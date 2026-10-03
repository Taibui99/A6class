"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import {
  createTeamAction,
  deleteTeamAction,
  renameTeamAction,
  type ActionState,
} from "@/lib/classes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Team = {
  id: string;
  name: string;
  _count: { members: number };
};

function Message({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={`text-xs ${state.ok ? "text-emerald-300" : "text-danger"}`}
    >
      {state.message}
    </p>
  );
}

function AddTeamForm({ classId }: { classId: string }) {
  const [state, formAction, pending] = useActionState(
    createTeamAction,
    { ok: false, message: "" } satisfies ActionState
  );
  const [name, setName] = useState("");

  return (
    <form
      action={formAction}
      onSubmit={() => setName("")}
      className="flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="classId" value={classId} />
      <div className="min-w-40 flex-1">
        <Input
          name="teamName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên tổ mới"
          aria-label="Tên tổ mới"
          required
        />
      </div>
      <Button type="submit" size="sm" disabled={pending || !name.trim()}>
        {pending ? (
          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
        ) : (
          <Plus aria-hidden="true" className="size-3.5" />
        )}
        Thêm tổ
      </Button>
      <Message state={state} />
    </form>
  );
}

function TeamRow({ team }: { team: Team }) {
  const [renameState, renameAction, renaming] = useActionState(
    renameTeamAction,
    { ok: false, message: "" } satisfies ActionState
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteTeamAction,
    { ok: false, message: "" } satisfies ActionState
  );
  const [name, setName] = useState(team.name);
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-xl bg-surface p-3 ring-1 ring-border">
      <form action={renameAction} className="flex min-w-48 flex-1 items-center gap-2">
        <input type="hidden" name="teamId" value={team.id} />
        <Input
          name="teamName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label={`Tên tổ ${team.name}`}
          className="h-9"
        />
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          disabled={renaming || !name.trim() || name.trim() === team.name}
        >
          {renaming ? (
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          ) : null}
          Lưu
        </Button>
      </form>

      <span className="text-xs text-text-muted">
        {team._count.members} học sinh
      </span>

      {confirming ? (
        <form action={deleteAction} className="flex items-center gap-1.5">
          <input type="hidden" name="teamId" value={team.id} />
          <span className="text-xs text-text-secondary">Xoá tổ này?</span>
          <Button
            type="submit"
            size="sm"
            variant="destructive"
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
            ) : null}
            Xoá
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setConfirming(false)}
          >
            Huỷ
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setConfirming(true)}
          aria-label={`Xoá tổ ${team.name}`}
        >
          <Trash2 aria-hidden="true" className="size-3.5" />
        </Button>
      )}

      <div className="basis-full">
        <Message state={renameState} />
        <Message state={deleteState} />
      </div>
    </li>
  );
}

export function TeamManager({ classId, teams }: { classId: string; teams: Team[] }) {
  return (
    <div className="space-y-3">
      <AddTeamForm classId={classId} />

      {teams.length === 0 ? (
        <p className="rounded-xl bg-surface p-4 text-sm text-text-muted ring-1 ring-border">
          Chưa có tổ nào. Thêm tổ ở trên, hoặc đơn giản là dán danh sách có cột
          Tổ — hệ thống sẽ tự tạo.
        </p>
      ) : (
        <ul className="space-y-2">
          {teams.map((team) => (
            <TeamRow key={team.id} team={team} />
          ))}
        </ul>
      )}
    </div>
  );
}
