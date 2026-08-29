"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

import { Mascot } from "@/components/mascot";
import { Logo } from "@/components/layout/logo";
import { PlayScape } from "@/components/entry/play-scape";
import { cn } from "@/lib/utils";
import {
  isReducedMotion,
  navigateWithTransition,
} from "@/lib/transition-nav";

const BOOT_MS = 2500;
const HELLO_MS = 1600;
const ENTER_MS = 900;

type Stage = "boot" | "hello" | "choice" | "entering";

export function WelcomeScreen({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("boot");

  useEffect(() => {
    const t = window.setTimeout(
      () => setStage("hello"),
      isReducedMotion() ? 300 : BOOT_MS
    );
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (stage !== "hello") return;
    const t = window.setTimeout(
      () => setStage(signedIn ? "entering" : "choice"),
      isReducedMotion() ? 300 : HELLO_MS
    );
    return () => window.clearTimeout(t);
  }, [stage, signedIn]);

  useEffect(() => {
    if (stage !== "entering") return;
    const t = window.setTimeout(() => {
      void navigateWithTransition(() =>
        router.replace("/bang-dieu-khien")
      );
    }, isReducedMotion() ? 0 : ENTER_MS);
    return () => window.clearTimeout(t);
  }, [stage, router]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    void navigateWithTransition(() => router.push(href));
  };

  const entering = stage === "entering";
  const inRun = stage === "boot";
  const inHello = stage === "hello";
  const face = inHello ? "happy" : "friendly";

  return (
    <main
      id="main-content"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-200 via-[#EAF6FF] to-bg px-6"
    >
      <PlayScape />

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center text-center">
        {/* Logo A6Class — từng chữ nảy lên */}
        <Logo size="lg" animate />

        <p
          className="intro-fade mt-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-text-muted"
          style={{ animationDelay: "500ms" }}
        >
          Ngôi nhà số của Lớp 12A6
        </p>

        {/* Robot chạy từ xa tới, vẫy tay chào */}
        <div className="relative mt-6 flex h-44 items-center justify-center">
          <div className="vt-mascot relative">
            {inRun && (
              <>
                <span className="cr-puff left-2 top-[86%]" style={{ animationDelay: "0.15s" }} />
                <span className="cr-puff left-7 top-[84%]" style={{ animationDelay: "0.6s" }} />
                <span className="cr-puff right-3 top-[88%]" style={{ animationDelay: "1.05s" }} />
                <span className="cr-puff right-9 top-[85%]" style={{ animationDelay: "1.4s" }} />
                <span className="cr-puff-stop left-1/2 top-[88%] -translate-x-1/2" />
              </>
            )}

            <div className={cn("relative", inRun && "cr-run")}>
              <div
                className={cn(
                  inRun
                    ? "cr-lean cr-bounce cr-arms-run"
                    : inHello
                      ? "cr-arms-wave cr-hello-bob"
                      : "mascot-bob"
                )}
              >
                <Mascot size={104} face={face} />
              </div>
            </div>

            {inHello && (
              <div
                className="intro-bubble absolute -top-12 left-1/2 whitespace-nowrap rounded-2xl bg-surface px-4 py-2 shadow-lg ring-1 ring-border"
                role="status"
              >
                <span className="text-[15px] font-extrabold tracking-tight text-primary">
                  Xin chào!
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-surface ring-1 ring-border"
                  style={{ boxShadow: "0 0 0 0.5px var(--border)" }}
                />
              </div>
            )}
          </div>

          {/* Bóng đất dưới chân robot */}
          <div
            aria-hidden
            className={cn(
              "absolute bottom-2 left-1/2 h-2.5 w-24 -translate-x-1/2 rounded-[100%] bg-slate-900/20 blur-[2px]",
              inRun && "cr-shadow"
            )}
          />
        </div>

        {stage === "boot" && (
          <div className="mt-8 h-1 w-44 overflow-hidden rounded-full bg-slate-300/60 ring-1 ring-border">
            <div className="intro-boot-bar h-full rounded-full bg-primary" />
          </div>
        )}

        {stage === "choice" && (
          <div className="mt-6 w-full max-w-xs space-y-3">
            <Link
              href="/register"
              onClick={go("/register")}
              className="intro-btn flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-primary-hover active:scale-[0.99]"
            >
              <UserPlus aria-hidden className="size-4" />
              Đăng ký
            </Link>
            <Link
              href="/login"
              onClick={go("/login")}
              className="intro-btn flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-surface-hover"
              style={{ animationDelay: "140ms" }}
            >
              <LogIn aria-hidden className="size-4" />
              Đăng nhập
            </Link>
          </div>
        )}

        {entering && (
          <div className="mt-8 flex flex-col items-center">
            <p className="text-sm font-medium text-text-secondary">
              Đang vào ngôi nhà của lớp…
            </p>
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <span className="splash-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
              <span className="splash-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "120ms" }} />
              <span className="splash-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}