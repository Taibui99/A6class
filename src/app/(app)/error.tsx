"use client";

import { useEffect } from "react";

import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Log lỗi cho việc debug (không lộ thông tin nhạy cảm)
      window.console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rotate-[-5deg]">
        <Mascot size={72} />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-text">Có lỗi xảy ra</h1>
        <p className="text-sm text-text-secondary">
          Không thể tải trang này. Vui lòng thử lại.
        </p>
      </div>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}