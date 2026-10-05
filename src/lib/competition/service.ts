import "server-only";

import type { CompetitionAccess } from "@/lib/competition/access";
import { resolveCompetitionAccess } from "@/lib/competition/access";
import { COMPETITION_CLASS } from "@/lib/competition/config";
import { periodLabel, startOfWeek } from "@/lib/competition/scoring";
import { auth } from "@/lib/auth/server";
import { getCurrentUser } from "@/lib/auth/current";
import { prisma } from "@/lib/prisma";

const MAX_COUNT = 50;

export class CompetitionError extends Error {}

/**
 * Lớp đang được xem: ưu tiên lớp mà người đăng nhập thực sự thuộc về.
 *
 * Trước đây hàm này chỉ tìm theo tên "12A6" + năm học ghi cứng trong
 * config, nên khi giáo viên đặt tên lớp khác (12A7, 10B2...) thì mọi
 * trang thi đua đều ném lỗi "Chưa có lớp 12A6" dù lớp đã tồn tại.
 * Nay ưu tiên membership của chính người đang đăng nhập.
 *
 * Vẫn giữ nhánh rơi về lớp mẫu để dữ liệu seed sẵn có tiếp tục chạy được
 * cho tài khoản chưa thuộc lớp nào.
 */
export async function getClass() {
  const select = { id: true, name: true, schoolYear: true } as const;

  const user = await getCurrentUser();
  if (user) {
    const membership = await prisma.classMembership.findFirst({
      where: { userId: user.id },
      orderBy: { joinedAt: "asc" },
      select: { class: { select } },
    });
    if (membership) return membership.class;
  }

  return prisma.class.findFirst({
    where: { name: COMPETITION_CLASS.name, schoolYear: COMPETITION_CLASS.schoolYear },
    select,
  });
}

export async function getAllTeamIds(classId: string): Promise<string[]> {
  const teams = await prisma.team.findMany({
    where: { classId },
    select: { id: true },
  });
  return teams.map((t) => t.id);
}

/**
 * Quyền của người đang đăng nhập đối với một kỳ thi cụ thể.
 * Dùng chung cho page và actions để quyền xem và quyền sửa luôn khớp nhau.
 */
export async function getAccessForPeriod(
  periodId: string | null,
  classId: string,
): Promise<{ access: CompetitionAccess; userId: string }> {
  const { data: session } = await auth.getSession();
  const email = session?.user?.email;
  if (!email) throw new CompetitionError("Bạn cần đăng nhập để xem bảng thi đua.");

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      memberships: {
        where: { classId },
        select: { role: true, teamId: true },
        take: 1,
      },
    },
  });
  if (!user) throw new CompetitionError("Không tìm thấy tài khoản của bạn.");

  const membership = user.memberships[0];
  if (!membership && user.role !== "TEACHER") {
    throw new CompetitionError("Bạn chưa thuộc lớp nào. Hãy nhờ giáo viên thêm bạn vào lớp.");
  }

  const period = periodId
    ? await prisma.competitionPeriod.findFirst({
        where: { id: periodId, classId },
        select: { publishedAt: true },
      })
    : null;

  const allTeamIds = await getAllTeamIds(classId);
  const access = resolveCompetitionAccess({
    userRole: user.role,
    memberRole: membership?.role,
    teamId: membership?.teamId,
    allTeamIds,
    isPublished: Boolean(period?.publishedAt),
  });

  return { access, userId: user.id };
}

/** Lấy kỳ thi đang chạy, tạo mới nếu chưa có (tuần hiện tại). */
export async function ensureActivePeriod(classId: string) {
  const active = await prisma.competitionPeriod.findFirst({
    where: { classId, isActive: true },
    orderBy: { startDate: "desc" },
  });
  if (active) return active;

  const start = startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return prisma.competitionPeriod.create({
    data: {
      classId,
      name: periodLabel(start, end),
      startDate: start,
      endDate: end,
      isActive: true,
    },
  });
}

/** Bật/tắt công bố kết quả — bật thì cả lớp xem được mọi tổ. */
export async function setPeriodPublished(
  classId: string,
  periodId: string,
  published: boolean,
): Promise<void> {
  const { access } = await getAccessForPeriod(periodId, classId);
  if (!access.isTeacher && access.role !== "CLASS_MONITOR") {
    throw new CompetitionError("Chỉ giáo viên hoặc lớp trưởng mới công bố kết quả được.");
  }
  await prisma.competitionPeriod.update({
    where: { id: periodId },
    data: { publishedAt: published ? new Date() : null },
  });
}

/** Đổi kỳ thi đang chạy sang kỳ khác (mở tuần mới khi cần). */
export async function activatePeriod(classId: string, periodId: string): Promise<void> {
  const { access } = await getAccessForPeriod(periodId, classId);
  if (!access.isTeacher) {
    throw new CompetitionError("Chỉ giáo viên mới chuyển được kỳ thi.");
  }
  await prisma.competitionPeriod.updateMany({
    where: { classId },
    data: { isActive: false },
  });
  await prisma.competitionPeriod.update({
    where: { id: periodId },
    data: { isActive: true },
  });
}

