"use server";

import { revalidatePath } from "next/cache";

import * as service from "@/lib/classes/service";

export type ActionState = {
  ok: boolean;
  message: string;
};

function toState(e: unknown): ActionState {
  return {
    ok: false,
    message: e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại nhé.",
  };
}

function refresh(classId?: string) {
  revalidatePath("/class");
  if (classId) revalidatePath("/class", "layout");
}

export async function createClassAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const created = await service.createClass({
      name: String(formData.get("name") ?? ""),
      schoolYear: String(formData.get("schoolYear") ?? ""),
      school: String(formData.get("school") ?? ""),
    });
    refresh(created.id);
    return { ok: true, message: `Đã tạo lớp ${created.name}.` };
  } catch (e) {
    return toState(e);
  }
}

export async function updateClassAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const classId = String(formData.get("classId") ?? "");
    await service.updateClass(classId, {
      name: String(formData.get("name") ?? ""),
      schoolYear: String(formData.get("schoolYear") ?? ""),
      school: String(formData.get("school") ?? ""),
    });
    refresh(classId);
    return { ok: true, message: "Đã lưu thông tin lớp." };
  } catch (e) {
    return toState(e);
  }
}

export async function createTeamAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const classId = String(formData.get("classId") ?? "");
    const name = String(formData.get("teamName") ?? "");
    await service.createTeam(classId, name);
    refresh(classId);
    return { ok: true, message: `Đã thêm tổ ${name.trim()}.` };
  } catch (e) {
    return toState(e);
  }
}

export async function renameTeamAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const teamId = String(formData.get("teamId") ?? "");
    const name = String(formData.get("teamName") ?? "");
    await service.renameTeam(teamId, name);
    refresh();
    return { ok: true, message: `Đã đổi tên thành ${name.trim()}.` };
  } catch (e) {
    return toState(e);
  }
}

export async function deleteTeamAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const teamId = String(formData.get("teamId") ?? "");
    const r = await service.deleteTeam(teamId);
    refresh();
    return {
      ok: true,
      message:
        r.removedMembers > 0
          ? `Đã xoá tổ. ${r.removedMembers} học sinh chuyển sang chưa có tổ.`
          : "Đã xoá tổ.",
    };
  } catch (e) {
    return toState(e);
  }
}

export async function importRosterAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const classId = String(formData.get("classId") ?? "");
    const raw = String(formData.get("roster") ?? "");
    const r = await service.importRoster(classId, raw);
    refresh(classId);

    const bits = [`thêm ${r.added}`, `cập nhật ${r.updated}`];
    if (r.adopted > 0) bits.push(`nâng cấp email thật cho ${r.adopted}`);
    if (r.teamsCreated > 0) bits.push(`tạo ${r.teamsCreated} tổ mới`);

    return { ok: true, message: `Đã nhập: ${bits.join(", ")}.` };
  } catch (e) {
    return toState(e);
  }
}

export async function updateStudentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const membershipId = String(formData.get("membershipId") ?? "");
    await service.updateStudent(membershipId, {
      fullName: String(formData.get("fullName") ?? ""),
      teamId: String(formData.get("teamId") ?? ""),
      role: String(formData.get("role") ?? "STUDENT"),
    });
    refresh();
    return { ok: true, message: "Đã cập nhật học sinh." };
  } catch (e) {
    return toState(e);
  }
}

export async function removeStudentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const membershipId = String(formData.get("membershipId") ?? "");
    await service.removeStudent(membershipId);
    refresh();
    return { ok: true, message: "Đã xoá học sinh khỏi lớp." };
  } catch (e) {
    return toState(e);
  }
}
