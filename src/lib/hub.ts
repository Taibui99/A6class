import "server-only";

import { prisma } from "@/lib/prisma";
import * as service from "@/lib/competition/service";
import { getUserClassId } from "@/lib/feed";

export type HubStat = { label: string; value: string };

/**
 * Số liệu nhẹ cho thẻ công cụ "Thi đua" trên trang kho công cụ.
 *
 * Cố tình KHÔNG kéo cả bảng xếp hạng về đây — chỉ lấy đúng những con số
 * mà người đang đăng nhập được phép thấy, theo cùng ma trận quyền với
 * trang thi đua (dùng lại `getAccessForPeriod` để không lệch nhau).
 * Trước khi kỳ được công bố, học sinh/cán sự không thấy số liệu tổ khác.
 */
export async function getHubStats(userId: string): Promise<HubStat[] | null> {
  const classId = await getUserClassId(userId);
  if (!classId) return null;

  const period = await prisma.competitionPeriod.findFirst({
    where: { classId, isActive: true },
    select: { id: true, publishedAt: true },
    orderBy: { startDate: "desc" },
  });

  const teamCount = await prisma.team.count({ where: { classId } });

  if (!period) {
    return [
      { label: "Kỳ", value: "Chưa mở" },
      { label: "Tổ", value: String(teamCount) },
      { label: "Học sinh", value: "—" },
    ];
  }

  let access;
  try {
    ({ access } = await service.getAccessForPeriod(period.id, classId));
  } catch {
    // Chưa vào lớp / chưa đăng nhập: vẫn hiện card, chỉ thiếu số liệu.
    return [
      { label: "Tổ", value: String(teamCount) },
      { label: "Kỳ", value: period.publishedAt ? "Đã công bố" : "Đang chạy" },
      { label: "Quyền", value: "—" },
    ];
  }

  if (access.seesAllTeams) {
    const studentCount = await prisma.classMembership.count({
      where: { classId, teamId: { not: null } },
    });
    return [
      { label: "Tổ", value: String(teamCount) },
      { label: "Học sinh", value: String(studentCount) },
      { label: "Kỳ", value: period.publishedAt ? "Đã công bố" : "Đang chạy" },
    ];
  }

  // Chỉ thấy tổ mình: đếm thành viên của đúng các tổ được phép xem.
  const visible = [...(access.visibleTeamIds ?? [])];
  const memberCount = visible.length
    ? await prisma.classMembership.count({ where: { classId, teamId: { in: visible } } })
    : 0;

  return [
    { label: "Tổ của bạn", value: String(visible.length) },
    { label: "Bạn cùng tổ", value: String(memberCount) },
    { label: "Kỳ", value: period.publishedAt ? "Đã công bố" : "Đang chạy" },
  ];
}