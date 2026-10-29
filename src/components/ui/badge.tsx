//React
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline";
};
export function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const variantClass =
    variant === "outline"
      ? "border border-[#dc9149]/60 bg-[#140c08]/90 text-[#f0a653]"
      : "bg-[#dc9149] text-[#1b1008]";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${variantClass} ${className}`}
      {...props}
    />
  );
}
