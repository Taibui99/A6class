import {
  Home,
  Newspaper,
  MessagesSquare,
  CircleHelp,
  UserRound,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Nhà",
    shortLabel: "Nhà",
    icon: Home,
  },
  {
    href: "/competition",
    label: "Thi đua",
    shortLabel: "Thi đua",
    icon: Trophy,
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