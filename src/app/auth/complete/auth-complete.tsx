"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { HOME_PATH } from "@/lib/home";

/** Đường dẫn chỉ nhận giá trị nội bộ, không nhận URL bên ngoài. */
function safeTarget(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return HOME_PATH;
}

/**
 * Đổi `neon_auth_session_verifier` mà Neon đính kèm sau khi OAuth thành
 * cookie phiên trên domain của app.
 *
 * Việc đổi này buộc phải chạy ở trình duyệt: SDK chỉ gửi tham số đi khi
 * `isBrowser()` và nhận về `Set-Cookie`. Server không làm được, nên trang
 * này là nơi duy nhất có thể hoàn tất bước đó. Xong rồi mới chuyển tới đích.
 */
export function AuthComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    // StrictMode chạy effect hai lần; chỉ hoàn tất phiên một lần.
    if (started.current) return;
    started.current = true;

    const target = safeTarget(searchParams.get("target"));

    void (async () => {
      try {
        await authClient.getSession();
      } catch {
        // Hết hạn verifier hoặc mất mạng: vẫn đưa người dùng về trang
        // chủ đích, nơi guard sẽ chuyển họ tới /login nếu chưa có phiên.
      }
      router.replace(target);
      router.refresh();
    })();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-hello px-4">
      <p className="flex items-center gap-2.5 text-sm text-text-muted">
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        Đang hoàn tất đăng nhập…
      </p>
    </main>
  );
}