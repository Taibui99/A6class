"use client";

import { useActionState, useEffect, useRef } from "react";

import { createNoticeAction } from "@/lib/notices/actions";

const INIT = { ok: true, message: "" };

/** Form đăng tin cho giáo viên, báo kết quả ngay dưới nút. */
export function NoticeComposer() {
  const [state, action, pending] = useActionState(createNoticeAction, INIT);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && state.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div>
        <label htmlFor="n-title" className="mb-1 block text-xs font-bold text-text-muted">
          Tiêu đề
        </label>
        <input
          id="n-title"
          name="title"
          required
          maxLength={100}
          placeholder="VD: Họp phụ huynh tháng 10"
          className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text"
        />
      </div>
      <div>
        <label htmlFor="n-body" className="mb-1 block text-xs font-bold text-text-muted">
          Nội dung
        </label>
        <input
          id="n-body"
          name="body"
          maxLength={300}
          placeholder="Thời gian, địa điểm, lưu ý..."
          className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" name="pinned" className="size-4 accent-[#0e7490]" />
          Ghim lên đầu
        </label>
        <button
          type="submit"
          disabled={pending}
          className="ml-auto inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Đang đăng..." : "Đăng"}
        </button>
      </div>
      {state.message && (
        <p className={state.ok ? "text-sm font-semibold text-success" : "text-sm font-semibold text-danger"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
