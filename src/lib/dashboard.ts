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

export type ScoreboardTeam = {
  id: string;
  name: string;
  color: string | null;
  totalScore: number;
  rank: number | null;
  memberCount: number;
};

export type ScoreboardStudent = {
  id: string;
  fullName: string;
  points: number;
};

export type Scoreboard = {
  teams: ScoreboardTeam[];
  students: ScoreboardStudent[];
};

export type RecentActivity = {
  id: string;
  kind: "POINT" | "SUBMISSION" | "REPORT" | "ANNOUNCEMENT" | "POST";
  title: string;
  detail: string;
  at: Date;
};

export async function getScoreboard(classId: string): Promise<Scoreboard> {
  try {
    const [teams, ranked] = await Promise.all([
      prisma.team.findMany({
        where: { classId },
        select: {
          id: true,
          name: true,
          color: true,
          totalScore: true,
          rank: true,
          _count: { select: { members: true } },
        },
        orderBy: [{ rank: "asc" }, { totalScore: "desc" }],
      }),
      prisma.pointTransaction.groupBy({
        by: ["targetUserId"],
        where: { classId, targetUserId: { not: null } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 10,
      }),
    ]);

    const ids = ranked
      .map((r) => r.targetUserId)
      .filter((id): id is string => Boolean(id));
    const users = ids.length
      ? await prisma.user.findMany({
          where: { id: { in: ids } },
          select: { id: true, fullName: true, role: true },
        })
      : [];
    const infoById = new Map(users.map((u) => [u.id, u]));

    const students = ranked
      .map((r) => ({
        id: r.targetUserId as string,
        fullName: infoById.get(r.targetUserId as string)?.fullName ?? "Học sinh",
        points: r._sum.amount ?? 0,
      }))
      .filter((s) => infoById.get(s.id)?.role === "STUDENT");

    return {
      teams: teams.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        totalScore: t.totalScore,
        rank: t.rank,
        memberCount: t._count.members,
      })),
      students: students.slice(0, 10),
    };
  } catch {
    return { teams: [], students: [] };
  }
}

export async function getRecentActivities(classId: string): Promise<RecentActivity[]> {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [points, submissions, reports, announcements, posts] =
      await Promise.all([
        prisma.pointTransaction.findMany({
          where: { classId, createdAt: { gte: since } },
          include: { targetUser: { select: { fullName: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.taskSubmission.findMany({
          where: { task: { classId }, submittedAt: { gte: since } },
          include: {
            user: { select: { fullName: true } },
            task: { select: { title: true } },
          },
          orderBy: { submittedAt: "desc" },
          take: 10,
        }),
        prisma.report.findMany({
          where: { classId, createdAt: { gte: since } },
          include: { creator: { select: { fullName: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.announcement.findMany({
          where: { classId, createdAt: { gte: since } },
          include: { author: { select: { fullName: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.post.findMany({
          where: { classId, createdAt: { gte: since } },
          include: { author: { select: { fullName: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    const items: RecentActivity[] = [
      ...points.map((p) => ({
        id: p.id,
        kind: "POINT" as const,
        title: `${p.targetUser?.fullName ?? "Một bạn"} được +${p.amount} điểm`,
        detail: p.reason,
        at: p.createdAt,
      })),
      ...submissions.map((s) => ({
        id: s.id,
        kind: "SUBMISSION" as const,
        title: `${s.user.fullName} đã nộp bài: ${s.task.title}`,
        detail: "Phiếu nộp vừa gửi, cần duyệt",
        at: s.submittedAt,
      })),
      ...reports.map((r) => ({
        id: r.id,
        kind: "REPORT" as const,
        title: `Báo cáo ${r.type.toLowerCase()}: ${r.title}`,
        detail: `Từ ${r.creator.fullName}`,
        at: r.createdAt,
      })),
      ...announcements.map((a) => ({
        id: a.id,
        kind: "ANNOUNCEMENT" as const,
        title: `Thông báo mới: ${a.title}`,
        detail: `Từ ${a.author.fullName}`,
        at: a.createdAt,
      })),
      ...posts.map((p) => ({
        id: p.id,
        kind: "POST" as const,
        title: `Bài viết mới của ${p.author.fullName}`,
        detail: p.content,
        at: p.createdAt,
      })),
    ];

    return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 12);
  } catch {
    return [];
  }
}

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