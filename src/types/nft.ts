export type NFT = {
  id: number;
  name: string;
  collection: string;
  description: string;
  image: string;
  price: string;
  currency: "ETH";
  category: string;
  network: "Ethereum" | "Polygon" | "Solana";
  likes: number;
  isRare: boolean;
  available?: boolean;
  edition?: number;
};
