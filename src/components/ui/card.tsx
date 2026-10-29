//Types
import { type CardProps } from "../../types/Card";

export function Card({ as = "div", className = "", children }: CardProps) {
  const classes = `rounded-xl border border-[#493023] bg-[#21130d] ${className}`;
  if (as === "article")
    return <article className={classes}>{children}</article>;
  if (as === "section")
    return <section className={classes}>{children}</section>;
  return <div className={classes}>{children}</div>;
}
