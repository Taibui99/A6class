import { useId } from "react";

import { cn } from "@/lib/utils";

export function Mascot({
  className,
  size = 64,
  label = "Linh vật lớp 12A6",
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
          x1="60"
          y1="14"
          x2="60"
          y2="112"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3159D0" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>

      {/* Tai */}
      <path
        d="M36 40 L25 13 L50 28 Z"
        fill="#F59E0B"
        stroke="#F59E0B"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M84 40 L95 13 L70 28 Z"
        fill="#F59E0B"
        stroke="#F59E0B"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Thân */}
      <path
        d="M60 15 C82 15 99 34 99 60 C99 92 79 111 60 111 C41 111 21 92 21 60 C21 34 38 15 60 15 Z"
        fill={`url(#${grad})`}
      />

      {/* Bụng */}
      <ellipse cx="60" cy="83" rx="21" ry="23" fill="#EFF6FF" />

      {/* Tim trên bụng */}
      <path
        d="M60 91 C60 91 51 83 51 78.5 C51 74.5 55 72.5 60 77 C65 72.5 69 74.5 69 78.5 C69 83 60 91 60 91 Z"
        fill="#F43F5E"
      />

      {/* Mắt */}
      <circle cx="44" cy="54" r="13" fill="#FFFFFF" />
      <circle cx="76" cy="54" r="13" fill="#FFFFFF" />
      <circle cx="46" cy="56" r="6" fill="#1C1917" />
      <circle cx="76" cy="56" r="6" fill="#1C1917" />
      <circle cx="44" cy="53" r="2.4" fill="#FFFFFF" />
      <circle cx="74" cy="53" r="2.4" fill="#FFFFFF" />

      {/* Lông mày */}
      <path
        d="M34 41 L49 46"
        stroke="#1E3A8A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M86 41 L71 46"
        stroke="#1E3A8A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Mỏ */}
      <path d="M60 65 Q55 69 55 75 L65 75 Q65 69 60 65 Z" fill="#F59E0B" />

      {/* Má hồng */}
      <circle cx="33" cy="70" r="4.5" fill="#FBBF24" opacity="0.45" />
      <circle cx="87" cy="70" r="4.5" fill="#FBBF24" opacity="0.45" />

      {/* Chân */}
      <ellipse cx="47" cy="110" rx="6" ry="4" fill="#F59E0B" />
      <ellipse cx="73" cy="110" rx="6" ry="4" fill="#F59E0B" />
    </svg>
  );
}