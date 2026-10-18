import type { SVGProps } from "react";

export type RebusIconKey =
  | "nonla"
  | "hoa"
  | "tim"
  | "mat"
  | "nuoc"
  | "trang"
  | "sao"
  | "nang"
  | "nha"
  | "cay"
  | "nhan"
  | "mieung"
  | "dongho"
  | "tui";

const stroke = "#000000";
const fill = "#ffffff";

export function RebusIcon({
  icon,
  size,
  ...props
}: { icon?: RebusIconKey; size?: number } & SVGProps<SVGSVGElement> = {
  icon: undefined,
}) {
  const base: SVGProps<SVGSVGElement> = {
    viewBox: "0 0 100 100",
    width: size,
    height: size,
    ...props,
  };
  if (!icon) return null;
  switch (icon) {
    case "nonla": {
      return (
        <svg {...base}>
          <path d="M50 14 L18 92 L82 92 Z" fill="#f4c26d" stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="16" r="6" fill="#8b5a2b" stroke={stroke} strokeWidth="2" />
          <path d="M30 70 Q50 40 70 70" fill="none" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    }
    case "hoa": {
      return (
        <svg {...base}>
          <circle cx="50" cy="50" r="12" fill="#ff4d6d" stroke={stroke} strokeWidth="2" />
          <g fill="#ff4d6d" stroke={stroke} strokeWidth="2">
            <ellipse cx="50" cy="28" rx="8" ry="14" />
            <ellipse cx="50" cy="72" rx="8" ry="14" />
            <ellipse cx="28" cy="50" rx="14" ry="8" />
            <ellipse cx="72" cy="50" rx="14" ry="8" />
            <ellipse cx="34" cy="34" rx="7" ry="12" transform="rotate(45 34 34)" />
            <ellipse cx="66" cy="66" rx="7" ry="12" transform="rotate(45 66 66)" />
            <ellipse cx="34" cy="66" rx="7" ry="12" transform="rotate(-45 34 66)" />
            <ellipse cx="66" cy="34" rx="7" ry="12" transform="rotate(-45 66 34)" />
          </g>
        </svg>
      );
    }
    case "tim": {
      return (
        <svg {...base}>
          <path
            d="M50 82 C50 82 12 52 12 22 C12 8 30 2 50 18 C70 2 88 8 88 22 C88 52 50 82 50 82 Z"
            fill="#ff4d6d"
            stroke={stroke}
            strokeWidth="3"
          />
        </svg>
      );
    }
    case "mat": {
      return (
        <svg {...base}>
          <path d="M20 50 Q50 30 80 50 Q50 70 20 50 Z" fill="#fff" stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="50" r="9" fill="#333" />
        </svg>
      );
    }
    case "nuoc": {
      return (
        <svg {...base}>
          <path
            d="M50 18 Q40 42 50 66 Q60 42 50 18 Z"
            fill="#6ec6ff"
            stroke={stroke}
            strokeWidth="3"
          />
          <path d="M34 60 Q50 40 66 60" fill="none" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    }
    case "trang": {
      return (
        <svg {...base}>
          <circle cx="44" cy="50" r="22" fill="#f3e5ab" stroke={stroke} strokeWidth="3" />
          <circle cx="56" cy="50" r="22" fill={fill} stroke="none" />
        </svg>
      );
    }
    case "sao": {
      return (
        <svg {...base}>
          <path
            d="M50 16 L55 35 L76 37 L60 52 L66 74 L50 60 L34 74 L40 52 L24 37 L45 35 Z"
            fill="#ffd166"
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );
    }
    case "nang": {
      return (
        <svg {...base}>
          <circle cx="50" cy="50" r="14" fill="#ffd166" stroke={stroke} strokeWidth="3" />
          <path d="M50 30 L50 18 M50 82 L50 70 M30 50 L18 50 M70 50 L82 50" stroke="#ffd166" strokeWidth="5" strokeLinecap="round" />
          <path d="M34 34 L44 44 M66 66 L56 56 M66 34 L56 44 M34 66 L44 56" stroke="#ffd166" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    }
    case "nha": {
      return (
        <svg {...base}>
          <path d="M30 70 L50 30 L70 70 Z" fill="#ffb703" stroke={stroke} strokeWidth="3" />
          <rect x="32" y="50" width="36" height="42" fill="#219ebc" stroke={stroke} strokeWidth="3" />
          <rect x="44" y="68" width="12" height="14" fill="#ffffff" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    }
    case "cay": {
      return (
        <svg {...base}>
          <rect x="46" y="66" width="8" height="24" fill="#8b5a2b" stroke={stroke} strokeWidth="2" />
          <circle cx="50" cy="40" r="20" fill="#2d6a4f" stroke={stroke} strokeWidth="3" />
        </svg>
      );
    }
    case "nhan": {
      return (
        <svg {...base}>
          <circle cx="50" cy="50" r="16" fill="#d9e4f5" stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="50" r="8" fill={fill} stroke={stroke} strokeWidth="2" />
        </svg>
      );
    }
    case "mieung": {
      return (
        <svg {...base}>
          <path d="M22 55 Q50 42 78 55 Q50 68 22 55 Z" fill="#ff4d6d" stroke={stroke} strokeWidth="3" />
        </svg>
      );
    }
    case "dongho": {
      return (
        <svg {...base}>
          <circle cx="50" cy="50" r="20" fill="#f1faee" stroke={stroke} strokeWidth="3" />
          <line x1="50" y1="50" x2="50" y2="30" stroke={stroke} strokeWidth="3" />
          <line x1="50" y1="50" x2="70" y2="42" stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="50" r="3" fill={stroke} />
        </svg>
      );
    }
    case "tui": {
      return (
        <svg {...base}>
          <path d="M30 74 Q30 50 50 50 Q70 50 70 74 Z" fill="#a259ff" stroke={stroke} strokeWidth="3" />
          <path d="M40 50 Q50 30 60 50" fill="none" stroke={stroke} strokeWidth="3" />
        </svg>
      );
    }
  }
}
