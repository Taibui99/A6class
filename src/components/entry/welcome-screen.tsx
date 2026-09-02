"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { WelcomeScene } from "@/components/welcome/WelcomeScene";
import { WelcomeUI } from "@/components/welcome/WelcomeUI";
import {
  isReducedMotion,
  navigateWithTransition,
} from "@/lib/transition-nav";

const INTRO_MS = 2200;
const HELLO_MS = 1500;
const ENTER_MS = 900;

type Stage = "intro" | "choice" | "entering";

export function WelcomeScreen({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(
      () => {
        setIntroComplete(true);
        setStage(signedIn ? "entering" : "choice");
      },
      isReducedMotion() ? 400 : INTRO_MS
    );
    return () => window.clearTimeout(t);
  }, [signedIn]);

  useEffect(() => {
    if (stage !== "choice") return;
    const t = window.setTimeout(
      () => setStage("entering"),
      isReducedMotion() ? 300 : HELLO_MS
    );
    return () => window.clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "entering") return;
    const t = window.setTimeout(() => {
      void navigateWithTransition(() =>
        router.replace("/bang-dieu-khien")
      );
    }, isReducedMotion() ? 0 : ENTER_MS);
    return () => window.clearTimeout(t);
  }, [stage, router]);

  return (
    <main id="main-content" className="h-dvh w-full">
      <WelcomeScene introComplete={introComplete}>
        <WelcomeUI stage={stage} />
      </WelcomeScene>
    </main>
  );
}
