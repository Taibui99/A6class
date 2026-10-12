import { Sparkles, Trophy, Users } from "lucide-react";

import { Logo } from "@/components/layout/logo";

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

/**
 * Khung đăng nhập/đăng ký theo ngôn ngữ boot splash: nền navy sâu,
 * panel brand gradient teal→xanh + form trắng. Không dùng blur
 * (quy tắc perf mobile), chỉ màu đặc + bóng đổ.
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
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          className="absolute rounded-full"
          style={{
            width: "60vmin",
            height: "60vmin",
            left: "-14vmin",
            top: "-18vmin",
            background:
              "radial-gradient(circle, rgba(37,99,235,.35), transparent 68%)",
          }}
        />
        <span
          className="absolute rounded-full"
          style={{
            width: "56vmin",
            height: "56vmin",
            right: "-12vmin",
            bottom: "-20vmin",
            background:
              "radial-gradient(circle, rgba(14,116,144,.4), transparent 68%)",
          }}
        />
      </div>

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-surface shadow-2xl lg:grid-cols-[1fr_1.1fr]">
          {/* Panel brand — gọn trên mobile */}
          <div
            className="flex flex-col justify-center gap-6 p-6 text-white sm:p-8"
            style={{
              background:
                "linear-gradient(150deg,#0b5b72 0%,#0e7490 45%,#2563eb 100%)",
            }}
          >
            <div className="text-white">
              <Logo size="md" />
            </div>
            <div>
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
            <ul className="hidden flex-col gap-3 sm:flex">
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
          </div>

          {/* Cột form */}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-black tracking-tight text-text">
              {title}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
            <div className="mt-5">{children}</div>
            {footer && <div className="mt-5">{footer}</div>}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/45">
          A6Class · Ngôi nhà số của lớp 12A6
        </p>
      </main>
    </div>
  );
}
