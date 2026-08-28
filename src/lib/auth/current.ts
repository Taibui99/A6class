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
    }
  } catch {
    // DB chưa migrate — trả về thông tin từ session.
  }

  return base;
});