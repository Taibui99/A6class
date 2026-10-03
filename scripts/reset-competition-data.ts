/**
 * XOÁ TOÀN BỘ DỮ LIỆU MẪU CỦA WEB THI ĐUA.
 *
 * Giữ nguyên: lớp, 36 học sinh, 4 tổ, 22 tiêu chí, kỳ thi đang chạy.
 * Xoá:      mọi PointTransaction — tức toàn bộ điểm đã nhập, kể cả dữ
 *           liệu mẫu của seed cũ (bản ghi không gắn tiêu chí) và dữ liệu
 *           kiểm thử. Trả lớp về trạng thái 0 điểm, sẵn sàng nhập thật.
 *
 * Chạy:  npx tsx scripts/reset-competition-data.ts
 * Xem trước mà không xoá:  thêm --dry-run
 */

import { PrismaClient } from "@prisma/client";

import { ALL_CRITERIA } from "../src/lib/competition/config";

const prisma = new PrismaClient();

const dryRun = process.argv.includes("--dry-run");
/** Có trả điểm tiêu chí về mặc định trong config.ts không (mặc định: có). */
const resetPoints = !process.argv.includes("--keep-points");

/** key -> defaultPoints, đọc từ config để không lệch với seed. */
const DEFAULT_BY_KEY = new Map(
  ALL_CRITERIA.map((c) => [c.key, c.defaultPoints]),
);

async function main() {
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (classes.length === 0) {
    console.log("Khong co lop nao trong DB — khong can xoa.");
    return;
  }

  console.log(`dry-run: ${dryRun}\n`);

  for (const cls of classes) {
    const [members, teams, criteria, periods, txAll, txLegacy] = await Promise.all([
      prisma.classMembership.count({ where: { classId: cls.id } }),
      prisma.team.count({ where: { classId: cls.id } }),
      prisma.criterion.count({ where: { classId: cls.id } }),
      prisma.competitionPeriod.findMany({
        where: { classId: cls.id },
        select: { id: true, name: true, isActive: true, publishedAt: true },
      }),
      prisma.pointTransaction.count({ where: { classId: cls.id } }),
      prisma.pointTransaction.count({
        where: { classId: cls.id, criterionId: null },
      }),
    ]);

    console.log(`=== ${cls.name} ===`);
    console.log(
      `  giu nguyen: ${members} thanh vien · ${teams} to · ${criteria} tieu chi · ${periods.length} ky`,
    );
    console.log(
      `  se xoa:     ${txAll} giao dich (trong do ${txLegacy} ban ghi mau cu khong gan tieu chi)`,
    );

    if (dryRun) {
      console.log("");
      continue;
    }

    const deleted = await prisma.pointTransaction.deleteMany({
      where: { classId: cls.id },
    });
    console.log(`  -> da xoa ${deleted.count} giao dich`);

    // Bỏ trạng thái công bố để kỳ cũ không còn "đã công bố" ở dữ liệu cũ.
    const unpublished = await prisma.competitionPeriod.updateMany({
      where: { classId: cls.id, publishedAt: { not: null } },
      data: { publishedAt: null },
    });
    if (unpublished.count > 0) {
      console.log(`  -> bo danh dau cong bo o ${unpublished.count} ky`);
    }

    if (resetPoints) {
      const changed = await resetCriterionPoints(cls.id);
      console.log(`  -> tra ve ${changed} muc diem mac dinh cua tieu chi`);
    }

    console.log("");
  }

  console.log(
    dryRun
      ? "DRY-RUN xong — chua xoa gi. Bo --dry-run de thuc thi."
      : "XOA XONG. Trang thi dua dang o 0 diem, san sang nhap diem that.",
  );
}

async function resetCriterionPoints(classId: string): Promise<number> {
  const criteria = await prisma.criterion.findMany({
    where: { classId },
    select: { id: true, key: true, points: true, label: true },
  });

  let changed = 0;
  for (const c of criteria) {
    const want = DEFAULT_BY_KEY.get(c.key);
    if (want === undefined || want === c.points) continue;
    await prisma.criterion.update({
      where: { id: c.id },
      data: { points: want },
    });
    changed++;
  }
  return changed;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());