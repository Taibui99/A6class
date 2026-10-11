import { getCurrentUser } from "@/lib/auth/current";
import { prisma } from "@/lib/prisma";
import { getMyClass } from "@/lib/classes/service";
import { TT_DAY_LABEL, TT_DAYS, TT_PERIODS } from "@/lib/timetable/constants";

const SEED: [number, number, string][] = [
  [1, 1, "Chào cờ"],
  [1, 2, "Toán"],
  [1, 3, "Văn"],
  [1, 4, "Anh"],
  [1, 5, "Lý"],
  [2, 1, "Toán"],
  [2, 2, "Văn"],
  [2, 3, "Hóa"],
  [2, 4, "Sinh"],
  [2, 5, "Thể dục"],
  [3, 1, "Văn"],
  [3, 2, "Toán"],
  [3, 3, "Anh"],
  [3, 4, "Sử"],
  [3, 5, "GDCD"],
  [4, 1, "Lý"],
  [4, 2, "Hóa"],
  [4, 3, "Toán"],
  [4, 4, "Địa"],
  [4, 5, "Tin"],
  [5, 1, "Anh"],
  [5, 2, "Văn"],
  [5, 3, "Toán"],
  [5, 4, "Sinh"],
  [5, 5, "Nhạc"],
  [6, 1, "Sử"],
  [6, 2, "Địa"],
  [6, 3, "Thể dục"],
  [6, 4, "HĐTN"],
  [6, 5, "Sinh hoạt"],
];

/** Map "day-period" → môn. Ô trống không lưu. */
export async function getSlots(classId: string): Promise<Record<string, string>> {
  try {
    const rows = await prisma.timetableSlot.findMany({ where: { classId } });
    return Object.fromEntries(rows.map((r) => [`${r.day}-${r.period}`, r.subject]));
  } catch {
    return {};
  }
}

/** 5 môn hôm nay theo getDay (1=T2…6=T7). Ngoài lịch = mảng rỗng. */
export async function getTodaySubjects(classId: string, jsDay: number): Promise<string[]> {
  if (jsDay < 1 || jsDay > 6) return [];
  try {
    const rows = await prisma.timetableSlot.findMany({
      where: { classId, day: jsDay },
      orderBy: { period: "asc" },
    });
    const byPeriod = new Map(rows.map((r) => [r.period, r.subject]));
    return TT_PERIODS.map((p) => byPeriod.get(p) ?? "");
  } catch {
    return [];
  }
}

async function mustBeMyClass(classId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    throw new Error("Chỉ giáo viên mới sửa thời khóa biểu được.");
  }
  const klass = await getMyClass();
  if (!klass || klass.id !== classId) {
    throw new Error("Không đúng lớp phụ trách.");
  }
}

export async function setSubject(
  classId: string,
  day: number,
  period: number,
  subject: string
) {
  await mustBeMyClass(classId);
  if (!TT_DAYS.includes(day as (typeof TT_DAYS)[number])) throw new Error("Thứ không hợp lệ.");
  if (!TT_PERIODS.includes(period as (typeof TT_PERIODS)[number])) throw new Error("Tiết không hợp lệ.");
  const name = subject.trim().slice(0, 30);
  if (!name) {
    await prisma.timetableSlot.deleteMany({ where: { classId, day, period } });
    return;
  }
  await prisma.timetableSlot.upsert({
    where: { classId_day_period: { classId, day, period } },
    create: { classId, day, period, subject: name },
    update: { subject: name },
  });
}

/** Đổ mẫu THCS khi bảng còn trắng (chỉ thêm ô thiếu). */
export async function seedSample(classId: string) {
  await mustBeMyClass(classId);
  await prisma.timetableSlot.createMany({
    data: SEED.map(([day, period, subject]) => ({ classId, day, period, subject })),
    skipDuplicates: true,
  });
}
