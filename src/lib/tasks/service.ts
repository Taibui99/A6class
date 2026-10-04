import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current";

export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "SUBMITTED" | "REVIEWING" | "COMPLETED" | "REJECTED";
  points: number | null;
  assigneeType: "INDIVIDUAL" | "TEAM" | "CLASS" | "ROLE";
  teamId: string | null;
  teamName?: string | null;
  creatorName?: string;
  submissionCount: number;
  createdAt: Date;
};


/**
 * Nhiệm vụ của một lớp.
 *
 * `classId` bỏ trống thì lấy lớp của chính người đang đăng nhập, thay vì
 * đoán "lớp đầu tiên trong DB" — nếu DB có nhiều lớp thì cách đoán cũ khiến
 * học sinh lớp này thấy nhiệm vụ của lớp kia.
 *
 * Không có lớp hoặc lỗi DB thì trả mảng rỗng. Cố ý KHÔNG trả dữ liệu mẫu:
 * nhiệm vụ bịa hiện như việc thật làm giáo viên tưởng đã nhập xong.
 */
export async function getClassTasks(classId?: string | null): Promise<TaskItem[]> {
  try {
    if (!classId) {
      const user = await getCurrentUser();
      if (!user) return [];
      const membership = await prisma.classMembership.findFirst({
        where: { userId: user.id },
        orderBy: { joinedAt: "asc" },
        select: { classId: true },
      });
      classId = membership?.classId ?? null;
    }

    if (!classId) return [];

    const tasks = await prisma.task.findMany({
      where: { classId },
      include: {
        team: { select: { id: true, name: true } },
        creator: { select: { fullName: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      deadline: t.deadline,
      priority: t.priority as TaskItem["priority"],
      status: t.status as TaskItem["status"],
      points: t.points,
      assigneeType: t.assigneeType as TaskItem["assigneeType"],
      teamId: t.teamId,
      teamName: t.team ? t.team.name : t.assigneeType === "CLASS" ? "Cả lớp" : null,
      creatorName: t.creator.fullName,
      submissionCount: t._count.submissions,
      createdAt: t.createdAt,
    }));
  } catch {
    return [];
  }
}
