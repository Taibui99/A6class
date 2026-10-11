"use server";

import { revalidatePath } from "next/cache";

import * as service from "@/lib/attendance/service";
import type { ActionState } from "@/lib/classes/actions";

function toState(e: unknown): ActionState {
  return {
    ok: false,
    message: e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại nhé.",
  };
}

export async function setAttendanceAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await service.setAttendance(
      String(formData.get("classId") ?? ""),
      String(formData.get("userId") ?? ""),
      String(formData.get("date") ?? ""),
      String(formData.get("status") ?? "PRESENT") as "PRESENT" | "ABSENT" | "EXCUSED"
    );
    revalidatePath("/attendance");
    return { ok: true, message: "Đã lưu điểm danh." };
  } catch (e) {
    return toState(e);
  }
}

export async function clearDayAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await service.clearDay(
      String(formData.get("classId") ?? ""),
      String(formData.get("date") ?? "")
    );
    revalidatePath("/attendance");
    return { ok: true, message: "Cả lớp có mặt." };
  } catch (e) {
    return toState(e);
  }
}
