"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HOME_PATH } from "@/lib/home";
import { cn } from "@/lib/utils";
import { isActivePath, navItems } from "@/components/layout/nav-items";

/**
 * Sidebar navy cho desktop — theo cấu trúc demo: Tổng quan, Học sinh,
 * Điểm danh, Thi đua, Việc lớp, Thời khóa biểu, Thông báo, Công cụ
 * (+ Dữ liệu lớp cho giáo viên). Lọc teacher như NavTabs cũ.
 * Mục đang xem = viên thuốc gradient teal→xanh phát sáng nhẹ.
 */
const CORE_HREFS = new Set([
  "/dashboard",
  "/members",
  "/attendance",
  "/competition",
  "/tasks",
  "/timetable",
  "/notices",
  "/class",
  HOME_PATH,
]);

export function SidebarNav({ isTeacher }: { isTeacher?: boolean }) {
  const pathname = usePathname();

  const tabs = navItems.filter(
    (item) => CORE_HREFS.has(item.href) && (!item.teacherOnly || isTeacher)
  );

  return (
    <nav className="flex flex-col gap-1" aria-label="Điều hướng chính">
      <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Menu
      </p>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActivePath(pathname, tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
              active
                ? "bg-gradient-to-r from-[#1293b3] to-[#2563eb] text-white shadow-[0_4px_14px_rgba(14,116,144,0.45)]"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            <span className="truncate">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
