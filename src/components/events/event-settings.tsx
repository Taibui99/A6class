"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  saveEventAction,
  clearEventAction,
  type EventActionState,
} from "@/lib/events/actions";
import type { EventSummary } from "@/lib/events";

const initialState: EventActionState = { ok: false, message: "" };

/** `datetime-local` cần "YYYY-MM-DDTHH:mm", không có múi giờ. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const label = "block text-xs font-bold text-text-secondary";

export function EventSettings({
  event,
  canEdit,
}: {
  event: EventSummary | null;
  canEdit: boolean;
}) {
  const [saveState, saveAction, saving] = useActionState(saveEventAction, initialState);
  const [clearState, clearAction, clearing] = useActionState(clearEventAction, initialState);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (saveState.ok) formRef.current?.reset();
  }, [saveState]);

  const message = clearState.ok ? clearState : saveState;

  if (!canEdit) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-base font-bold text-text">Sự kiện đếm ngược</h2>
        {event ? (
          <p className="mt-2 text-sm text-text-secondary">
            Đang đếm về{" "}
            <span className="font-bold text-text">{event.title}</span> — kết thúc{" "}
            {new Date(event.endsAt).toLocaleString("vi-VN")}.
          </p>
        ) : (
          <p className="mt-2 text-sm text-text-muted">
            Lớp chưa đặt sự kiện nào. Chỉ cán sự lớp mới đặt được.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-base font-bold text-text">Sự kiện đếm ngược</h2>
      <p className="mt-1 text-sm text-text-muted">
        Mốc thời gian hiển thị trên đồng hồ lớn ở trang /apps. Chỉ có một sự kiện
        đang chạy tại một thời điểm — tạo sự kiện mới sẽ tắt sự kiện cũ.
      </p>

      {event ? (
        <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
          Đang chạy: <span className="font-bold">{event.title}</span> — kết thúc{" "}
          {new Date(event.endsAt).toLocaleString("vi-VN")}
        </p>
      ) : null}

      <form ref={formRef} action={saveAction} className="mt-4 space-y-3">
        {event ? <input type="hidden" name="eventId" value={event.id} /> : null}

        <div>
          <label className={label} htmlFor="event-title">
            Tên sự kiện
          </label>
          <input
            id="event-title"
            name="title"
            defaultValue={event?.title ?? ""}
            placeholder="Ví dụ: Kỷ niệm 1000 ngày cùng thầy cô"
            className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className={label} htmlFor="event-desc">
            Mô tả ngắn (không bắt buộc)
          </label>
          <input
            id="event-desc"
            name="description"
            defaultValue={event?.description ?? ""}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="event-start">
              Bắt đầu
            </label>
            <input
              id="event-start"
              type="datetime-local"
              name="startsAt"
              defaultValue={event ? toLocalInput(event.startsAt) : ""}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className={label} htmlFor="event-end">
              Kết thúc
            </label>
            <input
              id="event-end"
              type="datetime-local"
              name="endsAt"
              defaultValue={event ? toLocalInput(event.endsAt) : ""}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : event ? "Cập nhật sự kiện" : "Tạo sự kiện"}
          </button>

          {event ? (
            <button
              type="submit"
              formAction={clearAction}
              disabled={clearing}
              className="inline-flex h-9 items-center rounded-xl bg-surface-2 px-4 text-xs font-bold text-text-secondary ring-1 ring-border transition hover:bg-surface-hover disabled:opacity-50"
            >
              {clearing ? "Đang tắt..." : "Tắt sự kiện"}
            </button>
          ) : null}
        </div>

        {message.message ? (
          <p
            role="status"
            className={`text-xs font-bold ${message.ok ? "text-success" : "text-danger"}`}
          >
            {message.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}