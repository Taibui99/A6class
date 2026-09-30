"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { isReducedMotion } from "@/lib/transition-nav";

interface WelcomeUIProps {
  onSignup?: () => void;
  onLogin?: () => void;
}

const LETTERS = [..."A6Class"];
const SUBTITLE = "Ngôi nhà số của lớp 12A6";
const GREETINGS = [
  "Xin chào! 👋",
  "Chào bạn! ☀️",
  "Rất vui được gặp bạn! 🌟",
  "Cùng học thật vui nào! 📚",
];

export default function WelcomeUI({ onSignup, onLogin }: WelcomeUIProps) {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [greetIndex, setGreetIndex] = useState(0);
  const reduced = isReducedMotion();

  useEffect(() => setMounted(true), []);

  // Robot chào người dùng, xoay vòng câu mỗi 6s.
  useEffect(() => {
    if (!mounted || reduced) {
      if (reduced) setGreeting(GREETINGS[0]);
      return;
    }
    setGreeting(GREETINGS[0]);
    const id = window.setInterval(() => {
      setGreeting(null);
      window.setTimeout(() => {
        setGreetIndex((i) => (i + 1) % GREETINGS.length);
        setGreeting(GREETINGS[(greetIndex + 1) % GREETINGS.length]);
      }, 320);
    }, 6000);
    return () => window.clearInterval(id);
  }, [mounted, reduced]);

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
                color: "#8C3B24",
                textShadow: "0 2px 0 rgba(255,255,255,.6)",
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
          className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C3B24]/70 sm:text-xs"
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
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-2xl bg-white/95 px-3.5 py-2 text-[11px] font-bold text-[#16306E] shadow-[0_10px_24px_rgba(60,40,30,.18)] sm:text-sm"
          style={{
            opacity: greeting ? 1 : 0,
            transform: greeting ? "scale(1)" : "scale(.7)",
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
          className="group flex h-11 items-center justify-center gap-2 rounded-xl border-none text-[13px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16306E] sm:text-sm"
          style={{
            background: "linear-gradient(180deg,#3B82F6,#1E40AF)",
            boxShadow: "0 5px 0 #16306E",
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
          className="h-11 rounded-xl border border-[#E7E5E4] bg-white/95 text-[13px] font-bold text-[#16306E] transition-colors hover:bg-[#EFF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16306E] sm:text-sm"
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