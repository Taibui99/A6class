import "server-only";

import type { MemberRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/classes/roster";
import { scoreStudents } from "@/lib/competition/scoring";

export type MemberCard = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: MemberRole;
  roleLabel: string;
  teamId: string | null;
  teamName: string | null;
  teamColor: string | null;
  /** Điểm thi đua tích luỹ cả năm. `null` khi chưa có kỳ thi nào. */
  score: number | null;
  /** Số ghi nhận đã nhận trong kỳ đang chạy. */
  marks: number | null;
};

export type TeamCard = {
  id: string;
  name: string;
  color: string | null;
  memberCount: number;
  leaderName: string | null;
};

export type MembersPageData = {
  classId: string;
  className: string;
  schoolYear: string;
  description: string | null;
  periodName: string | null;
  /** Số thành viên có chức danh cán sự (mọi role trừ STUDENT). */
  officerCount: number;
  members: MemberCard[];
  teams: TeamCard[];
};

/**
 * Dữ liệu cho trang /members — lấy từ DB, không có danh sách ghi cứng.
 *
 * Điểm thi đua lấy từ bảng xếp hạng cả năm của chính trang thi đua, nên
 * thẻ thành viên và bảng điểm luôn khớp nhau. Chưa có kỳ thi thì `score`
 * là `null` và giao diện hiện "Chưa có điểm" chứ không điền số 0 — số 0
 * bịa sẽ khiến thầy cô tưởng học sinh chưa làm gì.
 */
export async function getMembersPageData(classId: string): Promise<MembersPageData> {
  const klass = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      schoolYear: true,
      description: true,
      teams: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          color: true,
          leader: { select: { fullName: true } },
          _count: { select: { members: true } },
        },
      },
      memberships: {
        orderBy: { user: { fullName: "asc" } },
        select: {
          role: true,
          teamId: true,
          user: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!klass) {
    return {
      classId,
      className: "",
      schoolYear: "",
      description: null,
      periodName: null,
      officerCount: 0,
      members: [],
      teams: [],
    };
  }

  // Điểm cả năm: tự tính thay vì đọc từ loadCompetition. Hàm đó lọc theo
  // quyền xem (học sinh chỉ thấy tổ mình), dùng ở đây sẽ khiến thẻ của
  // thành viên ngoài tổ hiện "chưa có điểm" dù thực tế có. Ở đây cần đủ
  // điểm cho mọi thẻ trong lớp.
  const [criteria, yearEntries, activePeriod] = await Promise.all([
    prisma.criterion.findMany({
      where: { classId },
      select: { id: true, key: true, label: true, kind: true, points: true },
    }),
    prisma.pointTransaction.findMany({
      where: { classId },
      select: { criterionId: true, targetUserId: true, count: true },
    }),
    prisma.competitionPeriod.findFirst({
      where: { classId, isActive: true },
      select: { name: true },
    }),
  ]);

  const memberIds = new Set(klass.memberships.map((m) => m.user.id));
  const scores = scoreStudents(yearEntries, criteria, memberIds);

  const members: MemberCard[] = klass.memberships.map((m) => {
    const team = klass.teams.find((t) => t.id === m.teamId);
    const score = scores.get(m.user.id);
    return {
      id: m.user.id,
      fullName: m.user.fullName,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      roleLabel: m.role === "STUDENT" ? "Học sinh" : roleLabel(m.role),
      teamId: m.teamId,
      teamName: team?.name ?? null,
      teamColor: team?.color ?? null,
      score: score?.net ?? null,
      marks: score?.marks ?? null,
    };
  });

  return {
    classId: klass.id,
    className: klass.name,
    schoolYear: klass.schoolYear,
    description: klass.description,
    periodName: activePeriod?.name ?? null,
    officerCount: klass.memberships.filter((m) => m.role !== "STUDENT").length,
    members,
    teams: klass.teams.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      memberCount: t._count.members,
      leaderName: t.leader?.fullName ?? null,
    })),
  };
}