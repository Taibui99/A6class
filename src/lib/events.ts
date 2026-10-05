import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current";
import { OFFICER_ROLES } from "@/lib/competition/access";

/** Sự kiện sắp khai mạc trong vòng này vẫn hiện đồng hồ (giờ chuẩn bị). */
const PREP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type EventSummary = {
  id: string;
  title: string;
  description: string | null;
  /** ISO để client đếm ngược không phải parse lại. */
  endsAt: string;
  startsAt: string;
};

/**
 * Sự kiện đang chạy để hiển thị đồng hồ đếm ngược ở trang /apps.
 * Trả `null` khi lớp chưa có sự kiện nào — giao diện ẩn đồng hồ thay vì
 * điền một mốc bịa ra.
 *
 * Sự kiện đã bắt đầu nhưng chưa tới `startsAt` vẫn được trả về: đồng hồ đếm
 * về ngày khai mạc, tức vẫn nằm trong giai đoạn chuẩn bị.
 */
export async function getActiveEvent(classId: string): Promise<EventSummary | null> {
  const now = new Date();

  const events = await prisma.classEvent.findMany({
    where: {
      classId,
      isActive: true,
      endsAt: { gte: now },
      startsAt: { lte: new Date(now.getTime() + PREP_WINDOW_MS) },
    },
    orderBy: { endsAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
    },
    take: 1,
  });

  const e = events[0];
  if (!e) return null;

  return {
    id: e.id,
    title: e.title,
    description: e.description,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt.toISOString(),
  };
}

export type EventInput = {
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date;
};

export type SaveEventResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Chỉ cán sự mới được tạo/sửa sự kiện. */
async function requireOfficer(classId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const membership = await prisma.classMembership.findFirst({
    where: { userId: user.id, classId },
    select: { role: true },
  });

  return membership !== null && OFFICER_ROLES.includes(membership.role);
}

function validate(input: EventInput): string | null {
  if (input.title.trim().length === 0) return "Thiếu tên sự kiện.";
  if (Number.isNaN(input.startsAt.getTime())) return "Ngày bắt đầu không hợp lệ.";
  if (Number.isNaN(input.endsAt.getTime())) return "Ngày kết thúc không hợp lệ.";
  if (input.endsAt <= input.startsAt) {
    return "Ngày kết thúc phải sau ngày bắt đầu.";
  }
  return null;
}

/** Tạo sự kiện mới. Sự kiện cũ được tắt để chỉ có một đồng hồ đang chạy. */
export async function createEvent(classId: string, input: EventInput): Promise<SaveEventResult> {
  if (!(await requireOfficer(classId))) {
    return { ok: false, error: "Chỉ cán sự lớp mới được tạo sự kiện." };
  }

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  await prisma.classEvent.updateMany({
    where: { classId, isActive: true },
    data: { isActive: false },
  });

  const created = await prisma.classEvent.create({
    data: {
      classId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    },
    select: { id: true },
  });

  return { ok: true, id: created.id };
}

/** Sửa sự kiện đang chạy, hoặc tắt hẳn nếu đã qua. */
export async function updateEvent(
  classId: string,
  eventId: string,
  input: EventInput | null,
): Promise<SaveEventResult> {
  if (!(await requireOfficer(classId))) {
    return { ok: false, error: "Chỉ cán sự lớp mới được sửa sự kiện." };
  }

  const existing = await prisma.classEvent.findFirst({
    where: { id: eventId, classId },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Không tìm thấy sự kiện." };

  // input = null nghĩa là tắt sự kiện (đã kết thúc).
  if (input === null) {
    await prisma.classEvent.update({ where: { id: eventId }, data: { isActive: false } });
    return { ok: true, id: eventId };
  }

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  await prisma.classEvent.update({
    where: { id: eventId },
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isActive: true,
    },
  });

  return { ok: true, id: eventId };
}