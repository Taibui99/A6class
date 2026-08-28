"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navItems, isActivePath } from "@/components/layout/nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng di động"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex flex-col items-center gap-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-text-muted hover:text-text-secondary"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-1/2 top-0 h-0.5 w-8 translate-x-1/2 rounded-b-full transition-opacity",
                    active ? "bg-primary" : "opacity-0"
                  )}
                />
                <item.icon
                  aria-hidden="true"
                  className={cn(
                    "size-5 transition-transform duration-200 group-active:scale-90",
                    active && "-translate-y-px"
                  )}
                />
                <span>{item.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}