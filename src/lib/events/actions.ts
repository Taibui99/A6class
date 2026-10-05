"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current";
import { prisma } from "@/lib/prisma";
import { createEvent, updateEvent, type EventInput } from "@/lib/events";

export type EventActionState = {
  ok: boolean;
  message: string;
};

function parseInput(formData: FormData): EventInput | null {
  const title = (formData.get("title") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() || null;
  const startsAt = new Date((formData.get("startsAt") as string) ?? "");
  const endsAt = new Date((formData.get("endsAt") as string) ?? "");

  if (!title || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return null;
  }

  return { title, description, startsAt, endsAt };
}

async function currentClassId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const membership = await prisma.classMembership.findFirst({
    where: { userId: user.id },
    orderBy: { joinedAt: "asc" },
    select: { classId: true },
  });

  return membership?.classId ?? null;
}

export async function saveEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const classId = await currentClassId();
  if (!classId) return { ok: false, message: "Bạn chưa có lớp để đặt sự kiện." };

  const input = parseInput(formData);
  if (!input) {
    return { ok: false, message: "Thiếu tên sự kiện hoặc ngày không hợp lệ." };
  }

  const eventId = (formData.get("eventId") as string) || "";
  const result = eventId
    ? await updateEvent(classId, eventId, input)
    : await createEvent(classId, input);

  if (!result.ok) return { ok: false, message: result.error };

  revalidatePath("/apps");
  revalidatePath("/competition/settings");
  return { ok: true, message: "Đã lưu sự kiện." };
}

export async function clearEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const classId = await currentClassId();
  if (!classId) return { ok: false, message: "Bạn chưa có lớp." };

  const eventId = (formData.get("eventId") as string) || "";
  if (!eventId) return { ok: false, message: "Không có sự kiện để tắt." };

  const result = await updateEvent(classId, eventId, null);
  if (!result.ok) return { ok: false, message: result.error };

  revalidatePath("/apps");
  revalidatePath("/competition/settings");
  return { ok: true, message: "Đã tắt sự kiện." };
}