"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Splash thuần vector — không dùng ảnh nào.
 * Nền navy + quầng teal/xanh + sao nhấp nháy + vòng quỹ đạo + mark A6 vàng,
 * chữ quét sáng, thanh tiến trình thật. Cùng ngôn ngữ với bản prototype.
 */

const RUN_MS = 1500;
const FADE_MS = 400;

// Theo dõi trạng thái "đã hydration xong" mà không cần setState trong effect.
// Trả false khi SSR/hydration, true ngay sau khi client mount — đây là cách
// chuẩn để JS chỉ chạy sau khi trình duyệt đã render (tránh hydration mismatch).
const subscribeAlways = () => () => {};
const getHydrated = () => true;
const getServerSnapshot = () => false;

// Đọc prefers-reduced-motion và cập nhật khi người dùng đổi lựa chọn.
const subscribeReduced = (onChange: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  mq?.addEventListener?.("change", onChange);
  return () => mq?.removeEventListener?.("change", onChange);
};
const getReduced = () =>
  typeof window === "undefined"
    ? false
    : (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false);

export function SplashScreen() {
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(subscribeAlways, getHydrated, getServerSnapshot);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getServerSnapshot);
  const [stage, setStage] = useState<"run" | "fade" | "gone">("run");
  const [progress, setProgress] = useState(0);
  const startedAt = useRef<number>(0);

  // Splash hiện trên trang không phải trang chủ sau khi hydration xong.
  // `show` chỉ lật true một lần và không tự thay đổi trong lúc animation chạy —
  // nếu dùng biến toàn cục lật ngay thì render kế tiếp làm `skip` thành true và
  // cleanup huỷ animation ngay, splash bị đóng băng.
  const show = hydrated && pathname !== "/";
  const skip = !show;

  // Guard chạy animation đúng MỘT lần sau mỗi lần tải trang (hard reload sẽ nạp
  // lại JS nên ref này reset). Sau khi đã chạy, điều hướng SPA qua lại không làm
  // splash hiện lại.
  const playedRef = useRef(false);

  // Ở chế độ giảm chuyển động, thanh tiến trình nhảy thẳng về 100.
  const shownProgress = reduced ? 100 : progress;

  useEffect(() => {
    if (!show || playedRef.current) return;
    playedRef.current = true;

    if (reduced) {
      const t = window.setTimeout(() => setStage("gone"), 420);
      return () => window.clearTimeout(t);
    }

    startedAt.current = performance.now();

    // Thanh tiến trình chạy theo thời gian thực tới RUN_MS.
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt.current) / RUN_MS);
      // easeOutExpo cho cảm giác nhanh rồi chậm
      setProgress(Math.round((1 - Math.pow(2, -9 * t)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const t1 = window.setTimeout(() => setStage("fade"), RUN_MS);
    const t2 = window.setTimeout(() => setStage("gone"), RUN_MS + FADE_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [show, reduced]);

  const stars = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const s = Math.sin(i * 78.233) * 43758.5453;
        const a = s - Math.floor(s);
        const b = Math.sin(i * 12.9898) * 24634.6345;
        const c = b - Math.floor(b);
        return {
          left: a * 100,
          top: c * 74,
          size: 1 + a * 2.2,
          delay: a * 4,
          dur: 2 + c * 3.5,
        };
      }),
    [],
  );

  if (skip || stage === "gone") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải A6Class"
      style={{
        background: "linear-gradient(160deg,#0d2540 0%,#0a182e 100%)",
      }}
      className={cn(
        "splash-portal fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden",
        stage === "fade" && "splash-hide",
      )}
    >
      {/* ── Nền aurora ─────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          className="splash-blob absolute h-[62vmin] w-[62vmin] rounded-full"
          style={{
            left: "8%",
            top: "-14%",
            background: "radial-gradient(circle,rgba(37,99,235,.5),transparent 68%)",
            opacity: 0.55,
          }}
        />
        <span
          className="splash-blob absolute h-[54vmin] w-[54vmin] rounded-full"
          style={{
            right: "4%",
            top: "18%",
            background: "radial-gradient(circle,rgba(14,116,144,.5),transparent 68%)",
            opacity: 0.42,
            animationDelay: "-4s",
          }}
        />
        <span
          className="splash-blob absolute h-[58vmin] w-[58vmin] rounded-full"
          style={{
            left: "26%",
            bottom: "-22%",
            background: "radial-gradient(circle,rgba(37,99,235,.35),transparent 68%)",
            opacity: 0.34,
            animationDelay: "-8s",
          }}
        />

        {/* Sao nhấp nháy */}
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animation: `splashTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}

      </div>

      {/* ── Vòng quỹ đạo sau mark ──────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "min(78vmin, 420px)", aspectRatio: "1" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="splash-ring absolute inset-0 rounded-full"
            style={{
              border: `1px solid rgba(255,255,255,${0.28 - i * 0.06})`,
              animationDuration: `${16 + i * 7}s`,
              animationDelay: `${-i * 5}s`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
            }}
          />
        ))}
      </div>

      {/* ── Mark A6 vàng ─────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="splash-mascot-in">
          <div className="splash-mascot-float">
            <svg
              viewBox="6 4 78 70"
              width="132"
              height="132"
              role="img"
              aria-label="A6Class"
              style={{ overflow: "visible" }}
            >
              <defs>
                <linearGradient
                  id="splashApex"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FFD964" />
                  <stop offset="55%" stopColor="#FFC531" />
                  <stop offset="100%" stopColor="#F5A800" />
                </linearGradient>
              </defs>
              <path
                d="M 18,62 L 38,16 L 58,62 H 44 L 38,48 H 28"
                stroke="url(#splashApex)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M 58,62 C 68,62 72,52 70,42 C 67,32 54,32 46,40 C 40,46 42,58 52,60 C 60,61 66,54 64,44"
                stroke="url(#splashApex)"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          {/* Quầng sáng dưới chân */}
          <div
            aria-hidden
            className="splash-glow mx-auto -mt-3 h-5 w-28 rounded-[50%] blur-lg"
            style={{
              background:
                "radial-gradient(closest-side, rgba(96,165,250,.85), transparent)",
            }}
          />
        </div>

        {/* ── Logo ────────────────────────────────────────── */}
        <h1
          className="splash-word relative mt-7 select-none text-center text-4xl font-black tracking-tight sm:text-5xl"
          aria-label="A6Class"
        >
          {[..."A6Class"].map((ch, i) => (
            <span
              key={i}
              aria-hidden
              className="splash-letter inline-block"
              style={{
                animationDelay: `${420 + i * 70}ms`,
                background:
                  "linear-gradient(180deg,#FFFFFF 35%,#BAE6FD 75%,#38BDF8)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 6px 26px rgba(56,189,248,.35)",
              }}
            >
              {ch}
            </span>
          ))}
          {/* Ánh sáng quét ngang */}
          <span
            aria-hidden
            className="splash-shine pointer-events-none absolute inset-0"
          />
        </h1>

        <p className="splash-fade-in mt-1.5 text-[10px] font-bold uppercase tracking-[0.42em] text-white/60 sm:text-xs">
          Ngôi nhà số của lớp 12A6
        </p>

        {/* ── Thanh tiến trình ─────────────────────────────── */}
        <div
          className="splash-fade-in mt-8 w-[min(78vw,264px)]"
          style={{ animationDelay: "900ms" }}
        >
          <div
            role="progressbar"
            aria-valuenow={shownProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tiến trình tải"
            className="h-1.5 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${shownProgress}%`,
                background: "linear-gradient(90deg,#0e7490,#38bdf8)",
                boxShadow: "0 0 14px rgba(56,189,248,.7)",
                transition: "width 90ms linear",
              }}
            />
          </div>
          <p className="mt-2.5 text-center text-[11px] font-semibold tabular-nums text-white/60">
            Đang mở ngôi nhà của lớp… {shownProgress}%
          </p>
        </div>
      </div>
    </div>
  );
}