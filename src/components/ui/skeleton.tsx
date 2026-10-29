//Types
import type { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer animate-pulse rounded-md bg-[#2a1a12] motion-reduce:animate-none ${className}`}
      {...props}
    />
  );
}
