import Link from "next/link";

import { cn } from "@/lib/utils";
import { Mascot } from "@/components/mascot";
import { Logo } from "@/components/layout/logo";

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
    <Link href={href} className="flex min-w-0 items-center gap-2">
      <Logo size="sm" className="shrink-0" />
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0",
          size === "sm" ? "size-6" : "size-8",
          markClassName
        )}
      >
        <Mascot size={size === "sm" ? 22 : 30} />
      </span>
    </Link>
  );
}