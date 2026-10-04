import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current";
import { parseRoster } from "@/lib/classes/roster";
import { isPlaceholderEmail } from "@/lib/classes/roster";
import { findUniqueMemberByName } from "@/lib/classes/roster-match";

/** Chuẩn hoá: bỏ khoảng trắng thừa, giữ dấu tiếng Việt. */
function tidy(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export type ClassForm = {
  name: string;
  schoolYear: string;
  school?: string | null;
};

/** Lỗi nghiệp vụ — message tiếng Việt để hiện thẳng lên form. */
export class ClassError extends Error {}

async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user) throw new ClassError("Chưa đăng nhập.");
  if (user.role !== "TEACHER") {
    throw new ClassError("Chỉ giáo viên mới được quản lý dữ liệu lớp.");
  }
  return user;
}

/** Lớp mà giáo viên đang phụ trách (lớp đầu tiên trong membership). */
export async function getMyClass() {
  const user = await getCurrentUser();
  if (!user) return null;

  const membership = await prisma.classMembership.findFirst({
    where: { userId: user.id },
    orderBy: { joinedAt: "asc" },
    select: { classId: true },
  });
  if (!membership) return null;

  return prisma.class.findUnique({
    where: { id: membership.classId },
    select: { id: true, name: true, schoolYear: true, school: true, description: true },
  });
}

/** Danh sách tổ + học sinh của lớp, dùng cho trang quản lý. */
export async function getClassRoster(classId: string) {
  return prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      schoolYear: true,
      school: true,
      teams: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          color: true,
          leaderId: true,
          viceLeaderId: true,
          _count: { select: { members: true } },
        },
      },
      memberships: {
        orderBy: { user: { fullName: "asc" } },
        select: {
          id: true,
          role: true,
          teamId: true,
          user: { select: { id: true, fullName: true, email: true } },
        },
      },
    },
  });
}

export async function createClass(form: ClassForm) {
  await requireTeacher();
  const name = form.name.trim();
  const schoolYear = form.schoolYear.trim();
  if (!name) throw new ClassError("Cần nhập tên lớp.");
  if (!schoolYear) throw new ClassError("Cần nhập năm học.");

  return prisma.class.create({
    data: {
      name,
      schoolYear,
      school: form.school?.trim() || null,
    },
    select: { id: true, name: true },
  });
}

export async function updateClass(classId: string, form: ClassForm) {
  await requireTeacher();
  const name = form.name.trim();
  const schoolYear = form.schoolYear.trim();
  if (!name) throw new ClassError("Cần nhập tên lớp.");
  if (!schoolYear) throw new ClassError("Cần nhập năm học.");

  await assertOwnsClass(classId);
  return prisma.class.update({
    where: { id: classId },
    data: {
      name,
      schoolYear,
      school: form.school?.trim() || null,
    },
  });
}

/* ---------------------------------------------------------------- teams */

export async function createTeam(classId: string, rawName: string) {
  await requireTeacher();
  await assertOwnsClass(classId);

  const name = rawName.trim();
  if (!name) throw new ClassError("Cần nhập tên tổ.");

  const exists = await prisma.team.findFirst({ where: { classId, name } });
  if (exists) throw new ClassError(`Tổ "${name}" đã tồn tại.`);

  return prisma.team.create({
    data: { classId, name },
    select: { id: true, name: true },
  });
}

export async function renameTeam(teamId: string, rawName: string) {
  await requireTeacher();
  const name = rawName.trim();
  if (!name) throw new ClassError("Cần nhập tên tổ.");

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { classId: true, name: true },
  });
  if (!team) throw new ClassError("Không tìm thấy tổ.");
  await assertOwnsClass(team.classId);

  const clash = await prisma.team.findFirst({
    where: { classId: team.classId, name, NOT: { id: teamId } },
  });
  if (clash) throw new ClassError(`Tổ "${name}" đã tồn tại.`);

  return prisma.team.update({ where: { id: teamId }, data: { name } });
}

/** Xoá tổ: học sinh trong tổ chỉ mất tổ, không mất khỏi lớp. */
export async function deleteTeam(teamId: string) {
  await requireTeacher();
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { classId: true, _count: { select: { members: true } } },
  });
  if (!team) throw new ClassError("Không tìm thấy tổ.");
  await assertOwnsClass(team.classId);

  await prisma.$transaction([
    prisma.classMembership.updateMany({
      where: { teamId },
      data: { teamId: null },
    }),
    prisma.team.delete({ where: { id: teamId } }),
  ]);

  return { removedMembers: team._count.members };
}

/* -------------------------------------------------------------- roster */

export type ImportSummary = {
  added: number;
  updated: number;
  teamsCreated: number;
  /** Học sinh cũ được đổi từ email giả sang email thật. */
  adopted: number;
};


/**
 * Nhập danh sách học sinh vào lớp.
 *
 * - Tổ ghi trong danh sách mà chưa có sẽ được tạo tự động.
 * - Dòng khớp tên với học sinh đang có email giả sẽ được nâng cấp: đổi sang
 *   email thật, giữ nguyên tổ và chức vụ. Không tạo bản ghi trùng.
 * - Học sinh đã đăng nhập Google với đúng email sẽ tự gắn vào lớp ngay.
 */
