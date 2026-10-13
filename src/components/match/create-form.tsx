"use client";

import { useActionState, useState } from "react";
import { Loader2, Wand2 } from "lucide-react";

import { createRoomAction, type RoomActionState } from "@/lib/gameroom/actions";
import { parsePairs } from "@/lib/gameroom/parse";

const INIT: RoomActionState = { ok: true, message: "" };

export function CreateForm({ defaultText }: { defaultText: string }) {
  const [state, action, pending] = useActionState(createRoomAction, INIT);
  const [text, setText] = useState(defaultText);

  const n = parsePairs(text).length;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="m-title"
          className="mb-1 block text-xs font-bold text-text-muted"
        >
          Tên game
        </label>
        <input
          id="m-title"
          name="title"
          defaultValue="Văn hóa giao tiếp mạng"
          maxLength={60}
          className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text"
        />
      </div>
      <div>
        <label
          htmlFor="m-text"
          className="mb-1 block text-xs font-bold text-text-muted"
        >
          Danh sách cặp (mỗi dòng: Khái niệm | Nội dung)
        </label>
        <textarea
          id="m-text"
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder={"Quang hợp | Tổng hợp ánh sáng\nPhản xạ | Tia sáng bị hắt lại"}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 font-mono text-xs leading-relaxed text-text"
        />
        <p className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
          <span>{n >= 2 ? `Đọc được ${n} cặp.` : "Cần ít nhất 2 cặp."}</span>
          <button
            type="button"
            onClick={() => setText(defaultText)}
            className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
          >
            <Wand2 aria-hidden className="size-3.5" />
            Dùng đề mẫu
          </button>
        </p>
      </div>
      {state.message && (
        <p role="alert" className="text-sm font-semibold text-danger">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || n < 2}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {pending ? "Đang tạo phòng…" : "Tạo phòng chơi"}
      </button>
    </form>
  );
}
