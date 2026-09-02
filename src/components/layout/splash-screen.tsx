"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const RUN_MS = 2200;
const HI_MS = 1400;
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

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#1e1208]",
        stage === "hide" && "splash-hide"
      )}
    >
      {/* Scene background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/welcome/scene.png"
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Centered logo + text */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={cn(
          "transition-all duration-700",
          stage === "run" ? "scale-90 opacity-0" : "scale-100 opacity-100"
        )}>
          <Logo size="lg" animate={stage !== "run"} />
        </div>
        <p
          className={cn(
            "mt-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70 transition-opacity duration-500",
            stage === "run" ? "opacity-0" : "opacity-100"
          )}
        >
          Ngôi nhà số của Lớp 12A6
        </p>
      </div>
    </div>
  );
}
