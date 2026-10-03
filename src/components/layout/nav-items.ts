import {
  Newspaper,
  MessagesSquare,
  CircleHelp,
  UserRound,
  LayoutGrid,
  Trophy,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

import { HOME_PATH } from "@/lib/home";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

/** Kho công cụ đứng đầu: đây là trang chính, chọn công cụ rồi chuyển tới. */
export const navItems: NavItem[] = [
  {
    href: HOME_PATH,
    label: "Công cụ",
    shortLabel: "Công cụ",
    icon: LayoutGrid,
  },
  {
    href: "/competition",
    label: "Thi đua",
    shortLabel: "Thi đua",
    icon: Trophy,
  },
  {
    href: "/dashboard",
    label: "Bảng điều khiển",
    shortLabel: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    href: "/feed",
    label: "Feed lớp",
    shortLabel: "Feed",
    icon: Newspaper,
  },
  {
    href: "/messages",
    label: "Nhắn tin",
    shortLabel: "Nhắn tin",
    icon: MessagesSquare,
  },
  {
    href: "/help",
    label: "Hỏi đáp",
    shortLabel: "Hỏi đáp",
    icon: CircleHelp,
  },
  {
    href: "/profile",
    label: "Hồ sơ",
    shortLabel: "Hồ sơ",
    icon: UserRound,
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}