"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Mascot } from "@/components/mascot";
import { Logo } from "@/components/layout/logo";
import { PlayScape } from "@/components/entry/play-scape";
import { cn } from "@/lib/utils";

const RUN_MS = 2500;
const HI_MS = 1500;
const FADE_MS = 500;

type Stage = "run" | "hi" | "hide" | "gone";

export function SplashScreen() {
  const pathname = usePathname();
  const [stage, setStage] = useState<Stage>("run");

  useEffect(() => {
    if (pathname === "/") return;
    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
      false;
    if (reduce) {
      const t = window.setTimeout(() => setStage("gone"), 500);
      return () => window.clearTimeout(t);
    }
    const t1 = window.setTimeout(() => setStage("hi"), RUN_MS);
    const t2 = window.setTimeout(() => setStage("hide"), RUN_MS + HI_MS);
    const t3 = window.setTimeout(
      () => setStage("gone"),
      RUN_MS + HI_MS + FADE_MS
    );
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [pathname]);

  if (stage === "gone" || pathname === "/") return null;

  const inRun = stage === "run";
  const hi = stage === "hi";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "bg-hello fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-6",
        stage === "hide" && "splash-hide"
      )}
    >
      <PlayScape />

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center text-center">
        <Logo size="lg" animate />

        <p
          className="mt-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-text-muted"
          style={{ opacity: inRun ? 0 : undefined, transition: "opacity 300ms ease" }}
        >
          Ngôi nhà số của Lớp 12A6
        </p>

        <div className="relative mt-6 flex h-44 items-center justify-center">
          <div className="relative">
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
                    : "cr-arms-wave cr-hello-bob"
                )}
              >
                <Mascot size={104} face={hi ? "happy" : "friendly"} />
              </div>
            </div>

            {hi && (
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
                />
              </div>
            )}
          </div>

          <div
            aria-hidden
            className="absolute bottom-2 left-1/2 h-2.5 w-24 -translate-x-1/2 rounded-[100%] bg-slate-900/20 blur-[2px]"
          />
        </div>
      </div>
    </div>
  );
}