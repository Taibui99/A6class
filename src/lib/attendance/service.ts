import { getCurrentUser } from "@/lib/auth/current";
import { prisma } from "@/lib/prisma";
import { getMyClass } from "@/lib/classes/service";
import type { AttendanceStatus } from "@prisma/client";

export type AttendanceMark = "PRESENT" | "ABSENT" | "EXCUSED";

/** Dựng Date mốc ngày (UTC nửa đêm) — đọc/ghi nhất quán để so sánh khớp. */
export function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function todayISO(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Danh sách điểm danh: mọi thành viên trừ giáo viên, kèm tên tổ. */
export async function getAttendanceRoster(classId: string) {
  const memberships = await prisma.classMembership.findMany({
    where: { classId, role: { not: "TEACHER" } },
    include: {
      user: { select: { id: true, fullName: true } },
      team: { select: { name: true } },
    },
    orderBy: { user: { fullName: "asc" } },
  });
  return memberships.map((m) => ({
    id: m.user.id,
    name: m.user.fullName,
    team: m.team?.name ?? null,
  }));
}

/** Map userId → trạng thái ngày đó. Thiếu = có mặt (không lưu dòng PRESENT). */
export async function getDayRecords(
  classId: string,
  iso: string
): Promise<Record<string, AttendanceStatus>> {
  try {
    const rows = await prisma.attendanceRecord.findMany({
      where: { classId, date: toDate(iso) },
    });
    return Object.fromEntries(rows.map((r) => [r.userId, r.status]));
  } catch {
    return {};
  }
}

async function mustBeMyClass(classId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    throw new Error("Chỉ giáo viên mới điểm danh được.");
  }
  const klass = await getMyClass();
  if (!klass || klass.id !== classId) {
    throw new Error("Không đúng lớp phụ trách.");
  }
}

export async function setAttendance(
  classId: string,
  userId: string,
  iso: string,
  status: AttendanceMark
) {
  await mustBeMyClass(classId);
  const mem = await prisma.classMembership.findFirst({
    where: { classId, userId },
  });
  if (!mem) throw new Error("Học sinh không trong lớp.");
  const date = toDate(iso);
  if (status === "PRESENT") {
    await prisma.attendanceRecord.deleteMany({ where: { classId, userId, date } });
    return;
  }
  await prisma.attendanceRecord.upsert({
    where: { classId_userId_date: { classId, userId, date } },
    create: { classId, userId, date, status },
    update: { status },
  });
}

/** Xóa trắng 1 ngày = cả lớp có mặt. */
export async function clearDay(classId: string, iso: string) {
  await mustBeMyClass(classId);
  await prisma.attendanceRecord.deleteMany({
    where: { classId, date: toDate(iso) },
  });
}

export async function getAbsentCount(classId: string, iso: string): Promise<number> {
  try {
    return await prisma.attendanceRecord.count({
      where: { classId, date: toDate(iso), status: "ABSENT" },
    });
  } catch {
    return 0;
  }
}
