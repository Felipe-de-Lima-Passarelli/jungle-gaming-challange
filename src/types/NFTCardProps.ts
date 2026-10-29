//Types
import type { NFT } from "./nft";

export type NFTCardProps = {
  nft: NFT;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onAddToCart: (id: number) => void;
};
