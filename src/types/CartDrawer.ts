//Types
import type { NFT } from "../types/nft";
import type { DemoOrder } from "../types/DemoOrder";

export type CartDrawerProps = {
  items: NFT[];
  onRemove: (id: number) => void;
  quantities: Record<number, number>;
  onQuantityChange: (id: number, quantity: number) => void;
  onClose: () => void;
  onCheckoutComplete: (order: DemoOrder) => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  customer?: { name: string; email: string };
};
