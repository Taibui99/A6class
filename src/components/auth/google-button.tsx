"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { HOME_PATH } from "@/lib/home";

/**
 * Nút đăng nhập/đăng ký bằng Google qua Neon Auth.
 *
 * `signIn.social` trả về URL của Google trong `data.url`; ta tự chuyển
 * hướng vì trình duyệt chặn redirect tự động từ fetch. Nếu package tự
 * xử lý chuyển hướng ở phiên bản sau thì `data.url` rỗng và bước này
 * bị bỏ qua — vẫn an toàn.
 */
export function GoogleButton({
  label = "Tiếp tục với Google",
  redirect,
}: {
  label?: string;
  redirect?: string | null;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setPending(true);
    setError(null);

    const callbackURL = buildCallback(redirect);

    try {
      const { data, error: authError } = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (authError) {
        setError(mapError(authError.message));
        setPending(false);
        return;
      }

      const url = (data as { url?: string } | undefined)?.url;
      if (url) {
        window.location.href = url;
        return;
      }

      // Không có URL: nhiều khả năng package đã tự chuyển hướng.
      setPending(false);
    } catch {
      setError("Không kết nối được tới máy chủ đăng nhập. Thử lại nhé.");
      setPending(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger-light px-3 py-2.5 text-sm text-danger"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text shadow-sm transition hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <GoogleMark />
        )}
        {pending ? "Đang chuyển tới Google…" : label}
      </button>
    </div>
  );
}

/** Đường dẫn trả về sau khi Google chuyển người dùng về lại. */
function buildCallback(redirect: string | null | undefined): string {
  if (redirect && redirect.startsWith("/")) {
    return redirect;
  }
  return HOME_PATH;
}

/** Dịch lỗi kỹ thuật sang thông báo ngắn gọn cho học sinh. */
function mapError(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();

  if (raw.includes("provider") || raw.includes("not enabled")) {
    return "Đăng nhập Google chưa được bật. Liên hệ giáo viên để cấu hình.";
  }
  if (raw.includes("disabled") || raw.includes("not enabled")) {
    return "Tài khoản Google này đã bị chặn trên hệ thống.";
  }
  if (raw.includes("account_exists") || raw.includes("already")) {
    return "Email này đã có tài khoản. Hãy dùng chức năng đăng nhập.";
  }

  return "Không đăng nhập được bằng Google. Thử lại hoặc dùng email/mật khẩu.";
}

/** Logo Google chính thức (4 màu), vẽ tay để không phụ thuộc icon library. */
function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.59H1.29a12 12 0 0 0 0 10.82l3.98-3.13Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.59l3.98 3.13C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
