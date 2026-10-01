"use client";

import { useMemo } from "react";

import { Mascot } from "@/components/mascot";

/* ============================================================
   Cảnh chào tối — 100% vector (SVG + CSS), không dùng ảnh.
   Trục viewBox 1200x675 (16:9), giữ tỉ lệ bằng preserveAspectRatio.
   ============================================================ */

const VB_W = 1200;
const VB_H = 675;

/** Ngôi sao rải khắp bầu trời, không trùng vị trí. */
function useStars() {
  return useMemo(() => {
    const rnd = (n: number) => {
      const x = Math.sin(n * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 110 }, (_, i) => {
      const a = rnd(i + 1);
      const b = rnd(i + 500);
      const c = rnd(i + 900);
      return {
        x: a * VB_W,
        y: b * 400,
        r: 0.6 + c * 1.9,
        dur: 2.2 + a * 4.5,
        delay: b * 5,
        warm: c > 0.82,
      };
    });
  }, []);
}

/** Đèn cửa sổ trường học bật dần theo thứ tự. */
const WINDOWS = Array.from({ length: 24 }, (_, i) => ({
  col: i % 8,
  row: Math.floor(i / 8),
  delay: 0.15 + i * 0.16,
  flick: i === 5 || i === 14,
}));

/** Bóng đèn đom đóm bay ngang cảnh. */
const FIREFLIES = Array.from({ length: 14 }, (_, i) => {
  const a = (i * 2.399) % 1;
  return {
    left: 4 + a * 92,
    bottom: 8 + ((i * 37) % 34),
    dur: 5 + ((i * 13) % 6),
    delay: (i * 7) % 9,
    size: 1.6 + ((i * 5) % 3) * 0.5,
    drift: 24 + ((i * 11) % 40),
  };
});

/** Biểu tượng tri thức trôi lên — sách, bút, sao, bóng địa cầu. */
const ORBS = [
  { icon: "book", left: 16, dur: 13, delay: 0, size: 30 },
  { icon: "pencil", left: 30, dur: 15, delay: 3.2, size: 26 },
  { icon: "star", left: 47, dur: 17, delay: 6.4, size: 24 },
  { icon: "globe", left: 63, dur: 14, delay: 2.1, size: 28 },
  { icon: "book", left: 79, dur: 16, delay: 7.8, size: 26 },
  { icon: "star", left: 89, dur: 12, delay: 4.6, size: 22 },
];

