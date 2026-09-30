import { PrismaClient } from "@prisma/client";

import { ALL_CRITERIA, COMPETITION_CLASS, ROSTER, TEAM_NAMES } from "../src/lib/competition/config";
import { periodLabel, startOfWeek } from "../src/lib/competition/scoring";

const prisma = new PrismaClient();

const TEAM_COLORS = {
  "Tổ 1": "#38BDF8",
  "Tổ 2": "#A78BFA",
  "Tổ 3": "#34D399",
  "Tổ 4": "#FBBF24",
};

/** Chức vụ trong file Excel -> MemberRole trong DB.
 *  - LT  Lớp trưởng       -> CLASS_MONITOR
 *  - PHT Phó học tập      -> ACADEMIC_VICE_MONITOR
 *  - TQ  Thủ quỹ          -> LABOR_VICE_MONITOR (không có mục riêng trong schema)
 *  - TT  Tổ trưởng        -> TEAM_LEADER
 *  - còn lại              -> STUDENT */
const ROLE_MAP = {
  LT: "CLASS_MONITOR",
  PHT: "ACADEMIC_VICE_MONITOR",
  TQ: "LABOR_VICE_MONITOR",
  TT: "TEAM_LEADER",
};

function slug(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20);
}

async function main() {
  // ── 1. Lớp ───────────────────────────────────────────────
  const klass =
    (await prisma.class.findFirst({
      where: { name: COMPETITION_CLASS.name, schoolYear: COMPETITION_CLASS.schoolYear },
      select: { id: true },
    })) ??
    (await prisma.class.create({
      data: { name: COMPETITION_CLASS.name, schoolYear: COMPETITION_CLASS.schoolYear },
      select: { id: true },
    }));

  // ── 2. Tổ ────────────────────────────────────────────────
  const teamByName = new Map();
  for (const name of TEAM_NAMES) {
    const existing = await prisma.team.findFirst({
      where: { classId: klass.id, name },
      select: { id: true, name: true },
    });
    const t =
      existing ??
      (await prisma.team.create({
        data: { classId: klass.id, name, color: TEAM_COLORS[name] },
        select: { id: true, name: true },
      }));
    if (t && existing && existing.id === t.id) {
      await prisma.team.update({ where: { id: t.id }, data: { color: TEAM_COLORS[name] } });
    }
    teamByName.set(name, t);
  }

  // ── 3. Tiêu chí ──────────────────────────────────────────
  for (const c of ALL_CRITERIA) {
    await prisma.criterion.upsert({
      where: { classId_key: { classId: klass.id, key: c.key } },
      update: { label: c.label, kind: c.kind, sortOrder: c.sortOrder },
      create: {
        classId: klass.id,
        key: c.key,
        label: c.label,
        kind: c.kind,
        points: c.defaultPoints,
        sortOrder: c.sortOrder,
      },
    });
  }

  // ── 4. Học sinh + cán sự ─────────────────────────────────
  const leaderByTeam = new Map();
  for (const s of ROSTER) {
    const email = `${slug(s.name)}12a6@a6class.test`;
    const memberRole = s.role ? ROLE_MAP[s.role] : "STUDENT";

    const user = await prisma.user.upsert({
      where: { email },
      update: { fullName: s.name },
      create: { email, fullName: s.name, role: "STUDENT" },
      select: { id: true },
    });

    const team = teamByName.get(s.team);
    await prisma.classMembership.upsert({
      where: { userId_classId: { userId: user.id, classId: klass.id } },
      update: { role: memberRole, teamId: team.id },
      create: { userId: user.id, classId: klass.id, role: memberRole, teamId: team.id },
    });

    if (s.role === "TT") leaderByTeam.set(s.team, user.id);
  }

  // ── 5. Gắn tổ trưởng vào Team ────────────────────────────
  for (const [teamName, userId] of leaderByTeam) {
    const team = teamByName.get(teamName);
    await prisma.team.update({ where: { id: team.id }, data: { leaderId: userId } });
  }

  // ── 6. Dọn thành viên không có trong danh sách 36 em ──────
  const rosterEmails = ROSTER.map((s) => `${slug(s.name)}12a6@a6class.test`);
  const stray = await prisma.classMembership.findMany({
    where: { classId: klass.id, user: { email: { notIn: rosterEmails } } },
    select: { id: true },
  });
  if (stray.length) {
    await prisma.classMembership.deleteMany({ where: { id: { in: stray.map((m) => m.id) } } });
  }

  // ── 7. Kỳ thi hiện tại ───────────────────────────────────
  const start = startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const existing = await prisma.competitionPeriod.findFirst({
    where: { classId: klass.id, isActive: true },
    orderBy: { startDate: "desc" },
    select: { id: true },
  });
  if (!existing) {
    await prisma.competitionPeriod.create({
      data: {
        classId: klass.id,
        name: periodLabel(start, end),
        startDate: start,
        endDate: end,
        isActive: true,
      },
    });
  }

  const counts = {
    class: 1,
    teams: teamByName.size,
    criteria: await prisma.criterion.count({ where: { classId: klass.id } }),
    members: await prisma.classMembership.count({ where: { classId: klass.id } }),
    daXoaThanhVienThua: stray.length,
    periods: await prisma.competitionPeriod.count({ where: { classId: klass.id } }),
  };
  console.log(JSON.stringify(counts, null, 2));
}

main().finally(() => prisma.$disconnect());