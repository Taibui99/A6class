"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

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
      <span className="grid size-12 place-items-center rounded-full bg-danger-light text-danger">
        <TriangleAlert aria-hidden="true" className="size-6" />
      </span>
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