import { Suspense } from "react";

import { AuthComplete } from "./auth-complete";

export default function AuthCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-hello px-4">
          <p className="text-sm text-text-muted">
            Đang hoàn tất đăng nhập…
          </p>
        </main>
      }
    >
      <AuthComplete />
    </Suspense>
  );
}