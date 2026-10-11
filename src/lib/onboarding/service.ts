import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type OnboardingClass = {
  id: string;
  name: string;
  schoolYear: string;
  teams: { id: string; name: string }[];
};

export type OnboardingState = {
  /** true = chặn lại, bắt khai hồ sơ trước khi vào app. */
  needed: boolean;
  fullName: string;
  membership: { classId: string; teamId: string | null } | null;
  classes: OnboardingClass[];
};

/**
 * Học sinh mới (đặc biệt là đăng nhập Google lần đầu) phải ghi rõ họ tên
 * và tổ trước khi dùng web. Giáo viên bỏ qua. Tổ bắt buộc khi lớp đã có
 * tổ — lớp chưa có tổ thì cho qua để không kẹt.
 */
export const getOnboardingState = cache(
  async (userId: string): Promise<OnboardingState> => {
    const blank: OnboardingState = {
      needed: true,
      fullName: "",
      membership: null,
      classes: [],
    };
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, role: true },
    });
    if (!user || user.role === "TEACHER") {
      return { ...blank, needed: false, fullName: user?.fullName ?? "" };
    }

    const membership = await prisma.classMembership.findFirst({
      where: { userId },
      orderBy: { joinedAt: "asc" },
      select: { classId: true, teamId: true },
    });

    let classes: OnboardingClass[] = [];
    if (membership) {
      const klass = await prisma.class.findUnique({
        where: { id: membership.classId },
        select: {
          id: true,
          name: true,
          schoolYear: true,
          teams: {
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          },
        },
      });
      if (klass) classes = [klass];
    } else {
      classes = await prisma.class.findMany({
        select: {
          id: true,
          name: true,
          schoolYear: true,
          teams: {
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }

    const nameOk = !!user.fullName?.trim();
    let teamOk = true;
    if (membership) {
      const klass = classes.find((c) => c.id === membership.classId);
      teamOk = !!membership.teamId || (klass ? klass.teams.length === 0 : true);
    }

    return {
      needed: !membership || !nameOk || !teamOk,
      fullName: user.fullName,
      membership: membership
        ? { classId: membership.classId, teamId: membership.teamId }
        : null,
      classes,
    };
  }
);

export async function saveOnboarding(input: {
  userId: string;
  fullName: string;
  classId: string;
  teamId: string | null;
}) {
  const name = input.fullName.trim();
  if (name.length < 2) {
    throw new Error("Ghi rõ họ tên của em (ít nhất 2 ký tự).");
  }
  const klass = await prisma.class.findUnique({
    where: { id: input.classId },
    include: { teams: { select: { id: true } } },
  });
  if (!klass) throw new Error("Lớp không tồn tại.");

  let teamId: string | null = null;
  if (input.teamId) {
    if (!klass.teams.some((t) => t.id === input.teamId)) {
      throw new Error("Tổ không thuộc lớp đã chọn.");
    }
    teamId = input.teamId;
  } else if (klass.teams.length > 0) {
    throw new Error("Chọn tổ của em trong lớp.");
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: { fullName: name },
  });
  const existing = await prisma.classMembership.findUnique({
    where: { userId_classId: { userId: input.userId, classId: klass.id } },
  });
  if (existing) {
    // Giữ nguyên role (cán sự khai lại tên không bị giáng chức).
    await prisma.classMembership.update({
      where: { id: existing.id },
      data: { teamId },
    });
  } else {
    await prisma.classMembership.create({
      data: { userId: input.userId, classId: klass.id, teamId, role: "STUDENT" },
    });
  }
}
