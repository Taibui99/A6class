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
  ClipboardCheck,
  CalendarDays,
  Bell,
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
 * Thứ tự theo cấu trúc demo đã duyệt: Tổng quan → Học sinh → Điểm danh →
 * Bảng lớp → Thi đua → Việc lớp → Thời khóa biểu → Thông báo → Công cụ,
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
    href: "/members",
    label: "Học sinh",
    shortLabel: "Học sinh",
    icon: UsersRound,
  },
  {
    href: "/attendance",
    label: "Điểm danh",
    shortLabel: "Điểm danh",
    icon: ClipboardCheck,
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
    label: "Việc lớp",
    shortLabel: "Việc lớp",
    icon: ListTodo,
  },
  {
    href: "/timetable",
    label: "Thời khóa biểu",
    shortLabel: "TKB",
    icon: CalendarDays,
  },
  {
    href: "/notices",
    label: "Thông báo",
    shortLabel: "Thông báo",
    icon: Bell,
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