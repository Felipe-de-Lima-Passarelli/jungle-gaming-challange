//Types
import type { NFT } from "./nft";

export type DemoOrder = {
  id: string;
  createdAt: string;
  customerName: string;
  email: string;
  wallet: string;
  items: NFT[];
  total: number;
  status: string;
  transactionReference?: string;
  discount?: number;
  networkFee?: number;
};
