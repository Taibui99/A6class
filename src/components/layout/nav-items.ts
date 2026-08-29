import {
  Home,
  Newspaper,
  MessagesSquare,
  CircleHelp,
  UserRound,
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
    href: "/bang-dieu-khien",
    label: "Nhà",
    shortLabel: "Nhà",
    icon: Home,
  },
  {
    href: "/feed",
    label: "Feed lớp",
    shortLabel: "Feed",
    icon: Newspaper,
  },
  {
    href: "/nhan-tin",
    label: "Nhắn tin",
    shortLabel: "Nhắn tin",
    icon: MessagesSquare,
  },
  {
    href: "/cau-hoi",
    label: "Hỏi đáp",
    shortLabel: "Hỏi đáp",
    icon: CircleHelp,
  },
  {
    href: "/ho-so",
    label: "Hồ sơ",
    shortLabel: "Hồ sơ",
    icon: UserRound,
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}