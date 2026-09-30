"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { COMPETITION_CLASS, POSITIVE_CATEGORIES, NEGATIVE_CATEGORIES } from "@/lib/competition/config";

function currentWeek() {
  const now = new Date();
  const start = new Date(now);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function recordCompetitionPoint(formData: FormData) {
  const { data: session } = await auth.getSession();
  const email = session?.user?.email;
  if (!email) throw new Error("Bạn cần đăng nhập để ghi nhận điểm.");

  const klass = await prisma.class.findFirst({
    where: { name: COMPETITION_CLASS.name, schoolYear: COMPETITION_CLASS.schoolYear },
    select: { id: true },
  });
  if (!klass) throw new Error("Chưa thiết lập lớp 12A6 trong A6Class.");

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      memberships: { where: { classId: klass.id }, select: { role: true } },
    },
  });
  const allowedMemberRoles = ["CLASS_MONITOR", "ACADEMIC_VICE_MONITOR", "ACTIVITY_VICE_MONITOR", "LABOR_VICE_MONITOR", "TEAM_LEADER", "TEAM_VICE_LEADER"];
  const authorized = user?.role === "TEACHER" || Boolean(user?.memberships.some((membership) => allowedMemberRoles.includes(membership.role)));
  if (!user || !authorized) throw new Error("Bạn không có quyền ghi nhận điểm thi đua.");

  const targetType = String(formData.get("targetType") ?? "");
  const targetId = String(formData.get("targetId") ?? "");
  const category = String(formData.get("category") ?? "");
  const rawAmount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 240);
  if (!Number.isInteger(rawAmount) || rawAmount === 0 || rawAmount < -100 || rawAmount > 100) {
    throw new Error("Số điểm phải là số nguyên từ -100 đến 100 và khác 0.");
  }
  const validCategory = [...POSITIVE_CATEGORIES, ...NEGATIVE_CATEGORIES].includes(category as never);
  if (!validCategory || !targetId || !["student", "team"].includes(targetType)) {
    throw new Error("Dữ liệu ghi nhận điểm không hợp lệ.");
  }
  if ((POSITIVE_CATEGORIES as readonly string[]).includes(category) && rawAmount < 0) {
    throw new Error("Danh mục điểm cộng cần nhập số điểm dương.");
  }
  if ((NEGATIVE_CATEGORIES as readonly string[]).includes(category) && rawAmount > 0) {
    throw new Error("Danh mục điểm trừ cần nhập số điểm âm.");
  }

  let targetUserId: string | null = null;
  let targetTeamId: string | null = null;
  if (targetType === "student") {
    const membership = await prisma.classMembership.findFirst({
      where: { classId: klass.id, userId: targetId },
      select: { userId: true },
    });
    if (!membership) throw new Error("Học sinh không thuộc lớp 12A6.");
    targetUserId = membership.userId;
  } else {
    const team = await prisma.team.findFirst({
      where: { id: targetId, classId: klass.id },
      select: { id: true },
    });
    if (!team) throw new Error("Tổ không thuộc lớp 12A6.");
    targetTeamId = team.id;
  }

  let period = await prisma.competitionPeriod.findFirst({
    where: { classId: klass.id, isActive: true },
    orderBy: { startDate: "desc" },
    select: { id: true },
  });
  if (!period) {
    const { start, end } = currentWeek();
    period = await prisma.competitionPeriod.create({
      data: { classId: klass.id, name: "Thi đua tuần", startDate: start, endDate: end, isActive: true },
      select: { id: true },
    });
  }

  await prisma.pointTransaction.create({
    data: {
      classId: klass.id,
      targetUserId,
      targetTeamId,
      amount: rawAmount,
      reason: category,
      category: rawAmount > 0 ? "POSITIVE" : "NEGATIVE",
      giverId: user.id,
      periodId: period.id,
      note: note || null,
    },
  });
  revalidatePath("/competition");
}
