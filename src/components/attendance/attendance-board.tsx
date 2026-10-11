"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { clearDayAction, setAttendanceAction } from "@/lib/attendance/actions";

type Student = { id: string; name: string; team: string | null };
type Status = "PRESENT" | "ABSENT" | "EXCUSED";

const DUMMY = { ok: true, message: "" };

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 1).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/**
 * Bảng điểm danh: đổi ngày qua query (?date=), bấm trạng thái lưu ngay.
 * Mặc định cả lớp có mặt — chỉ cần đánh dấu bạn vắng/có phép.
 */
export function AttendanceBoard({
  classId,
  date,
  students,
  records,
}: {
  classId: string;
  date: string;
  students: Student[];
  records: Record<string, Status>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [marks, setMarks] = useState(records);

  const q = query.trim().toLowerCase();
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const list = students.filter((s) => !q || s.name.toLowerCase().includes(q));
  const absent = list.filter((s) => (marks[s.id] ?? "PRESENT") === "ABSENT").length;
  const excused = list.filter((s) => (marks[s.id] ?? "PRESENT") === "EXCUSED").length;
  const present = list.length - absent - excused;

  function mark(id: string, status: Status) {
    setMarks((m) => ({ ...m, [id]: status }));
    const fd = new FormData();
    fd.set("classId", classId);
    fd.set("userId", id);
    fd.set("date", date);
    fd.set("status", status);
    startTransition(async () => {
      await setAttendanceAction(DUMMY, fd);
      router.refresh();
    });
  }

  function allPresent() {
    const fd = new FormData();
    fd.set("classId", classId);
    fd.set("date", date);
    startTransition(async () => {
      await clearDayAction(DUMMY, fd);
      setMarks({});
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="date"
          value={date}
          max={todayStr}
          onChange={(e) => {
            if (e.target.value) router.push(`/attendance?date=${e.target.value}`);
          }}
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-text"
          aria-label="Chọn ngày điểm danh"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tên..."
          className="h-10 min-w-40 flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-text"
          aria-label="Tìm học sinh"
        />
        <button
          type="button"
          onClick={allPresent}
          disabled={pending}
          className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          Cả lớp có mặt
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm font-bold">
        <span className="rounded-full bg-success-light px-3 py-1 text-success">
          Có mặt: {present}
        </span>
        <span className="rounded-full bg-danger-light px-3 py-1 text-danger">
          Vắng: {absent}
        </span>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">
          Có phép: {excused}
        </span>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-text-muted">
          Chưa có học sinh nào. Vào Dữ liệu lớp để nhập danh sách.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((s) => {
            const st = marks[s.id] ?? "PRESENT";
            return (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2"
              >
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-light text-sm font-extrabold text-primary"
                >
                  {initials(s.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text">
                    {s.name}
                  </span>
                  <span className="block text-xs text-text-muted">{s.team ?? ""}</span>
                </span>
                <span className="flex shrink-0 gap-1.5">
                  {(
                    [
                      ["PRESENT", "Có mặt"],
                      ["ABSENT", "Vắng"],
                      ["EXCUSED", "Có phép"],
                    ] as [Status, string][]
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      disabled={pending}
                      onClick={() => mark(s.id, v)}
                      aria-pressed={st === v}
                      className={
                        st === v
                          ? v === "PRESENT"
                            ? "rounded-full bg-success px-3 py-1.5 text-xs font-bold text-white"
                            : v === "ABSENT"
                              ? "rounded-full bg-danger px-3 py-1.5 text-xs font-bold text-white"
                              : "rounded-full bg-amber px-3 py-1.5 text-xs font-bold text-[#1A1200]"
                          : "rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text"
                      }
                    >
                      {label}
                    </button>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
