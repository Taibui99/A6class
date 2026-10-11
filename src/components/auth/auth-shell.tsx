import { GraduationCap, Star, Trophy, Users } from "lucide-react";

import { Mascot } from "@/components/mascot";
import { Logo } from "@/components/layout/logo";

const STICKERS = [
  { icon: Star, text: "+5đ mỗi việc tốt", tilt: "sticker-tilt" },
  { icon: Trophy, text: "#1 tuần này", tilt: "sticker-tilt-r" },
  { icon: Users, text: "Cả lớp cùng đua", tilt: "sticker-tilt" },
];

/**
 * Khung đăng nhập/đăng ký kiểu Pop Gen-Z (DESIGN-V3-POP.md §4):
 * desktop = panel mực bên trái (brand + slogan + sticker bay) + form bên phải;
 * mobile = brand gọn + form card sticker.
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
    <div className="bg-hello flex min-h-dvh flex-col px-4 py-8 sm:py-12">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 lg:grid lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Panel mực — chỉ desktop */}
        <div
          aria-hidden
          className="hidden rounded-[24px] border-2 border-[#1E1B16] bg-[#1E1B16] p-8 text-[#FFF6E9] shadow-[6px_6px_0_#FF5C8A] lg:block"
        >
          <Logo size="md" />
          <p className="mt-6 text-3xl font-black tracking-tight">
            Sổ sticker
            <br />
            của lớp bạn.
          </p>
          <p className="mt-2 text-sm text-[#FFF6E9]/70">
            Chấm điểm, giao việc và đua tuần — vui như dán sticker.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {STICKERS.map((s) => (
              <span key={s.text} className={`sticker sticker-white ${s.tilt}`}>
                <s.icon aria-hidden className="size-3.5" />
                {s.text}
              </span>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Mascot size={120} face="happy" />
          </div>
        </div>

        {/* Cột form */}
        <div className="w-full max-w-sm">
          <div className="mb-5 text-center lg:text-left">
            <div className="flex items-center justify-center gap-3 lg:hidden">
              <Mascot size={56} />
              <Logo size="md" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-text">
              {title}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          </div>
          <div className="pop-card p-5 sm:p-6">{children}</div>
          {footer && <div className="mt-5">{footer}</div>}
        </div>
      </main>

      <footer className="mx-auto mt-8 w-full max-w-sm">
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-text-muted">
          <GraduationCap aria-hidden="true" className="size-3.5" />
          A6Class · Ngôi nhà số của lớp 12A6
        </p>
      </footer>
    </div>
  );
}
