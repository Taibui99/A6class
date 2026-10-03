"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";

import { HOME_PATH } from "@/lib/home";
import { cn } from "@/lib/utils";

/** Lối về kho công cụ. Nav đã bị ẩn nên không có tab nào hiện ở top bar,
 *  bấm logo là cách duy nhất — nhưng logo là ảnh nên không nói được là
 *  đang ở đâu. Ô này cho biết đang ở kho công cụ hay không, và đưa
 *  người dùng về đây từ mọi trang khác. */
export function HomeTaskLink() {
  const pathname = usePathname();
  const onHome = pathname === HOME_PATH || pathname.startsWith(`${HOME_PATH}/`);

  return (
    <Link
      href={HOME_PATH}
      aria-current={onHome ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-bold transition",
        onHome
          ? "bg-sky-500/15 text-sky ring-1 ring-sky-500/30"
          : "text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
      )}
    >
      <LayoutGrid aria-hidden className="size-4 shrink-0" />
      <span className="hidden sm:inline">Công cụ</span>
      <span className="sr-only sm:hidden">Về kho công cụ</span>
    </Link>
  );
}