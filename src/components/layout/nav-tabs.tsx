"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HOME_PATH } from "@/lib/home";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-items";

type Props = {
  isTeacher?: boolean;
};

/** Core destinations trên desktop — tin nhắn/hỗ trợ/hồ sơ đi qua user menu. */
const CORE_HREFS = new Set(["/dashboard", "/feed", "/competition", "/tasks", "/members", HOME_PATH]);

export function NavTabs({ isTeacher }: Props) {
  const pathname = usePathname();

  const tabs = navItems.filter(
    (item) => CORE_HREFS.has(item.href) && (!item.teacherOnly || isTeacher)
  );

  return (
    <nav className="hidden md:flex items-center gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname === tab.href || pathname.startsWith(tab.href + "/");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
              isActive
                ? "bg-primary-light text-primary"
                : "text-text-secondary hover:bg-surface-hover hover:text-text"
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
