"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";

import {
  updateCriterionLabelAction,
  updateCriterionPointsAction,
  type ActionState,
} from "@/lib/competition/actions";
import { cn } from "@/lib/utils";

type Criterion = {
  id: string;
  key: string;
  label: string;
  kind: "POSITIVE" | "NEGATIVE";
  points: number;
};

type Group = {
  key: string;
  label: string;
  kind: "POSITIVE" | "NEGATIVE";
  input: "COUNT" | "GRADE";
  criteria: Criterion[];
};

const PANEL = "rounded-2xl bg-surface border border-border";
const INITIAL: ActionState = { ok: true, message: "" };

export default function CriterionSettings({
  classId,
  groups,
}: {
  classId: string;
  groups: Group[];
}) {
  const [toast, setToast] = useState<ActionState | null>(null);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});

  async function savePoints(c: Criterion, raw: string) {
    const points = Number(raw);
    if (!Number.isInteger(points) || points < 0 || points > 50) {
      setToast({ ok: false, message: "Mức điểm phải là số nguyên từ 0 đến 50." });
      return;
    }
    if (points === c.points) {
      setDirty((d) => ({ ...d, [`p-${c.id}`]: false }));
      return;
    }
    const fd = new FormData();
    fd.set("classId", classId);
    fd.set("criterionId", c.id);
    fd.set("points", String(points));
    setToast(await updateCriterionPointsAction(INITIAL, fd));
    setDirty((d) => ({ ...d, [`p-${c.id}`]: false }));
  }

  async function saveLabel(c: Criterion, raw: string) {
    const label = raw.trim();
    if (!label) {
      setToast({ ok: false, message: "Tên tiêu chí không được để trống." });
      return;
    }
    if (label === c.label) {
      setDirty((d) => ({ ...d, [`l-${c.id}`]: false }));
      return;
    }
    const fd = new FormData();
    fd.set("classId", classId);
    fd.set("criterionId", c.id);
    fd.set("label", label);
    setToast(await updateCriterionLabelAction(INITIAL, fd));
    setDirty((d) => ({ ...d, [`l-${c.id}`]: false }));
  }

  const dirtyCount = Object.values(dirty).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <header className={cn(PANEL, "px-4 py-4 sm:px-5")}>
        <Link
          href="/competition"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-text"
        >
          <ArrowLeft aria-hidden className="size-3.5" /> Về trang thi đua
        </Link>
        <h1 className="mt-2 text-lg font-extrabold tracking-tight text-text sm:text-xl">
          Cấu hình mức điểm tiêu chí
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
          Đổi mức điểm ở đây thì <b className="text-text">mọi tuần đã ghi cũng tính lại</b>, không mất
          dữ liệu số lần đã nhập. Nhóm tiêu chí và thứ tự cột cố định theo file Excel, chỉ chỉnh được
          tên và mức điểm.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1.5 text-[11px] text-muted">
          <RotateCcw aria-hidden className="size-3.5" />
          Điểm trừ hiển thị mức phạt dương; hệ thống tự trừ theo loại tiêu chí.
        </p>
      </header>

      {toast && (
        <p
          role="status"
          className={cn(
            "rounded-xl px-3 py-2 text-xs font-semibold",
            toast.ok ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600",
          )}
        >
          {toast.message}
        </p>
      )}

      {groups.map((g) => (
        <section key={g.key} className={cn(PANEL, "overflow-hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 className="text-sm font-extrabold text-text">{g.label}</h2>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                g.kind === "POSITIVE"
                  ? "bg-emerald-500/15 text-emerald-600"
                  : "bg-rose-500/15 text-rose-600",
              )}
            >
              {g.kind === "POSITIVE" ? "Điểm cộng" : "Điểm trừ"}
              {g.input === "GRADE" ? " · chọn con điểm" : ""}
            </span>
          </div>

          <ul className="divide-y divide-border/60">
            {g.criteria.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold tabular-nums",
                    g.kind === "POSITIVE"
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-rose-500/15 text-rose-600",
                  )}
                >
                  {c.kind === "POSITIVE" ? `+${c.points}` : `−${c.points}`}
                </span>

                <div className="min-w-[200px] flex-1">
                  <label className="sr-only" htmlFor={`label-${c.id}`}>
                    Tên tiêu chí {c.key}
                  </label>
                  <input
                    id={`label-${c.id}`}
                    type="text"
                    defaultValue={c.label}
                    maxLength={120}
                    onBlur={(e) => void saveLabel(c, e.target.value)}
                    className={cn(
                      "h-8 w-full rounded-lg border border-transparent bg-transparent px-2 text-xs font-semibold text-text",
                      "focus:border-sky focus:bg-canvas focus:outline-none",
                      dirty[`l-${c.id}`] && "border-amber-500/50",
                    )}
                  />
                  <p className="px-2 text-[10px] text-muted">{c.key}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-bold text-muted" htmlFor={`points-${c.id}`}>
                    {g.kind === "POSITIVE" ? "Cộng" : "Phạt"}
                  </label>
                  <input
                    id={`points-${c.id}`}
                    type="number"
                    min={0}
                    max={50}
                    inputMode="numeric"
                    defaultValue={c.points}
                    onBlur={(e) => void savePoints(c, e.target.value)}
                    className={cn(
                      "h-8 w-16 rounded-lg border border-transparent bg-canvas px-2 text-center text-xs font-extrabold tabular-nums text-text",
                      "focus:border-sky focus:outline-none",
                      dirty[`p-${c.id}`] && "border-amber-500/50",
                    )}
                  />
                  <span className="text-[10px] text-muted">điểm / lần</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="flex items-center gap-1.5 px-1 text-[11px] text-muted">
        <Save aria-hidden className="size-3.5" />
        Sửa xong rời ô là tự lưu. Nhấn Enter cũng lưu.
        {dirtyCount > 0 && <span className="font-bold text-amber-300">· {dirtyCount} ô chưa lưu</span>}
      </p>
    </div>
  );
}