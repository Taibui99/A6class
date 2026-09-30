import { CompetitionArena } from "@/components/competition/competition-arena";
import { COMPETITION_CLASS, ROSTER } from "@/lib/competition/config";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;

export default async function CompetitionPage() {
  const rosterTeams = [...new Set(ROSTER.map((s) => s.team))].map((name) => ({
    id: name,
    name,
    score: 0,
    memberCount: ROSTER.filter((s) => s.team === name).length,
    color: null as string | null,
  }));

  let students: {
    id: string;
    name: string;
    teamName: string;
    teamId: string | null;
    score: number;
  }[] = ROSTER.map((s, i) => ({
    id: `roster-${i + 1}`,
    name: s.name,
    teamName: s.team,
    teamId: null,
    score: 0,
  }));

  let teams: {
    id: string;
    name: string;
    score: number;
    memberCount: number;
    color: string | null;
  }[] = rosterTeams;

  let events: {
    id: string;
    amount: number;
    reason: string;
    targetName: string;
    giverName: string;
    createdAt: string;
  }[] = [];

  let canManage = false;
  let hasDatabaseClass = false;
  let meId: string | null = null;
  let period: { name: string; start: string; end: string; daysLeft: number } | null =
    null;
  /** Điểm theo 7 ngày gần nhất, để vẽ nhịp độ thi đua. */
  let trend: { label: string; amount: number }[] = [];
  /** Cột điểm của tổ = điểm giao cho tổ + tổng điểm cá nhân thuộc tổ. */
  let teamPointsFromMembers = 0;
  let teamPointsDirect = 0;

  try {
    const { data: session } = await auth.getSession();
    const email = session?.user?.email ?? null;
    if (email) {
      const me = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      meId = me?.id ?? null;
    }

    const klass = await prisma.class.findFirst({
      where: {
        name: COMPETITION_CLASS.name,
        schoolYear: COMPETITION_CLASS.schoolYear,
      },
      include: {
        teams: { orderBy: { name: "asc" } },
        memberships: { include: { user: true, team: true } },
      },
    });

    if (klass && klass.memberships.length > 0 && klass.teams.length > 0) {
      hasDatabaseClass = true;

      if (meId) {
        const current = await prisma.user.findUnique({
          where: { id: meId },
          select: {
            role: true,
            memberships: {
              where: { classId: klass.id },
              select: { role: true },
            },
          },
        });
        const officerRoles = [
          "CLASS_MONITOR",
          "ACADEMIC_VICE_MONITOR",
          "ACTIVITY_VICE_MONITOR",
          "LABOR_VICE_MONITOR",
          "TEAM_LEADER",
          "TEAM_VICE_LEADER",
        ];
        canManage =
          current?.role === "TEACHER" ||
          Boolean(
            current?.memberships.some((m) => officerRoles.includes(m.role)),
          );
      }

      const active = await prisma.competitionPeriod.findFirst({
        where: { classId: klass.id, isActive: true },
        orderBy: { startDate: "desc" },
      });
      if (active) {
        const now = Date.now();
        period = {
          name: active.name,
          start: active.startDate.toISOString(),
          end: active.endDate.toISOString(),
          daysLeft: Math.max(
            0,
            Math.ceil((active.endDate.getTime() - now) / DAY_MS),
          ),
        };
      }

      const transactions = await prisma.pointTransaction.findMany({
        where: {
          classId: klass.id,
          ...(active ? { periodId: active.id } : {}),
        },
        include: {
          targetUser: { select: { id: true, fullName: true } },
          targetTeam: { select: { id: true, name: true } },
          giver: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 250,
      });

      const scoreByUser = new Map<string, number>();
      const scoreByTeam = new Map<string, number>();
      for (const t of transactions) {
        if (t.targetUserId)
          scoreByUser.set(
            t.targetUserId,
            (scoreByUser.get(t.targetUserId) ?? 0) + t.amount,
          );
        if (t.targetTeamId)
          scoreByTeam.set(
            t.targetTeamId,
            (scoreByTeam.get(t.targetTeamId) ?? 0) + t.amount,
          );
      }

      teamPointsDirect = [...scoreByTeam.values()].reduce((a, b) => a + b, 0);
      teamPointsFromMembers = [...scoreByUser.values()].reduce(
        (a, b) => a + b,
        0,
      );

      students = klass.memberships
        .map((m) => ({
          id: m.userId,
          name: m.user.fullName,
          teamName: m.team?.name ?? "Chưa phân tổ",
          teamId: m.teamId,
          score: scoreByUser.get(m.userId) ?? 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));

      teams = klass.teams.map((t) => {
        const memberSum = klass.memberships
          .filter((m) => m.teamId === t.id)
          .reduce((s, m) => s + (scoreByUser.get(m.userId) ?? 0), 0);
        return {
          id: t.id,
          name: t.name,
          score: (scoreByTeam.get(t.id) ?? 0) + memberSum,
          memberCount: klass.memberships.filter((m) => m.teamId === t.id)
            .length,
          color: t.color,
        };
      });

      events = transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        reason: t.note ? `${t.reason} · ${t.note}` : t.reason,
        targetName:
          t.targetUser?.fullName ??
          t.targetTeam?.name ??
          "Không rõ đối tượng",
        giverName: t.giver.fullName,
        createdAt: t.createdAt.toISOString(),
      }));

      // Nhịp 7 ngày: gom điểm dương theo ngày.
      const buckets = new Map<string, number>();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(today.getTime() - i * DAY_MS);
        buckets.set(d.toISOString().slice(0, 10), 0);
      }
      for (const t of transactions) {
        if (t.amount <= 0) continue;
        const key = t.createdAt.toISOString().slice(0, 10);
        if (buckets.has(key)) {
          buckets.set(key, (buckets.get(key) ?? 0) + t.amount);
        }
      }
      trend = [...buckets.entries()].map(([date, amount]) => ({
        label: new Intl.DateTimeFormat("vi-VN", {
          weekday: "short",
        }).format(new Date(`${date}T00:00:00`)),
        amount,
      }));
    }
  } catch {
    // Trang vẫn mở được nếu DB chưa cấu hình/migrate.
  }

  return (
    <CompetitionArena
      className={COMPETITION_CLASS.name}
      schoolYear={COMPETITION_CLASS.schoolYear}
      students={students}
      teams={teams}
      events={events}
      canManage={canManage}
      hasDatabaseClass={hasDatabaseClass}
      meId={meId}
      period={period}
      trend={trend}
      teamPointsDirect={teamPointsDirect}
      teamPointsFromMembers={teamPointsFromMembers}
    />
  );
}