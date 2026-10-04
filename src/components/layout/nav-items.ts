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

/** Kho công cụ đứng đầu: đây là trang chính, chọn công cụ rồi chuyển tới. */
export const navItems: NavItem[] = [
  {
    href: "/competition",
    label: "Thi đua",
    shortLabel: "Thi đua",
    icon: Trophy,
  },
  {
    href: "/tasks",
    label: "Hoạt động",
    shortLabel: "Việc lớp",
    icon: ListTodo,
  },
  {
    href: "/members",
    label: "Thành viên",
    shortLabel: "Thành viên",
    icon: UsersRound,
  },
  {
    href: "/dashboard",
    label: "Tổng quan",
    shortLabel: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    href: HOME_PATH,
    label: "Kho công cụ",
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