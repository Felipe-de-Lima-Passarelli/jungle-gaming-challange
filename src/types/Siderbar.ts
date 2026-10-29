//React
import type { Dispatch, SetStateAction } from "react";

export type SidebarProps = {
  category: string;
  network: string;
  onSelectNetwork: (network: string) => void;
  onSelectCategory: (category: string) => void;
  minPrice: number;
  maxPrice: number;
  setMinPrice: Dispatch<SetStateAction<number>>;
  setMaxPrice: Dispatch<SetStateAction<number>>;
  onApplyRange: () => void;
};
