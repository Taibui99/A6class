"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { Mascot } from "@/components/mascot";

const SKY_TONES = [
  "rgba(59,130,246,0.55)",
  "rgba(168,85,247,0.45)",
  "rgba(6,182,212,0.35)",
];

/**
 * Màn chờ ngắn khi `/` đưa khách về trang đăng nhập.
 *
 * Cố tình không dựng cảnh nặng: chỉ một nền trời đêm mờ, linh vật nhịp nhàng
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
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-hello p-6"
      aria-busy="true"
    >
      {/* Nền trời đêm: ba quầng sáng mờ trôi rất chậm */}
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
          className="entry-bob motion-reduce:animate-none flex size-20 items-center justify-center rounded-3xl bg-surface ring-1 ring-white/10"
        >
          <Mascot size={54} />
        </span>

        <div className="flex items-center gap-2.5">
          <Logo size="sm" />
          <span className="text-sm font-semibold text-text">A6Class</span>
        </div>

        {/* Thanh tiến trình không xác định */}
        <div
          role="status"
          aria-live="polite"
          className="h-1 w-52 overflow-hidden rounded-full bg-white/10"
        >
          <span className="entry-progress block h-full w-1/3 rounded-full bg-sky motion-reduce:animate-none" />
        </div>

        <p className="text-sm text-text-muted">Đang chuẩn bị không gian của bạn…</p>

        {showFallback && (
          <Link
            href={to}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
          >
            Vào thẳng trang đăng nhập
          </Link>
        )}
      </div>
    </main>
  );
}