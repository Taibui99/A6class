import { useId } from "react";

import { cn } from "@/lib/utils";

export type MascotFace =
  | "friendly"
  | "happy"
  | "wink"
  | "love"
  | "surprised"
  | "sleepy";

const eyeArc = "M44.5 63 Q50 55 55.5 63";
const eyeArcR = "M64.5 63 Q70 55 75.5 63";
const mouthSmile = "M54 74 Q60 79 66 74";
const mouthHappy = "M53 72 Q60 81 67 72";

function Eyes({ mode }: { mode: MascotFace }) {
  if (mode === "wink") {
    return (
      <>
        <circle cx="50" cy="60" r="7" fill="#FAFBFF" />
        <circle cx="50" cy="62" r="3" fill="#0F172A" />
        <circle cx="48.5" cy="59" r="1.6" fill="#FFFFFF" />
        <path d={eyeArcR} stroke="#FAFBFF" strokeWidth="3.2" strokeLinecap="round" />
      </>
    );
  }
  if (mode === "love") {
    const heart = (cx: number) => (
      <g transform={`translate(${cx} 60)`}>
        <path
          d="M0 3.5 C0 3.5 -4.6 0.8 -4.6 -1.2 A2.9 2.9 0 0 1 0 -3.4 A2.9 2.9 0 0 1 4.6 -1.2 C4.6 0.8 0 3.5 0 3.5 Z"
          fill="#F43F5E"
        />
        <circle cx="-1.6" cy="-2.2" r="1" fill="#FFFFFF" opacity="0.7" />
      </g>
    );
    return <>{heart(50)}{heart(70)}</>;
  }
  if (mode === "sleepy" || mode === "happy") {
    const p = mode === "happy" ? eyeArc : eyeArc.replace("63", "61");
    const pr = mode === "happy" ? eyeArcR : eyeArcR.replace("63", "61");
    return (
      <>
        <path d={p} stroke="#FAFBFF" strokeWidth="3.2" strokeLinecap="round" />
        <path d={pr} stroke="#FAFBFF" strokeWidth="3.2" strokeLinecap="round" />
      </>
    );
  }
  if (mode === "surprised") {
    return (
      <>
        <circle cx="50" cy="60" r="8" fill="#FAFBFF" />
        <circle cx="70" cy="60" r="8" fill="#FAFBFF" />
        <circle cx="50" cy="60" r="1.8" fill="#0F172A" />
        <circle cx="70" cy="60" r="1.8" fill="#0F172A" />
      </>
    );
  }
  return (
    <>
      <circle cx="50" cy="60" r="7" fill="#FAFBFF" />
      <circle cx="70" cy="60" r="7" fill="#FAFBFF" />
      <circle cx="50" cy="62" r="3" fill="#0F172A" />
      <circle cx="70" cy="62" r="3" fill="#0F172A" />
      <circle cx="48.5" cy="59" r="1.6" fill="#FFFFFF" />
      <circle cx="68.5" cy="59" r="1.6" fill="#FFFFFF" />
    </>
  );
}

function Mouth({ mode }: { mode: MascotFace }) {
  if (mode === "surprised") {
    return (
      <circle cx="60" cy="75" r="3.4" stroke="#FAFBFF" strokeWidth="3" />
    );
  }
  if (mode === "love") {
    return (
      <path d="M56 73.5 Q60 76 64 73.5" stroke="#FAFBFF" strokeWidth="3" strokeLinecap="round" />
    );
  }
  if (mode === "happy") {
    return (
      <path d={mouthHappy} stroke="#FAFBFF" strokeWidth="3.6" strokeLinecap="round" />
    );
  }
  return (
    <path d={mouthSmile} stroke="#FAFBFF" strokeWidth="3.2" strokeLinecap="round" />
  );
}

export function Mascot({
  className,
  size = 64,
  face = "friendly",
  label = "Linh vật robot của lớp 12A6",
}: {
  className?: string;
  size?: number;
  face?: MascotFace;
  label?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const bodyGrad = `mascot-body-${id}`;
  const baseGrad = `mascot-base-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-hidden="true"
      aria-label={label}
      className={cn("select-none", className)}
    >
      <defs>
        <linearGradient
          id={bodyGrad}
          x1="40"
          y1="26"
          x2="80"
          y2="112"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" />
          <stop offset="0.58" stopColor="#F2F4F8" />
          <stop offset="0.6" stopColor="#2E56CC" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient
          id={baseGrad}
          x1="60"
          y1="98"
          x2="60"
          y2="114"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3159D0" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>

      {/* Tai nub hai bên */}
      <circle cx="18" cy="58" r="8" fill="#1E3A8A" />
      <circle cx="102" cy="58" r="8" fill="#1E3A8A" />

      {/* Ăng-ten */}
      <circle cx="60" cy="11" r="9" fill="#F59E0B" opacity="0.3" />
      <circle cx="60" cy="11" r="6" fill="#F59E0B" />
      <circle cx="57.5" cy="9" r="1.8" fill="#FFFFFF" opacity="0.8" />
      <line
        x1="60"
        y1="28"
        x2="60"
        y2="16"
        stroke="#475569"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Chân */}
      <ellipse cx="48" cy="114" rx="6" ry="4" fill="#1E3A8A" />
      <ellipse cx="72" cy="114" rx="6" ry="4" fill="#1E3A8A" />

      {/* Đế xanh */}
      <rect x="24" y="98" width="72" height="16" rx="9" fill={`url(#${baseGrad})`} />

      {/* Thân trắng */}
      <rect
        x="22"
        y="26"
        width="76"
        height="86"
        rx="30"
        fill={`url(#${bodyGrad})`}
        stroke="#D8E0EC"
        strokeWidth="1.5"
      />

      {/* Cánh tay trái (thân thiện — có thể vẫy) */}
      <g className="mascot-arm-left" style={{ transformOrigin: "18px 80px" }}>
        <rect
          x="10"
          y="61"
          width="16"
          height="38"
          rx="8"
          fill="#E8EEF7"
          stroke="#B9C6DE"
          strokeWidth="1.5"
          transform="rotate(10 18 80)"
        />
        <circle cx="18" cy="66" r="3.2" fill="#B9C6DE" opacity="0.5" />
      </g>
      {/* Cánh tay phải */}
      <g className="mascot-arm-right" style={{ transformOrigin: "102px 80px" }}>
        <rect
          x="94"
          y="61"
          width="16"
          height="38"
          rx="8"
          fill="#E8EEF7"
          stroke="#B9C6DE"
          strokeWidth="1.5"
          transform="rotate(-10 102 80)"
        />
      </g>

      {/* Màn hình mặt */}
      <rect x="36" y="40" width="48" height="42" rx="16" fill="#17223F" />

      {/* Quầng sáng mắt */}
      <circle cx="50" cy="60" r="9.5" fill="#93C5FD" opacity="0.22" />
      <circle cx="70" cy="60" r="9.5" fill="#93C5FD" opacity="0.22" />

      {/* Mặt */}
      <Eyes mode={face} />
      <Mouth mode={face} />

      {/* Má hồng trên thân */}
      <circle cx="33" cy="76" r="4.5" fill="#FBBF24" opacity="0.42" />
      <circle cx="87" cy="76" r="4.5" fill="#FBBF24" opacity="0.42" />

      {/* Tim 12A6 trên ngực */}
      <path
        d="M60 94 C60 94 54 88 54 85 C54 82 57 81 60 84 C63 81 66 82 66 85 C66 88 60 94 60 94 Z"
        fill="#F43F5E"
      />
    </svg>
  );
}