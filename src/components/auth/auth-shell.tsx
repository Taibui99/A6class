import type { CSSProperties } from "react";
import { Sparkles, Trophy, Users } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Mascot } from "@/components/mascot";

const POINTS = [
  {
    icon: Trophy,
    title: "Thi đua theo tổ",
    desc: "Chấm điểm, xếp hạng, vinh danh mỗi tuần",
  },
  {
    icon: Users,
    title: "Cả lớp cùng tham gia",
    desc: "Điểm danh, việc lớp, bảng tin chung",
  },
  {
    icon: Sparkles,
    title: "Học mà chơi",
    desc: "Minigame, huy hiệu, bảng thành tích",
  },
];

const CHIPS = [
  { text: "+5đ", style: { top: "6%", right: "8%", animationDelay: "0s" } },
  { text: "#1 tuần", style: { top: "22%", right: "22%", animationDelay: "1.1s" } },
  { text: "12A6", style: { bottom: "14%", right: "10%", animationDelay: "2s" } },
];

const STARS = Array.from({ length: 14 }, (_, i) => {
  const s = Math.sin(i * 78.233) * 43758.5453;
  const a = s - Math.floor(s);
  const b = Math.sin(i * 12.9898) * 24634.6345;
  const c = b - Math.floor(b);
  return {
    left: a * 100,
    top: c * 100,
    size: 1.5 + a * 2.5,
    delay: a * 4,
    dur: 2 + c * 3,
  };
});

/**
 * Màn đăng nhập/đăng ký sống động: nền aurora trôi, sao nhấp nháy, vòng
 * quỹ đạo xoay, chip sticker bay, linh vật nhún nhảy, form vào theo nhịp.
 * Tất cả chỉ dùng transform/opacity (rẻ cho GPU), tắt hết khi người dùng
 * bật giảm chuyển động.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0a182e] px-4 py-8 sm:py-12">
      {/* Nền aurora + sao — trang trí thuần túy */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="auth-orb-1 absolute rounded-full" />
        <span className="auth-orb-2 absolute rounded-full" />
        <span className="auth-ring" />
        {STARS.map((s, i) => (
          <span
            key={i}
            className="auth-star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            }}
          />
        ))}
      </div>

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center">
        <div className="auth-rise grid w-full overflow-hidden rounded-3xl bg-surface shadow-2xl lg:grid-cols-[1fr_1.1fr]">
          {/* Panel brand */}
          <div
            className="relative flex flex-col justify-center gap-6 overflow-hidden p-6 text-white sm:p-8"
            style={{
              background:
                "linear-gradient(150deg,#0b5b72 0%,#0e7490 45%,#2563eb 100%)",
            }}
          >
            <span aria-hidden className="auth-panel-glow" />
            {CHIPS.map((c) => (
              <span
                key={c.text}
                aria-hidden
                className="auth-chip"
                style={c.style as CSSProperties}
              >
                {c.text}
              </span>
            ))}
            <div
              className="auth-rise relative text-white"
              style={{ animationDelay: "80ms" }}
            >
              <Logo size="md" />
            </div>
            <div className="auth-rise relative" style={{ animationDelay: "160ms" }}>
              <p className="text-2xl font-black leading-snug tracking-tight sm:text-3xl">
                Ngôi nhà số
                <br />
                của lớp bạn.
              </p>
              <p className="mt-2 text-sm text-white/75">
                Điểm danh, thi đua, giao việc — mọi sinh hoạt lớp gói trong một
                web.
              </p>
            </div>
            <ul className="auth-rise relative hidden flex-col gap-3 sm:flex" style={{ animationDelay: "240ms" }}>
              {POINTS.map((p) => (
                <li key={p.title} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25"
                  >
                    <p.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold">
                      {p.title}
                    </span>
                    <span className="block text-xs text-white/70">{p.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div
              aria-hidden
              className="auth-mascot pointer-events-none absolute -bottom-4 right-4 hidden opacity-90 sm:block"
            >
              <Mascot size={96} face="happy" />
            </div>
          </div>

          {/* Cột form */}
          <div className="p-6 sm:p-8">
            <div className="auth-rise" style={{ animationDelay: "200ms" }}>
              <h1 className="text-2xl font-black tracking-tight text-text">
                {title}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
            </div>
            <div className="auth-rise mt-5" style={{ animationDelay: "300ms" }}>
              {children}
            </div>
            {footer && (
              <div className="auth-rise mt-5" style={{ animationDelay: "380ms" }}>
                {footer}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/45">
          A6Class · Ngôi nhà số của lớp 12A6
        </p>
      </main>
    </div>
  );
}
