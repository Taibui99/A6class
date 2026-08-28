"use client";

import { usePathname } from "next/navigation";

import { navItems, isActivePath } from "@/components/layout/nav-items";

export function MobilePageTitle() {
  const pathname = usePathname();
  const current = navItems.find((item) => isActivePath(pathname, item.href));

  return (
    <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-sm font-semibold text-text">
      {current ? current.label : "A6Class"}
    </p>
  );
}