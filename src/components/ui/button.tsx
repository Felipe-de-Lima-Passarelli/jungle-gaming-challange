//Types
import { type ButtonProps } from "../../types/Button";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0a653] focus-visible:ring-offset-2 focus-visible:ring-offset-[#140c08] disabled:pointer-events-none disabled:opacity-50";
const variants = {
  default: "bg-[#dc9149] text-[#1c1008] hover:bg-[#f0a653]",
  outline: "border border-[#65472f] text-[#e8d6c3] hover:bg-[#2a1a12]",
  ghost: "text-[#bca48d] hover:bg-[#2a1a12] hover:text-[#f0a653]",
};
export function Button({
  className = "",
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
