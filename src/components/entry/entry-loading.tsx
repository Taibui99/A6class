"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SKY_TONES = [
  "rgba(37,99,235,0.4)",
  "rgba(14,116,144,0.45)",
  "rgba(255,197,49,0.28)",
];

/**
 * Màn chờ ngắn khi `/` đưa khách về trang đăng nhập.
 *
 * Cố tình không dựng cảnh nặng: chỉ nền kẹo pop mờ, linh vật nhịp nhàng
 * và thanh tiến trình không xác định. Sau `FALLBACK_DELAY_MS` nếu điều
 * hướng chưa chạy (JS chậm, mạng lag, JS bị chặn) thì hiện nút vào thẳng,
 * để không bao giờ thành màn hình chết.
 */
const FALLBACK_DELAY_MS = 1200;

export function EntryLoading({ to = "/login" }: { to?: string }) {
  const router = useRouter();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), FALLBACK_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#0a182e] p-6 text-white"
      aria-busy="true"
    >
      {/* Nền kẹo pop: ba quầng sáng mờ trôi rất chậm */}
      <div aria-hidden className="absolute inset-0">
        {SKY_TONES.map((tone, index) => (
          <span
            key={tone}
            className="entry-glow absolute size-[62vmin] rounded-full motion-reduce:animate-none"
            style={{
              background: `radial-gradient(circle, ${tone}, transparent 68%)`,
              animationDelay: `${index * -5}s`,
              left: index === 1 ? "auto" : "-12%",
              right: index === 1 ? "-10%" : "auto",
              top: index === 2 ? "auto" : "-24%",
              bottom: index === 2 ? "-34%" : "auto",
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-7 text-center">
        <span
          aria-hidden
          className="entry-bob motion-reduce:animate-none flex size-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/25"
        >
          <svg viewBox="6 4 78 70" width="52" height="52" aria-hidden="true">
            <defs>
              <linearGradient
                id="entryApex"
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
              stroke="url(#entryApex)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 58,62 C 68,62 72,52 70,42 C 67,32 54,32 46,40 C 40,46 42,58 52,60 C 60,61 66,54 64,44"
              stroke="url(#entryApex)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>

        <div className="flex items-center gap-2.5">
          <span className="text-lg font-black tracking-tight text-white">
            A6<span className="text-[#FF5C8A]">CLASS</span>
          </span>
        </div>

        {/* Thanh tiến trình không xác định */}
        <div
          role="status"
          aria-live="polite"
          className="h-1.5 w-52 overflow-hidden rounded-full bg-white/15"
        >
          <span className="entry-progress block h-full w-1/3 rounded-full bg-[#38bdf8] motion-reduce:animate-none" />
        </div>

        <p className="text-sm text-white/60">Đang chuẩn bị không gian của bạn…</p>

        {showFallback && (
          <Link
            href={to}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0b3b4d] transition hover:bg-white/90"
          >
            Vào thẳng trang đăng nhập
          </Link>
        )}
      </div>
    </main>
  );
}