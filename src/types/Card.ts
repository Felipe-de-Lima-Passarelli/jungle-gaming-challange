//React
import type { ReactNode } from "react";

export type CardProps = {
  as?: "div" | "section" | "article";
  className?: string;
  children: ReactNode;
};
