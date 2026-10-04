import { prisma } from "@/lib/prisma";
import { looseName } from "@/lib/classes/roster";

/**
 * Tìm học sinh trong lớp có tên khớp với dòng đang nhập.
 *
 * So khớp bỏ dấu + không phân biệt hoa thường, nên giáo viên gõ "Bao Ngoc"
 * hay "Bảo Ngọc" đều ra cùng một người.
 *
 * Chỉ khớp khi đúng một người: lớp có hai học sinh trùng tên thì bỏ qua chứ
 * không đoán bừa — người dùng tự xử lý bằng cách sửa tay.
 */
export async function findUniqueMemberByName(
  classId: string,
  fullName: string
) {
  const target = looseName(fullName);
  if (!target) return null;

  const members = await prisma.classMembership.findMany({
    where: { classId },
    select: {
      id: true,
      teamId: true,
      role: true,
      user: { select: { id: true, fullName: true, email: true } },
    },
  });

  const matches = members.filter((m) => looseName(m.user.fullName) === target);
  return matches.length === 1 ? matches[0] : null;
}