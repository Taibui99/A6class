import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 text-center"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
        A6Class · Bảng lớp 12A6
      </p>
      <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-text">
        404
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
        Trang này không có trong sổ tay của lớp. Có thể link đã cũ hoặc bạn gõ
        nhầm địa chỉ.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button
          render={<Link href="/dashboard" />}
          className="bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          Về Tổng quan
        </Button>
        <Button
          render={<Link href="/feed" />}
          variant="outline"
          className="border-border bg-surface text-text hover:bg-surface-hover"
        >
          Xem Bảng lớp
        </Button>
      </div>
    </main>
  );
}
