"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Hộp thoại xác nhận thay cho window.confirm() của trình duyệt.
 * Cùng ngôn ngữ modal của app: card trắng, nút teal/đỏ.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xác nhận",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full",
              danger ? "bg-danger-light text-danger" : "bg-amber-100 text-amber-ink"
            )}
          >
            <TriangleAlert className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-text">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-9 items-center rounded-xl border border-border bg-surface px-4 text-sm font-bold text-text transition-colors hover:bg-surface-hover disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            autoFocus
            className={cn(
              "inline-flex h-9 items-center rounded-xl px-4 text-sm font-bold text-white transition-opacity disabled:opacity-50",
              danger
                ? "bg-danger hover:opacity-90"
                : "bg-primary hover:bg-primary-hover"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
