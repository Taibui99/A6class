import "server-only";

import {
  COMPETITION_CLASS,
  CRITERION_GROUPS,
  GRADE_TIERS,
} from "@/lib/competition/config";
import type { CriterionRow } from "@/lib/competition/scoring";
import { rankStudents, rankTeams, scoreStudents } from "@/lib/competition/scoring";
import type { CompetitionAccess } from "@/lib/competition/access";
import { canViewTeam } from "@/lib/competition/access";
import * as service from "@/lib/competition/service";
import { prisma } from "@/lib/prisma";

export type MemberRow = {
  userId: string;
  name: string;
  teamId: string | null;
  teamName: string | null;
  teamColor: string | null;
  role: string;
  avatarUrl: string | null;
};

export type GroupView = {
  key: string;
  label: string;
  kind: "POSITIVE" | "NEGATIVE";
  input: "COUNT" | "GRADE";
  criteria: CriterionRow[];
  /** Tổng điểm của cả nhóm, dùng cho tiêu đề cột. */
  points: number;
};

export type CompetitionData = {
  classId: string;
  className: string;
  schoolYear: string;
  period: { id: string; name: string; start: string; end: string; publishedAt: string | null; daysLeft: number } | null;
  periods: { id: string; name: string; isActive: boolean; publishedAt: string | null }[];
  groups: GroupView[];
  members: MemberRow[];
  teams: { id: string; name: string; color: string | null; memberCount: number }[];
  /** Ô bảng của kỳ đang xem: `${criterionId}:${userId}` -> số lần. */
  cells: Record<string, number>;
  weekStudents: (MemberRow & { positive: number; negative: number; net: number; marks: number; rank: number; tier: string; tierTone: string })[];
  yearStudents: (MemberRow & { positive: number; negative: number; net: number; marks: number; rank: number; tier: string; tierTone: string })[];
  weekTeams: ReturnType<typeof rankTeams>;
  yearTeams: ReturnType<typeof rankTeams>;
  access: CompetitionAccess;
  /** Id tài khoản đang đăng nhập, dùng để highlight dòng của chính mình. */
  meId: string;
  visibleTeamIds: string[] | null;
  trend: { date: string; label: string; positive: number; negative: number; net: number }[];
  recent: {
    id: string;
    userId: string;
    userName: string;
    teamColor: string | null;
    criterionLabel: string;
    kind: "POSITIVE" | "NEGATIVE";
    count: number;
    points: number;
    giverName: string;
    createdAt: string;
  }[];
  tiers: typeof GRADE_TIERS;
};

/**
 * Gom tiêu chí trong DB về đúng 19 nhóm cột theo file Excel.
 * Tiêu chí lạ (nếu giáo viên tự thêm) gom vào nhóm phụ theo loại.
 */
function buildGroups(criteria: CriterionRow[]): GroupView[] {
  const byKey = new Map(criteria.map((c) => [c.key, c]));
  const groups: GroupView[] = [];

  for (const g of CRITERION_GROUPS) {
    const list = g.criteria
      .map((d) => byKey.get(d.key))
      .filter((c): c is CriterionRow => Boolean(c));
    if (list.length === 0) continue;
    groups.push({
      key: g.key,
      label: g.label,
      kind: g.kind,
      input: g.input,
      criteria: list,
      // Với nhóm "Điểm tốt" chỉ hiện con điểm cao nhất làm tham chiếu.
      points: g.input === "GRADE" ? Math.max(...list.map((c) => c.points)) : list[0].points,
    });
  }

  // Tiêu chí trong DB không thuộc nhóm nào trong config -> gom nhóm riêng cuối bảng.
  const known = new Set(CRITERION_GROUPS.flatMap((g) => g.criteria.map((c) => c.key)));
  const extra = criteria.filter((c) => !known.has(c.key));
  for (const kind of ["NEGATIVE", "POSITIVE"] as const) {
    const list = extra.filter((c) => c.kind === kind);
    if (list.length === 0) continue;
    groups.push({
      key: `EXTRA_${kind}`,
      label: kind === "NEGATIVE" ? "Tiêu chí trừ khác" : "Tiêu chí cộng khác",
      kind,
      input: "COUNT",
      criteria: list,
      points: list[0].points,
    });
  }

  return groups;
}

