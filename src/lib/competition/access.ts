import type { MemberRole, UserRole } from "@prisma/client";

/** Các chức vụ được tính là "cán sự" (được nhập điểm). */
export const OFFICER_ROLES: MemberRole[] = [
  "CLASS_MONITOR",
  "ACADEMIC_VICE_MONITOR",
  "ACTIVITY_VICE_MONITOR",
  "LABOR_VICE_MONITOR",
  "TEAM_LEADER",
  "TEAM_VICE_LEADER",
];

/**
 * Quy tắc đã chốt:
 *  - Giáo viên: xem + sửa cả lớp.
 *  - Lớp trưởng: xem + sửa cả lớp (ngoại lệ duy nhất so với cán sự).
 *  - Cán sự khác (PHT, TQ, tổ trưởng, tổ phó): chỉ xem + sửa TỔ MÌNH,
 *    không được nhìn hay sửa tổ khác.
 *  - Học sinh: chỉ xem tổ mình, không sửa gì.
 *  - Khi kỳ đã công bố (publishedAt): ai cũng xem được tất cả, nhưng
 *    quyền SỬA vẫn giữ nguyên như trên.
 */
export type CompetitionAccess = {
  isTeacher: boolean;
  role: MemberRole | null;
  teamId: string | null;
  /** true = được xem mọi tổ. */
  seesAllTeams: boolean;
  /** true = được sửa mọi tổ. */
  canEditAll: boolean;
  /** true = được nhập điểm (GV, lớp trưởng, cán sự). */
  canRecord: boolean;
  /** Kỳ đã công bố chưa. */
  isPublished: boolean;
  /** Chỉ số các tổ được phép xem; null = xem tất cả. */
  visibleTeamIds: ReadonlySet<string> | null;
};

export function resolveCompetitionAccess(input: {
  userRole: UserRole | null | undefined;
  memberRole: MemberRole | null | undefined;
  teamId: string | null | undefined;
  allTeamIds: readonly string[];
  isPublished: boolean;
}): CompetitionAccess {
  const isTeacher = input.userRole === "TEACHER";
  const role = input.memberRole ?? null;
  const teamId = input.teamId ?? null;

  // Lớp trưởng là ngoại lệ: xem và sửa toàn lớp.
  const seesAllTeams = isTeacher || role === "CLASS_MONITOR" || input.isPublished;
  const canEditAll = isTeacher || role === "CLASS_MONITOR";
  const canRecord = isTeacher || (role !== null && OFFICER_ROLES.includes(role));

  const visibleTeamIds = seesAllTeams
    ? null
    : teamId
      ? new Set([teamId])
      : // Học sinh chưa vào tổ: không xem tổ nào cả, chỉ xem bảng cá nhân của mình.
        new Set<string>();

  return {
    isTeacher,
    role,
    teamId,
    seesAllTeams,
    canEditAll,
    canRecord,
    isPublished: input.isPublished,
    visibleTeamIds,
  };
}

/** Được xem tổ này không. */
export function canViewTeam(access: CompetitionAccess, teamId: string | null): boolean {
  if (access.seesAllTeams) return true;
  if (!teamId) return false;
  return access.visibleTeamIds?.has(teamId) ?? false;
}

/** Được sửa (nhập điểm) tổ này không. */
export function canEditTeam(access: CompetitionAccess, teamId: string | null): boolean {
  if (access.canEditAll) return true;
  if (!teamId || !access.canRecord) return false;
  return access.teamId === teamId;
}

/** Được sửa dòng của học sinh này không (dựa trên tổ của học sinh). */
export function canEditStudent(access: CompetitionAccess, studentTeamId: string | null): boolean {
  return canEditTeam(access, studentTeamId);
}

/** Tổ còn lại được phép sửa, dùng để giới hạn danh sách trong form nhập. */
export function editableTeamIds(
  access: CompetitionAccess,
  allTeamIds: readonly string[],
): string[] {
  if (access.canEditAll) return [...allTeamIds];
  if (!access.canRecord || !access.teamId) return [];
  return allTeamIds.filter((id) => id === access.teamId);
}