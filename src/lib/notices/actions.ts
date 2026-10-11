"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current";
import { prisma } from "@/lib/prisma";
import { getMyClass } from "@/lib/classes/service";
import type { ActionState } from "@/lib/classes/actions";

async function mustTeacher() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    throw new Error("Chỉ giáo viên mới đăng được.");
  }
  const klass = await getMyClass();
  if (!klass) throw new Error("Chưa có lớp.");
  return { user, klass };
}

function toState(e: unknown): ActionState {
  return {
    ok: false,
    message: e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại nhé.",
  };
}

export async function createNoticeAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { user, klass } = await mustTeacher();
    const title = String(formData.get("title") ?? "").trim().slice(0, 100);
    const content = String(formData.get("body") ?? "").trim().slice(0, 300);
    if (!title) throw new Error("Thiếu tiêu đề thông báo.");
    await prisma.announcement.create({
      data: {
        classId: klass.id,
        authorId: user.id,
        title,
        content,
        isPinned: formData.get("pinned") === "on",
      },
    });
    revalidatePath("/notices");
    return { ok: true, message: "Đã đăng thông báo." };
  } catch (e) {
    return toState(e);
  }
}

export async function deleteNoticeAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { klass } = await mustTeacher();
    const id = String(formData.get("id") ?? "");
    const found = await prisma.announcement.findFirst({
      where: { id, classId: klass.id },
    });
    if (!found) throw new Error("Không tìm thấy thông báo.");
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/notices");
    return { ok: true, message: "Đã xóa." };
  } catch (e) {
    return toState(e);
  }
}
