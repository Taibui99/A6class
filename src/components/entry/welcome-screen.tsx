"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

const BOOT_MS = 1500;
const HELLO_MS = 1500;
const ENTER_MS = 900;

type Stage = "boot" | "hello" | "choice" | "entering";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
  );
}

export function WelcomeScreen({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("boot");

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const t = window.setTimeout(
      () => setStage("hello"),
      reduce ? 200 : BOOT_MS
    );
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (stage !== "hello") return;
    const reduce = prefersReducedMotion();
    const t = window.setTimeout(
      () => setStage(signedIn ? "entering" : "choice"),
      reduce ? 300 : HELLO_MS
    );
    return () => window.clearTimeout(t);
  }, [stage, signedIn]);

  useEffect(() => {
    if (stage !== "entering") return;
    const reduce = prefersReducedMotion();
    const t = window.setTimeout(
      () => router.replace("/bang-dieu-khien"),
      reduce ? 0 : ENTER_MS
    );
    return () => window.clearTimeout(t);
  }, [stage, router]);

  const entering = stage === "entering";

  return (
    <main
      id="main-content"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-6"
    >
      {/* Nền chuyển động nhẹ */}
      <div
        aria-hidden
        className="intro-orb-1 pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="intro-orb-2 pointer-events-none absolute -bottom-28 -right-20 size-80 rounded-full bg-warning/15 blur-3xl"
      />

      <div className="relative flex w-full max-w-xs flex-col items-center text-center">
        {stage === "boot" && (
          <div className="flex flex-col items-center">
            <div className="intro-logo relative grid size-24 select-none place-items-center rounded-[1.75rem] bg-primary text-3xl font-extrabold tracking-tight text-white shadow-[0_24px_48px_-16px_rgba(30,64,175,0.5)]">
              A6
              <span aria-hidden className="intro-glint" />
            </div>
            <p className="intro-fade mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">
              Ngôi nhà số của
            </p>
            <h1 className="intro-word mt-2 text-2xl font-extrabold tracking-tight text-text">
              Lớp 12A6
            </h1>
            <div className="mt-8 h-1 w-44 overflow-hidden rounded-full bg-surface-hover ring-1 ring-border">
              <div className="intro-boot-bar h-full rounded-full bg-primary" />
            </div>
          </div>
        )}

        {!entering && stage !== "boot" && (
          <div className="flex flex-col items-center">
            <div className="intro-logo relative grid size-16 select-none place-items-center rounded-2xl bg-primary text-xl font-extrabold tracking-tight text-white shadow-[0_16px_32px_-10px_rgba(30,64,175,0.5)]">
              A6
              <span aria-hidden className="intro-glint" />
            </div>

            <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
              <span className="intro-word inline-block">Xin</span>{" "}
              <span
                className="intro-word inline-block text-primary"
                style={{ animationDelay: "110ms" }}
              >
                chào!
              </span>
            </h1>

            <p
              className="intro-fade mt-3 max-w-[16rem] text-sm leading-relaxed text-text-secondary"
              style={{ animationDelay: "240ms" }}
            >
              Chào mừng đến ngôi nhà số của{" "}
              <span className="font-semibold text-text">Lớp 12A6</span>
            </p>

            {stage === "choice" && (
              <div className="mt-10 w-full max-w-xs space-y-3">
                <Link
                  href="/register"
                  className="intro-btn flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-primary-hover active:scale-[0.99]"
                >
                  <UserPlus aria-hidden className="size-4" />
                  Đăng ký
                </Link>
                <Link
                  href="/login"
                  className="intro-btn flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-surface-hover"
                  style={{ animationDelay: "140ms" }}
                >
                  <LogIn aria-hidden className="size-4" />
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        )}

        {entering && (
          <div className="flex flex-col items-center">
            <div className="intro-pulse grid size-20 select-none place-items-center rounded-[1.6rem] bg-primary text-2xl font-extrabold tracking-tight text-white shadow-[0_20px_40px_-14px_rgba(30,64,175,0.5)]">
              A6
            </div>
            <p className="mt-8 text-sm font-medium text-text-secondary">
              Đang vào ngôi nhà của lớp…
            </p>
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <span
                className="splash-dot h-1.5 w-1.5 rounded-full bg-primary"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="splash-dot h-1.5 w-1.5 rounded-full bg-primary"
                style={{ animationDelay: "120ms" }}
              />
              <span
                className="splash-dot h-1.5 w-1.5 rounded-full bg-primary"
                style={{ animationDelay: "240ms" }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}