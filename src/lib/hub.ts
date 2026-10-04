import "server-only";

import { prisma } from "@/lib/prisma";
import * as service from "@/lib/competition/service";
import { loadCompetition } from "@/lib/competition/query";
import { getClassTasks } from "@/lib/tasks/service";
import { roleLabel } from "@/lib/classes/roster";
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

/** Một tổ trên thẻ "Thi đua" ở trang chủ. */
export type HubTeamCard = {
  id: string;
  name: string;
  color: string | null;
  /** Điểm trung bình mỗi người — cùng cách xếp hạng như trang thi đua. */
  average: number;
  rank: number;
  memberCount: number;
};

/** Một người trên ô "Thành viên" ở trang chủ. */
export type HubMemberCard = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  roleLabel: string | null;
  teamName: string | null;
};

export type HubTaskCard = {
  id: string;
  title: string;
  status: string;
  priority: string;
  teamName: string | null;
  dueText: string;
  isOverdue: boolean;
};

export type HubOverview = {
  className: string;
  schoolYear: string;
  school: string | null;
  description: string | null;
  teamCount: number;
  studentCount: number;
  staffCount: number;
  periodName: string | null;
  daysLeft: number | null;
  canSeeAllTeams: boolean;
  teams: HubTeamCard[];
  staff: HubMemberCard[];
  students: HubMemberCard[];
  tasks: HubTaskCard[];
};

/** Nhãn việc gấp, dùng chung cho thẻ task và số liệu tổng quan. */
const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn",
};

const DONE_STATUSES = new Set(["COMPLETED"]);

/**
 * Dữ liệu cho bốn ô bento ở trang chủ (`/apps`).
 *
 * Cố ý gom và đếm ở đây rồi mới trả về: `loadCompetition` nặng (bảng điểm
 * từng ô, bảng xếp hạng học sinh theo tuần và cả năm), đưa thẳng xuống
 * client sẽ làm nặng RSC payload mà trang chủ không dùng tới. Ở đây chỉ giữ
 * đúng phần trang chủ hiển thị.
 *
 * Chỉ liệt kê thành viên của lớp đang xem, và tô trong nhóm ban cán sự /
 * học sinh — không kéo email về client.
 */
export async function getHubOverview(classId: string): Promise<HubOverview> {
  const klass = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      name: true,
      schoolYear: true,
      school: true,
      description: true,
      teams: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          color: true,
          _count: { select: { members: true } },
        },
      },
      memberships: {
        orderBy: { user: { fullName: "asc" } },
        select: {
          role: true,
          teamId: true,
          team: { select: { name: true } },
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      },
    },
  });

  const base: HubOverview = {
    className: klass?.name ?? "",
    schoolYear: klass?.schoolYear ?? "",
    school: klass?.school ?? null,
    description: klass?.description ?? null,
    teamCount: klass?.teams.length ?? 0,
    studentCount: 0,
    staffCount: 0,
    periodName: null,
    daysLeft: null,
    canSeeAllTeams: false,
    teams: [],
    staff: [],
    students: [],
    tasks: [],
  };
  if (!klass) return base;

  // Ban cán sự = có vai trò đặc biệt; còn lại là học sinh.
  const staff: HubMemberCard[] = [];
  const students: HubMemberCard[] = [];
  for (const m of klass.memberships) {
    const card: HubMemberCard = {
      id: m.user.id,
      fullName: m.user.fullName,
      avatarUrl: m.user.avatarUrl,
      roleLabel: m.role === "STUDENT" ? null : roleLabel(m.role),
      teamName: m.team?.name ?? null,
    };
    if (m.role === "STUDENT") students.push(card);
    else staff.push(card);
  }
  base.staff = staff;
  base.students = students;
  base.studentCount = students.length;
  base.staffCount = staff.length;

  const tasks = await getClassTasks(classId);
  const now = Date.now();
  base.tasks = tasks.slice(0, 5).map((t) => {
    const overdue =
      t.deadline !== null && t.deadline.getTime() < now && !DONE_STATUSES.has(t.status);
    const days = t.deadline
      ? Math.round((t.deadline.getTime() - now) / 86_400_000)
      : null;
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      priority: PRIORITY_LABEL[t.priority] ?? t.priority,
      teamName: t.teamName ?? null,
      dueText: days === null ? "Không hạn" : overdue ? `Trễ ${Math.abs(days)} ngày` : `Còn ${days} ngày`,
      isOverdue: overdue,
    };
  });

  // Thi đua: điểm tổ đã được tính sẵn trong DB. Gọi trong try/catch vì lớp
  // mới tạo chưa có kỳ thi thì loadCompetition ném lỗi — trang chủ vẫn phải
  // hiện được ba ô còn lại.
  try {
    const comp = await loadCompetition();
    base.periodName = comp.period?.name ?? null;
    base.daysLeft = comp.period?.daysLeft ?? null;
    base.canSeeAllTeams = comp.access.seesAllTeams;

    const counts = new Map(comp.teams.map((t) => [t.id, t.memberCount]));
    base.teams = comp.weekTeams.map((t) => ({
      id: t.teamId,
      name: t.teamName,
      color: t.color,
      average: t.average,
      rank: t.rank,
      memberCount: counts.get(t.teamId) ?? t.memberIds.length,
    }));
  } catch {
    base.teams = klass.teams.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      average: 0,
      rank: 0,
      memberCount: t._count.members,
    }));
  }

  return base;
}