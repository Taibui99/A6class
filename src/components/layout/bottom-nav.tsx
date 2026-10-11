"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, ListTodo, LayoutDashboard, LayoutGrid, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOME_PATH } from "@/lib/home";

/**
 * 5 đích theo mental model học sinh (DESIGN-REDESIGN.md §5.1):
 * Tổng quan → Bảng lớp → Thi đua → Nhiệm vụ → Công cụ.
 * Pop Gen-Z: active = pill mực chữ kem — không glassmorphism,
 * không floating, không gradient. Hit area ≥44px.
 */
export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { href: "/feed", label: "Bảng lớp", icon: Newspaper },
    { href: "/competition", label: "Thi đua", icon: Trophy },
    { href: "/tasks", label: "Việc lớp", icon: ListTodo },
    { href: HOME_PATH, label: "Công cụ", icon: LayoutGrid },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <nav className="flex items-stretch justify-around px-1">
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
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] font-bold transition-all",
                isActive ? "bg-primary text-primary-ink" : "text-text-muted"
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
