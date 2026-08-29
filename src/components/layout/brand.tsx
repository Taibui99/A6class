import Link from "next/link";

import { cn } from "@/lib/utils";
import { Mascot } from "@/components/mascot";

export function Brand({
  size = "md",
  href = "/bang-dieu-khien",
  markClassName,
}: {
  size?: "sm" | "md";
  href?: string;
  markClassName?: string;
}) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0",
          size === "sm" ? "size-8" : "size-9",
          markClassName
        )}
      >
        <Mascot size={size === "sm" ? 28 : 34} />
      </span>
      <span className={cn("leading-tight", size === "sm" && "hidden min-[400px]:block")}>
        <span className="block text-[15px] font-bold tracking-tight text-text">
          A6Class
        </span>
        <span className="block text-[11px] font-medium text-text-muted">
          Lớp 12A6
        </span>
      </span>
    </Link>
  );
}