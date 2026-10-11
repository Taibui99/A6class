"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { seedSampleAction, setSubjectAction } from "@/lib/timetable/actions";
import { TT_DAY_LABEL, TT_DAYS, TT_PERIODS } from "@/lib/timetable/service";

const DUMMY = { ok: true, message: "" };

/**
 * Lưới T2–T7 × Tiết 1–5. Giáo viên bấm vào ô để sửa (lưu khi Enter/rời ô),
 * học sinh chỉ xem. Nút đổ mẫu khi bảng còn trắng.
 */
export function TimetableGrid({
  classId,
  slots,
  canEdit,
}: {
  classId: string;
  slots: Record<string, string>;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const empty = Object.keys(slots).length === 0;

  function openCell(key: string, current: string) {
    if (!canEdit) return;
    setEditing(key);
    setDraft(current);
  }

  function commit(day: number, period: number, save: boolean) {
    const key = `${day}-${period}`;
    setEditing(null);
    if (!save) return;
    const fd = new FormData();
    fd.set("classId", classId);
    fd.set("day", String(day));
    fd.set("period", String(period));
    fd.set("subject", draft);
    startTransition(async () => {
      await setSubjectAction(DUMMY, fd);
      router.refresh();
    });
  }

  function seed() {
    const fd = new FormData();
    fd.set("classId", classId);
    startTransition(async () => {
      await seedSampleAction(DUMMY, fd);
      router.refresh();
    });
  }

  return (
    <div>
      {canEdit && (
        <p className="mb-3 text-xs text-text-muted">
          Bấm vào ô để sửa môn học, Enter hoặc bấm ra ngoài để lưu. Xóa trắng
          ô để bỏ tiết đó.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="bg-primary-soft p-2.5 text-center text-xs font-extrabold uppercase tracking-wide text-primary" />
              {TT_DAYS.map((d) => (
                <th
                  key={d}
                  className="bg-primary-soft p-2.5 text-center text-xs font-extrabold uppercase tracking-wide text-primary"
                >
                  {TT_DAY_LABEL[d]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TT_PERIODS.map((p) => (
              <tr key={p} className="border-t border-border">
                <th className="bg-surface-hover p-2.5 text-center text-xs font-bold text-text-secondary">
                  Tiết {p}
                </th>
                {TT_DAYS.map((d) => {
                  const key = `${d}-${p}`;
                  const val = slots[key] ?? "";
                  const isEditing = editing === key;
                  return (
                    <td
                      key={key}
                      onClick={() => openCell(key, val)}
                      className={
                        "p-2.5 text-center font-semibold text-text " +
                        (canEdit ? "cursor-pointer hover:bg-surface-hover" : "")
                      }
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          value={draft}
                          maxLength={30}
                          onChange={(e) => setDraft(e.target.value)}
                          onBlur={() => commit(d, p, true)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commit(d, p, true);
                            if (e.key === "Escape") commit(d, p, false);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded-lg border border-primary bg-surface px-2 py-1 text-center text-sm text-text"
                          aria-label={`Tiết ${p} ${TT_DAY_LABEL[d]}`}
                        />
                      ) : (
                        val || <span className="text-text-muted">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canEdit && empty && (
        <button
          type="button"
          onClick={seed}
          disabled={pending}
          className="mt-3 inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          Dùng thời khóa biểu mẫu
        </button>
      )}
    </div>
  );
}