export async function loadCompetition(viewPeriodId?: string): Promise<CompetitionData> {
const klass = await service.getClass();
  if (!klass) {
    throw new Error(
      `Chưa có lớp "${COMPETITION_CLASS.name}" (${COMPETITION_CLASS.schoolYear}) trong A6Class. Nếu bạn đã tạo lớp riêng thì hãy đăng nhập bằng tài khoản giáo viên đó; còn không thì chạy: npx tsx scripts/seed-competition.ts`,
    );
  }

  const activePeriod = await service.ensureActivePeriod(klass.id);
  const period = viewPeriodId
    ? await prisma.competitionPeriod.findFirst({
        where: { id: viewPeriodId, classId: klass.id },
      })
    : activePeriod;

  const { access, userId } = await service.getAccessForPeriod(period?.id ?? null, klass.id);

  const [criteriaRaw, teamsRaw, membersRaw, periodsRaw] = await Promise.all([
    prisma.criterion.findMany({
      where: { classId: klass.id },
      select: { id: true, key: true, label: true, kind: true, points: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.team.findMany({
      where: { classId: klass.id },
      select: {
        id: true,
        name: true,
        color: true,
        leader: { select: { fullName: true } },
        _count: { select: { members: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.classMembership.findMany({
      where: { classId: klass.id },
      select: {
        role: true,
        teamId: true,
        team: { select: { name: true, color: true } },
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { user: { fullName: "asc" } },
    }),
    prisma.competitionPeriod.findMany({
      where: { classId: klass.id },
      select: { id: true, name: true, isActive: true, publishedAt: true },
      orderBy: { startDate: "desc" },
    }),
  ]);

  const criteria: CriterionRow[] = criteriaRaw.map((c) => ({
    id: c.id,
    key: c.key,
    label: c.label,
    kind: c.kind,
    points: c.points,
  }));
  const groups = buildGroups(criteria);

  const members: MemberRow[] = membersRaw.map((m) => ({
    userId: m.user.id,
    name: m.user.fullName ?? "Chưa đặt tên",
    teamId: m.teamId,
    teamName: m.team?.name ?? null,
    teamColor: m.team?.color ?? null,
    role: m.role,
    avatarUrl: m.user.avatarUrl,
  }));

  const teams = teamsRaw.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    memberCount: t._count.members,
  }));

  // ── Quyền xem: giáo viên/lớp trưởng/kỳ đã công bố xem hết;
  //    còn lại chỉ xem tổ của mình. ───────────────────────────────
  const visibleTeams = teams.filter((t) => canViewTeam(access, t.id));
  const visibleMembers = members.filter(
    (m) => canViewTeam(access, m.teamId) || m.userId === userId,
  );

  const memberIdSet = new Set(members.map((m) => m.userId));
  const visibleMemberIdSet = new Set(visibleMembers.map((m) => m.userId));

  // ── Ô bảng của kỳ đang xem ──────────────────────────────────
  const periodEntries = period
    ? await prisma.pointTransaction.findMany({
        where: { periodId: period.id, targetUserId: { in: [...memberIdSet] } },
        select: { criterionId: true, targetUserId: true, count: true, createdAt: true },
      })
    : [];

  const cells: Record<string, number> = {};
  for (const e of periodEntries) cells[`${e.criterionId}:${e.targetUserId}`] = e.count;

  // ── Điểm cả năm (mọi kỳ của lớp) ─────────────────────────────
  const yearEntries = await prisma.pointTransaction.findMany({
    where: { classId: klass.id, targetUserId: { in: [...memberIdSet] } },
    select: { criterionId: true, targetUserId: true, count: true },
  });

  const weekScores = scoreStudents(periodEntries, criteria, memberIdSet);
  const yearScores = scoreStudents(yearEntries, criteria, memberIdSet);

  const scoreStudent = (id: string, src: typeof weekScores) => {
    const s = src.get(id);
    const net = s?.net ?? 0;
    const tier = GRADE_TIERS.find((t) => net >= t.min) ?? GRADE_TIERS[GRADE_TIERS.length - 1];
    return { positive: s?.positive ?? 0, negative: s?.negative ?? 0, net, marks: s?.marks ?? 0, tier: tier.label, tierTone: tier.tone };
  };

  const weekStudents = rankStudents(
    visibleMembers.map((m) => ({ ...m, ...scoreStudent(m.userId, weekScores) })),
  );
  const yearStudents = rankStudents(
    visibleMembers.map((m) => ({ ...m, ...scoreStudent(m.userId, yearScores) })),
  );

  // ── Điểm tổ: xếp hạng theo TRUNG BÌNH mỗi thành viên ─────────
  const teamInputs = () =>
    visibleTeams.map((t) => ({
      teamId: t.id,
      teamName: t.name,
      color: t.color,
      memberIds: members.filter((m) => m.teamId === t.id).map((m) => m.userId),
      direct: 0,
    }));

  // Điểm ghi thẳng vào tổ (không có targetUserId) — hiện chưa dùng nhưng để sẵn.
  const directByTeam = new Map<string, number>();
  if (period) {
    const direct = await prisma.pointTransaction.findMany({
      where: { periodId: period.id, targetUserId: null, targetTeamId: { not: null } },
      select: { targetTeamId: true, amount: true },
    });
    for (const d of direct) {
      if (!d.targetTeamId) continue;
      directByTeam.set(d.targetTeamId, (directByTeam.get(d.targetTeamId) ?? 0) + d.amount);
    }
  }

  const weekTeams = rankTeams(
    teamInputs().map((t) => ({ ...t, direct: directByTeam.get(t.teamId) ?? 0 })),
    weekScores,
  );
  const yearTeams = rankTeams(teamInputs(), yearScores);

  // ── Nhịp 7 ngày trong kỳ ────────────────────────────────────
  const perDay = new Map<string, { positive: number; negative: number }>();
  for (const e of periodEntries) {
    const c = criteria.find((x) => x.id === e.criterionId);
    if (!c) continue;
    const d = e.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const cur = perDay.get(key) ?? { positive: 0, negative: 0 };
    const pts = (c.kind === "NEGATIVE" ? -c.points : c.points) * e.count;
    if (pts >= 0) cur.positive += pts;
    else cur.negative += pts;
    perDay.set(key, cur);
  }
  const trend = buildTrend(perDay, period?.endDate ?? new Date());

  // ── Lịch sử ghi điểm gần nhất (chỉ những người được xem) ─────
  const rawRecent = await prisma.pointTransaction.findMany({
    where: {
      classId: klass.id,
      ...(period ? { periodId: period.id } : {}),
      OR: [{ targetUserId: { in: [...visibleMemberIdSet] } }, { targetUserId: null }],
    },
    select: {
      id: true,
      targetUserId: true,
      count: true,
      criterionId: true,
      createdAt: true,
      targetUser: { select: { fullName: true, memberships: { where: { classId: klass.id }, select: { team: { select: { color: true } } }, take: 1 } } },
      criterion: { select: { label: true, kind: true, points: true } },
      giver: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const criterionById = new Map(criteria.map((c) => [c.id, c]));
  const recent = rawRecent
    .map((r) => {
      const c = r.criterionId ? criterionById.get(r.criterionId) : undefined;
      const signed = c ? (c.kind === "NEGATIVE" ? -c.points : c.points) * r.count : 0;
      return {
        id: r.id,
        userId: r.targetUserId ?? "",
        userName: r.targetUser?.fullName ?? "Ghi thẳng vào tổ",
        teamColor: r.targetUser?.memberships[0]?.team?.color ?? null,
        criterionLabel: c?.label ?? "Giao dịch cũ",
        kind: c?.kind ?? ("NEGATIVE" as const),
        count: r.count,
        points: signed,
        giverName: r.giver.fullName ?? "Không rõ",
        createdAt: r.createdAt.toISOString(),
      };
    })
    .filter((r) => access.seesAllTeams || r.userId === userId || visibleMemberIdSet.has(r.userId));

  return {
    classId: klass.id,
    className: klass.name,
    schoolYear: klass.schoolYear,
    period: period
      ? {
          id: period.id,
          name: period.name,
          start: period.startDate.toISOString(),
          end: period.endDate.toISOString(),
          publishedAt: period.publishedAt?.toISOString() ?? null,
          daysLeft: daysBetweenToday(period.endDate),
        }
      : null,
    periods: periodsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      isActive: p.isActive,
      publishedAt: p.publishedAt?.toISOString() ?? null,
    })),
    groups,
    members,
    teams,
    cells,
    weekStudents,
    yearStudents,
    weekTeams,
    yearTeams,
    access,
    meId: userId,
    visibleTeamIds: access.seesAllTeams ? null : visibleTeams.map((t) => t.id),
    trend,
    recent,
    tiers: GRADE_TIERS,
  };
}

function daysBetweenToday(end: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((e.getTime() - today.getTime()) / 86400000));
}

function buildTrend(
  perDay: Map<string, { positive: number; negative: number }>,
  endDate: Date,
): { date: string; label: string; positive: number; negative: number; net: number }[] {
  const out: { date: string; label: string; positive: number; negative: number; net: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const hit = perDay.get(key) ?? { positive: 0, negative: 0 };
    out.push({
      date: key,
      label: new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(d),
      positive: hit.positive,
      negative: hit.negative,
      net: hit.positive + hit.negative,
    });
  }
  return out;
}