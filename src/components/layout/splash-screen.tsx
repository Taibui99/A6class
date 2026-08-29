"use client";

import { useEffect, useState } from "react";

const HOLD_MS = 1000;
const TOTAL_MS = 1500;

export function SplashScreen() {
  const [stage, setStage] = useState<"show" | "hide" | "gone">("show");

  useEffect(() => {
    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
      false;
    if (reduce) {
      const t = window.setTimeout(() => setStage("gone"), 600);
      return () => window.clearTimeout(t);
    }
    const t1 = window.setTimeout(() => setStage("hide"), HOLD_MS);
    const t2 = window.setTimeout(() => setStage("gone"), TOTAL_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (stage === "gone") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background ${
        stage === "hide" ? "splash-hide" : "splash-overlay"
      }`}
    >
      <div className="splash-panel mx-6 w-full max-w-xs rounded-2xl border border-border bg-surface px-8 py-10 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-md">
          <span className="text-xl font-extrabold tracking-tight text-primary-foreground">
            A6
          </span>
        </div>
        <h1 className="mt-4 text-xl font-extrabold tracking-tight text-text">
          A6Class
        </h1>
        <p className="mt-1 text-sm text-text-muted">Ngôi nhà số của lớp 11A6</p>
        <p className="mt-6 text-sm font-medium text-text-secondary">
          Đang tải hệ thống…
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5">
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
    </div>
  );
}