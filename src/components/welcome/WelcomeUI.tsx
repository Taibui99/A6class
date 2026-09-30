"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Sparkles } from "lucide-react";
import { isReducedMotion } from "@/lib/transition-nav";

interface WelcomeUIProps {
  onSignup?: () => void;
  onLogin?: () => void;
}

const noopSubscribe = () => () => {};

/** true sau khi hydrate — chỉ chạy animation/effect phía client. */
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

const LETTERS = [..."A6Class"];
const LETTER_GRADIENT = [
  "#7DD3FC",
  "#38BDF8",
  "#A78BFA",
  "#C4B5FD",
  "#7DD3FC",
  "#FDE68A",
  "#FBBF24",
];
const SUBTITLE = "Ngôi nhà số của lớp 12A6";
const GREETINGS = [
  "Xin chào! 👋",
  "Chào bạn! ☀️",
  "Rất vui được gặp bạn! 🌟",
  "Cùng học thật vui nào! 📚",
];

export default function WelcomeUI({ onSignup, onLogin }: WelcomeUIProps) {
  const [greetIndex, setGreetIndex] = useState(0);
  const [hidden, setHidden] = useState(true);
  const reduced = isReducedMotion();
  const mounted = useMounted();

  // Robot chào người dùng, xoay vòng câu mỗi 6s.
  useEffect(() => {
    if (!mounted || reduced) return;

    const id = window.setInterval(() => {
      setHidden(true);
      window.setTimeout(() => {
        setGreetIndex((i) => (i + 1) % GREETINGS.length);
        setHidden(false);
      }, 320);
    }, 6000);
    return () => window.clearInterval(id);
  }, [mounted, reduced]);

  const greeting = GREETINGS[greetIndex];
  const visible = mounted && !hidden;
  const live = mounted && !reduced;

  return (
    <>
      {/* ── Logo + phụ đề ─────────────────────────────────── */}
      <header
        className="absolute left-1/2 top-[4%] z-20 -translate-x-1/2 text-center"
        style={{ width: "min(92%, 720px)" }}
      >
        <h1
          aria-label="A6Class"
          className="flex items-center justify-center gap-px leading-none"
        >
          {LETTERS.map((ch, i) => (
            <span
              key={i}
              aria-hidden
              className="font-extrabold"
              style={{
                fontSize: "clamp(26px, 5.4vw, 52px)",
                color: LETTER_GRADIENT[i % LETTER_GRADIENT.length],
                textShadow: "0 0 26px rgba(56,189,248,.45), 0 2px 10px rgba(2,6,23,.8)",
                opacity: live ? 0 : 1,
                transform: live ? "translateY(-22px)" : "translateY(0)",
                transition: `opacity .6s cubic-bezier(.34,1.6,.5,1) ${
                  0.35 + i * 0.06
                }s, transform .6s cubic-bezier(.34,1.6,.5,1) ${
                  0.35 + i * 0.06
                }s`,
              }}
            >
              {ch}
            </span>
          ))}
        </h1>
        <p
          className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300/80 sm:text-xs"
          style={{
            opacity: live ? 0 : 1,
            transition: "opacity .6s ease .95s",
          }}
        >
          {SUBTITLE}
        </p>
      </header>

      {/* ── Bong bóng chào của robot ───────────────────────── */}
      <div
        aria-live="polite"
        className="absolute left-1/2 top-[38%] z-20 -translate-x-1/2"
        style={{ pointerEvents: "none" }}
      >
        <span
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-2xl bg-[#0D1226]/95 px-3.5 py-2 text-[11px] font-bold text-[#EEF2FF] shadow-[0_10px_30px_rgba(2,6,23,.55)] ring-1 ring-white/15 sm:text-sm"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(.7)",
            transformOrigin: "20% 130%",
            transition:
              "opacity .28s cubic-bezier(.34,1.56,.64,1), transform .28s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          <Sparkles aria-hidden className="size-3.5 text-[#F3C94D]" />
          {greeting}
        </span>
      </div>

      {/* ── CTA ────────────────────────────────────────────── */}
      <nav
        aria-label="Bắt đầu"
        className="absolute bottom-[5%] left-1/2 z-20 flex -translate-x-1/2 flex-col gap-2"
        style={{ width: "min(86%, 340px)" }}
      >
        <button
          type="button"
          onClick={onSignup}
          className="group flex h-11 items-center justify-center gap-2 rounded-xl border-none text-[13px] font-bold text-[#04101F] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8] sm:text-sm"
          style={{
            background: "linear-gradient(180deg,#38BDF8,#7C3AED)",
            boxShadow: "0 5px 0 #0B1226",
            opacity: live ? 0 : 1,
            transform: live ? "translateY(14px)" : "translateY(0)",
            transition:
              "opacity .55s ease 1.35s, transform .55s ease 1.35s, background-color .15s",
          }}
        >
          Đăng ký tham gia
          <span
            aria-hidden
            className="transition-transform duration-150 group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>

        <button
          type="button"
          onClick={onLogin}
          className="h-11 rounded-xl border border-white/15 bg-[#0D1226]/95 text-[13px] font-bold text-[#EEF2FF] transition-colors hover:bg-[#141B33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8] sm:text-sm"
          style={{
            opacity: live ? 0 : 1,
            transform: live ? "translateY(14px)" : "translateY(0)",
            transition: "opacity .55s ease 1.5s, transform .55s ease 1.5s",
          }}
        >
          Đã có tài khoản? Đăng nhập
        </button>
      </nav>
    </>
  );
}