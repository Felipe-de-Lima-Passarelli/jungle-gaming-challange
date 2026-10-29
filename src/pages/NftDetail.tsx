//React
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

//Lib
import { getCurrentUser } from "../lib/auth";
import { api } from "../lib/api";
import { formatEth } from "../lib/eth";
import { connectRealtime } from "../lib/realtime";

//Types
import type { NFT } from "../types/nft";
import type { NftDetailProps } from "../types/NFTDetails";

//Components
import { Skeleton } from "../components/ui/skeleton";

export default function NftDetail({ nftId }: NftDetailProps) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  useEffect(
    () =>
      connectRealtime({
        onNftUpdated: (event) => {
          if (event.id === Number(nftId)) {
            void queryClient.invalidateQueries({ queryKey: ["nfts", nftId] });
            setNotice(
              `Atualização recebida: ${event.price ? `preço ${event.price} ETH` : "disponibilidade alterada"}. Revise antes de comprar.`,
            );
          }
        },
        onOrderUpdated: () => undefined,
        onConnectionChange: (connected) => {
          if (connected)
            void queryClient.invalidateQueries({ queryKey: ["nfts", nftId] });
        },
      }),
    [nftId, queryClient],
  );

  const [favorite, setFavorite] = useState(() => {
    try {
      const user = getCurrentUser();
      return user
        ? (
            JSON.parse(
              localStorage.getItem(`kurio:${user.id}:favorites`) ?? "[]",
            ) as number[]
          ).includes(Number(nftId))
        : false;
    } catch {
      return false;
    }
  });
  function addToCart() {
    try {
      const user = getCurrentUser();
      const key = `kurio:${user?.id ?? "guest"}:cart`;
      const saved = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
      const lines = saved.map((line) =>
        typeof line === "number"
          ? { id: line, quantity: 1 }
          : (line as { id: number; quantity: number }),
      );
      const existing = lines.find((line) => line.id === Number(nftId));
      if (existing)
        existing.quantity = Math.min(5, existing.quantity + quantity);
      else lines.push({ id: Number(nftId), quantity });
      localStorage.setItem(key, JSON.stringify(lines));
      setNotice("NFT adicionado ao carrinho.");
    } catch {
      setNotice("Não foi possível atualizar o carrinho.");
    }
  }
  function toggleFavorite() {
    const user = getCurrentUser();
    if (!user) {
      window.location.assign(`/login?returnTo=detail`);
      return;
    }
    const key = `kurio:${user.id}:favorites`;
    const old = JSON.parse(localStorage.getItem(key) ?? "[]") as number[];
    const next = old.includes(Number(nftId))
      ? old.filter((id) => id !== Number(nftId))
      : [...old, Number(nftId)];
    localStorage.setItem(key, JSON.stringify(next));
    setFavorite(next.includes(Number(nftId)));
    setNotice(
      next.includes(Number(nftId))
        ? "Adicionado aos favoritos."
        : "Removido dos favoritos.",
    );
    void api.put("/favorites", { ids: next }).catch(() => {
      localStorage.setItem(key, JSON.stringify(old));
      setFavorite(old.includes(Number(nftId)));
      setNotice(
        "Não foi possível sincronizar os favoritos. A alteração foi desfeita.",
      );
    });
  }
  const {
    data: nft,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["nfts", nftId],
    queryFn: async () => {
      const response = await api.get<NFT>(`/nfts/${nftId}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#140c08] px-4 text-[#b89a7a]">
        <div
          role="status"
          aria-label="Carregando detalhes do NFT"
          className="grid w-full max-w-5xl gap-8 md:grid-cols-2"
        >
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !nft) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#140c08] px-4 text-center text-[#ead9c6]">
        <h1 className="text-2xl font-bold sm:text-3xl">NFT não encontrado</h1>
        <p className="max-w-md text-sm leading-6 text-[#b89a7a]">
          Não foi possível carregar os detalhes desta obra.
        </p>
        <Link
          to="/"
          className="rounded-lg bg-[#dc9149] px-5 py-3 text-sm font-bold text-[#140c08] transition-colors hover:bg-[#f0a653]"
        >
          ← Voltar ao marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#140c08] px-4 py-8 text-[#ead9c6] sm:px-6 sm:py-12 lg:px-10">
      <div className="mx-auto max-w-300">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#b89a7a] transition-colors hover:text-[#f0a653] sm:mb-10"
        >
          ← Voltar ao marketplace
        </Link>
        <section className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
          <div className="relative overflow-hidden rounded-2xl border border-[#493023] bg-[#24150f]">
            <img
              src={nft.image}
              alt={nft.name}
              className="aspect-square w-full object-cover"
            />
            {nft.isRare && (
              <span className="absolute left-4 top-4 rounded-md border border-[#f0a653]/50 bg-[#140c08]/90 px-3 py-1.5 text-xs font-bold tracking-wider text-[#f0a653]">
                RARO
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#dc9149]">
              {nft.collection}
            </span>
            <h1 className="mt-3 wrap-break-word text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {nft.name}
            </h1>
            <p className="mt-5 text-sm leading-7 text-[#b89a7a] sm:text-base">
              {nft.description}
            </p>
            {nft.available === false && (
              <p
                role="status"
                className="mt-4 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-200"
              >
                Esta edição está indisponível no momento.
              </p>
            )}
            <div className="mt-8 grid grid-cols-3 divide-x divide-[#493023] rounded-xl border border-[#493023] bg-[#24150f] py-5">
              <div className="min-w-0 px-2 text-center sm:px-4">
                <span className="block text-xs text-[#b89a7a] sm:text-sm">
                  Categoria
                </span>
                <strong className="mt-2 block wrap-break-word text-sm sm:text-base">
                  {nft.category}
                </strong>
              </div>
              <div className="min-w-0 px-2 text-center sm:px-4">
                <span className="block text-xs text-[#b89a7a] sm:text-sm">
                  Rede
                </span>
                <strong className="mt-2 block wrap-break-word text-sm sm:text-base">
                  {nft.network}
                </strong>
              </div>
              <div className="min-w-0 px-2 text-center sm:px-4">
                <span className="block text-xs text-[#b89a7a] sm:text-sm">
                  Favoritos
                </span>
                <strong className="mt-2 block text-sm sm:text-base">
                  {nft.likes}
                </strong>
              </div>
            </div>
            <div className="mt-8 rounded-xl border border-[#493023] bg-[#24150f] p-5 sm:p-6">
              <span className="text-sm text-[#b89a7a]">Preço atual</span>
              <strong className="mt-2 block text-3xl font-bold text-[#f0a653] sm:text-4xl">
                {formatEth(nft.price, 2)} {nft.currency}
              </strong>
              <p className="mt-5 border-t border-[#493023] pt-4 text-xs leading-5 text-[#b89a7a]">
                Compra demonstrativa. Nenhuma transação real será realizada.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-[#b89a7a]">Quantidade</span>
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="grid size-9 place-items-center rounded border border-[#493023] disabled:opacity-40"
                >
                  −
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  disabled={quantity >= 5}
                  onClick={() => setQuantity((value) => Math.min(5, value + 1))}
                  className="grid size-9 place-items-center rounded border border-[#493023] disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={nft.available === false}
                  onClick={addToCart}
                  className="rounded-md bg-[#dc9149] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#1c1008] hover:bg-[#f0a653]"
                >
                  Adicionar ao carrinho
                </button>
                <button
                  type="button"
                  onClick={toggleFavorite}
                  aria-pressed={favorite}
                  className="rounded-md border border-[#dc9149] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#f0a653]"
                >
                  {favorite ? "♥ Favoritado" : "♡ Favoritar"}
                </button>
              </div>
              {notice && (
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-3 text-sm text-[#f0a653]"
                >
                  {notice}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
