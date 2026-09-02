"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { navigateWithTransition } from "@/lib/transition-nav";

export function WelcomeUI({
  stage,
}: {
  stage: "intro" | "choice" | "entering";
}) {
  const router = useRouter();

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    void navigateWithTransition(() => router.push(href));
  };

  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo */}
      <div
        className={`transition-all duration-500 ${
          stage === "intro" ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <Logo size="lg" animate={stage !== "intro"} />
      </div>

      {/* Tagline */}
      <p
        className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70 transition-all duration-500 delay-100 ${
          stage === "intro" ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        Ngôi nhà số của Lớp 12A6
      </p>

      {/* Buttons — choice stage */}
      {stage === "choice" && (
        <div className="mt-6 w-full max-w-[280px] space-y-3">
          <Link
            href="/register"
            onClick={go("/register")}
            className="intro-btn flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] hover:bg-primary-hover active:scale-[0.99]"
          >
            <UserPlus aria-hidden className="size-4" />
            Đăng ký
          </Link>
          <Link
            href="/login"
            onClick={go("/login")}
            className="intro-btn flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white/90 text-sm font-semibold text-text shadow-lg ring-1 ring-white/20 transition-colors hover:bg-white"
            style={{ animationDelay: "140ms" }}
          >
            <LogIn aria-hidden className="size-4" />
            Đăng nhập
          </Link>
        </div>
      )}

      {/* Entering stage */}
      {stage === "entering" && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm font-medium text-white/80">
            Đang vào ngôi nhà của lớp…
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <span
              className="splash-dot h-1.5 w-1.5 rounded-full bg-white"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="splash-dot h-1.5 w-1.5 rounded-full bg-white"
              style={{ animationDelay: "120ms" }}
            />
            <span
              className="splash-dot h-1.5 w-1.5 rounded-full bg-white"
              style={{ animationDelay: "240ms" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