/**
 * Ghi một ô trong bảng: số lần của học sinh với một tiêu chí trong một kỳ.
 * count = 0 nghĩa là xoá ô (giữ bảng sạch, không để lại dòng 0 điểm).
 *
 * Chặn nhập chéo tổ: cán sự chỉ sửa được tổ của mình, lớp trưởng và
 * giáo viên sửa được tất cả.
 */
export async function saveEntry(input: {
  classId: string;
  periodId: string;
  criterionId: string;
  targetUserId: string;
  count: number;
}): Promise<{ ok: true; count: number; points: number }> {
  const { classId, periodId, criterionId, targetUserId } = input;

  if (!Number.isInteger(input.count) || input.count < 0 || input.count > MAX_COUNT) {
    throw new CompetitionError(`Số lần phải là số nguyên từ 0 đến ${MAX_COUNT}.`);
  }

  const { access, userId } = await getAccessForPeriod(periodId, classId);

  const [criterion, target] = await Promise.all([
    prisma.criterion.findFirst({
      where: { id: criterionId, classId },
      select: { id: true, points: true, kind: true, label: true },
    }),
    prisma.classMembership.findFirst({
      where: { userId: targetUserId, classId },
      select: { teamId: true },
    }),
  ]);
  if (!criterion) throw new CompetitionError("Tiêu chí không thuộc lớp này.");
  if (!target) throw new CompetitionError("Học sinh không thuộc lớp này.");

  // Quyền sửa: GV + lớp trưởng sửa hết; cán sự khác chỉ sửa tổ mình.
  const canEdit =
    access.canEditAll || (access.canRecord && access.teamId !== null && access.teamId === target.teamId);
  if (!canEdit) {
    throw new CompetitionError(
      target.teamId === null
        ? "Học sinh này chưa được xếp vào tổ nào nên không nhập điểm được."
        : "Bạn chỉ được nhập điểm cho tổ của mình.",
    );
  }

  const magnitude = Math.abs(criterion.points);
  const signed = criterion.kind === "NEGATIVE" ? -magnitude : magnitude;
  const points = signed * input.count;

  if (input.count === 0) {
    await prisma.pointTransaction.deleteMany({
      where: { periodId, criterionId, targetUserId },
    });
    return { ok: true, count: 0, points: 0 };
  }

  await prisma.pointTransaction.upsert({
    where: { periodId_criterionId_targetUserId: { periodId, criterionId, targetUserId } },
    update: { count: input.count, amount: points },
    create: {
      classId,
      periodId,
      criterionId,
      targetUserId,
      giverId: userId,
      count: input.count,
      amount: points,
      reason: criterion.label,
      category: criterion.kind,
    },
  });

  return { ok: true, count: input.count, points };
}

/** Giáo viên chỉnh mức điểm của một tiêu chí. Điểm luôn tính lại theo
 *  Criterion.points nên mọi tuần đã ghi cũng đổi theo. */
export async function updateCriterionPoints(
  classId: string,
  criterionId: string,
  points: number,
): Promise<void> {
  const { access } = await getAccessForPeriod(null, classId);
  if (!access.isTeacher) {
    throw new CompetitionError("Chỉ giáo viên mới đổi được mức điểm tiêu chí.");
  }
  if (!Number.isInteger(points) || points < 0 || points > 50) {
    throw new CompetitionError("Mức điểm phải là số nguyên từ 0 đến 50.");
  }

  const criterion = await prisma.criterion.findFirst({
    where: { id: criterionId, classId },
    select: { id: true, points: true, kind: true },
  });
  if (!criterion) throw new CompetitionError("Tiêu chí không thuộc lớp này.");

  const signed = criterion.kind === "NEGATIVE" ? -Math.abs(points) : Math.abs(points);

  // Cập nhật luôn amount cho khớp, dù điểm hiển thị luôn tính lại.
  await prisma.$transaction([
    prisma.criterion.update({ where: { id: criterionId }, data: { points } }),
    prisma.pointTransaction.updateMany({
      where: { criterionId },
      data: { amount: { set: 0 } },
    }),
  ]);

  const rows = await prisma.pointTransaction.findMany({
    where: { criterionId },
    select: { id: true, count: true },
  });
  for (const row of rows) {
    await prisma.pointTransaction.update({
      where: { id: row.id },
      data: { amount: signed * row.count },
    });
  }
}

/** Đổi nhãn tiêu chí cho đúng cách ghi thực tế của lớp. */
export async function updateCriterionLabel(
  classId: string,
  criterionId: string,
  label: string,
): Promise<void> {
  const { access } = await getAccessForPeriod(null, classId);
  if (!access.isTeacher) {
    throw new CompetitionError("Chỉ giáo viên mới sửa được tên tiêu chí.");
  }
  const clean = label.trim().slice(0, 120);
  if (!clean) throw new CompetitionError("Tên tiêu chí không được để trống.");
  await prisma.criterion.updateMany({ where: { id: criterionId, classId }, data: { label: clean } });
}