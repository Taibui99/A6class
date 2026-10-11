"use server";

import { revalidatePath } from "next/cache";

import * as service from "@/lib/timetable/service";
import type { ActionState } from "@/lib/classes/actions";

function toState(e: unknown): ActionState {
  return {
    ok: false,
    message: e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại nhé.",
  };
}

export async function setSubjectAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await service.setSubject(
      String(formData.get("classId") ?? ""),
      Number(formData.get("day") ?? 0),
      Number(formData.get("period") ?? 0),
      String(formData.get("subject") ?? "")
    );
    revalidatePath("/timetable");
    return { ok: true, message: "Đã lưu." };
  } catch (e) {
    return toState(e);
  }
}

export async function seedSampleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await service.seedSample(String(formData.get("classId") ?? ""));
    revalidatePath("/timetable");
    return { ok: true, message: "Đã đổ thời khóa biểu mẫu." };
  } catch (e) {
    return toState(e);
  }
}
