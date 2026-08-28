import { prisma } from "@/lib/prisma";

export type DashboardTask = {
  id: string;
  title: string;
  deadline: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "SUBMITTED" | "REVIEWING" | "COMPLETED" | "REJECTED";
};

export type DashboardAnnouncement = {
  id: string;
  title: string;
  content: string | null;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  isPinned: boolean;
  createdAt: Date;
};

export type DashboardSummary = {
  classId: string | null;
  className: string | null;
  team: { id: string; name: string; totalScore: number; rank: number | null } | null;
  totalPoints: number;
  personalRank: number | null;
  pendingTasks: DashboardTask[];
  pendingTaskCount: number;
  announcements: DashboardAnnouncement[];
};

export async function getDashboardSummary(
  userId: string
): Promise<DashboardSummary | null> {
  try {
    const membership = await prisma.classMembership.findFirst({
      where: { userId },
      select: {
        classId: true,
        class: { select: { name: true } },
        team: {
          select: { id: true, name: true, totalScore: true, rank: true },
        },
      },
    });

    const classId = membership?.classId ?? null;

    const [pointsAgg, pendingTasks, announcements] = await Promise.all([
      classId
        ? prisma.pointTransaction.aggregate({
            where: { classId, targetUserId: userId },
            _sum: { amount: true },
          })
        : Promise.resolve({ _sum: { amount: 0 } }),
      classId
        ? prisma.taskAssignment.findMany({
            where: {
              userId,
              status: { in: ["TODO", "IN_PROGRESS"] },
              task: { classId },
            },
            select: {
              id: true,
              status: true,
              task: {
                select: {
                  id: true,
                  title: true,
                  deadline: true,
                  priority: true,
                },
              },
            },
            orderBy: [{ task: { deadline: "asc" } }, { task: { createdAt: "asc" } }],
            take: 5,
          })
        : Promise.resolve([]),
      classId
        ? prisma.announcement.findMany({
            where: { classId },
            select: { id: true, title: true, content: true, priority: true, isPinned: true, createdAt: true },
            orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
            take: 3,
          })
        : Promise.resolve([]),
    ]);

    let personalRank: number | null = null;
    if (classId) {
      const ranked = await prisma.pointTransaction.groupBy({
        by: ["targetUserId"],
        where: { classId, targetUserId: { not: null } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      });
      const me = ranked.findIndex((r) => r.targetUserId === userId);
      if (me !== -1) personalRank = me + 1;
    }

    return {
      classId,
      className: membership?.class?.name ?? null,
      team: membership?.team ?? null,
      totalPoints: pointsAgg._sum.amount ?? 0,
      personalRank,
      pendingTasks: pendingTasks.map((a) => ({
        id: a.task.id,
        title: a.task.title,
        deadline: a.task.deadline,
        priority: a.task.priority,
        status: a.status,
      })),
      pendingTaskCount: pendingTasks.length,
      announcements,
    };
  } catch {
    return null;
  }
}