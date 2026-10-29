//Types
import type { MobileBottomNavProps } from "../types/MobileBottomNav";

export default function MobileBottomNav({
  cartCount,
  onOpenCart,
  onOpenOrders,
  onOpenProfile,
}: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Navegação mobile"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[#493023] bg-[#140c08]/95 px-3 py-3 text-[#ead9c6] backdrop-blur-md md:hidden"
    >
      <a
        href="#inicio"
        aria-label="Início"
        className="flex flex-col items-center justify-center text-xl transition-colors hover:text-[#f0a653]"
      >
        ⌂
      </a>

      <a
        href="#mercado"
        aria-label="Favoritos"
        className="flex flex-col items-center justify-center text-xl transition-colors hover:text-[#f0a653]"
      >
        ♥
      </a>

      <button
        type="button"
        onClick={onOpenCart}
        aria-label="Abrir carrinho"
        className="relative flex flex-col items-center justify-center bg-transparent text-xl text-[#ead9c6] transition-colors hover:text-[#f0a653]"
      >
        🛒
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#dc9149] text-[10px] font-bold text-[#140c08]">
          {cartCount}
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenOrders}
        aria-label="Meus pedidos"
        className="flex flex-col items-center justify-center bg-transparent text-xl transition-colors hover:text-[#f0a653]"
      >
        ▣
      </button>
      <button
        type="button"
        onClick={onOpenProfile}
        aria-label="Meu perfil"
        className="flex flex-col items-center justify-center bg-transparent text-xl transition-colors hover:text-[#f0a653]"
      >
        ♟
      </button>
    </nav>
  );
}
