"use client";

import { useActionState, useState } from "react";
import { Loader2, TriangleAlert, Upload } from "lucide-react";

import { importRosterAction, type ActionState } from "@/lib/classes/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = { ok: false, message: "" };

const SAMPLE = `Nguyễn Văn An|an.nguyen@12a6.edu.vn|Tổ 1|Tổ trưởng
Trần Thị Bình||Tổ 1|Học sinh
Lê Quang Chiến||Tổ 2|TL
# dòng bắt đầu bằng # sẽ bị bỏ qua`;

export function RosterImport({ classId }: { classId: string }) {
  const [state, formAction, pending] = useActionState(
    importRosterAction,
    initialState
  );
  const [text, setText] = useState("");

  const lineCount = text.split(/\r?\n/).filter((l) => l.trim()).length;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />

      <div className="rounded-xl bg-surface-hover/60 p-3.5 ring-1 ring-border">
        <p className="text-xs font-semibold text-text">Cách nhập</p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          Mỗi dòng một học sinh. Các cột theo thứ tự:{" "}
          <strong className="font-semibold text-text">
            Họ tên | Email | Tổ | Chức vụ
          </strong>
          . Bỏ trống cột nào cũng được — chỉ cần có họ tên.
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-text-muted">
          <li>· Dán thẳng từ Excel hoặc Google Sheets, phân cách bằng dấu |</li>
          <li>
            · Email giúp học sinh tự vào đúng lớp khi đăng nhập bằng Google
          </li>
          <li>· Tổ chưa có sẽ được tạo tự động</li>
          <li>· Chức vụ ghi tắt: HS, TL, TLT, LT</li>
          <li>· Dòng bắt đầu bằng # là chú thích, bị bỏ qua</li>
        </ul>
        <button
          type="button"
          onClick={() => setText(SAMPLE)}
          className="mt-2.5 text-xs font-semibold text-sky-300 underline-offset-4 hover:underline"
        >
          Xem ví dụ mẫu
        </button>
      </div>

      {state.message && (
        <div
          role="status"
          className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${
            state.ok
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              : "border-danger/20 bg-danger-light text-danger"
          }`}
        >
          {state.ok ? null : (
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          <p>{state.message}</p>
        </div>
      )}

      <div>
        <Textarea
          name="roster"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          spellCheck={false}
          placeholder={SAMPLE}
          className="font-mono text-xs leading-relaxed"
        />
        <p className="mt-1.5 text-xs text-text-muted">
          {lineCount > 0
            ? `${lineCount} dòng sẽ được đọc.`
            : "Chưa có dòng nào."}
        </p>
      </div>

      <Button type="submit" disabled={pending || lineCount === 0}>
        {pending ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Upload aria-hidden="true" className="size-4" />
        )}
        {pending ? "Đang nhập…" : "Nhập danh sách"}
      </Button>
    </form>
  );
}
