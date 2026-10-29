export type NftUpdatedEvent = {
  id: number;
  version: number;
  price?: string;
  available?: boolean;
  edition?: number;
};

export type OrderUpdatedEvent = {
  id: string;
  version: number;
  status: "pending" | "confirmed" | "declined";
  transactionReference?: string;
  ownerId?: string;
};

export type RealtimeHandlers = {
  onNftUpdated: (event: NftUpdatedEvent) => void;
  onOrderUpdated: (event: OrderUpdatedEvent) => void;
  onConnectionChange?: (connected: boolean) => void;
};

export type StoredEvent = {
  id: number;
  type: "nft.updated" | "order.updated";
  payload: Record<string, unknown>;
  createdAt: string;
};
