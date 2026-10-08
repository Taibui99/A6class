import { prisma } from "@/lib/prisma";

/**
 * Hệ thống thành tích (DESIGN-REDESIGN.md §F, mood "celebratory").
 *
 * Catalog code-first, đồng bộ vào bảng Achievement bằng upsert theo id ổn định.
 * Điều kiện luôn tính từ dữ liệu THẬT (bài đăng, nhiệm vụ đã xong, điểm…) —
 * không có achievement "cho có". Khi trang /achievements mở, metrics được chấm
 * lại và mọi điều kiện đã đạt sẽ được ghi bền vào UserAchievement/TeamAchievement
 * (khóa unique [userId, achievementId] chống trùng).
 */

export type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type AchievementScope = "USER" | "TEAM";

export type AchievementMetric =
  | "posts"
  | "comments"
  | "tasksDone"
  | "points"
  | "reactionsReceived"
  | "daysInClass"
  | "personalTop"
  | "teamRank"
  | "teamPoints";

export type AchievementDef = {
  /** id ổn định — cũng là khóa upsert vào bảng Achievement. */
  id: string;
  title: string;
  description: string;
  /** Tên icon Lucide (kebab-case), trang UI tự map. */
  icon: string;
  rarity: Rarity;
  scope: AchievementScope;
  metric: AchievementMetric;
  /** Ngưỡng đạt. personalTop/teamRank dùng `min` là Xếp hạng ≤ min. */
  min: number;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Cá nhân ─────────────────────────────────────────────
  { id: "first-post", title: "Bài đầu tiên", description: "Đăng bài mở màn lên Bảng lớp.", icon: "pen-line", rarity: "COMMON", scope: "USER", metric: "posts", min: 1 },
  { id: "wall-writer", title: "Viết đều", description: "Đăng đủ 10 bài cho cả lớp.", icon: "newspaper", rarity: "UNCOMMON", scope: "USER", metric: "posts", min: 10 },
  { id: "first-comment", title: "Có qua có lại", description: "Bình luận lần đầu tiên.", icon: "message-circle", rarity: "COMMON", scope: "USER", metric: "comments", min: 1 },
  { id: "chatterbox", title: "Người nói nhiều", description: "Để lại 20 bình luận.", icon: "messages-square", rarity: "RARE", scope: "USER", metric: "comments", min: 20 },
  { id: "first-task", title: "Xong việc đầu tiên", description: "Hoàn thành 1 nhiệm vụ của lớp.", icon: "check-check", rarity: "COMMON", scope: "USER", metric: "tasksDone", min: 1 },
  { id: "task-10", title: "Siêng như ong", description: "Hoàn thành đủ 10 nhiệm vụ.", icon: "list-checks", rarity: "RARE", scope: "USER", metric: "tasksDone", min: 10 },
  { id: "first-point", title: "Ghi bàn", description: "Nhận điểm thi đua đầu tiên.", icon: "target", rarity: "COMMON", scope: "USER", metric: "points", min: 1 },
  { id: "point-100", title: "Vua điểm cá nhân", description: "Tích lũy 100 điểm.", icon: "star", rarity: "UNCOMMON", scope: "USER", metric: "points", min: 100 },
  { id: "point-500", title: "Kho báu lớp", description: "Tích lũy 500 điểm.", icon: "gem", rarity: "EPIC", scope: "USER", metric: "points", min: 500 },
  { id: "liked-20", title: "Được cả lớp yêu", description: "Bài viết của bạn nhận 20 tim.", icon: "heart", rarity: "RARE", scope: "USER", metric: "reactionsReceived", min: 20 },
  { id: "veteran", title: "Cựu binh 12A6", description: "30 ngày kể từ ngày vào lớp.", icon: "shield-check", rarity: "UNCOMMON", scope: "USER", metric: "daysInClass", min: 30 },
  { id: "top-10", title: "Bảng vàng", description: "Lọt top 10 điểm cá nhân của lớp.", icon: "medal", rarity: "RARE", scope: "USER", metric: "personalTop", min: 10 },

  // ── Tổ ──────────────────────────────────────────────────
  { id: "team-top-1", title: "Tổ dẫn đầu", description: "Tổ của bạn vươn lên hạng 1.", icon: "trophy", rarity: "EPIC", scope: "TEAM", metric: "teamRank", min: 1 },
  { id: "team-100", title: "Tổ 100 điểm", description: "Tổ của bạn đạt 100 điểm thi đua.", icon: "flag", rarity: "UNCOMMON", scope: "TEAM", metric: "teamPoints", min: 100 },
  { id: "team-300", title: "Tổ khủng", description: "Tổ của bạn đạt 300 điểm thi đua.", icon: "crown", rarity: "LEGENDARY", scope: "TEAM", metric: "teamPoints", min: 300 },
];

export type AchievementMetrics = {
  posts: number;
  comments: number;
  tasksDone: number;
  points: number;
  reactionsReceived: number;
  daysInClass: number;
  personalTop: number;
  teamRank: number;
  teamPoints: number;
};

export type AchievementItem = AchievementDef & {
  unlockedAt: Date | null;
  /** Giá trị hiện tại (đã kẹp bởi ngưỡng để hiển thị tiến trình). */
  current: number;
  unlocked: boolean;
};

