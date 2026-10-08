"use client";

import { useActionState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";

import {
  createClassAction,
  updateClassAction,
  type ActionState,
} from "@/lib/classes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ClassInfo = {
  id: string;
  name: string;
  schoolYear: string;
  school: string | null;
};

export function ClassInfoForm({ klass }: { klass: ClassInfo }) {
  const [state, formAction, pending] = useActionState(
    updateClassAction,
    { ok: false, message: "" } satisfies ActionState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="classId" value={klass.id} />

      {state.message && (
        <p
          role="status"
          className={`flex items-start gap-2 text-sm ${
            state.ok ? "text-emerald-600" : "text-danger"
          }`}
        >
          {state.ok ? null : (
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="class-name">Tên lớp</Label>
          <Input
            id="class-name"
            name="name"
            defaultValue={klass.name}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="class-year">Năm học</Label>
          <Input
            id="class-year"
            name="schoolYear"
            defaultValue={klass.schoolYear}
            placeholder="2026-2027"
            required
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="class-school">Trường (không bắt buộc)</Label>
        <Input
          id="class-school"
          name="school"
          defaultValue={klass.school ?? ""}
          className="mt-1.5"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending && (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        )}
        Lưu thông tin lớp
      </Button>
    </form>
  );
}

export function CreateClassForm() {
  const [state, formAction, pending] = useActionState(
    createClassAction,
    { ok: false, message: "" } satisfies ActionState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p
          role="status"
          className={`flex items-start gap-2 text-sm ${
            state.ok ? "text-emerald-600" : "text-danger"
          }`}
        >
          {state.ok ? null : (
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          {state.message}
        </p>
      )}

      <div>
        <Label htmlFor="new-class-name">Tên lớp</Label>
        <Input
          id="new-class-name"
          name="name"
          placeholder="12A6"
          required
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="new-class-year">Năm học</Label>
        <Input
          id="new-class-year"
          name="schoolYear"
          placeholder="2026-2027"
          required
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="new-class-school">Trường (không bắt buộc)</Label>
        <Input
          id="new-class-school"
          name="school"
          className="mt-1.5"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending && (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        )}
        Tạo lớp
      </Button>
    </form>
  );
}
