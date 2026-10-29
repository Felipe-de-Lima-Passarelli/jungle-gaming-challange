//React
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

//lib
import { api } from "../lib/api";
import { ethToWei, formatEth, sumEth, weiToEthString } from "../lib/eth";

//Axios
import axios from "axios";

//Icons
import { X, ShoppingBag, Trash2, CheckCircle2, ArrowLeft } from "lucide-react";

//Types
import type { NFT } from "../types/nft";
import type { DemoOrder } from "../types/DemoOrder";
import type { CartDrawerProps } from "../types/CartDrawer";

export default function CartDrawer({
  items,
  onRemove,
  onClose,
  onCheckoutComplete,
  isAuthenticated,
  onRequireAuth,
  customer,
  quantities,
  onQuantityChange,
}: CartDrawerProps) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  const [isCheckout, setIsCheckout] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<DemoOrder | null>(null);
  const [fullName, setFullName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [wallet, setWallet] = useState("");
  const [network, setNetwork] = useState("Ethereum");
  const [walletConnected, setWalletConnected] = useState(false);
  const walletsQuery = useQuery({
    queryKey: ["wallets", customer?.email],
    enabled: isCheckout && isAuthenticated,
    queryFn: async () =>
      (
        await api.get<
          { id: string; label: string; address: string; network: string }[]
        >("/wallets")
      ).data,
  });
  const [accepted, setAccepted] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [quote, setQuote] = useState<{
    subtotal: string;
    discount: string;
    networkFee: string;
    total: string;
    quoteVersion: number;
  } | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [busy, setBusy] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );
  const [pendingOrderPayload, setPendingOrderPayload] = useState<Record<
    string,
    unknown
  > | null>(null);
  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusable();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  const totalWei = sumEth(
    items.map((item) => ({
      price: item.price,
      quantity: quantities[item.id] ?? 1,
    })),
  );
  const fallbackTotal = weiToEthString(totalWei + ethToWei("0.015"));
  const selectedItems = items.map((item) => ({
    ...item,
    quantity: quantities[item.id] ?? 1,
  }));
  async function applyCoupon() {
    setQuoteError("");
    try {
      const response = await api.post("/checkout/quote", {
        items: selectedItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        coupon,
      });
      setQuote(response.data);
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setQuote(null);
      setQuoteError(message ?? "Não foi possível calcular o total.");
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Fechar carrinho"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="relative flex h-full w-full max-w-lg flex-col border-l border-[#493023] bg-[#170e09] text-[#f3e5d5] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-[#493023] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#dc9149]">
              Sua seleção
            </p>
            <h2 id="cart-title" className="mt-1 text-xl font-semibold">
              Carrinho{" "}
              <span className="text-sm font-normal text-[#bca48d]">
                ({items.length})
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="grid size-10 place-items-center rounded-full border border-[#493023] text-[#e8d6c3] transition hover:bg-[#2a1a12] hover:text-[#f0a653]"
          >
            <X size={19} />
          </button>
        </header>

        {isComplete ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 size={32} />
            </span>
            <h3 className="mt-5 text-xl font-semibold">
              Pedido demonstrativo confirmado!
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#bca48d]">
              Seu pedido foi registrado apenas nesta demonstração. Nenhum
              pagamento ou transação blockchain foi realizado.
            </p>
            {completedOrder && (
              <div className="mt-4 w-full max-w-sm rounded-lg border border-[#493023] bg-[#21130d] p-4 text-left text-sm">
                <p className="text-[#f0a653]">{completedOrder.id}</p>
                <p className="mt-2 flex justify-between gap-3">
                  <span className="text-[#bca48d]">Itens</span>
                  <span>{completedOrder.items.length}</span>
                </p>
                <p className="mt-2 flex justify-between gap-3">
                  <span className="text-[#bca48d]">Total</span>
                  <strong>{completedOrder.total.toFixed(3)} ETH</strong>
                </p>
                <p className="mt-2 break-all text-xs text-[#bca48d]">
                  Referência simulada:{" "}
                  {completedOrder.transactionReference ?? "não disponível"}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-md bg-[#dc9149] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#1c1008] transition hover:bg-[#f0a653]"
            >
              Voltar ao marketplace
            </button>
          </div>
        ) : isCheckout ? (
          <form
            className="flex flex-1 flex-col overflow-y-auto"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!items.length || !accepted || busy) return;
              if (wallet && !walletConnected) {
                setQuoteError(
                  "Conecte a carteira simulada antes de confirmar, ou deixe o campo vazio.",
                );
                return;
              }
              setBusy(true);
              setQuoteError("");
              try {
                let orderPayload = pendingOrderPayload;
                let latestQuote: {
                  items: { nft: NFT; quantity: number }[];
                  subtotal: string;
                  discount: string;
                  networkFee: string;
                  total: string;
                  quoteVersion: number;
                };
                if (orderPayload) {
                  latestQuote = orderPayload as unknown as typeof latestQuote;
                } else {
                  const quoteResponse = await api.post("/checkout/quote", {
                    items: selectedItems.map((item) => ({
                      id: item.id,
                      quantity: item.quantity,
                    })),
                    coupon,
                  });
                  latestQuote = quoteResponse.data as typeof latestQuote;
                  if (
                    ethToWei(latestQuote.total) !==
                    ethToWei(quote?.total ?? fallbackTotal)
                  ) {
                    setQuote(latestQuote);
                    setQuoteError(
                      "O preço ou as taxas mudaram. Revise o novo total e confirme novamente.",
                    );
                    setBusy(false);
                    return;
                  }
                  orderPayload = {
                    customerName: fullName.trim(),
                    email: email.trim(),
                    wallet: wallet.trim(),
                    network,
                    ...latestQuote,
                    transactionReference: `SIM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
                  };
                  setPendingOrderPayload(orderPayload);
                }
                if (!orderPayload)
                  throw new Error("Não foi possível preparar o pedido.");
                const orderResponse = await api.post("/orders", orderPayload, {
                  headers: { "Idempotency-Key": idempotencyKey },
                });
                const result = orderResponse.data;
                if (result.status === "declined") {
                  setQuoteError(
                    "O pagamento simulado foi recusado. Seus itens continuam no carrinho.",
                  );
                  setPendingOrderPayload(null);
                  setIdempotencyKey(crypto.randomUUID());
                  return;
                }
                const order: DemoOrder = {
                  id: result.id,
                  createdAt: result.createdAt,
                  customerName: fullName.trim(),
                  email: email.trim(),
                  wallet: wallet.trim(),
                  items: latestQuote.items.flatMap((item) =>
                    Array.from({ length: item.quantity }, () => item.nft),
                  ),
                  total: Number(latestQuote.total),
                  discount: Number(latestQuote.discount),
                  networkFee: Number(latestQuote.networkFee),
                  transactionReference: result.transactionReference,
                  status: "Confirmado (demonstração)",
                };
                setPendingOrderPayload(null);
                setIdempotencyKey(crypto.randomUUID());
                setCompletedOrder(order);
                onCheckoutComplete(order);
                setIsComplete(true);
              } catch (error: unknown) {
                const message = axios.isAxiosError<{ message?: string }>(error)
                  ? error.response?.data?.message
                  : undefined;
                setQuoteError(
                  message ??
                    "Falha ao confirmar o pedido. Tente novamente; a tentativa é protegida por idempotência.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
              <button
                type="button"
                onClick={() => setIsCheckout(false)}
                className="inline-flex items-center gap-2 text-sm text-[#bca48d] transition hover:text-[#f0a653]"
              >
                <ArrowLeft size={16} /> Voltar ao carrinho
              </button>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#dc9149]">
                  Etapa final
                </p>
                <h3 className="mt-1 text-xl font-semibold">Finalizar pedido</h3>
                <p className="mt-2 text-sm leading-6 text-[#bca48d]">
                  Preencha os dados para registrar um pedido de demonstração.
                </p>
              </div>
              <label className="block text-sm text-[#e8d6c3]">
                Nome completo
                <input
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 w-full rounded-md border border-[#493023] bg-[#21130d] px-3 py-3 text-sm outline-none transition placeholder:text-[#806953] focus:border-[#dc9149]"
                  placeholder="Seu nome"
                />
              </label>
              <label className="block text-sm text-[#e8d6c3]">
                E-mail
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-md border border-[#493023] bg-[#21130d] px-3 py-3 text-sm outline-none transition placeholder:text-[#806953] focus:border-[#dc9149]"
                  placeholder="voce@exemplo.com"
                />
              </label>
              <label className="block text-sm text-[#e8d6c3]">
                Carteira cadastrada{" "}
                <span className="text-[#947b65]">(opcional)</span>
                <select
                  value={wallet}
                  onChange={(event) => {
                    setWallet(event.target.value);
                    setWalletConnected(false);
                    const selected = walletsQuery.data?.find(
                      (entry) => entry.address === event.target.value,
                    );
                    if (selected) setNetwork(selected.network);
                  }}
                  className="mt-2 w-full rounded-md border border-[#493023] bg-[#21130d] px-3 py-3 text-sm outline-none focus:border-[#dc9149]"
                >
                  <option value="">Nenhuma carteira selecionada</option>
                  {(walletsQuery.data ?? []).map((entry) => (
                    <option key={entry.id} value={entry.address}>
                      {entry.label} · {entry.network}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-[#e8d6c3]">
                Endereço manual{" "}
                <span className="text-[#947b65]">(opcional)</span>
                <input
                  value={wallet}
                  onChange={(event) => {
                    setWallet(event.target.value);
                    setWalletConnected(false);
                  }}
                  className="mt-2 w-full rounded-md border border-[#493023] bg-[#21130d] px-3 py-3 text-sm outline-none transition placeholder:text-[#806953] focus:border-[#dc9149]"
                  placeholder="Endereço fictício da carteira"
                />
              </label>
              <label className="block text-sm text-[#e8d6c3]">
                Rede
                <select
                  value={network}
                  onChange={(event) => setNetwork(event.target.value)}
                  className="mt-2 w-full rounded-md border border-[#493023] bg-[#21130d] px-3 py-3 text-sm"
                >
                  <option>Ethereum</option>
                  <option>Polygon</option>
                  <option>Solana</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!wallet) {
                    setQuoteError(
                      "Selecione uma carteira cadastrada ou informe um endereço fictício.",
                    );
                    return;
                  }
                  if (wallet.toLowerCase().includes("reject")) {
                    setWalletConnected(false);
                    setQuoteError(
                      "Conexão da carteira recusada (cenário simulado).",
                    );
                    return;
                  }
                  setWalletConnected((connected) => !connected);
                  setQuoteError("");
                }}
                className="rounded-md border border-[#493023] px-4 py-2 text-xs text-[#f0a653]"
              >
                {walletConnected
                  ? "Desconectar carteira simulada"
                  : "Conectar carteira simulada"}
              </button>
              <p className="text-xs text-[#947b65]" role="status">
                {walletConnected
                  ? `Conectada à rede ${network} (simulação).`
                  : "Carteira desconectada. Nenhuma extensão será aberta."}
              </p>
              <div className="rounded-lg border border-[#493023] bg-[#21130d] p-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#bca48d]">Unidades selecionadas</span>
                  <span>
                    {selectedItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0,
                    )}
                  </span>
                </div>
                <label className="mt-4 block text-sm">
                  Cupom de desconto
                  <div className="mt-2 flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => {
                        setCoupon(e.target.value);
                        setQuote(null);
                      }}
                      className="min-w-0 flex-1 rounded-md border border-[#493023] bg-[#140c08] px-3 py-2"
                      placeholder="KURIO10"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="rounded-md border border-[#dc9149] px-3 py-2 text-xs font-bold text-[#f0a653]"
                    >
                      Aplicar
                    </button>
                  </div>
                </label>
                <div className="mt-3 space-y-2 border-t border-[#493023] pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#bca48d]">Subtotal</span>
                    <span>
                      {formatEth(
                        quote?.subtotal ?? weiToEthString(totalWei),
                        3,
                      )}{" "}
                      ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#bca48d]">Desconto</span>
                    <span>-{formatEth(quote?.discount ?? "0", 3)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#bca48d]">Taxa de rede</span>
                    <span>
                      {formatEth(quote?.networkFee ?? "0.015", 3)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#493023] pt-3">
                    <span className="text-[#bca48d]">Total estimado</span>
                    <strong className="text-lg text-[#f0a653]">
                      {formatEth(quote?.total ?? fallbackTotal, 3)} ETH
                    </strong>
                  </div>
                </div>
                {quoteError && (
                  <p role="alert" className="mt-3 text-xs text-red-300">
                    {quoteError}
                  </p>
                )}
              </div>
              <label className="flex items-start gap-3 text-xs leading-5 text-[#bca48d]">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  required
                  className="mt-1 accent-[#dc9149]"
                />
                <span>
                  Entendo que esta é uma demonstração: não haverá cobrança nem
                  transação real na blockchain.
                </span>
              </label>
            </div>
            <footer className="border-t border-[#493023] bg-[#140c08] px-5 py-5 sm:px-7">
              <button
                type="submit"
                disabled={!items.length || !accepted || busy}
                className="w-full rounded-md bg-[#dc9149] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#1c1008] transition hover:bg-[#f0a653] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Processando…" : "Confirmar pedido demonstrativo"}
              </button>
            </footer>
          </form>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full border border-[#493023] bg-[#24150f] text-[#dc9149]">
              <ShoppingBag size={26} />
            </span>
            <h3 className="mt-5 text-lg font-semibold">
              Seu carrinho está vazio
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#bca48d]">
              Explore a coleção e adicione os NFTs que gostaria de colecionar.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                document
                  .getElementById("mercado")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-6 rounded-md bg-[#dc9149] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#1c1008] transition hover:bg-[#f0a653]"
            >
              Explorar NFTs
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-[#493023] bg-[#21130d] p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-24 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-semibold">
                      {item.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#bca48d]">
                      {item.collection}
                    </p>
                    <p className="mt-auto pt-3 text-sm font-semibold text-[#f0a653]">
                      {formatEth(
                        weiToEthString(
                          ethToWei(item.price) *
                            BigInt(quantities[item.id] ?? 1),
                        ),
                        2,
                      )}{" "}
                      {item.currency}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        disabled={(quantities[item.id] ?? 1) <= 1}
                        onClick={() =>
                          onQuantityChange(
                            item.id,
                            (quantities[item.id] ?? 1) - 1,
                          )
                        }
                        aria-label={`Diminuir quantidade de ${item.name}`}
                        className="grid size-7 place-items-center rounded border border-[#493023] disabled:opacity-40"
                      >
                        −
                      </button>
                      <span aria-live="polite">
                        Qtd. {quantities[item.id] ?? 1}
                      </span>
                      <button
                        type="button"
                        disabled={(quantities[item.id] ?? 1) >= 5}
                        onClick={() =>
                          onQuantityChange(
                            item.id,
                            (quantities[item.id] ?? 1) + 1,
                          )
                        }
                        aria-label={`Aumentar quantidade de ${item.name}`}
                        className="grid size-7 place-items-center rounded border border-[#493023] disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remover ${item.name} do carrinho`}
                    className="self-start rounded-md p-2 text-[#bca48d] transition hover:bg-[#3a2113] hover:text-red-300"
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>
            <footer className="border-t border-[#493023] bg-[#140c08] px-5 py-5 sm:px-7">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#bca48d]">Subtotal</span>
                <strong className="text-xl text-[#f0a653]">
                  {formatEth(weiToEthString(totalWei), 2)} ETH
                </strong>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#947b65]">
                Taxas de rede e custos adicionais não incluídos.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    onClose();
                    onRequireAuth();
                    return;
                  }
                  setIsCheckout(true);
                }}
                className="mt-5 w-full rounded-md bg-[#dc9149] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#1c1008] transition hover:bg-[#f0a653]"
              >
                {isAuthenticated
                  ? "Continuar para finalizar"
                  : "Entre para finalizar a compra"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full rounded-md border border-[#65472f] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#e8d6c3] transition hover:bg-[#2a1a12]"
              >
                Continuar explorando
              </button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