async function gatherMetrics(userId: string): Promise<AchievementMetrics | null> {
  const membership = await prisma.classMembership.findFirst({
    where: { userId },
    orderBy: { joinedAt: "asc" },
    select: {
      joinedAt: true,
      classId: true,
      team: { select: { rank: true, totalScore: true } },
    },
  });
  if (!membership) return null;

  const [posts, comments, tasksDone, pointsAgg, likedCount, ranked] =
    await Promise.all([
      prisma.post.count({ where: { authorId: userId, classId: membership.classId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.taskAssignment.count({
        where: { userId, status: "COMPLETED", task: { classId: membership.classId } },
      }),
      prisma.pointTransaction.aggregate({
        where: { classId: membership.classId, targetUserId: userId },
        _sum: { amount: true },
      }),
      prisma.reaction.count({ where: { post: { authorId: userId } } }),
      prisma.pointTransaction.groupBy({
        by: ["targetUserId"],
        where: { classId: membership.classId, targetUserId: { not: null } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
    ]);

  const meIndex = ranked.findIndex((r) => r.targetUserId === userId);
  const daysInClass = Math.floor(
    (Date.now() - membership.joinedAt.getTime()) / 86_400_000
  );

  return {
    posts,
    comments,
    tasksDone,
    points: pointsAgg._sum.amount ?? 0,
    reactionsReceived: likedCount,
    daysInClass,
    personalTop: meIndex === -1 ? 999 : meIndex + 1,
    teamRank: membership.team?.rank ?? 999,
    teamPoints: membership.team?.totalScore ?? 0,
  };
}

function currentFor(def: AchievementDef, m: AchievementMetrics): number {
  switch (def.metric) {
    case "personalTop":
      return m.personalTop;
    case "teamRank":
      return m.teamRank;
    default:
      return m[def.metric];
  }
}

/** Đảm bảo catalog tồn tại trong DB (upsert theo id ổn định). */
async function syncCatalog(): Promise<void> {
  await prisma.$transaction(
    ACHIEVEMENTS.map((a) =>
      prisma.achievement.upsert({
        where: { id: a.id },
        update: {
          title: a.title,
          description: a.description,
          icon: a.icon,
          rarity: a.rarity,
        },
        create: {
          id: a.id,
          title: a.title,
          description: a.description,
          icon: a.icon,
          rarity: a.rarity,
          condition: { metric: a.metric, min: a.min, scope: a.scope },
        },
      })
    )
  );
}

/**
 * Chấm lại thành tích của user: trả về danh sách kèm tiến trình và
 * ghi bền các achievement vừa đạt (cả phần TEAM nếu user có tổ).
 */
export async function getAchievementsForUser(
  userId: string
): Promise<{
  items: AchievementItem[];
  unlockedCount: number;
  totalCount: number;
  teamItems: AchievementItem[];
} | null> {
  try {
    await syncCatalog();
    const metrics = await gatherMetrics(userId);
    if (!metrics) return null;

    const [userRows, teamRows] = await Promise.all([
      prisma.userAchievement.findMany({ where: { userId } }),
      prisma.teamAchievement.findMany({
        where: { team: { members: { some: { userId } } } },
      }),
    ]);
    const unlockedUser = new Map(userRows.map((r) => [r.achievementId, r.unlockedAt]));
    const unlockedTeam = new Map(teamRows.map((r) => [r.achievementId, r.unlockedAt]));

    const items: AchievementItem[] = [];
    const teamItems: AchievementItem[] = [];
    const toCreateUser: string[] = [];
    const toCreateTeam: string[] = [];
    const hasTeam = metrics.teamRank < 999;

    for (const def of ACHIEVEMENTS) {
      const raw = currentFor(def, metrics);
      const isTop = def.metric === "personalTop" || def.metric === "teamRank";
      const met = isTop ? raw <= def.min : raw >= def.min;
      const unlockedAt =
        def.scope === "USER" ? unlockedUser.get(def.id) : unlockedTeam.get(def.id);
      const unlocked = Boolean(unlockedAt) || met;

      const item: AchievementItem = {
        ...def,
        unlockedAt: unlockedAt ?? null,
        current: isTop ? raw : Math.min(raw, def.min),
        unlocked,
      };

      if (def.scope === "USER") {
        items.push(item);
        if (met && !unlockedAt) toCreateUser.push(def.id);
      } else {
        teamItems.push(item);
        if (met && hasTeam && !unlockedAt) toCreateTeam.push(def.id);
      }
    }

    // Ghi bền achievement vừa đạt (idempotent nhờ unique constraint).
    if (toCreateUser.length > 0) {
      await prisma.userAchievement.createMany({
        data: toCreateUser.map((achievementId) => ({ userId, achievementId })),
        skipDuplicates: true,
      });
    }
    if (toCreateTeam.length > 0) {
      const team = await prisma.classMembership.findFirst({
        where: { userId },
        select: { teamId: true },
      });
      if (team?.teamId) {
        await prisma.teamAchievement.createMany({
          data: toCreateTeam.map((achievementId) => ({
            teamId: team.teamId as string,
            achievementId,
          })),
          skipDuplicates: true,
        });
      }
    }

    const unlockedCount = items.filter((i) => i.unlocked).length;
    return {
      items,
      teamItems,
      unlockedCount,
      totalCount: items.length,
    };
  } catch {
    return null;
  }
}
