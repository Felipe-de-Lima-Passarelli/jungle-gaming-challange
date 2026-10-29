//Socket
import { io, type Socket } from "socket.io-client";

//Types
import type {
  NftUpdatedEvent,
  OrderUpdatedEvent,
  RealtimeHandlers,
  StoredEvent,
} from "../types/IO";

let socket: Socket | null = null;
const nftVersions = new Map<number, number>();
const orderVersions = new Map<string, number>();

function emitBrowserEvent(name: string, detail: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function connectRealtime(handlers: RealtimeHandlers, ownerId?: string) {
  const mocksEnabled = import.meta.env.VITE_ENABLE_MOCKS !== "false";
  const configuredUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
  const url =
    configuredUrl || (mocksEnabled ? "http://kurio-realtime.local" : undefined);
  if (!url) return () => undefined;

  let disposed = false;
  let isConnected = false;
  let pollingTimer: ReturnType<typeof setInterval> | undefined;
  let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
  let cursor = 0;

  const setConnected = (connected: boolean) => {
    if (disposed || isConnected === connected) return;
    isConnected = connected;
    handlers.onConnectionChange?.(connected);
    document.documentElement.dataset.realtimeConnected = String(connected);
    emitBrowserEvent(
      connected ? "kurio:realtime:connected" : "kurio:realtime:disconnected",
      { connected },
    );
  };

  const handleNft = (event: NftUpdatedEvent) => {
    if (!Number.isInteger(event.id) || !Number.isFinite(event.version)) return;
    const current = nftVersions.get(event.id) ?? 0;
    if (event.version <= current) return;
    nftVersions.set(event.id, event.version);
    handlers.onNftUpdated(event);
    emitBrowserEvent("kurio:realtime:nft.updated", event);
  };

  const handleOrder = (event: OrderUpdatedEvent) => {
    if (!event.id || !Number.isFinite(event.version)) return;
    if (ownerId && event.ownerId !== ownerId) return;
    const current = orderVersions.get(event.id) ?? 0;
    if (event.version <= current) return;
    orderVersions.set(event.id, event.version);
    handlers.onOrderUpdated(event);
    emitBrowserEvent("kurio:realtime:order.updated", event);
  };

  const handleStoredEvent = (event: StoredEvent) => {
    if (!event || !Number.isFinite(event.id) || !event.payload) return;
    cursor = Math.max(cursor, event.id);
    const payload = event.payload as unknown as NftUpdatedEvent &
      OrderUpdatedEvent;
    if (event.type === "nft.updated") handleNft(payload);
    else if (event.type === "order.updated") handleOrder(payload);
  };

  const pollEvents = async () => {
    if (disposed || !mocksEnabled || !isConnected) return;
    try {
      const response = await fetch(
        `/api/realtime/events?cursor=${cursor}&limit=100`,
      );
      if (!response.ok) return;
      const result = (await response.json()) as {
        events?: StoredEvent[];
        cursor?: number;
      };
      for (const event of result.events ?? []) handleStoredEvent(event);
      if (Number.isFinite(result.cursor))
        cursor = Math.max(cursor, Number(result.cursor));
    } catch {
      /* ERROR */
    }
  };

  const startPollingFallback = () => {
    if (disposed || !mocksEnabled || pollingTimer) return;
    setConnected(true);
    void pollEvents();
    pollingTimer = setInterval(() => void pollEvents(), 250);
  };

  const activeSocket = io(url, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    timeout: 4000,
    transports: ["websocket"],
    path: "/socket.io/",
    query: ownerId ? { ownerId } : undefined,
  });
  socket = activeSocket;
  activeSocket.on("connect", () => {
    if (fallbackTimer) clearTimeout(fallbackTimer);
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = undefined;
    }
    setConnected(true);
  });
  activeSocket.on("disconnect", (reason) => {
    setConnected(false);
    emitBrowserEvent("kurio:realtime:disconnected", { reason });
    if (mocksEnabled && !disposed && !fallbackTimer) {
      fallbackTimer = setTimeout(startPollingFallback, 1200);
    }
  });
  activeSocket.on("connect_error", (error) => {
    emitBrowserEvent("kurio:realtime:error", { message: error.message });
  });
  activeSocket.on("nft.updated", handleNft);
  activeSocket.on("order.updated", handleOrder);

  if (mocksEnabled) fallbackTimer = setTimeout(startPollingFallback, 1200);

  return () => {
    disposed = true;
    if (fallbackTimer) clearTimeout(fallbackTimer);
    if (pollingTimer) clearInterval(pollingTimer);
    activeSocket.removeAllListeners();
    activeSocket.disconnect();
    if (socket === activeSocket) socket = null;
    if (document.documentElement.dataset.realtimeConnected === "true") {
      document.documentElement.dataset.realtimeConnected = "false";
    }
  };
}
