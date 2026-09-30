import { PrismaClient } from "@prisma/client";

import { ROSTER, TEAM_NAMES } from "../src/lib/competition/config";

const prisma = new PrismaClient();

async function main() {
  const cls = await prisma.class.findFirst({
    where: { name: "12A6" },
    select: {
      id: true,
      teams: { select: { id: true, name: true, color: true, leader: { select: { fullName: true } } } },
      memberships: {
        select: { role: true, team: { select: { name: true } }, user: { select: { fullName: true, email: true } } },
        orderBy: { user: { fullName: "asc" } },
      },
      criteria: { select: { key: true, points: true, kind: true }, orderBy: { sortOrder: "asc" } },
      competitionPeriods: { select: { name: true, publishedAt: true, isActive: true } },
    },
  });

  if (!cls) return console.log("KHONG co lop 12A6");

  const byTeam = new Map(TEAM_NAMES.map((t) => [t, []]));
  for (const m of cls.memberships) {
    byTeam.get(m.team?.name ?? "—")?.push(m);
  }

  console.log("=== THANH VIEN THEO TO ===");
  for (const [team, list] of byTeam) {
    const officers = list.filter((m) => m.role !== "STUDENT");
    console.log(
      `${team}: ${list.length} em` +
        (officers.length
          ? ` | can su: ${officers.map((o) => `${o.user.fullName}(${o.role})`).join(", ")}`
          : ""),
    );
  }

  const rosterNames = new Set(ROSTER.map((s) => s.name));
  const dbNames = cls.memberships.map((m) => m.user.fullName);
  const khongCoTrongExcel = dbNames.filter((n) => !rosterNames.has(n));
  const thieuTrongDB = [...rosterNames].filter((n) => !dbNames.includes(n));

  console.log("\n=== DOI CHIEU VOI FILE EXCEL ===");
  console.log("Trong DB khong co trong Excel:", khongCoTrongExcel.length ? khongCoTrongExcel.join(", ") : "khong co");
  console.log("Trong Excel chua co trong DB:", thieuTrongDB.length ? thieuTrongDB.join(", ") : "khong co");

  console.log("\n=== TRUONG TOI ===");
  for (const t of cls.teams) console.log(`${t.name} (${t.color}) truong: ${t.leader?.fullName ?? "CHUA GAN"}`);

  console.log("\n=== TIEU CHI ===", cls.criteria.length, "muc");
  console.log(cls.criteria.map((c) => `${c.key}:${c.kind === "NEGATIVE" ? "-" : "+"}${c.points}`).join(" "));

  console.log("\n=== KY THI ===", JSON.stringify(cls.competitionPeriods));
}

main().finally(() => prisma.$disconnect());