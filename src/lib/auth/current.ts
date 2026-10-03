import { cache } from "react";

import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: "TEACHER" | "STUDENT";
  defaultClassName: string | null;
  className: string | null;
};

/** Lấy user đang đăng nhập kèm hồ sơ từ DB (match theo email). id = prisma User id. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const { data: session } = await auth.getSession();
  const authUser = session?.user;
  if (!authUser?.email) return null;

  const base: CurrentUser = {
    id: authUser.id,
    email: authUser.email,
    fullName: authUser.name ?? "Học sinh",
    avatarUrl: null,
    role: "STUDENT",
    defaultClassName: null,
    className: null,
  };

  try {
    const profile = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        memberships: {
          take: 1,
          select: {
            class: { select: { name: true } },
          },
        },
      },
    });
    if (profile) {
      base.id = profile.id;
      base.fullName = profile.fullName;
      base.avatarUrl = profile.avatarUrl;
      base.role = profile.role;
      base.defaultClassName = profile.memberships[0]?.class?.name ?? null;
      base.className = profile.memberships[0]?.class?.name ?? null;
    } else {
      // Đăng nhập bằng Google: tài khoản mới chưa có hồ sơ trong DB vì
      // không đi qua form đăng ký. Tự tạo hồ sơ (mặc định là học sinh,
      // chưa thuộc lớp nào) để giáo viên có thể đưa vào lớp.
      const fullName = authUser.name?.trim() || authUser.email.split("@")[0];
      const avatarUrl =
        typeof authUser.image === "string" ? authUser.image : null;

      const created = await prisma.user
        .create({
          data: { email: authUser.email, fullName, avatarUrl },
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        })
        .catch(() => null);

      if (created) {
        base.id = created.id;
        base.fullName = created.fullName;
        base.avatarUrl = created.avatarUrl;
        base.role = created.role;
      }
    }
  } catch {
    // DB chưa migrate — trả về thông tin từ session.
  }

  return base;
});