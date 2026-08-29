import { useId } from "react";

import { cn } from "@/lib/utils";

export function Mascot({
  className,
  size = 64,
  label = "Linh vật robot của lớp 12A6",
}: {
  className?: string;
  size?: number;
  label?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const grad = `mascot-grad-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-label={label}
      className={cn("select-none", className)}
    >
      <defs>
        <linearGradient
          id={grad}
          x1="40"
          y1="24"
          x2="80"
          y2="112"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3159D0" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>

      {/* Tai/nub bên */}
      <circle cx="17" cy="58" r="7" fill="#1E3A8A" />
      <circle cx="103" cy="58" r="7" fill="#1E3A8A" />

      {/* Ăng-ten */}
      <circle cx="60" cy="10" r="8" fill="#F59E0B" opacity="0.35" />
      <circle cx="60" cy="10" r="5" fill="#F59E0B" />
      <line
        x1="60"
        y1="26"
        x2="60"
        y2="13"
        stroke="#1E3A8A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Thân */}
      <rect x="20" y="24" width="80" height="88" rx="32" fill={`url(#${grad})`} />

      {/* Ánh sáng trên đầu */}
      <ellipse cx="50" cy="40" rx="17" ry="9" fill="#FFFFFF" opacity="0.12" />

      {/* Mắt */}
      <circle cx="45" cy="54" r="11" fill="#FFFFFF" />
      <circle cx="75" cy="54" r="11" fill="#FFFFFF" />
      <circle cx="45" cy="56" r="5.5" fill="#1C1917" />
      <circle cx="75" cy="56" r="5.5" fill="#1C1917" />
      <circle cx="43" cy="53" r="2.2" fill="#FFFFFF" />
      <circle cx="73" cy="53" r="2.2" fill="#FFFFFF" />

      {/* Nụ cười */}
      <path
        d="M52 70 Q60 77 68 70"
        stroke="#1C1917"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Má hồng */}
      <circle cx="33" cy="66" r="4.5" fill="#FBBF24" opacity="0.45" />
      <circle cx="87" cy="66" r="4.5" fill="#FBBF24" opacity="0.45" />

      {/* Màn hình bụng */}
      <rect x="43" y="88" width="34" height="22" rx="11" fill="#EFF6FF" />

      {/* Tim 12A6 */}
      <path
        d="M60 100 C60 100 51 92 51 87.5 C51 83.5 55 81.5 60 86 C65 81.5 69 83.5 69 87.5 C69 92 60 100 60 100 Z"
        fill="#F43F5E"
      />
    </svg>
  );
}