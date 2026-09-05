"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import WelcomeUI from "@/components/welcome/WelcomeUI";
import {
  isReducedMotion,
  navigateWithTransition,
} from "@/lib/transition-nav";

const WelcomeScene = dynamic(
  () => import("@/components/welcome/WelcomeScene"),
  { ssr: false },
);

const INTRO_MS = 5200;

export function WelcomeScreen({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (!sceneReady) return;
    const t = setTimeout(
      () => {
        void navigateWithTransition(() => router.replace("/bang-dieu-khien"));
      },
      isReducedMotion() ? 200 : INTRO_MS,
    );
    return () => clearTimeout(t);
  }, [sceneReady, router]);

  const handleSignup = useCallback(() => {
    void navigateWithTransition(() => router.replace("/dang-ky"));
  }, [router]);

  const handleLogin = useCallback(() => {
    void navigateWithTransition(() => router.replace("/dang-nhap"));
  }, [router]);

  return (
    <main
      id="main-content"
      className="h-dvh w-full flex items-center justify-center p-2 sm:p-4"
      style={{ background: "#FBEFE6" }}
    >
      <div className="relative w-full max-w-[1100px]">
        <WelcomeScene onReady={() => setSceneReady(true)}>
          <WelcomeUI onSignup={handleSignup} onLogin={handleLogin} />
        </WelcomeScene>
      </div>
    </main>
  );
}
