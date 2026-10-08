import {
  Newspaper,
  MessagesSquare,
  CircleHelp,
  UserRound,
  LayoutGrid,
  Trophy,
  LayoutDashboard,
  UsersRound,
  ListTodo,
  type LucideIcon,
} from "lucide-react";

import { HOME_PATH } from "@/lib/home";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** Chỉ hiện với giáo viên (được lọc ở nơi render). */
  teacherOnly?: boolean;
};

/**
 * Thứ tự theo mental model học sinh (DESIGN-REDESIGN.md §5.1):
 * Tổng quan → Bảng lớp → Thi đua → Nhiệm vụ → Thành viên → Công cụ,
 * rồi mới tới taxonomy phần mềm (Dữ liệu lớp, tin nhắn, hỗ trợ, hồ sơ).
 */
export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Tổng quan",
    shortLabel: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    href: "/feed",
    label: "Bảng lớp",
    shortLabel: "Bảng lớp",
    icon: Newspaper,
  },
  {
    href: "/competition",
    label: "Thi đua",
    shortLabel: "Thi đua",
    icon: Trophy,
  },
  {
    href: "/tasks",
    label: "Nhiệm vụ",
    shortLabel: "Nhiệm vụ",
    icon: ListTodo,
  },
  {
    href: "/members",
    label: "Thành viên",
    shortLabel: "Thành viên",
    icon: UsersRound,
  },
  {
    href: HOME_PATH,
    label: "Công cụ",
    shortLabel: "Công cụ",
    icon: LayoutGrid,
  },
  {
    href: "/class",
    label: "Dữ liệu lớp",
    shortLabel: "Lớp",
    icon: UsersRound,
    teacherOnly: true,
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