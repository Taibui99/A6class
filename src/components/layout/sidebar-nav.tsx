"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navItems, isActivePath } from "@/components/layout/nav-items";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Điều hướng chính" className="flex flex-1 flex-col gap-0.5 px-3">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
              active
                ? "bg-primary-light text-primary"
                : "text-text-secondary hover:bg-surface-hover hover:text-text"
            )}
          >
            {active && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
              />
            )}
            <item.icon
              aria-hidden="true"
              className={cn(
                "size-[18px] shrink-0 transition-transform duration-150",
                active
                  ? "text-primary"
                  : "text-text-muted group-hover:text-text-secondary"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}