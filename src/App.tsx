//React
import { useEffect, useMemo, useState } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

//Lib
import { api } from "./lib/api";
import { getCurrentUser, logoutAccount } from "./lib/auth";
import { connectRealtime } from "./lib/realtime";
import { ethToWei } from "./lib/eth";

//Types
import type { NFT } from "./types/nft";
import { type DemoOrder } from "./types/DemoOrder";
import { type KurioUser } from "./types/KurioUser";

//Components
import Header from "./components/Header";
import Hero from "./components/Hero";
import NFTCard from "./components/NFTCard";
import Sidebar from "./components/Siderbar";
import CatalogToolbar from "./components/CatalogToolbar";
import PromoSection from "./components/PromoSection";
import JournalSection from "./components/JournalSection";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import CartDrawer from "./components/CartDrawer";
import OrderHistoryDrawer from "./components/OrderHistoryDrawer";

//CSS
import "./index.css";

function App() {
  const [query, setQuery] = useState(
    () => new URLSearchParams(window.location.search).get("search") ?? "",
  );
  const [tab, setTab] = useState(
    () =>
      new URLSearchParams(window.location.search).get("view") ??
      "Todos os NFTs",
  );
  const [category, setCategory] = useState(
    () => new URLSearchParams(window.location.search).get("category") ?? "",
  );
  const [sort, setSort] = useState(
    () => new URLSearchParams(window.location.search).get("sort") ?? "recentes",
  );
  const [page, setPage] = useState(() =>
    Math.max(
      1,
      Number(new URLSearchParams(window.location.search).get("page") ?? 1),
    ),
  );
  const [network, setNetwork] = useState(
    () => new URLSearchParams(window.location.search).get("network") ?? "",
  );
  const pageSize = 6;
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const owner = getCurrentUser();
      return owner
        ? (JSON.parse(
            localStorage.getItem(`kurio:${owner.id}:favorites`) ?? "[]",
          ) as number[])
        : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState<KurioUser | null>(() => getCurrentUser());
  const storageKey = (kind: "cart" | "orders", owner = user) =>
    `kurio:${owner?.id ?? "guest"}:${kind}`;
  type CartLine = { id: number; quantity: number };
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      const current = getCurrentUser();
      const raw = localStorage.getItem(`kurio:${current?.id ?? "guest"}:cart`);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed)
        ? parsed.map((item) =>
            typeof item === "number"
              ? { id: item, quantity: 1 }
              : (item as CartLine),
          )
        : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(
    () => new URLSearchParams(window.location.search).get("openCart") === "1",
  );
  const [isOrdersOpen, setIsOrdersOpen] = useState(
    () => new URLSearchParams(window.location.search).get("openOrders") === "1",
  );
  const [realtimeNotice, setRealtimeNotice] = useState("");
  const [orders, setOrders] = useState<DemoOrder[]>(() => {
    try {
      const current = getCurrentUser();
      if (!current) return [];

      const saved = localStorage.getItem(`kurio:${current.id}:orders`);
      if (saved) return JSON.parse(saved) as DemoOrder[];

      const legacyRaw = localStorage.getItem("kurio:orders");
      const legacyOrders = legacyRaw
        ? (JSON.parse(legacyRaw) as DemoOrder[])
        : [];
      const ownedOrders = legacyOrders.filter(
        (order) => order.email?.toLowerCase() === current.email.toLowerCase(),
      );
      if (ownedOrders.length > 0) {
        localStorage.setItem(
          `kurio:${current.id}:orders`,
          JSON.stringify(ownedOrders),
        );
      }
      return ownedOrders;
    } catch {
      return [];
    }
  });
  const queryClient = useQueryClient();
  const [minPrice, setMinPrice] = useState(() =>
    Number(new URLSearchParams(window.location.search).get("minPrice") ?? 0.02),
  );
  const [maxPrice, setMaxPrice] = useState(() =>
    Number(new URLSearchParams(window.location.search).get("maxPrice") ?? 12.3),
  );
  const [appliedRange, setAppliedRange] = useState<[number, number]>(() => {
    const params = new URLSearchParams(window.location.search);
    return [
      Number(params.get("minPrice") ?? 0.02),
      Number(params.get("maxPrice") ?? 12.3),
    ];
  });

  const {
    data: catalog = { items: [] as NFT[], total: 0, totalPages: 1 },
    isLoading,
    isError,
    error,
  } = useQuery<{ items: NFT[]; total: number; totalPages: number }>({
    queryKey: ["nfts", query, category, sort, tab, appliedRange, network, page],
    queryFn: async () => {
      const response = await api.get<{
        items: NFT[];
        total: number;
        totalPages: number;
      }>("/nfts", {
        params: {
          search: query,
          category,
          network,
          sort:
            tab === "Em alta"
              ? "price-desc"
              : sort === "menor"
                ? "price-asc"
                : sort === "maior"
                  ? "price-desc"
                  : sort,
          minPrice: appliedRange[0],
          maxPrice: appliedRange[1],
          page,
          pageSize,
        },
      });
      return response.data;
    },
  });
  const nfts = catalog.items;

  const updateCart = (updater: (old: CartLine[]) => CartLine[]) =>
    setCart((old) => {
      const next = updater(old);
      localStorage.setItem(storageKey("cart"), JSON.stringify(next));
      void api.put("/cart", { items: next }).catch(() => undefined);
      return next;
    });

  useEffect(() => {
    void api.put("/cart", { items: cart }).catch(() => undefined);
  }, [cart, user?.id]);

  const requireLogin = (returnTo: string) => {
    window.location.assign(`/login?returnTo=${returnTo}`);
  };

  const cartNftQueries = useQueries({
    queries: cart.map((line) => ({
      queryKey: ["nft", line.id],
      queryFn: async () => (await api.get<NFT>(`/nfts/${line.id}`)).data,
      staleTime: 30_000,
    })),
  });
  const cartItems = useMemo(
    () =>
      cartNftQueries
        .map((query) => query.data)
        .filter((nft): nft is NFT => Boolean(nft)),
    [cartNftQueries],
  );

  const visibleNFTs = useMemo(() => {
    let list = nfts.filter(
      (nft) =>
        `${nft.name} ${nft.collection}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (!category || nft.category === category) &&
        (!network || nft.network === network) &&
        ethToWei(nft.price) >= ethToWei(String(appliedRange[0])) &&
        ethToWei(nft.price) <= ethToWei(String(appliedRange[1])),
    );

    if (tab === "Em alta")
      list = [...list].sort((a, b) =>
        ethToWei(a.price) > ethToWei(b.price)
          ? -1
          : ethToWei(a.price) < ethToWei(b.price)
            ? 1
            : 0,
      );
    if (sort === "menor")
      list = [...list].sort((a, b) =>
        ethToWei(a.price) < ethToWei(b.price)
          ? -1
          : ethToWei(a.price) > ethToWei(b.price)
            ? 1
            : 0,
      );
    if (sort === "maior")
      list = [...list].sort((a, b) =>
        ethToWei(a.price) > ethToWei(b.price)
          ? -1
          : ethToWei(a.price) < ethToWei(b.price)
            ? 1
            : 0,
      );
    return list;
  }, [nfts, query, tab, category, network, sort, appliedRange]);

  const toggleFavorite = (id: number) => {
    if (!user) {
      requireLogin("favorites");
      return;
    }
    const previous = favorites;
    const next = previous.includes(id)
      ? previous.filter((x) => x !== id)
      : [...previous, id];
    setFavorites(next);
    localStorage.setItem(`kurio:${user.id}:favorites`, JSON.stringify(next));
    void api.put("/favorites", { ids: next }).catch(() => {
      setFavorites(previous);
      localStorage.setItem(
        `kurio:${user.id}:favorites`,
        JSON.stringify(previous),
      );
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    if (network) {
      params.set("network", network);
    } else {
      params.delete("network");
    }

    if (tab !== "Todos os NFTs") {
      params.set("view", tab);
    } else {
      params.delete("view");
    }

    if (sort !== "recentes") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    if (appliedRange[0] !== 0.02) {
      params.set("minPrice", String(appliedRange[0]));
    } else {
      params.delete("minPrice");
    }

    if (appliedRange[1] !== 12.3) {
      params.set("maxPrice", String(appliedRange[1]));
    } else {
      params.delete("maxPrice");
    }

    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    const suffix = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${suffix ? `?${suffix}` : ""}${window.location.hash}`,
    );
  }, [query, category, network, tab, sort, appliedRange, page]);

  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("search") ?? "");
      setCategory(params.get("category") ?? "");
      setNetwork(params.get("network") ?? "");
      setTab(params.get("view") ?? "Todos os NFTs");
      setSort(params.get("sort") ?? "recentes");
      const min = Number(params.get("minPrice") ?? 0.02);
      const max = Number(params.get("maxPrice") ?? 12.3);
      setMinPrice(min);
      setMaxPrice(max);
      setAppliedRange([min, max]);
      setPage(Math.max(1, Number(params.get("page") ?? 1)));
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  const totalPages = Math.max(1, catalog.totalPages);
  const paginatedNFTs = visibleNFTs;

  const saveOrder = (order: DemoOrder) => {
    const updated = [order, ...orders];
    setOrders(updated);
    try {
      if (!user) return;
      localStorage.setItem(storageKey("orders"), JSON.stringify(updated));
    } catch (error) {
      console.error("Não foi possível salvar o pedido no navegador.", error);
    }
  };

  useEffect(() => {
    if (!isOrdersOpen || !user) return;
    let active = true;
    void api
      .get<
        {
          id: string;
          createdAt: string;
          customerName?: string;
          email?: string;
          wallet?: string;
          items?: (NFT & { quantity?: number; nft?: NFT })[];
          total: number;
          status: string;
          transactionReference?: string;
          discount?: number;
          networkFee?: number;
        }[]
      >("/orders")
      .then((response) => {
        if (!active) return;
        const remote: DemoOrder[] = response.data.map((order) => ({
          id: order.id,
          createdAt: order.createdAt,
          customerName: order.customerName ?? user.name,
          email: order.email ?? user.email,
          wallet: order.wallet ?? "",
          items: (order.items ?? []).flatMap((item) => {
            const nft = "nft" in item && item.nft ? item.nft : item;
            return Array.from(
              { length: item.quantity ?? 1 },
              () => ({ ...nft, quantity: undefined }) as unknown as NFT,
            );
          }),
          total: order.total,
          status:
            order.status === "confirmed"
              ? "Confirmado (demonstração)"
              : order.status,
          transactionReference: order.transactionReference,
          discount: order.discount,
          networkFee: order.networkFee,
        }));
        setOrders((current) => {
          const merged = [...remote, ...current].filter(
            (order, index, all) =>
              all.findIndex((candidate) => candidate.id === order.id) === index,
          );
          localStorage.setItem(
            `kurio:${user.id}:orders`,
            JSON.stringify(merged),
          );
          return merged;
        });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isOrdersOpen, user]);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setCart([]);
      setOrders([]);
      setFavorites([]);
      setIsCartOpen(false);
      setIsOrdersOpen(false);
      queryClient.clear();
    };
    const onProfileUpdated = () => setUser(getCurrentUser());
    window.addEventListener("kurio:session-expired", onExpired);
    window.addEventListener("kurio:profile-updated", onProfileUpdated);
    return () => {
      window.removeEventListener("kurio:session-expired", onExpired);
      window.removeEventListener("kurio:profile-updated", onProfileUpdated);
    };
  }, [queryClient]);

  useEffect(
    () =>
      connectRealtime(
        {
          onNftUpdated: (event) => {
            void queryClient.invalidateQueries({ queryKey: ["nfts"] });
            void queryClient.invalidateQueries({ queryKey: ["nft"] });
            setRealtimeNotice(
              `Atualização em tempo real: ${event.price ? `preço ${event.price} ETH` : "disponibilidade"} do NFT #${event.id}. Revise o carrinho antes de confirmar.`,
            );
          },
          onOrderUpdated: () => {
            void queryClient.invalidateQueries({
              queryKey: ["orders", user?.id],
            });
            if (user && isOrdersOpen) {
              void api
                .get<Record<string, unknown>[]>("/orders")
                .then((response) => {
                  const remote = response.data.map((order) => ({
                    id: String(order.id),
                    createdAt: String(order.createdAt),
                    customerName: String(order.customerName ?? user.name),
                    email: String(order.email ?? user.email),
                    wallet: String(order.wallet ?? ""),
                    items: (Array.isArray(order.items)
                      ? order.items
                      : []
                    ).flatMap((entry) => {
                      const item = entry as {
                        nft?: NFT;
                        quantity?: number;
                      } & Partial<NFT>;
                      const nft = item.nft ?? (item as NFT);
                      return Array.from(
                        {
                          length: Math.max(
                            1,
                            Math.min(5, Number(item.quantity ?? 1)),
                          ),
                        },
                        () => nft,
                      );
                    }),
                    total: Number(order.total ?? 0),
                    status: String(order.status),
                    transactionReference: order.transactionReference as
                      | string
                      | undefined,
                  })) as DemoOrder[];
                  setOrders((current) =>
                    [...remote, ...current].filter(
                      (order, index, all) =>
                        all.findIndex(
                          (candidate) => candidate.id === order.id,
                        ) === index,
                    ),
                  );
                })
                .catch(() => undefined);
            }
          },
          onConnectionChange: (connected) => {
            if (connected) {
              void queryClient.invalidateQueries({ queryKey: ["nfts"] });
              void queryClient.invalidateQueries({ queryKey: ["nft"] });
              if (user && isOrdersOpen) {
                void api
                  .get<Record<string, unknown>[]>("/orders")
                  .then((response) => {
                    const remote = response.data.map((order) => ({
                      id: String(order.id),
                      createdAt: String(order.createdAt),
                      customerName: String(order.customerName ?? user.name),
                      email: String(order.email ?? user.email),
                      wallet: String(order.wallet ?? ""),
                      items: (Array.isArray(order.items)
                        ? order.items
                        : []
                      ).flatMap((entry) => {
                        const item = entry as {
                          nft?: NFT;
                          quantity?: number;
                        } & Partial<NFT>;
                        const nft = item.nft ?? (item as NFT);
                        return Array.from(
                          {
                            length: Math.max(
                              1,
                              Math.min(5, Number(item.quantity ?? 1)),
                            ),
                          },
                          () => nft,
                        );
                      }),
                      total: Number(order.total ?? 0),
                      status: String(order.status),
                      transactionReference: order.transactionReference as
                        | string
                        | undefined,
                    })) as DemoOrder[];
                    setOrders((current) =>
                      [...remote, ...current].filter(
                        (order, index, all) =>
                          all.findIndex(
                            (candidate) => candidate.id === order.id,
                          ) === index,
                      ),
                    );
                  })
                  .catch(() => undefined);
              }
              setRealtimeNotice(
                "Conexão em tempo real ativa; catálogo e pedidos sincronizados.",
              );
            }
          },
        },
        user?.id,
      ),
    [user?.id, queryClient, isOrdersOpen, user],
  );

  return (
    <div className="site-shell">
      <Header
        cartCount={cart.reduce((sum, line) => sum + line.quantity, 0)}
        user={user}
        onLogin={() => window.location.assign("/login")}
        onLogout={() => {
          logoutAccount();
          queryClient.clear();
          setUser(null);
          setCart([]);
          setOrders([]);
          setFavorites([]);
          setIsCartOpen(false);
          setIsOrdersOpen(false);
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() =>
          user ? setIsOrdersOpen(true) : requireLogin("orders")
        }
      />
      <main id="inicio">
        <Hero />
        <section className="market-layout" id="mercado">
          {realtimeNotice && (
            <p
              role="status"
              aria-live="polite"
              className="mx-4 mb-4 rounded-lg border border-[#704d31] bg-[#21130d] px-4 py-3 text-sm text-[#f0a653] md:col-span-2"
            >
              {realtimeNotice}
              <button
                type="button"
                onClick={() => setRealtimeNotice("")}
                className="ml-3 underline"
              >
                Dispensar
              </button>
            </p>
          )}
          <Sidebar
            category={category}
            network={network}
            onSelectNetwork={(value) => {
              window.history.pushState({}, "", window.location.href);
              setNetwork(value);
              setPage(1);
            }}
            onSelectCategory={(value) => {
              window.history.pushState({}, "", window.location.href);
              setCategory(value);
              setPage(1);
            }}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            onApplyRange={() => {
              window.history.pushState({}, "", window.location.href);
              setAppliedRange([
                Math.min(minPrice, maxPrice),
                Math.max(minPrice, maxPrice),
              ]);
              setPage(1);
            }}
          />
          <div className="catalog">
            <CatalogToolbar
              tab={tab}
              onChangeTab={(value) => {
                setTab(value);
                setPage(1);
              }}
              sort={sort}
              onChangeSort={(value) => {
                window.history.pushState({}, "", window.location.href);
                setSort(value);
                setPage(1);
              }}
              query={query}
              onChangeQuery={(value) => {
                setQuery(value);
                setPage(1);
              }}
              category={category}
              onClearCategory={() => {
                setCategory("");
                setPage(1);
              }}
              resultCount={catalog.total}
            />
            {isLoading && (
              <div
                role="status"
                aria-label="Carregando NFTs"
                className="grid grid-cols-2 gap-4 min-[681px]:grid-cols-3"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="skeleton-shimmer aspect-square rounded-xl" />
                    <div className="skeleton-shimmer h-3 w-3/4 rounded" />
                    <div className="skeleton-shimmer h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            )}
            {isError && (
              <p role="alert">
                Não foi possível carregar os NFTs:{" "}
                {error instanceof Error ? error.message : "Erro desconhecido"}
              </p>
            )}
            <div className="grid grid-cols-2 gap-x-3 gap-y-4.25 min-[681px]:grid-cols-3 min-[681px]:gap-x-5.5 min-[681px]:gap-y-6">
              {paginatedNFTs.map((nft) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                  isFavorite={favorites.includes(nft.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={(id) =>
                    updateCart((old) =>
                      old.some((line) => line.id === id)
                        ? old.map((line) =>
                            line.id === id
                              ? { ...line, quantity: line.quantity + 1 }
                              : line,
                          )
                        : [...old, { id, quantity: 1 }],
                    )
                  }
                />
              ))}
            </div>
            {visibleNFTs.length === 0 && (
              <div className="empty-state">
                Nenhum NFT encontrado.{" "}
                <button
                  onClick={() => {
                    setQuery("");
                    setCategory("");
                    setAppliedRange([0.02, 12.3]);
                    setMinPrice(0.02);
                    setMaxPrice(12.3);
                    setPage(1);
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
            <nav className="pagination" aria-label="Paginação do catálogo">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  window.history.pushState({}, "", window.location.href);
                  setPage((value) => Math.max(1, value - 1));
                }}
                aria-label="Página anterior"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    aria-current={pageNumber === page ? "page" : undefined}
                    className={pageNumber === page ? "page-current" : ""}
                    onClick={() => {
                      window.history.pushState({}, "", window.location.href);
                      setPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  window.history.pushState({}, "", window.location.href);
                  setPage((value) => Math.min(totalPages, value + 1));
                }}
                aria-label="Próxima página"
              >
                ›
              </button>
            </nav>
          </div>
        </section>
        <PromoSection />
        <JournalSection />
      </main>
      <Footer />
      <MobileBottomNav
        cartCount={cart.reduce((sum, line) => sum + line.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() =>
          user ? setIsOrdersOpen(true) : requireLogin("orders")
        }
        onOpenProfile={() =>
          user ? window.location.assign("/profile") : requireLogin("profile")
        }
      />
      {isCartOpen && (
        <CartDrawer
          items={cartItems}
          onRemove={(id) =>
            updateCart((old) => old.filter((line) => line.id !== id))
          }
          quantities={Object.fromEntries(
            cart.map((line) => [line.id, line.quantity]),
          )}
          onQuantityChange={(id, quantity) =>
            updateCart((old) =>
              old.map((line) =>
                line.id === id
                  ? { ...line, quantity: Math.max(1, Math.min(5, quantity)) }
                  : line,
              ),
            )
          }
          onClose={() => setIsCartOpen(false)}
          isAuthenticated={Boolean(user)}
          onRequireAuth={() => requireLogin("checkout")}
          customer={user ? { name: user.name, email: user.email } : undefined}
          onCheckoutComplete={(order) => {
            if (!user) {
              requireLogin("checkout");
              return;
            }
            saveOrder({ ...order, customerName: user.name, email: user.email });
            updateCart((old) =>
              old
                .map((line) => ({
                  ...line,
                  quantity:
                    line.quantity -
                    order.items.filter((item) => item.id === line.id).length,
                }))
                .filter((line) => line.quantity > 0),
            );
          }}
        />
      )}
      {isOrdersOpen && user && (
        <OrderHistoryDrawer
          orders={orders}
          onClose={() => setIsOrdersOpen(false)}
        />
      )}
    </div>
  );
}
export default App;
