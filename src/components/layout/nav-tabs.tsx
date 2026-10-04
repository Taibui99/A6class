"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, ListTodo, UsersRound, LayoutDashboard, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOME_PATH } from "@/lib/home";

type Props = {
  isTeacher?: boolean;
};

export function NavTabs({ isTeacher }: Props) {
  const pathname = usePathname();

  const tabs = [
    { href: "/competition", label: "Thi đua", icon: Trophy },
    { href: "/tasks", label: "Hoạt động", icon: ListTodo },
    { href: "/members", label: "Thành viên", icon: UsersRound },
    { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { href: HOME_PATH, label: "Công cụ", icon: LayoutGrid },
  ];

  if (isTeacher) {
    tabs.push({ href: "/class", label: "Dữ liệu lớp", icon: UsersRound });
  }

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
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              isActive
                ? "bg-sky-500/15 text-sky ring-1 ring-sky-500/30 shadow-sm"
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
