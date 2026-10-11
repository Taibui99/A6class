"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2, TriangleAlert, Upload, FileUp } from "lucide-react";

import { importRosterAction, type ActionState } from "@/lib/classes/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = { ok: false, message: "" };

const SAMPLE = `Nguyễn Văn An|an.nguyen@12a6.edu.vn|Tổ 1|Tổ trưởng
Trần Thị Bình||Tổ 1|Học sinh
Lê Quang Chiến||Tổ 2|TL
# dòng bắt đầu bằng # sẽ bị bỏ qua`;

/** Dòng đầu là hàng tiêu đề (Họ tên, Email, Tổ...) thì bỏ qua. */
function isHeaderRow(cells: string[]): boolean {
  if (cells.filter(Boolean).length < 2) return false;
  return cells.some((c) =>
    /họ(\s+và)?\s*tên|^tên$|^name$|email|lớp|^\s*tổ\s*$/i.test(c.trim())
  );
}

function rowsToText(rows: string[][]): string {
  return rows
    .map((cells) => {
      const trimmed = cells.map((c) => String(c ?? "").trim());
      while (trimmed.length && !trimmed[trimmed.length - 1]) trimmed.pop();
      return trimmed.join(" | ");
    })
    .filter((line) => line.replace(/[|\s]/g, ""))
    .join("\n");
}

export function RosterImport({ classId }: { classId: string }) {
  const [state, formAction, pending] = useActionState(
    importRosterAction,
    initialState
  );
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const lineCount = text.split(/\r?\n/).filter((l) => l.trim()).length;

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    setFileError("");
    setFileName(file.name);
    setReading(true);
    try {
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        // Đọc Excel ngay trên trình duyệt, sheet đầu tiên.
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) throw new Error("empty");
        const aoa = XLSX.utils.sheet_to_json<string[]>(ws, {
          header: 1,
          defval: "",
          blankrows: false,
        }) as string[][];
        const rows = (aoa ?? []).map((r) => (Array.isArray(r) ? r : [r]));
        const body = rows.length && isHeaderRow(rows[0].map(String)) ? rows.slice(1) : rows;
        const out = rowsToText(body.map((r) => r.map(String)));
        if (!out) throw new Error("empty");
        setText(out);
      } else {
        // .csv / .txt / khác: đọc thẳng text.
        let raw = await file.text();
        raw = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
        if (!raw.trim()) throw new Error("empty");
        setText(raw.trim());
      }
    } catch {
      setFileError(
        "Không đọc được file này. Thử file .xlsx, .csv hoặc .txt khác nhé."
      );
      setFileName("");
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />

      <div className="rounded-xl bg-surface-hover/60 p-3.5 border border-border">
        <p className="text-xs font-semibold text-text">Cách nhập</p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          Mỗi dòng một học sinh. Các cột theo thứ tự:{" "}
          <strong className="font-semibold text-text">
            Họ tên | Email | Tổ | Chức vụ
          </strong>
          . Bỏ trống cột nào cũng được — chỉ cần có họ tên.
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-text-muted">
          <li>· Chọn file Excel (.xlsx) hoặc CSV — đọc ngay, không tải đi đâu</li>
          <li>· Hoặc dán thẳng từ Excel/Google Sheets vào ô bên dưới</li>
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
          className="mt-2.5 text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          Xem ví dụ mẫu
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          className="hidden"
          aria-label="Chọn file danh sách"
          onChange={(e) => onPickFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={reading}
          onClick={() => fileRef.current?.click()}
        >
          <FileUp aria-hidden="true" className="size-4" />
          {reading ? "Đang đọc file…" : "Chọn file Excel/CSV"}
        </Button>
        {fileName && (
          <span className="text-xs font-semibold text-text-secondary">
            {fileName} → đã đổ vào ô bên dưới, sửa lại rồi bấm Nhập
          </span>
        )}
      </div>

      {(state.message || fileError) && (
        <div
          role="status"
          className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${
            fileError || !state.ok
              ? "border-danger/20 bg-danger-light text-danger"
              : "border-success/25 bg-success/10 text-success"
          }`}
        >
          {(fileError || !state.ok) && (
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          <p>{fileError || state.message}</p>
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

      <Button type="submit" disabled={pending || reading || lineCount === 0}>
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