function OrbIcon({ icon }: { icon: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (icon === "book")
    return (
      <g {...common}>
        <path d="M12 6c-2.6-1.6-5.4-1.9-8-1.4v13c2.6-.5 5.4-.2 8 1.4 2.6-1.6 5.4-1.9 8-1.4v-13c-2.6-.5-5.4-.2-8 1.4Z" />
        <path d="M12 6v13" />
      </g>
    );
  if (icon === "pencil")
    return (
      <g {...common}>
        <path d="m4 20 3.2-.8L19 7.4a2 2 0 0 0 0-2.8 2 2 0 0 0-2.8 0L4.4 16.4 4 20Z" />
        <path d="m14.8 6.2 3 3" />
      </g>
    );
  if (icon === "globe")
    return (
      <g {...common}>
        <circle cx="12" cy="12" r="8.4" />
        <path d="M3.6 12h16.8M12 3.6c2.2 2.4 3.3 5.3 3.3 8.4S14.2 18 12 20.4c-2.2-2.4-3.3-5.3-3.3-8.4S9.8 6 12 3.6Z" />
      </g>
    );
  return (
    <path
      {...common}
      d="m12 3.6 2.5 5.3 5.8.8-4.2 4 1 5.7L12 16.7l-5.1 2.7 1-5.7-4.2-4 5.8-.8Z"
    />
  );
}

export default function WelcomeScene({ children }: { children?: React.ReactNode }) {
  const stars = useStars();

  return (
      <div className="ws-scene relative isolate w-full overflow-hidden rounded-[26px] bg-[var(--bg)] shadow-[0_30px_80px_-30px_rgba(2,6,23,.9)] ring-1 ring-white/10 sm:rounded-[32px]">
      {/* ── Nền trời: 3 lớp aurora trôi chậm ───────────────── */}
      <div aria-hidden className="absolute inset-0">
        <span
          className="ws-aurora absolute h-[70vmin] w-[70vmin] rounded-full blur-[90px]"
          style={{
            left: "-8%",
            top: "-22%",
            background: "radial-gradient(circle,#3B82F6,transparent 68%)",
            opacity: 0.5,
          }}
        />
        <span
          className="ws-aurora absolute h-[62vmin] w-[62vmin] rounded-full blur-[90px]"
          style={{
            right: "-6%",
            top: "-12%",
            background: "radial-gradient(circle,#A855F7,transparent 68%)",
            opacity: 0.4,
            animationDelay: "-5s",
          }}
        />
        <span
          className="ws-aurora absolute h-[66vmin] w-[66vmin] rounded-full blur-[100px]"
          style={{
            left: "24%",
            bottom: "-32%",
            background: "radial-gradient(circle,#06B6D4,transparent 68%)",
            opacity: 0.3,
            animationDelay: "-10s",
          }}
        />
      </div>

      {/* ── Toàn bộ cảnh vector ───────────────────────────── */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMax slice"
        className="relative block aspect-[16/9] w-full"
        role="img"
        aria-label="Ngôi trường 12A6 lúc đêm: trời sao, trăng, hồng đèn lớp học và linh vật robot"
      >
        <defs>
          <linearGradient id="ws-hill-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#141C3A" />
            <stop offset="100%" stopColor="#0C1228" />
          </linearGradient>
          <linearGradient id="ws-hill-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B1128" />
            <stop offset="100%" stopColor="#060A18" />
          </linearGradient>
          <linearGradient id="ws-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B2547" />
            <stop offset="100%" stopColor="#101833" />
          </linearGradient>
          <linearGradient id="ws-roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A3A6E" />
            <stop offset="100%" stopColor="#182252" />
          </linearGradient>
          <linearGradient id="ws-win" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <radialGradient id="ws-moon" cx="0.35" cy="0.3" r="0.75">
            <stop offset="0%" stopColor="#FEFCE8" />
            <stop offset="70%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FCD34D" />
          </radialGradient>
          <radialGradient id="ws-gate" cx="0.5" cy="0" r="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ws-flag" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <filter id="ws-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sao */}
        <g>
          {stars.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill={s.warm ? "#FDE68A" : "#FFFFFF"}
              opacity={0.35}
              style={{
                animation: `ws-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </g>

        {/* Sao băng */}
        {[0, 1, 2].map((i) => (
          <g
            key={`shoot-${i}`}
            style={{ animation: `ws-shoot 9s linear ${i * 3.1 + 1.5}s infinite` }}
          >
            <line
              x1="0"
              y1="0"
              x2="86"
              y2="40"
              stroke="#E0F2FE"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.85"
            />
            <circle cx="0" cy="0" r="2.6" fill="#FFFFFF" />
          </g>
        ))}

        {/* Trăng + quầng sáng */}
        <g>
          <circle cx="1042" cy="112" r="120" fill="#FDE68A" opacity="0.06" />
          <circle cx="1042" cy="112" r="76" fill="#FDE68A" opacity="0.1" />
          <circle cx="1042" cy="112" r="46" fill="url(#ws-moon)" filter="url(#ws-glow)" />
          <circle cx="1028" cy="100" r="6" fill="#FCD34D" opacity="0.45" />
          <circle cx="1054" cy="126" r="4" fill="#FCD34D" opacity="0.4" />
          <circle cx="1036" cy="132" r="2.6" fill="#FCD34D" opacity="0.35" />
        </g>

        {/* Núi xa — trôi rất chậm */}
        <path
          className="ws-parallax-far"
          fill="url(#ws-hill-far)"
          d="M0 470 L120 402 L232 456 L340 388 L470 462 L600 404 L724 466 L858 396 L986 460 L1100 414 L1200 468 L1200 675 L0 675 Z"
        />

        {/* Núi gần */}
        <path
          className="ws-parallax-near"
          fill="url(#ws-hill-near)"
          d="M0 552 L146 496 L268 546 L392 482 L520 552 L664 490 L800 556 L944 498 L1082 552 L1200 512 L1200 675 L0 675 Z"
        />

        {/* ── Cây bên trái, đung đưa ─────────────────────────── */}
        <g className="ws-tree" style={{ transformOrigin: "150px 548px" }}>
          <path d="M146 552h8v72h-8z" fill="#0A0F22" />
          <path d="M150 400c-34 0-58 26-58 58 0 24 14 42 34 50-10 8-16 20-16 32h80c0-12-6-24-16-32 20-8 34-26 34-50 0-32-24-58-58-58Z" fill="#0D1533" />
          <path d="M150 420c-24 0-42 18-42 40 0 17 10 30 24 36-8 6-12 14-12 24h60c0-10-4-18-12-24 14-6 24-19 24-36 0-22-18-40-42-40Z" fill="#111B40" />
        </g>
        {/* Cây bên phải, đung đưa lệch pha */}
        <g className="ws-tree" style={{ transformOrigin: "1064px 556px", animationDelay: "-1.4s" }}>
          <path d="M1060 560h8v66h-8z" fill="#0A0F22" />
          <path d="M1064 424c-30 0-52 24-52 52 0 21 12 37 30 45-9 7-14 18-14 28h72c0-10-5-21-14-28 18-8 30-24 30-45 0-28-22-52-52-52Z" fill="#0D1533" />
          <path d="M1064 442c-21 0-38 17-38 36 0 16 9 28 22 34-7 5-11 13-11 21h54c0-8-4-16-11-21 13-6 22-18 22-34 0-19-17-36-38-36Z" fill="#111B40" />
        </g>

        {/* ── Trường học ───────────────────────────────────── */}
        <g>
          {/* quầng sáng quanh trường */}
          <ellipse cx="600" cy="560" rx="360" ry="130" fill="url(#ws-gate)" opacity="0.5" />

          {/* mái */}
          <path d="M420 356 L600 246 L780 356 Z" fill="url(#ws-roof)" />
          <path d="M420 356 L780 356 L780 366 L420 366 Z" fill="#0E1533" />
          {/* chóp cờ trên mái */}
          <path d="M600 246 L600 218" stroke="#5B6BA8" strokeWidth="3" strokeLinecap="round" />
          <g className="ws-flag" style={{ transformOrigin: "600px 220px" }}>
            <path d="M601 220h44l-11 12 11 12h-44z" fill="url(#ws-flag)" />
          </g>

          {/* thân trường */}
          <rect x="440" y="366" width="320" height="188" fill="url(#ws-wall)" />
          {/* mái hiên */}
          <rect x="424" y="352" width="352" height="10" rx="4" fill="#26356A" />

          {/* cửa sổ: 8 cột x 3 hàng */}
          {WINDOWS.map((w, i) => {
            const x = 458 + w.col * 36;
            const y = 392 + w.row * 46;
            const lit = i % 4 !== 3;
            return (
              <g key={`win-${i}`}>
                <rect
                  x={x}
                  y={y}
                  width="26"
                  height="30"
                  rx="4"
                  fill={lit ? "url(#ws-win)" : "#0B1226"}
                  opacity={lit ? 0 : 1}
                  style={
                    lit
                      ? {
                          animation: w.flick
                            ? `ws-win ${5.5}s ease-in-out ${w.delay}s infinite`
                            : `ws-win-on 1.5s ease-out ${w.delay}s forwards`,
                          filter: "url(#ws-glow)",
                        }
                      : undefined
                  }
                />
                <rect x={x} y={y} width="26" height="30" rx="4" fill="none" stroke="#38477F" strokeWidth="1.4" />
                <path d={`M${x + 13} ${y}v30M${x} ${y + 15}h26`} stroke="#38477F" strokeWidth="1.1" />
              </g>
            );
          })}

          {/* cửa chính + ánh sáng đổ ra */}
          <path d="M566 554v-52a34 34 0 0 1 68 0v52Z" fill="#0B1226" />
          <path d="M566 554v-52a34 34 0 0 1 68 0v52Z" fill="url(#ws-win)" opacity="0.85" />
          <path d="M600 502v52" stroke="#8A6A22" strokeWidth="1.6" />
          <path d="M600 554l-96 78 192 0Z" fill="#FDE68A" opacity="0.07" />

          {/* bảng tên trường */}
          <rect x="548" y="374" width="104" height="18" rx="5" fill="#0B1226" stroke="#33417A" strokeWidth="1.2" />
          <text
            x="600"
            y="387"
            textAnchor="middle"
            fontSize="12"
            fontWeight="800"
            letterSpacing="2"
            fill="#7DD3FC"
          >
            12A6
          </text>

          {/* bậc cửa */}
          <path d="M524 554h152l14 22H510Z" fill="#111A3C" />
          <path d="M510 576h180l10 18H500Z" fill="#0C1228" />
        </g>

        {/* Bụi sáng quanh sân trường */}
        <g className="ws-dust" opacity="0.5">
          <circle cx="250" cy="600" r="2.4" fill="#FDE68A" />
          <circle cx="420" cy="628" r="1.8" fill="#BAE6FD" />
          <circle cx="820" cy="612" r="2.2" fill="#FDE68A" />
          <circle cx="980" cy="636" r="1.6" fill="#DDD6FE" />
        </g>
      </svg>

      {/* ── Đèn đom đóm ─────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {FIREFLIES.map((f, i) => (
          <span
            key={`ff-${i}`}
            className="ws-firefly absolute rounded-full bg-[#FDE68A]"
            style={{
              left: `${f.left}%`,
              bottom: `${f.bottom}%`,
              width: f.size,
              height: f.size,
              boxShadow: "0 0 8px 2px rgba(253,230,138,.7)",
              animation: `ws-drift ${f.dur}s ease-in-out ${f.delay}s infinite alternate`,
              ["--ws-drift" as string]: `${f.drift}px`,
            }}
          />
        ))}
      </div>

      {/* ── Biểu tượng tri thức trôi lên ─────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {ORBS.map((o, i) => (
          <span
            key={`orb-${i}`}
            className="ws-orb absolute"
            style={{
              left: `${o.left}%`,
              bottom: "-8%",
              width: o.size,
              height: o.size,
              color: ["#7DD3FC", "#C4B5FD", "#FDE68A", "#67E8F9"][i % 4],
              animation: `ws-rise ${o.dur}s linear ${o.delay}s infinite`,
            }}
          >
            <svg viewBox="0 0 24 24" className="size-full">
              <OrbIcon icon={o.icon} />
            </svg>
          </span>
        ))}
      </div>

      {/* Sương ấm ở đường chân trời */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(to top, rgba(7,11,26,.92) 0%, rgba(7,11,26,.45) 45%, transparent 100%)",
        }}
      />

      {/* Linh vật đứng bên cổng */}
      <div className="pointer-events-none absolute bottom-[9%] left-1/2 -translate-x-1/2">
        <div className="ws-mascot-float">
          <div className="ws-mascot-in">
            <Mascot size={74} className="ws-mascot-wave drop-shadow-[0_14px_28px_rgba(2,6,23,.6)]" />
          </div>
        </div>
      </div>

      {/* Quầng sáng dưới chân linh vật */}
      <div
        aria-hidden
        className="ws-glow pointer-events-none absolute bottom-[4%] left-1/2 h-8 w-56 -translate-x-1/2 rounded-[100%] blur-md"
        style={{
          background:
            "radial-gradient(ellipse, rgba(56,189,248,.42) 0%, rgba(56,189,248,0) 70%)",
        }}
      />

      {children}
    </div>
  );
}