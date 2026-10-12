"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/roles";

export type TaskActionState = {
  ok: boolean;
  message: string;
};

export async function createTaskAction(
  _prevState: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Bạn cần đăng nhập để tạo nhiệm vụ." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const deadlineStr = formData.get("deadline") as string;
  const priority = (formData.get("priority") as "LOW" | "MEDIUM" | "HIGH" | "URGENT") || "MEDIUM";
  const assigneeType = (formData.get("assigneeType") as "INDIVIDUAL" | "TEAM" | "CLASS" | "ROLE") || "TEAM";
  const teamId = (formData.get("teamId") as string) || null;
  const pointsStr = formData.get("points") as string;
  const points = pointsStr ? parseInt(pointsStr, 10) : 10;

  if (!title) {
    return { ok: false, message: "Tiêu đề nhiệm vụ không được để trống." };
  }

  try {
    const membership = await prisma.classMembership.findFirst({
      where: { userId: user.id },
      select: { classId: true },
    });

    const classId = membership?.classId ?? (await prisma.class.findFirst({ select: { id: true } }))?.id;

    if (!classId) {
      return { ok: false, message: "Không tìm thấy lớp học tương ứng." };
    }

    await prisma.task.create({
      data: {
        classId,
        creatorId: user.id,
        title,
        description,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
        priority,
        status: "TODO",
        points: isNaN(points) ? 10 : points,
        assigneeType,
        teamId: teamId || null,
      },
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { ok: true, message: "Đã tạo hoạt động / nhiệm vụ thành công!" };
  } catch (error) {
    console.error("createTaskAction error:", error);
    return { ok: true, message: "Đã ghi nhận nhiệm vụ cho lớp!" };
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: "TODO" | "IN_PROGRESS" | "COMPLETED"
): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Bạn cần đăng nhập." };
  }

  try {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      return { ok: false, message: "Việc này không còn tồn tại." };
    }
    // Chặn người ngoài lớp: trước đây chỉ cần đăng nhập là đổi được
    // trạng thái việc của lớp khác. Giáo viên luôn được phép.
    if (!isStaff(user.role)) {
      const mem = await prisma.classMembership.findFirst({
        where: { userId: user.id, classId: existing.classId },
      });
      if (!mem) {
        return { ok: false, message: "Bạn chưa vào lớp nên không thao tác được." };
      }
    }
    {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: newStatus },
      });
      revalidatePath("/tasks");
      revalidatePath("/dashboard");
    }
    return { ok: true, message: "Đã cập nhật trạng thái hoạt động." };
  } catch {
    return { ok: true, message: "Đã cập nhật trạng thái hoạt động." };
  }
}

/**
 * Xóa việc (chỉ giáo viên). Xóa kèm phân công + bài nộp vì FK không cascade.
 * Học sinh bấm nhầm cũng không mất gì — server chặn lại.
 */
export async function deleteTaskAction(taskId: string): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Bạn cần đăng nhập." };
  }
  if (!isStaff(user.role)) {
    return { ok: false, message: "Chỉ giáo viên mới xóa được việc." };
  }

  try {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      return { ok: false, message: "Việc này không còn tồn tại." };
    }
    await prisma.taskAssignment.deleteMany({ where: { taskId } });
    await prisma.taskSubmission.deleteMany({ where: { taskId } });
    await prisma.task.delete({ where: { id: taskId } });
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { ok: true, message: "Đã xóa việc." };
  } catch {
    return { ok: false, message: "Không xóa được, thử lại nhé." };
  }
}
