"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { Mascot, type MascotFace } from "@/components/mascot";
import { cn } from "@/lib/utils";

/**
 * Splash thuần vector — không dùng ảnh nào.
 * Nền aurora chuyển động + sao nhấp nháy + vòng quỹ đạo + linh vật robot
 * bay vào rồi vẫy tay, logo ánh sáng quét, thanh tiến trình thật.
 */

const RUN_MS = 2600;
const FADE_MS = 520;

const FACES: MascotFace[] = ["friendly", "happy", "wink", "love"];

export function SplashScreen() {
  const pathname = usePathname();
  const [stage, setStage] = useState<"run" | "fade" | "gone">("run");
  const [progress, setProgress] = useState(0);
  const [face, setFace] = useState<MascotFace>("friendly");
  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (pathname === "/") {
      setStage("gone");
      return;
    }

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (reduce) {
      setProgress(100);
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

    // Đổi biểu cảm linh vật theo nhịp.
    const faces = window.setInterval(
      () => setFace((f) => FACES[(FACES.indexOf(f) + 1) % FACES.length]),
      760,
    );

    const t1 = window.setTimeout(() => setStage("fade"), RUN_MS);
    const t2 = window.setTimeout(() => setStage("gone"), RUN_MS + FADE_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(faces);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => {
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

  if (stage === "gone") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải A6Class"
      className={cn(
        "splash-portal fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#070B1A]",
        stage === "fade" && "splash-hide",
      )}
    >
      {/* ── Nền aurora ─────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          className="splash-blob absolute h-[62vmin] w-[62vmin] rounded-full blur-[90px]"
          style={{
            left: "8%",
            top: "-14%",
            background: "radial-gradient(circle,#3B82F6,transparent 68%)",
            opacity: 0.55,
          }}
        />
        <span
          className="splash-blob absolute h-[54vmin] w-[54vmin] rounded-full blur-[90px]"
          style={{
            right: "4%",
            top: "18%",
            background: "radial-gradient(circle,#A855F7,transparent 68%)",
            opacity: 0.42,
            animationDelay: "-4s",
          }}
        />
        <span
          className="splash-blob absolute h-[58vmin] w-[58vmin] rounded-full blur-[100px]"
          style={{
            left: "26%",
            bottom: "-22%",
            background: "radial-gradient(circle,#06B6D4,transparent 68%)",
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

        {/* Lưới perspective */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(147,197,253,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,.55) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
            transform: "perspective(520px) rotateX(66deg)",
            transformOrigin: "bottom",
            maskImage: "linear-gradient(to top, #000, transparent 78%)",
            WebkitMaskImage: "linear-gradient(to top, #000, transparent 78%)",
          }}
        />
      </div>

      {/* ── Vòng quỹ đạo sau linh vật ──────────────────────── */}
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
              border: `1px solid rgba(147,197,253,${0.3 - i * 0.07})`,
              animationDuration: `${16 + i * 7}s`,
              animationDelay: `${-i * 5}s`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
            }}
          />
        ))}
      </div>

      {/* ── Linh vật ──────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="splash-mascot-in">
          <div className="splash-mascot-float">
            <Mascot size={132} face={face} className="splash-mascot-wave" />
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
                  "linear-gradient(180deg,#FFFFFF 30%,#93C5FD 72%,#3B82F6)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 6px 26px rgba(59,130,246,.42)",
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

        <p className="splash-fade-in mt-1.5 text-[10px] font-bold uppercase tracking-[0.42em] text-sky-300/70 sm:text-xs">
          Ngôi nhà số của lớp 12A6
        </p>

        {/* ── Thanh tiến trình ─────────────────────────────── */}
        <div
          className="splash-fade-in mt-8 w-[min(78vw,264px)]"
          style={{ animationDelay: "900ms" }}
        >
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tiến trình tải"
            className="h-1.5 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg,#38BDF8,#A78BFA)",
                boxShadow: "0 0 14px rgba(167,139,250,.7)",
                transition: "width 90ms linear",
              }}
            />
          </div>
          <p className="mt-2.5 text-center text-[11px] font-semibold tabular-nums text-sky-200/70">
            Đang mở ngôi nhà của lớp… {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}