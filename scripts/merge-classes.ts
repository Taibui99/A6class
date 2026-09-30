/**
 * Gộp dữ liệu về MỘT lớp duy nhất.
 *
 * Seed demo cũ tạo lớp tên "Lớp 12A6" (9 học sinh giả + cô giáo).
 * Seed thi đua tạo lớp tên "12A6" (36 em thật theo file Excel).
 * src/lib/auth/current.ts lấy membership đầu tiên không lọc lớp,
 * nên app bị chia đôi giữa hai lớp. Script này:
 *   - giữ lớp "12A6" (36 em thật) làm lớp chính
 *   - chuyển tài khoản giáo viên sang lớp chính
 *   - xoá sạch lớp rác cùng học sinh giả và dữ liệu demo
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const classes = await prisma.class.findMany({
    where: { schoolYear: "2026-2027" },
    select: {
      id: true,
      name: true,
      _count: { select: { memberships: true } },
    },
  });
  console.log("Lop truoc khi gop:", classes.map((c) => `${c.name} (${c._count.memberships} em)`).join(" | "));

  const canonical = classes.find((c) => c.name === "12A6");
  if (!canonical) throw new Error("Khong tim thay lop 12A6 de lam lop chinh.");

  const junk = classes.filter((c) => c.id !== canonical.id);
  if (junk.length === 0) {
    console.log("Chi co mot lop - khong can lam gi.");
    return;
  }

  for (const j of junk) {
    // 1. Giu lai tai khoan GIAO VIEN sang lop chinh
    const teachers = await prisma.classMembership.findMany({
      where: { classId: j.id, user: { role: "TEACHER" } },
      select: { userId: true },
    });
    for (const t of teachers) {
      await prisma.classMembership.upsert({
        where: { userId_classId: { userId: t.userId, classId: canonical.id } },
        update: {},
        create: { userId: t.userId, classId: canonical.id, role: "CLASS_MONITOR" },
      });
    }

    // 2. Thu thap userId cua lop rac truoc khi xoa
    const members = await prisma.classMembership.findMany({
      where: { classId: j.id },
      select: { userId: true },
    });
    const memberIds = [...new Set(members.map((m) => m.userId))];

    // 3. Xoa cac bang con (Class quan he Restrict nen phai xoa truoc)
    await prisma.comment.deleteMany({ where: { post: { classId: j.id } } });
    await prisma.reaction.deleteMany({ where: { post: { classId: j.id } } });
    await prisma.post.deleteMany({ where: { classId: j.id } });
    await prisma.taskSubmission.deleteMany({ where: { task: { classId: j.id } } });
    await prisma.taskAssignment.deleteMany({ where: { task: { classId: j.id } } });
    await prisma.task.deleteMany({ where: { classId: j.id } });
    await prisma.answer.deleteMany({ where: { question: { classId: j.id } } });
    await prisma.question.deleteMany({ where: { classId: j.id } });
    await prisma.message.deleteMany({
      where: { conversation: { classId: j.id } },
    });
    await prisma.conversationMember.deleteMany({
      where: { conversation: { classId: j.id } },
    });
    await prisma.conversation.deleteMany({ where: { classId: j.id } });
    await prisma.announcement.deleteMany({ where: { classId: j.id } });
    await prisma.report.deleteMany({ where: { classId: j.id } });
    await prisma.pointTransaction.deleteMany({ where: { classId: j.id } });
    await prisma.criterion.deleteMany({ where: { classId: j.id } });
    await prisma.rankHistory.deleteMany({ where: { team: { classId: j.id } } });
    await prisma.teamAchievement.deleteMany({ where: { team: { classId: j.id } } });
    await prisma.classMembership.deleteMany({ where: { classId: j.id } });
    await prisma.competitionPeriod.deleteMany({ where: { classId: j.id } });
    await prisma.team.deleteMany({ where: { classId: j.id } });
    await prisma.class.delete({ where: { id: j.id } });

    // 4. Xoa hoc sinh gia khong con membership nao
    let removed = 0;
    for (const uid of memberIds) {
      const still = await prisma.classMembership.count({ where: { userId: uid } });
      if (still === 0) {
        const u = await prisma.user.findUnique({
          where: { id: uid },
          select: { role: true },
        });
        if (u?.role === "STUDENT") {
          await prisma.user.delete({ where: { id: uid } });
          removed++;
        }
      }
    }
    console.log(`Da xoa lop "${j.name}", giao vien giu lai: ${teachers.length}, hoc sinh gia da xoa: ${removed}`);
  }

  const after = await prisma.class.findMany({
    select: { name: true, schoolYear: true, _count: { select: { memberships: true, teams: true, criteria: true } } },
  });
  console.log("\nLop sau khi gop:", JSON.stringify(after, null, 2));
}

main().finally(() => prisma.$disconnect());