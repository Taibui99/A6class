"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import WelcomeUI from "@/components/welcome/WelcomeUI";
import { navigateWithTransition } from "@/lib/transition-nav";

const WelcomeScene = dynamic(() => import("@/components/welcome/WelcomeScene"), {
  ssr: false,
});

/** Người đã đăng nhập: tự vào dashboard sau khi xem xong cảnh.
 *  Khách: ở lại để chọn Đăng ký / Đăng nhập — không bị cướp màn hình. */
const AUTO_ENTER_MS = 7000;

export function WelcomeScreen({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const go = useCallback(
    (path: string) => {
      void navigateWithTransition(() => router.replace(path));
    },
    [router],
  );

  useEffect(() => {
    if (!mounted || !signedIn) return;
    const t = window.setTimeout(() => go("/dashboard"), AUTO_ENTER_MS);
    return () => window.clearTimeout(t);
  }, [mounted, signedIn, go]);

  return (
    <main
      id="main-content"
      className="flex min-h-dvh w-full items-center justify-center p-3 sm:p-6"
      style={{ background: "#FBEFE6" }}
    >
      <div className="w-full max-w-[1100px]">
        <WelcomeScene>
          <WelcomeUI
            onSignup={() => go("/dang-ky")}
            onLogin={() => go("/dang-nhap")}
          />
        </WelcomeScene>
      </div>
    </main>
  );
}