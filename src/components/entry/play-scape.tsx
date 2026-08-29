import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function Ic({ children, className }: { children: ReactNode; className?: string }) {
  return <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">{children}</svg>;
}

type Item = {
  name: string;
  className: string;
  popDelay: number;
  floatDelay: number;
  size: number;
  svg: ReactNode;
};

const items: Item[] = [
  {
    name: "star",
    className: "left-[7%] top-[16%]",
    popDelay: 900,
    floatDelay: 0,
    size: 44,
    svg: (
      <Ic>
        <path
          d="M24 5l5.1 12.1L42 18l-9.6 8.5L36 39l-12-7.6L12 39l3.6-12.5L6 18l12.9-.9z"
          fill="#FBBF24"
          stroke="#B45309"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="19" cy="14" r="2.6" fill="#FFFFFF" opacity="0.65" />
      </Ic>
    ),
  },
  {
    name: "pencil",
    className: "right-[10%] top-[22%]",
    popDelay: 1250,
    floatDelay: 500,
    size: 46,
    svg: (
      <Ic className="rotate-[28deg]">
        <rect x="20" y="5" width="8" height="26" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.4" />
        <rect x="17" y="7" width="14" height="6" rx="2.5" fill="#FBBF24" />
        <path d="M20 29l8 0 -4 10z" fill="#DC2626" />
        <path d="M24 36v3" stroke="#FFF7ED" strokeWidth="2" strokeLinecap="round" />
      </Ic>
    ),
  },
  {
    name: "book",
    className: "left-[5%] top-[34%]",
    popDelay: 1400,
    floatDelay: 200,
    size: 48,
    svg: (
      <Ic>
        <rect x="8" y="11" width="32" height="27" rx="6" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="1.6" />
        <rect x="20" y="11" width="5" height="27" fill="#BFDBFE" opacity="0.85" />
        <path d="M13 19h12M13 25h12M13 31h7" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      </Ic>
    ),
  },
  {
    name: "bell",
    className: "right-[8%] bottom-[34%]",
    popDelay: 1600,
    floatDelay: 350,
    size: 42,
    svg: (
      <Ic>
        <path
          d="M12 15a12 12 0 0 1 24 0c0 8 3 10 3 12H9c0-2 3-4 3-12z"
          fill="#F43F5E"
          stroke="#BE123C"
          strokeWidth="1.6"
        />
        <circle cx="24" cy="33" r="3" fill="#FDE8EA" />
        <path d="M20 34q4 -3 8 0" stroke="#BE123C" strokeWidth="1.8" strokeLinecap="round" />
      </Ic>
    ),
  },
  {
    name: "rocket",
    className: "left-[6%] bottom-[26%]",
    popDelay: 1800,
    floatDelay: 150,
    size: 46,
    svg: (
      <Ic className="rotate-[-42deg]">
        <rect x="17" y="6" width="14" height="23" rx="7" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.6" />
        <circle cx="24" cy="17" r="4.6" fill="#60A5FA" />
        <path d="M20 28l8 0 -4 10z" fill="#F43F5E" />
      </Ic>
    ),
  },
  {
    name: "globe",
    className: "right-[6%] bottom-[20%]",
    popDelay: 1950,
    floatDelay: 600,
    size: 44,
    svg: (
      <Ic>
        <circle cx="24" cy="24" r="16" fill="#BFDBFE" stroke="#1E40AF" strokeWidth="2" />
        <ellipse cx="24" cy="24" rx="6.5" ry="16" fill="none" stroke="#1E40AF" strokeWidth="1.6" />
        <path d="M9 24h30" stroke="#1E40AF" strokeWidth="1.6" />
        <circle cx="30" cy="15" r="2.2" fill="#FFFFFF" opacity="0.8" />
      </Ic>
    ),
  },
];

function Cloud({ className, size }: { className?: string; size: number }) {
  return (
    <svg viewBox="0 0 72 44" width={size} aria-hidden="true" className={className}>
      <path
        d="M20 40a12 12 0 1 1 3-23.6A15 15 0 0 1 50 15a12 12 0 0 1 3.6 23.6z"
        fill="#FFFFFF"
        opacity="0.95"
      />
    </svg>
  );
}

function Flower({ className, delay }: { className?: string; delay: number }) {
  return (
    <span className={cn("cr-pop absolute", className)} style={{ animationDelay: `${delay}ms` }}>
      <svg viewBox="0 0 24 24" width={26} aria-hidden="true">
        <path d="M12 22V11" stroke="#6FA14E" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="8" r="4.4" fill="#F472B6" />
        <circle cx="12" cy="8" r="1.8" fill="#FBBF24" />
      </svg>
    </span>
  );
}

export function PlayScape() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -bottom-20 left-1/2 h-44 w-[135%] -translate-x-1/2 rounded-[50%] bg-emerald-200/70" />
      <div className="absolute -bottom-24 -left-28 h-52 w-80 rounded-[50%] bg-emerald-300/55" />
      <div className="absolute -bottom-20 -right-32 h-44 w-96 rounded-[50%] bg-teal-200/60" />

      <Flower className="left-[12%] bottom-[6%]" delay={1100} />
      <Flower className="right-[14%] bottom-[4%]" delay={1450} />
      <Flower className="left-[46%] bottom-[3%]" delay={1650} />

      {/* Mặt trời + tia quay */}
      <div className="absolute right-[7%] top-[9%]">
        <span
          className="cr-rays absolute -inset-2 rounded-full"
          style={{
            background:
              "repeating-conic-gradient(rgba(251,191,36,0.45) 0 10deg, transparent 10deg 24deg)",
          }}
        />
        <span className="relative block size-12 rounded-full bg-amber-300 ring-4 ring-amber-200/70" />
      </div>

      {/* Mây trôi */}
      <div className="cr-cloud absolute left-[8%] top-[12%]">
        <Cloud size={52} />
      </div>
      <div className="cr-cloud absolute right-[16%] top-[26%]" style={{ animationDelay: "-9s" }}>
        <Cloud size={38} />
      </div>
      <div className="cr-cloud absolute left-[16%] top-[30%]" style={{ animationDelay: "-18s" }}>
        <Cloud size={30} />
      </div>

      {/* Tia lấp lánh */}
      <span className="cr-twinkle absolute left-[22%] top-[14%] size-2 rounded-full bg-amber-300" />
      <span className="cr-twinkle absolute right-[24%] top-[18%] size-1.5 rounded-full bg-sky-300" style={{ animationDelay: "-0.8s" }} />
      <span className="cr-twinkle absolute left-[30%] top-[24%] size-1.5 rounded-full bg-amber-300" style={{ animationDelay: "-1.4s" }} />

      {/* Model object hoạt hình lơ lửng */}
      {items.map((it) => (
        <div
          key={it.name}
          className={cn("cr-pop absolute", it.className)}
          style={{ animationDelay: `${it.popDelay}ms` }}
        >
          <span
            className="cr-float block"
            style={{ width: it.size, animationDelay: `${it.floatDelay}ms` }}
          >
            {it.svg}
          </span>
        </div>
      ))}
    </div>
  );
}