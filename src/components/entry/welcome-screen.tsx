"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import WelcomeUI from "@/components/welcome/WelcomeUI";
import { navigateWithTransition } from "@/lib/transition-nav";

// Cảnh vector render sẵn ở server (SVG + CSS thuần, không lệch hydration)
// nên khách không đợi JS mới thấy khung cảnh.
const WelcomeScene = dynamic(() => import("@/components/welcome/WelcomeScene"));

/** Người đã đăng nhập: tự vào dashboard sau khi xem xong cảnh.
 *  Khách: ở lại để chọn Đăng ký / Đăng nhập — không bị cướp màn hình. */
const AUTO_ENTER_MS = 7000;

const noopSubscribe = () => () => {};

/** true sau khi hydrate — dùng để chỉ chạy timer phía client. */
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function WelcomeScreen({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const mounted = useMounted();

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
      className="bg-hello flex min-h-dvh w-full items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-[1100px]">
        <WelcomeScene>
          <WelcomeUI onSignup={() => go("/register")} onLogin={() => go("/login")} />
        </WelcomeScene>
      </div>
    </main>
  );
}