"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import { saveOnboardingAction } from "@/lib/onboarding/actions";
import { FormSelect } from "@/components/ui/form-select";
import type { OnboardingClass } from "@/lib/onboarding/service";

const INIT = { ok: true, message: "" };

/**
 * Form khai hồ sơ lần đầu: họ tên (bắt buộc) + lớp + tổ
 * (bắt buộc khi lớp đã có tổ). Không có kẽ hở bỏ qua ở client
 * vì server cũng kiểm tra lại y hệt.
 */
export function OnboardingForm({
  fullName,
  membership,
  classes,
}: {
  fullName: string;
  membership: { classId: string; teamId: string | null } | null;
  classes: OnboardingClass[];
}) {
  const [state, action, pending] = useActionState(saveOnboardingAction, INIT);
  const [classId, setClassId] = useState(
    membership?.classId ?? classes[0]?.id ?? ""
  );
  const [teamId, setTeamId] = useState(membership?.teamId ?? "");

  if (classes.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface-hover/60 p-4 text-sm text-text-secondary">
        Chưa có lớp nào trong hệ thống. Nhờ thầy/cô tạo lớp rồi em quay lại
        nhé.
      </p>
    );
  }

  const klass = classes.find((c) => c.id === classId) ?? null;
  const teams = klass?.teams ?? [];

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="ob-name"
          className="mb-1 block text-xs font-bold text-text-muted"
        >
          Họ và tên của em
        </label>
        <input
          id="ob-name"
          name="fullName"
          required
          minLength={2}
          maxLength={60}
          defaultValue={fullName}
          placeholder="VD: Nguyễn Văn An"
          autoComplete="name"
          className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text"
        />
      </div>

      <div>
        <span className="mb-1 block text-xs font-bold text-text-muted">
          Lớp của em
        </span>
        <FormSelect
          name="classId"
          value={classId}
          onChange={(cid) => {
            setClassId(cid);
            setTeamId("");
          }}
          ariaLabel="Lớp của em"
          className="h-11 w-full text-sm"
          placeholder="— Chọn lớp —"
          options={classes.map((c) => ({
            value: c.id,
            label: `${c.name} · ${c.schoolYear}`,
          }))}
        />
      </div>

      {klass && teams.length > 0 ? (
        <div>
          <span className="mb-1 block text-xs font-bold text-text-muted">
            Tổ của em
          </span>
          <FormSelect
            name="teamId"
            value={teamId}
            onChange={setTeamId}
            ariaLabel="Tổ của em"
            className="h-11 w-full text-sm"
            placeholder="— Chọn tổ —"
            options={teams.map((t) => ({ value: t.id, label: t.name }))}
          />
        </div>
      ) : (
        klass && <input type="hidden" name="teamId" value="" />
      )}

      {state.message && (
        <p role="alert" className="text-sm font-semibold text-danger">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !classId || (teams.length > 0 && !teamId)}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {pending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
        {pending ? "Đang lưu…" : "Xong — vào lớp"}
      </button>
    </form>
  );
}
