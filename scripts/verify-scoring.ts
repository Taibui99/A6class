/** Kiem chung cong thuc cham diem bang du lieu that trong DB. */
import { PrismaClient } from "@prisma/client";

import { rankTeams, scoreStudents } from "../src/lib/competition/scoring";
import { ROSTER } from "../src/lib/competition/config";

const prisma = new PrismaClient();

async function main() {
  const cls = await prisma.class.findFirst({ where: { name: "12A6" }, select: { id: true } });
  if (!cls) throw new Error("Chua co lop 12A6");
  const period = await prisma.competitionPeriod.findFirst({
    where: { classId: cls.id, isActive: true },
    select: { id: true, name: true },
  });
  if (!period) throw new Error("Chua co ky thi");

  const criteria = await prisma.criterion.findMany({
    where: { classId: cls.id },
    select: { id: true, key: true, kind: true, points: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });
  const byKey = new Map(criteria.map((c) => [c.key, c]));
  const c = (k: string) => {
    const x = byKey.get(k);
    if (!x) throw new Error(`Thieu tieu chi ${k}`);
    return x;
  };

  const teams = await prisma.team.findMany({
    where: { classId: cls.id },
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });
  const members = await prisma.classMembership.findMany({
    where: { classId: cls.id },
    select: { userId: true, teamId: true, user: { select: { fullName: true } } },
  });
  const memberById = new Map(members.map((m) => [m.userId, m]));
  const byName = new Map(members.map((m) => [m.user.fullName ?? "", m.userId]));

  const uid = (name: string) => {
    const id = byName.get(name);
    if (!id) throw new Error(`Khong tim thay hoc sinh ${name}`);
    return id;
  };
  const teacher = await prisma.user.findFirst({ where: { role: "TEACHER" }, select: { id: true } });
  if (!teacher) throw new Error("Khong co giao vien");

  // ── Xoa du lieu kiem thu truoc ───────────────────────────────
  await prisma.pointTransaction.deleteMany({
    where: { periodId: period.id, giverId: teacher.id },
  });

  // ── Nhap diem theo dung quy tac viet ─────────────────────────
  // To 1: Yen Nhi phat bieu 3 lan (+3), diem 10 (+4)  => +7
  //        Gia Kha phat bieu 1 lan (+1)                  => +1
  //        Duy Khang noi chuyen 2 lan (-2 x2)            => -4
  // To 2: Trong An diem 7 (+1), cham hinh thuc 1 lan (-2) => -1
  // To 3/4: de trong => 0
  const plan: [string, string, number][] = [
    ["Yến Nhi", "PHAT_BIEU", 3],
    ["Yến Nhi", "DIEM_10", 1],
    ["Gia Kha", "PHAT_BIEU", 1],
    ["Duy Khang", "NOI_CHUYEN", 2],
    ["Trọng Ân", "DIEM_7", 1],
    ["Trọng Ân", "HINH_THUC", 1],
  ];

  for (const [name, key, count] of plan) {
    const crit = c(key);
    const targetUserId = uid(name);
    const signed = crit.kind === "NEGATIVE" ? -crit.points : crit.points;
    await prisma.pointTransaction.upsert({
      where: {
        periodId_criterionId_targetUserId: {
          periodId: period.id,
          criterionId: crit.id,
          targetUserId,
        },
      },
      update: { count, amount: signed * count },
      create: {
        classId: cls.id,
        periodId: period.id,
        criterionId: crit.id,
        targetUserId,
        giverId: teacher.id,
        count,
        amount: signed * count,
        reason: crit.key,
        category: crit.kind,
      },
    });
  }

  // ── Tinh lai bang ham that dung trong app ─────────────────────
  const entries = await prisma.pointTransaction.findMany({
    where: { periodId: period.id, targetUserId: { in: members.map((m) => m.userId) } },
    select: { criterionId: true, targetUserId: true, count: true, amount: true },
  });
  const scores = scoreStudents(
    entries,
    criteria.map((x) => ({ ...x, label: x.key })),
    new Set(members.map((m) => m.userId)),
  );

  console.log("=== DIEM CA NHAN (ky vua nhap) ===");
  for (const [name, id] of [...byName].filter(([, id]) => (scores.get(id)?.net ?? 0) !== 0)) {
    const s = scores.get(id);
    console.log(
      `  ${name.padEnd(12)} cong ${String(s!.positive).padStart(2)} | tru ${String(s!.negative).padStart(3)} | rong ${s!.net > 0 ? "+" : ""}${s!.net}`,
    );
  }

  const ranking = rankTeams(
    teams.map((t) => ({
      teamId: t.id,
      teamName: t.name,
      color: t.color,
      memberIds: members.filter((m) => m.teamId === t.id).map((m) => m.userId),
      direct: 0,
    })),
    scores,
  );

  console.log("\n=== XEP HANG TO (theo TRUNG BINH) ===");
  for (const t of ranking) {
    console.log(
      `  #${t.rank} ${t.teamName.padEnd(6)} thanh vien ${String(t.memberIds.length).padStart(2)} | tu thanh vien ${String(t.fromMembers).padStart(3)} | tong ${String(t.total).padStart(3)} | TB ${t.average.toFixed(3)}`,
    );
  }

  // ── Kiem chung bang tinh tay ─────────────────────────────────
  const t1 = ranking.find((t) => t.teamName === "Tổ 1")!;
  const t2 = ranking.find((t) => t.teamName === "Tổ 2")!;
  const tb1 = (7 + 1 - 4) / 10; // 3 thanh vien co diem, tong 4, /10 thanh vien
  const tb2 = -1 / 10;
  const tb3 = 0 / 9;
  const tb4 = 0 / 7;

  const checks: [string, boolean, string][] = [
    ["To 1 tong = 4 (7+1-4)", t1.fromMembers === 4, `co ${t1.fromMembers}`],
    ["To 1 TB = 4/10 = 0.4", Math.abs(t1.average - tb1) < 1e-9, `co ${t1.average}`],
    ["To 2 tong = -1", t2.fromMembers === -1, `co ${t2.fromMembers}`],
    ["To 2 TB = -1/10 = -0.1", Math.abs(t2.average - tb2) < 1e-9, `co ${t2.average}`],
    ["To 3 TB = 0", Math.abs(ranking.find((t) => t.teamName === "Tổ 3")!.average - tb3) < 1e-9, ""],
    ["To 4 TB = 0", Math.abs(ranking.find((t) => t.teamName === "Tổ 4")!.average - tb4) < 1e-9, ""],
    [
      "To 3 (9 em) > To 4 (7 em) khi cung 0 diem -> phai dong hang",
      ranking.find((t) => t.teamName === "Tổ 3")!.rank ===
        ranking.find((t) => t.teamName === "Tổ 4")!.rank,
      "",
    ],
    ["To 1 vao nhat", ranking[0].teamName === "Tổ 1", `dau bang ${ranking[0].teamName}`],
    ["Yen Nhi = +7", scores.get(uid("Yến Nhi"))?.net === 7, `co ${scores.get(uid("Yến Nhi"))?.net}`],
    ["Duy Khang = -4", scores.get(uid("Duy Khang"))?.net === -4, `co ${scores.get(uid("Duy Khang"))?.net}`],
    ["Trong An = -1", scores.get(uid("Trọng Ân"))?.net === -1, `co ${scores.get(uid("Trọng Ân"))?.net}`],
    [
      "Roster khop 36 em",
      ROSTER.length === 36 && members.filter((m) => m.teamId).length === 36,
      `${ROSTER.length} / ${members.filter((m) => m.teamId).length}`,
    ],
  ];

  console.log("\n=== KIEM CHUNG ===");
  let fail = 0;
  for (const [name, ok, detail] of checks) {
    if (!ok) fail++;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  [${detail}]` : ""}`);
  }
  console.log(fail === 0 ? "\nTAT CA KIEM CHUNG QUA." : `\n${fail} KIEM CHUNG FAIL.`);
}

main().finally(() => prisma.$disconnect());