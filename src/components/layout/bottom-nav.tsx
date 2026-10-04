"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, ListTodo, UsersRound, LayoutDashboard, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOME_PATH } from "@/lib/home";

type Props = {
  isTeacher?: boolean;
};

export function BottomNav({ isTeacher }: Props) {
  const pathname = usePathname();

  const items = [
    { href: "/competition", label: "Thi đua", icon: Trophy },
    { href: "/tasks", label: "Việc lớp", icon: ListTodo },
    { href: "/members", label: "4 Tổ", icon: UsersRound },
    { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { href: HOME_PATH, label: "Công cụ", icon: LayoutGrid },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-border bg-surface/95 backdrop-blur-lg px-2 py-1.5 shadow-2xl">
      <nav className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-bold transition-all",
                isActive
                  ? "text-sky"
                  : "text-text-muted hover:text-text"
              )}
            >
              <div
                className={cn(
                  "grid size-8 place-items-center rounded-xl transition-all",
                  isActive
                    ? "bg-sky-500/20 text-sky ring-1 ring-sky-500/40"
                    : "text-text-muted"
                )}
              >
                <Icon className="size-4 shrink-0" />
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
