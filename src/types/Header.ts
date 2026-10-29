//Types
import type { KurioUser } from "../types/KurioUser";

export type HeaderProps = {
  cartCount: number;
  user: KurioUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenCart: () => void;
  onOpenOrders: () => void;
};
