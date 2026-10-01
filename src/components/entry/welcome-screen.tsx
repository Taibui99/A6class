"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import WelcomeUI from "@/components/welcome/WelcomeUI";
import { navigateWithTransition } from "@/lib/transition-nav";

// Cảnh vector render sẵn ở server (SVG + CSS thuần, không lệch hydration)
// nên khách không đợi JS mới thấy khung cảnh.
const WelcomeScene = dynamic(() => import("@/components/welcome/WelcomeScene"));

/** Chỉ khách mới chưa đăng nhập thấy màn này. Người đã đăng nhập được
 *  `/` chuyển thẳng sang nhiệm vụ trọng tâm (thi đua) nên không cần tự
 *  động vào — tránh bắt người dùng đợi 7 giây rồi mới tới nơi họ cần tới. */
export function WelcomeScreen() {
  const router = useRouter();

  const go = useCallback(
    (path: string) => {
      void navigateWithTransition(() => router.replace(path));
    },
    [router],
  );

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
