import {
  Newspaper,
  MessagesSquare,
  CircleHelp,
  UserRound,
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

/** Thi đua đứng đầu: đây là nhiệm vụ trọng tâm của web, mọi thứ khác là phụ. */
export const navItems: NavItem[] = [
  {
    href: HOME_PATH,
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