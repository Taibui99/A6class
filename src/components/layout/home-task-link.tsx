"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy } from "lucide-react";

import { HOME_PATH } from "@/lib/home";
import { cn } from "@/lib/utils";

/** Lối về nhiệm vụ trọng tâm. Nav đã bị ẩn nên nếu không có link này thì
 *  người dùng ở feed/nhắn tin không có cách nào quay lại thi đua ngoài
 *  việc bấm logo. Ẩn trên chính trang thi đua để không thừa. */
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
          : "text-text-secondary hover:bg-surface-hover hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
      )}
    >
      <Trophy aria-hidden className="size-4 shrink-0" />
      <span className="hidden sm:inline">Thi đua</span>
      <span className="sr-only sm:hidden">Về trang thi đua</span>
    </Link>
  );
}
