"use server";

import { revalidatePath } from "next/cache";

import * as service from "@/lib/competition/service";

export type ActionState = {
  ok: boolean;
  message: string;
};

/** Bọc service để form dùng useActionState: luôn trả về state thay vì throw. */
function toState(e: unknown): ActionState {
  return {
    ok: false,
    message: e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại nhé.",
  };
}

function refresh() {
  revalidatePath("/competition");
  revalidatePath("/competition/settings");
  revalidatePath("/dashboard");
}

export async function saveEntryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const classId = String(formData.get("classId") ?? "");
    const periodId = String(formData.get("periodId") ?? "");
    const criterionId = String(formData.get("criterionId") ?? "");
    const targetUserId = String(formData.get("targetUserId") ?? "");
    const count = Number(formData.get("count"));
    if (!classId || !periodId || !criterionId || !targetUserId) {
      return { ok: false, message: "Thiếu dữ liệu ô cần lưu." };
    }
    const r = await service.saveEntry({ classId, periodId, criterionId, targetUserId, count });
    refresh();
    return {
      ok: true,
      message:
        r.count === 0
          ? "Đã xoá ô."
          : `Đã ghi ${r.count} lần (${r.points > 0 ? "+" : ""}${r.points} điểm).`,
    };
  } catch (e) {
    return toState(e);
  }
}

export async function setPublishedAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const classId = String(formData.get("classId") ?? "");
    const periodId = String(formData.get("periodId") ?? "");
    const published = formData.get("published") === "1";
    await service.setPeriodPublished(classId, periodId, published);
    refresh();
    return {
      ok: true,
      message: published
        ? "Đã công bố kết quả — cả lớp xem được tất cả các tổ."
        : "Đã chuyển lại chế độ riêng tưng tổ.",
    };
  } catch (e) {
    return toState(e);
  }
}

export async function activatePeriodAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const classId = String(formData.get("classId") ?? "");
    const periodId = String(formData.get("periodId") ?? "");
    await service.activatePeriod(classId, periodId);
    refresh();
    return { ok: true, message: "Đã chuyển sang kỳ thi mới." };
  } catch (e) {
    return toState(e);
  }
}

export async function updateCriterionPointsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const classId = String(formData.get("classId") ?? "");
    const criterionId = String(formData.get("criterionId") ?? "");
    const points = Number(formData.get("points"));
    await service.updateCriterionPoints(classId, criterionId, points);
    refresh();
    return { ok: true, message: "Đã cập nhật mức điểm." };
  } catch (e) {
    return toState(e);
  }
}

export async function updateCriterionLabelAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const classId = String(formData.get("classId") ?? "");
    const criterionId = String(formData.get("criterionId") ?? "");
    const label = String(formData.get("label") ?? "");
    await service.updateCriterionLabel(classId, criterionId, label);
    refresh();
    return { ok: true, message: "Đã cập nhật tên tiêu chí." };
  } catch (e) {
    return toState(e);
  }
}