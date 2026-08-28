import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({ size = "md", href = "/bang-dieu-khien" }: { size?: "sm" | "md"; href?: string }) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center rounded-xl bg-primary font-extrabold tracking-tight text-white shadow-sm",
          size === "sm" ? "size-8 text-xs" : "size-9 text-[13px]"
        )}
      >
        A6
      </span>
      <span className={cn("leading-tight", size === "sm" && "hidden min-[400px]:block")}>
        <span className="block text-[15px] font-bold tracking-tight text-text">
          A6Class
        </span>
        <span className="block text-[11px] font-medium text-text-muted">
          Lớp 11A6
        </span>
      </span>
    </Link>
  );
}