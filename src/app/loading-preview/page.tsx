import { notFound } from "next/navigation";

import AppLoading from "@/app/(app)/loading";

/**
 * Trang đóng băng các màn loading để chụp ảnh (CHỈ dev).
 * - ?m=splash → splash vào web (đứng yên ở 64%, không tự tắt)
 * - ?m=entry  → màn chờ ở `/` (không tự chuyển trang)
 * - ?m=app    → loading trong app (panel + skeleton)
 * Production trả 404.
 */

const STARS = Array.from({ length: 18 }, (_, i) => {
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
});

function ApexMark({ size = 132 }: { size?: number }) {
  return (
    <svg
      viewBox="6 4 78 70"
      width={size}
      height={size}
      role="img"
      aria-label="A6Class"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="pvApex" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD964" />
          <stop offset="55%" stopColor="#FFC531" />
          <stop offset="100%" stopColor="#F5A800" />
        </linearGradient>
      </defs>
      <path
        d="M 18,62 L 38,16 L 58,62 H 44 L 38,48 H 28"
        stroke="url(#pvApex)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 58,62 C 68,62 72,52 70,42 C 67,32 54,32 46,40 C 40,46 42,58 52,60 C 60,61 66,54 64,44"
        stroke="url(#pvApex)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function SplashFrozen() {
  const shownProgress = 64;
  return (
    <div
      role="status"
      aria-label="Xem trước splash A6Class"
      className="splash-portal fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(160deg,#0d2540 0%,#0a182e 100%)",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          className="splash-blob absolute h-[62vmin] w-[62vmin] rounded-full"
          style={{
            left: "8%",
            top: "-14%",
            background:
              "radial-gradient(circle,rgba(37,99,235,.5),transparent 68%)",
            opacity: 0.55,
          }}
        />
        <span
          className="splash-blob absolute h-[54vmin] w-[54vmin] rounded-full"
          style={{
            right: "4%",
            top: "18%",
            background:
              "radial-gradient(circle,rgba(14,116,144,.5),transparent 68%)",
            opacity: 0.42,
            animationDelay: "-4s",
          }}
        />
        <span
          className="splash-blob absolute h-[58vmin] w-[58vmin] rounded-full"
          style={{
            left: "26%",
            bottom: "-22%",
            background:
              "radial-gradient(circle,rgba(37,99,235,.35),transparent 68%)",
            opacity: 0.34,
            animationDelay: "-8s",
          }}
        />
        {STARS.map((s, i) => (
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

      <div className="relative z-10 flex flex-col items-center">
        <div className="splash-mascot-in">
          <div className="splash-mascot-float">
            <ApexMark />
          </div>
          <div
            aria-hidden
            className="splash-glow mx-auto -mt-3 h-5 w-28 rounded-[50%] blur-lg"
            style={{
              background:
                "radial-gradient(closest-side, rgba(96,165,250,.85), transparent)",
            }}
          />
        </div>

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
          <span
            aria-hidden
            className="splash-shine pointer-events-none absolute inset-0"
          />
        </h1>

        <p className="splash-fade-in mt-1.5 text-[10px] font-bold uppercase tracking-[0.42em] text-white/60 sm:text-xs">
          Ngôi nhà số của lớp 12A6
        </p>

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

function EntryFrozen() {
  return (
    <main
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#0a182e] p-6 text-white"
      aria-label="Xem trước màn chờ vào web"
    >
      <div aria-hidden className="absolute inset-0">
        {[
          "rgba(37,99,235,0.4)",
          "rgba(14,116,144,0.45)",
          "rgba(255,197,49,0.28)",
        ].map((tone, index) => (
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
          <ApexMark size={52} />
        </span>

        <div className="flex items-center gap-2.5">
          <span className="text-lg font-black tracking-tight text-white">
            A6<span className="text-[#FF5C8A]">CLASS</span>
          </span>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="h-1.5 w-52 overflow-hidden rounded-full bg-white/15"
        >
          <span className="entry-progress block h-full w-1/3 rounded-full bg-[#38bdf8] motion-reduce:animate-none" />
        </div>

        <p className="text-sm text-white/60">Đang chuẩn bị không gian của bạn…</p>
      </div>
    </main>
  );
}

export default async function LoadingPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
  const sp = await searchParams;
  const mode = sp.m ?? "splash";

  if (mode === "entry") return <EntryFrozen />;
  if (mode === "app") return <AppLoading />;
  return <SplashFrozen />;
}
