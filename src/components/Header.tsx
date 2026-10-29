//Types
import { type HeaderProps } from "../types/Header";

export default function Header({
  cartCount,
  user,
  onLogin,
  onLogout,
  onOpenCart,
  onOpenOrders,
}: HeaderProps) {
  const focusSearch = () => {
    document.getElementById("search")?.focus();
  };

  return (
    <header className="hidden h-18.5 items-center justify-between gap-6 border-b border-[#382219] px-[8.8%] min-[681px]:flex max-[1050px]:px-[5%]">
      <a href="#inicio" className="text-[15px] tracking-[1px] text-white">
        KURIO
      </a>

      <nav className="flex h-full items-center gap-10.5 max-[1050px]:gap-5.5">
        <a
          href="#inicio"
          className="relative flex h-full items-center text-xs text-[#f0a653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#dc9149]"
        >
          Início
        </a>

        <a
          href="#mercado"
          className="flex h-full items-center text-xs text-[#c8b19a] transition-colors hover:text-[#f0a653]"
        >
          Mercado
        </a>

        <a
          href="#criadores"
          className="flex h-full items-center text-xs text-[#c8b19a] transition-colors hover:text-[#f0a653]"
        >
          Criadores
        </a>

        <a
          href="#diario"
          className="flex h-full items-center text-xs text-[#c8b19a] transition-colors hover:text-[#f0a653]"
        >
          Aprenda
        </a>
      </nav>

      <div className="flex items-center gap-4.5">
        <button
          type="button"
          aria-label="Buscar"
          onClick={focusSearch}
          className="relative bg-transparent p-1 text-[25px] text-[#f0dfca] transition-colors hover:text-[#f0a653]"
        >
          ⌕
        </button>

        <button
          type="button"
          aria-label={`Carrinho com ${cartCount} itens`}
          onClick={onOpenCart}
          className="relative bg-transparent p-1 text-[17px] text-[#f0dfca] transition-colors hover:text-[#f0a653]"
        >
          🛒
          <span className="absolute -right-1 top-0 grid size-3.75 place-items-center rounded-full bg-[#dc9149] font-sans text-[10px] text-[#180d07]">
            {cartCount}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenOrders}
          className="rounded-md border border-[#65472f] px-3 py-2 text-xs font-semibold text-[#e8d6c3] transition-colors hover:bg-[#2a1a12] hover:text-[#f0a653]"
        >
          Meus pedidos
        </button>
        {user ? (
          <div className="flex items-center gap-2">
            <a
              href="/profile"
              className="text-xs text-[#f0a653] hover:underline"
            >
              Perfil
            </a>
            <a
              href="/wallets"
              className="text-xs text-[#f0a653] hover:underline"
            >
              Carteiras
            </a>
            <span className="max-w-28 truncate text-xs text-[#e8d6c3]">
              Olá, {user.name.split(" ")[0]}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-[5px] border border-[#65472f] px-3 py-2.5 text-xs font-semibold text-[#e8d6c3] transition-colors hover:bg-[#2a1a12]"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="rounded-[5px] border-0 bg-[#dc9149] px-3.5 py-2.5 text-xs font-bold text-[#1c1008] transition-colors hover:bg-[#f0a653]"
          >
            ↗ Entrar
          </button>
        )}
      </div>
    </header>
  );
}