export async function importRoster(classId: string, raw: string): Promise<ImportSummary> {
  await requireTeacher();
  await assertOwnsClass(classId);

  const rows = parseRoster(raw);
  if (rows.length === 0) {
    throw new ClassError("Chưa đọc được học sinh nào. Mỗi dòng cần ít nhất có Họ tên.");
  }

  const summary: ImportSummary = { added: 0, updated: 0, teamsCreated: 0, adopted: 0 };

  for (const row of rows) {
    // Tìm/tạo tổ
    let teamId: string | null = null;
    if (row.teamName) {
      const team = await prisma.team.findFirst({
        where: { classId, name: row.teamName },
        select: { id: true },
      });
      if (team) {
        teamId = team.id;
      } else {
        const created = await prisma.team.create({
          data: { classId, name: row.teamName },
          select: { id: true },
        });
        teamId = created.id;
        summary.teamsCreated += 1;
      }
    }

    // Tên là khoá nhận diện: nếu lớp đã có đúng người này thì cập nhật tại
    // chỗ chứ không tạo bản ghi thứ hai. Áp dụng cả khi dòng không có email —
    // nếu không, dán danh sách cũ sẽ nhân đôi số học sinh.
    const existingMember = await findUniqueMemberByName(classId, row.fullName);
    if (existingMember) {
      const keepEmail = row.email ?? existingMember.user.email;
      const upgradesEmail =
        row.email !== null &&
        row.email !== existingMember.user.email &&
        isPlaceholderEmail(existingMember.user.email);

      // Email đã có người khác dùng thì để nguyên email cũ.
      const emailTaken =
        row.email !== null &&
        row.email !== existingMember.user.email &&
        (await prisma.user.count({ where: { email: row.email } })) > 0;

      await prisma.user.update({
        where: { id: existingMember.user.id },
        data: {
          fullName: row.fullName,
          ...(upgradesEmail && !emailTaken ? { email: keepEmail } : {}),
        },
      });
      await prisma.classMembership.update({
        where: { id: existingMember.id },
        data: { teamId: teamId ?? existingMember.teamId, role: row.role },
      });

      if (upgradesEmail && !emailTaken) summary.adopted += 1;
      else summary.updated += 1;
      continue;
    }

    // Học sinh có email → dùng email làm khoá; không email → tạo bản ghi riêng
    let userId: string | null = null;
    if (row.email) {
      const user = await prisma.user.upsert({
        where: { email: row.email },
        create: { email: row.email, fullName: row.fullName },
        update: { fullName: row.fullName },
        select: { id: true },
      });
      userId = user.id;
    } else {
      const user = await prisma.user.create({
        data: { fullName: row.fullName, email: `no-email-${crypto.randomUUID()}@a6class.local` },
        select: { id: true },
      });
      userId = user.id;
    }

    const existing = await prisma.classMembership.findUnique({
      where: { userId_classId: { userId, classId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.classMembership.update({
        where: { id: existing.id },
        data: { teamId, role: row.role },
      });
      summary.updated += 1;
    } else {
      await prisma.classMembership.create({
        data: { userId, classId, teamId, role: row.role },
      });
      summary.added += 1;
    }
  }

  return summary;
}

/** Sửa thông tin một học sinh trong lớp. */
export async function updateStudent(
  membershipId: string,
  data: { fullName: string; teamId: string | null; role: string }
) {
  await requireTeacher();
  const membership = await prisma.classMembership.findUnique({
    where: { id: membershipId },
    select: { classId: true, userId: true },
  });
  if (!membership) throw new ClassError("Không tìm thấy học sinh.");
  await assertOwnsClass(membership.classId);

  const fullName = tidy(data.fullName);
  if (!fullName) throw new ClassError("Cần có họ tên.");

  const teamId = data.teamId || null;
  if (teamId) {
    const team = await prisma.team.findFirst({
      where: { id: teamId, classId: membership.classId },
      select: { id: true },
    });
    if (!team) throw new ClassError("Tổ không thuộc lớp này.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: membership.userId },
      data: { fullName },
    }),
    prisma.classMembership.update({
      where: { id: membershipId },
      data: { teamId, role: data.role as never },
    }),
  ]);
}

/** Xoá học sinh khỏi lớp. User trùng lớp khác vẫn giữ nguyên. */
export async function removeStudent(membershipId: string) {
  await requireTeacher();
  const membership = await prisma.classMembership.findUnique({
    where: { id: membershipId },
    select: { classId: true, userId: true },
  });
  if (!membership) throw new ClassError("Không tìm thấy học sinh.");
  await assertOwnsClass(membership.classId);

  const others = await prisma.classMembership.count({
    where: { userId: membership.userId, NOT: { id: membershipId } },
  });

  await prisma.classMembership.delete({ where: { id: membershipId } });

  // Tài khoản "vô danh" sinh ra từ dòng không email thì xoá luôn cho sạch.
  if (others === 0) {
    await prisma.user
      .delete({ where: { id: membership.userId } })
      .catch(() => undefined);
  }
}

/* -------------------------------------------------------------- helpers */

async function assertOwnsClass(classId: string) {
  const user = await requireTeacher();
  const membership = await prisma.classMembership.findUnique({
    where: { userId_classId: { userId: user.id, classId } },
    select: { id: true },
  });
  if (!membership) {
    throw new ClassError("Bạn không phụ trách lớp này.");
  }
}
