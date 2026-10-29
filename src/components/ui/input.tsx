//Types
import { type InputProps } from "../../types/Input";

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`flex h-11 w-full rounded-md border border-[#493023] bg-[#21130d] px-3 py-2 text-sm text-[#f3e5d5] outline-none placeholder:text-[#806953] focus-visible:border-[#dc9149] focus-visible:ring-2 focus-visible:ring-[#dc9149]/30 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
