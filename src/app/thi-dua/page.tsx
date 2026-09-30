import { CompetitionArena } from "@/components/competition/competition-arena";
import { COMPETITION_CLASS, ROSTER } from "@/lib/competition/config";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompetitionPage() {
  const fallbackTeams = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4"].map((name) => ({
    id: name,
    name,
    score: 0,
    memberCount: ROSTER.filter((student) => student.team === name).length,
  }));
  let students = ROSTER.map((student, index) => ({
    id: `roster-${index + 1}`,
    name: student.name,
    teamName: student.team,
    score: 0,
  }));
  let teams = fallbackTeams;
  let events: { id: string; amount: number; reason: string; targetName: string; giverName: string; createdAt: string }[] = [];
  let canManage = false;
  let hasDatabaseClass = false;

  try {
    const klass = await prisma.class.findFirst({
      where: { name: COMPETITION_CLASS.name, schoolYear: COMPETITION_CLASS.schoolYear },
      include: {
        teams: { orderBy: { name: "asc" } },
        memberships: { include: { user: true, team: true } },
      },
    });
    if (klass && klass.memberships.length > 0 && klass.teams.length > 0) {
      hasDatabaseClass = true;
      const { data: session } = await auth.getSession();
      if (session?.user?.email) {
        const current = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true, memberships: { where: { classId: klass.id }, select: { role: true } } },
        });
        const officerRoles = ["CLASS_MONITOR", "ACADEMIC_VICE_MONITOR", "ACTIVITY_VICE_MONITOR", "LABOR_VICE_MONITOR", "TEAM_LEADER", "TEAM_VICE_LEADER"];
        canManage = current?.role === "TEACHER" || Boolean(current?.memberships.some((membership) => officerRoles.includes(membership.role)));
      }

      const period = await prisma.competitionPeriod.findFirst({
        where: { classId: klass.id, isActive: true },
        orderBy: { startDate: "desc" },
        select: { id: true },
      });
      const transactions = period ? await prisma.pointTransaction.findMany({
        where: { classId: klass.id, periodId: period.id },
        include: { targetUser: { select: { id: true, fullName: true } }, targetTeam: { select: { id: true, name: true } }, giver: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        take: 250,
      }) : [];

      const scoreByUser = new Map<string, number>();
      const scoreByTeam = new Map<string, number>();
      for (const transaction of transactions) {
        if (transaction.targetUserId) scoreByUser.set(transaction.targetUserId, (scoreByUser.get(transaction.targetUserId) ?? 0) + transaction.amount);
        if (transaction.targetTeamId) scoreByTeam.set(transaction.targetTeamId, (scoreByTeam.get(transaction.targetTeamId) ?? 0) + transaction.amount);
      }
      students = klass.memberships.map((membership) => ({
        id: membership.userId,
        name: membership.user.fullName,
        teamName: membership.team?.name ?? "Chưa phân tổ",
        score: scoreByUser.get(membership.userId) ?? 0,
      })).sort((a, b) => a.name.localeCompare(b.name, "vi"));
      teams = klass.teams.map((team) => ({
        id: team.id,
        name: team.name,
        score: (scoreByTeam.get(team.id) ?? 0) + klass.memberships.filter((membership) => membership.teamId === team.id).reduce((sum, membership) => sum + (scoreByUser.get(membership.userId) ?? 0), 0),
        memberCount: klass.memberships.filter((membership) => membership.teamId === team.id).length,
      }));
      events = transactions.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        reason: transaction.note ? `${transaction.reason} · ${transaction.note}` : transaction.reason,
        targetName: transaction.targetUser?.fullName ?? transaction.targetTeam?.name ?? "Không rõ đối tượng",
        giverName: transaction.giver.fullName,
        createdAt: transaction.createdAt.toISOString(),
      }));
    }
  } catch {
    // Cho phép trang công khai vẫn mở nếu DB chưa được cấu hình/migrate.
  }

  return <CompetitionArena className={COMPETITION_CLASS.name} schoolYear={COMPETITION_CLASS.schoolYear} students={students} teams={teams} events={events} canManage={canManage} hasDatabaseClass={hasDatabaseClass} />;
}
