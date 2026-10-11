"use client";

import { useActionState, useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";

import {
  removeStudentAction,
  updateStudentAction,
  type ActionState,
} from "@/lib/classes/actions";
import { roleLabel } from "@/lib/classes/roster";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";

type Student = {
  id: string;
  role: string;
  teamId: string | null;
  user: { id: string; fullName: string; email: string };
};

type TeamOption = { id: string; name: string };

const EDITABLE_ROLES = [
  "STUDENT",
  "TEAM_LEADER",
  "TEAM_VICE_LEADER",
  "CLASS_MONITOR",
];

function StudentRow({
  student,
  teams,
}: {
  student: Student;
  teams: TeamOption[];
}) {
  const [teamId, setTeamId] = useState(student.teamId ?? "");
  const [role, setRole] = useState(
    EDITABLE_ROLES.includes(student.role) ? student.role : "STUDENT"
  );
  const [updateState, updateAction, updating] = useActionState(
    updateStudentAction,
    { ok: false, message: "" } satisfies ActionState
  );
  const [removeState, removeAction, removing] = useActionState(
    removeStudentAction,
    { ok: false, message: "" } satisfies ActionState
  );

  return (
    <li className="rounded-xl bg-surface p-3 border border-border">
      <form action={updateAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="membershipId" value={student.id} />

        <div className="min-w-44 flex-1">
          <Input
            name="fullName"
            defaultValue={student.user.fullName}
            aria-label={`Họ tên của ${student.user.fullName}`}
            required
            className="h-9"
          />
        </div>

        <div className="w-32">
          <select
            name="teamId"
            defaultValue={student.teamId ?? ""}
            aria-label={`Tổ của ${student.user.fullName}`}
            className="h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
          >
            <option value="">Chưa có tổ</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <FormSelect
            name="teamId"
            value={teamId}
            onChange={setTeamId}
            ariaLabel={`Tổ của ${student.user.fullName}`}
            className="h-9 w-full text-sm"
            emptyLabel="Chưa có tổ"
            options={teams.map((t) => ({ value: t.id, label: t.name }))}
          />
        </div>

        <div className="w-36">
          <FormSelect
            name="role"
            value={role}
            onChange={setRole}
            ariaLabel={`Chức vụ của ${student.user.fullName}`}
            className="h-9 w-full text-sm"
            options={EDITABLE_ROLES.map((r) => ({ value: r, label: roleLabel(r) }))}
          />
        </div>

        <Button type="submit" size="sm" disabled={updating}>
          {updating ? (
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-3.5" />
          )}
          Lưu
        </Button>
      </form>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-text-muted">{student.user.email}</span>
        <form action={removeAction}>
          <input type="hidden" name="membershipId" value={student.id} />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            disabled={removing}
            aria-label={`Xoá ${student.user.fullName} khỏi lớp`}
          >
            {removing ? (
              <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
            ) : (
              <Trash2 aria-hidden="true" className="size-3.5" />
            )}
            Xoá
          </Button>
        </form>

        {updateState.message && (
          <span
            role="status"
            className={`text-xs ${updateState.ok ? "text-success" : "text-danger"}`}
          >
            {updateState.message}
          </span>
        )}
        {removeState.message && (
          <span
            role="status"
            className={`text-xs ${removeState.ok ? "text-success" : "text-danger"}`}
          >
            {removeState.message}
          </span>
        )}
      </div>
    </li>
  );
}

export function RosterTable({
  students,
  teams,
}: {
  students: Student[];
  teams: TeamOption[];
}) {
  if (students.length === 0) {
    return (
      <p className="rounded-xl bg-surface p-4 text-sm text-text-muted border border-border">
        Lớp chưa có học sinh nào. Dán danh sách ở mục bên trên để bắt đầu.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {students.map((s) => (
        <StudentRow key={s.id} student={s} teams={teams} />
      ))}
    </ul>
  );
}
