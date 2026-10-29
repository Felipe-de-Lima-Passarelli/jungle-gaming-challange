//React
import { useEffect, useRef } from "react";

//Icons
import { X, PackageCheck, ShoppingBag } from "lucide-react";

//Types
import type { Props } from "../types/OrderProps";

//Lib
import { formatEth } from "../lib/eth";

export default function OrderHistoryDrawer({ orders, onClose }: Props) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
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

  return (
    <div className="fixed inset-0 z-110 flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Fechar histórico de pedidos"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="orders-title"
        className="relative flex h-full w-full max-w-xl flex-col border-l border-[#493023] bg-[#170e09] text-[#f3e5d5] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-[#493023] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#dc9149]">
              Sua conta
            </p>
            <h2 id="orders-title" className="mt-1 text-xl font-semibold">
              Meus pedidos{" "}
              <span className="text-sm font-normal text-[#bca48d]">
                ({orders.length})
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar histórico de pedidos"
            className="grid size-10 place-items-center rounded-full border border-[#493023] text-[#e8d6c3] transition hover:bg-[#2a1a12] hover:text-[#f0a653]"
          >
            <X size={19} />
          </button>
        </header>
        {orders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full border border-[#493023] bg-[#24150f] text-[#dc9149]">
              <ShoppingBag size={26} />
            </span>
            <h3 className="mt-5 text-lg font-semibold">
              Você ainda não tem pedidos
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#bca48d]">
              Quando confirmar uma compra demonstrativa, ela aparecerá aqui e
              continuará disponível após atualizar a página neste navegador.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-md bg-[#dc9149] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#1c1008] hover:bg-[#f0a653]"
            >
              Voltar ao marketplace
            </button>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border border-[#493023] bg-[#21130d] p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#dc9149]">{order.id}</p>
                    <h3 className="mt-1 font-semibold">Pedido demonstrativo</h3>
                    <p className="mt-1 text-xs text-[#bca48d]">
                      {new Date(order.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <PackageCheck
                    className="shrink-0 text-emerald-400"
                    size={22}
                    aria-label="Pedido confirmado"
                  />
                </div>
                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-12 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#bca48d]">
                          {item.collection}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm text-[#f0a653]">
                        {formatEth(item.price, 2)} ETH
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-[#493023] pt-3">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-[#bca48d]">Total</span>
                    <strong className="text-[#f0a653]">
                      {formatEth(order.total, 2)} ETH
                    </strong>
                  </div>
                  <p className="mt-2 text-xs text-emerald-400">
                    {order.status}
                  </p>
                  <p className="mt-2 break-all text-xs text-[#947b65]">
                    Comprador: {order.customerName} · {order.email}
                  </p>
                  {order.wallet && (
                    <p className="mt-1 break-all text-xs text-[#947b65]">
                      Carteira informada: {order.wallet}
                    </p>
                  )}
                </div>
              </article>
            ))}
            <p className="pb-4 text-xs leading-5 text-[#947b65]">
              Histórico salvo no localStorage deste navegador. Os pedidos são
              demonstrativos; nenhum pagamento ou transação blockchain foi
              realizado.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
