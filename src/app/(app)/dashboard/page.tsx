import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ListTodo,
  Megaphone,
  Pin,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/roles";
import {
  getDailyPoints,
  getDashboardSummary,
  getRecentActivities,
  getScoreboard,
  getTodayTeamDeltas,
} from "@/lib/dashboard";
import { getAbsentCount } from "@/lib/attendance/service";
import { getTodaySubjects } from "@/lib/timetable/service";
import { getClassTasks } from "@/lib/tasks/service";
import { prisma } from "@/lib/prisma";
import { cn, formatNumber, formatRelativeTime } from "@/lib/utils";
import {
  TeacherActivityDialog,
  type ActivityItem,
} from "@/components/dashboard/teacher-activity-dialog";

// Không có dữ liệu thì hiện empty state, không dựng sẵn tổ và điểm giả —
// bảng xếp hạng bịa sẽ khiến thầy cô tưởng lớp đã có điểm thi đua.
// Bố cục theo DESIGN-REDESIGN.md §5.2: hero trạng thái lớp (P0) →
// leaderboard là hero content (P1) → việc cần chốt (P2) → bảng tin (P4).
// Phủ pop Gen-Z (DESIGN-V3-POP.md §4): hero vàng sticker, medal tròn, viền mực.

type ClassTask = Awaited<ReturnType<typeof getClassTasks>>[number];

const DONE = "COMPLETED";

// ── Nhóm vai trò cho dashboard (DESIGN-REDESIGN.md §G) ──────────────
// teacher / monitor (lớp trưởng + PHT, TQ, LĐ) / leader (trưởng,
// phó tổ) / student — mỗi nhóm có stats, lối tắt và việc khác nhau.
const ROLE_LABEL: Record<string, string> = {
  TEACHER: "Giáo viên",
  ADMIN: "Quản trị viên",
  CLASS_MONITOR: "Lớp trưởng",
  CLASS_VICE_MONITOR: "Lớp phó",
  ACADEMIC_VICE_MONITOR: "PHT",
  ACTIVITY_VICE_MONITOR: "TQ",
  LABOR_VICE_MONITOR: "LĐ",
  TEAM_LEADER: "Trưởng tổ",
  TEAM_VICE_LEADER: "Phó tổ",
  STUDENT: "Học sinh",
};

const MONITOR_ROLES = new Set([
  "CLASS_MONITOR",
  "CLASS_VICE_MONITOR",
  "ACADEMIC_VICE_MONITOR",
  "ACTIVITY_VICE_MONITOR",
  "LABOR_VICE_MONITOR",
]);
const LEADER_ROLES = new Set(["TEAM_LEADER", "TEAM_VICE_LEADER"]);

type RoleGroup = "teacher" | "monitor" | "leader" | "student";

function taskUrgency(task: ClassTask, now: Date): 0 | 1 | 2 | 3 {
  if (task.status === DONE) return 3;
  if (!task.deadline) return 2;
  const due = new Date(task.deadline);
  if (due.getTime() < now.getTime()) return 0;
  if (due.toDateString() === now.toDateString()) return 1;
  return 2;
}

function taskState(task: ClassTask, now: Date) {
  const urgency = taskUrgency(task, now);
  if (urgency === 0) return { dot: "bg-danger", label: "Quá hạn", labelColor: "text-danger" };
  if (urgency === 1) return { dot: "bg-amber", label: "Hôm nay", labelColor: "text-amber-ink" };
  if (urgency === 3) return { dot: "bg-success", label: "Đã xong", labelColor: "text-success" };
  if (task.deadline) {
    const days = Math.max(
      1,
      Math.ceil((new Date(task.deadline).getTime() - now.getTime()) / 86_400_000)
    );
    return { dot: "bg-border-strong", label: `Còn ${days} ngày`, labelColor: "text-text-muted" };
  }
  return { dot: "bg-border-strong", label: "Trong tuần", labelColor: "text-text-muted" };
}

/** Đường cong mượt qua các điểm (Catmull-Rom → bezier) cho biểu đồ vùng. */
function smoothPath(pts: [number, number][]): string {
  const r1 = (n: number) => Math.round(n * 10) / 10;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  linkLabel,
  href,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  linkLabel?: string;
  href?: string;
}) {
  return (
    <header className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-extrabold tracking-tight text-text">
          <Icon className="size-4 shrink-0 text-accent-ink" aria-hidden />
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>
      </div>
      {linkLabel && href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-accent-ink hover:underline"
        >
          {linkLabel} <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      )}
    </header>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [data, classTasks, membership] = await Promise.all([
    getDashboardSummary(user.id),
    getClassTasks(),
    prisma.classMembership.findFirst({
      where: { userId: user.id },
      orderBy: { joinedAt: "asc" },
      select: { role: true, teamId: true },
    }),
  ]);

  const now = new Date();
  const todayISOStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const jsDay = now.getDay();
  const todayLabel =
    jsDay >= 1 && jsDay <= 6
      ? ["T2", "T3", "T4", "T5", "T6", "T7"][jsDay - 1]
      : "Chủ nhật";
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const firstName = user.fullName.trim().split(/\s+/).at(-1) ?? "bạn";

  const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(now);
  const dayMonth = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(now);
  const dateLabel = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${dayMonth}`;

  const isTeacher = isStaff(user.role);
  const memberRole = membership?.role ?? null;
  const myTeamId = membership?.teamId ?? null;

  const roleGroup: RoleGroup = isTeacher
    ? "teacher"
    : memberRole && MONITOR_ROLES.has(memberRole)
      ? "monitor"
      : memberRole && LEADER_ROLES.has(memberRole)
        ? "leader"
        : "student";
  const roleLabel =
    user.role === "ADMIN"
      ? ROLE_LABEL.ADMIN
      : isTeacher
        ? ROLE_LABEL.TEACHER
        : memberRole
          ? (ROLE_LABEL[memberRole] ?? null)
          : null;
  // Trưởng/phó tổ và học sinh chỉ thấy việc của mình/tổ mình trên dashboard.
  const scopedToMyTeam = roleGroup === "leader" || roleGroup === "student";

  const classId = data?.classId ?? null;

  const [scoreboard, activities, criteriaCount, deltas, myTaskIds, pointRows, dailyWeek, absentToday, todaySubjects] =
    classId
      ? await Promise.all([
          getScoreboard(classId),
          getRecentActivities(classId),
          prisma.criterion.count({ where: { classId } }),
          getTodayTeamDeltas(classId),
          prisma.taskAssignment.findMany({
            where: { userId: user.id },
            select: { taskId: true },
          }),
          roleGroup === "teacher"
            ? prisma.pointTransaction.groupBy({
                by: ["targetUserId"],
                where: { classId, targetUserId: { not: null } },
                _sum: { amount: true },
              })
            : Promise.resolve([]),
          getDailyPoints(classId),
          getAbsentCount(classId, todayISOStr),
          getTodaySubjects(classId, jsDay),
        ])
      : [
          { teams: [], students: [] },
          [],
          0,
          {} as Record<string, number>,
          [] as { taskId: string }[],
          [] as unknown[],
          [] as { key: string; label: string; total: number; isToday: boolean }[],
          0,
          [] as string[],
        ];
  const myTaskIdSet = new Set(myTaskIds.map((a) => a.taskId));

  const activityItems: ActivityItem[] = activities.map((a) => ({
    id: a.id,
    kind: a.kind,
    title: a.title,
    detail: `${a.detail} · ${formatRelativeTime(a.at)}`,
  }));

  const displayTeams = scoreboard.teams;
  const topTeam = displayTeams[0] ?? null;
  const studentCount = displayTeams.reduce((sum, t) => sum + t.memberCount, 0);
  const openTaskCount = classTasks.filter((t) => t.status !== DONE).length;

  const className = data?.className ?? null;
  const classLabel = className ?? "Lớp của bạn";

  // Headline P0: trả lời "lớp mình hôm nay thế nào" — không bịa số.
  const headline = topTeam
    ? `${topTeam.name} đang dẫn đầu thi đua`
    : isTeacher
      ? "Chưa có tổ nào — vào Dữ liệu lớp để tạo tổ"
      : "Lớp chưa có tổ nào để thi đua";

  // P2: chỉ 3 việc, nặng nhất trước (quá hạn → hôm nay → còn lại → đã xong).
  // Trưởng tổ / học sinh: chỉ việc áp cho mình hoặc tổ mình.
  const scopedTasks = scopedToMyTeam
    ? classTasks.filter(
        (t) =>
          t.assigneeType === "CLASS" ||
          t.assigneeType === "ROLE" ||
          (t.assigneeType === "TEAM" && t.teamId === myTeamId) ||
          (t.assigneeType === "INDIVIDUAL" && myTaskIdSet.has(t.id))
      )
    : classTasks;
  const sortedTasks = [...scopedTasks]
    .sort((a, b) => taskUrgency(a, now) - taskUrgency(b, now))
    .slice(0, 3);

  // Lối tắt theo vai trò — mỗi nhóm một việc cần làm ngay.
  const ctas =
    roleGroup === "teacher"
      ? [
          { label: "Giao việc", href: "/tasks", primary: true },
          { label: "Nhập / Xem điểm", href: "/competition" },
          { label: "Bảng tin lớp", href: "/feed" },
        ]
      : roleGroup === "monitor"
        ? [
            { label: "Nhập / Xem điểm", href: "/competition", primary: true },
            { label: "Việc của lớp", href: "/tasks" },
            { label: "Thành viên", href: "/members" },
          ]
        : roleGroup === "leader"
          ? [
              { label: "Điểm tổ mình", href: "/competition", primary: true },
              { label: "Việc của tổ", href: "/tasks" },
              { label: "Bảng thành tích", href: "/achievements" },
            ]
          : [
              { label: "Xem bảng điểm", href: "/competition", primary: true },
              { label: "Việc của tôi", href: "/tasks" },
              { label: "Bảng thành tích", href: "/achievements" },
            ];

  const announcements = data?.announcements ?? [];

  // Hình học biểu đồ vùng 7 ngày (server-render SVG, không cần JS client).
  const maxDay = Math.max(1, ...dailyWeek.map((d) => d.total));
  const chartW = 320;
  const chartBase = 142;
  const chartX = (i: number) =>
    14 + (i * (chartW - 28)) / Math.max(1, dailyWeek.length - 1);
  const chartY = (v: number) => 12 + 120 * (1 - v / maxDay);
  const chartPts = dailyWeek.map(
    (d, i) => [chartX(i), chartY(d.total)] as [number, number]
  );
  const chartLine = dailyWeek.length > 1 ? smoothPath(chartPts) : "";
  const chartArea = dailyWeek.length
    ? `${chartLine} L ${chartX(dailyWeek.length - 1)} ${chartBase} L ${chartX(0)} ${chartBase} Z`
    : "";

  return (
    <div className="space-y-6">
      {isTeacher && activityItems.length > 0 && (
        <TeacherActivityDialog activities={activityItems} />
      )}

      {/* ── P0 · Hero trạng thái lớp — gradient teal→xanh kiểu bản prototype ── */}
      <section className="rounded-[24px] bg-gradient-to-br from-[#0b5b72] via-[#0e7490] to-[#2563eb] px-5 py-7 text-white shadow-xl sm:px-7 sm:py-8">
        <p className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/70">
          <span>
            {classLabel} · {dateLabel}
          </span>
          {roleLabel && (
            <span className="rounded-full border border-white/40 bg-white/15 px-2 py-0.5 text-[10px] font-extrabold tracking-normal text-white">
              {roleLabel}
            </span>
          )}
        </p>

        <div className="mt-4 min-w-0">
          <div className="min-w-0">
            <p className="text-sm text-white/80">
              {greeting}, {firstName}.
            </p>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              {headline}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
              {studentCount > 0 && (
                <>
                  <span className="font-semibold text-white">{studentCount} bạn</span>
                  <span aria-hidden>·</span>
                </>
              )}
              <span className="font-semibold text-white">{openTaskCount} việc</span>
              <span aria-hidden>·</span>
              {topTeam ? (
                <span className="font-semibold text-white">
                  #1 {topTeam.name}
                </span>
              ) : (
                <span>chưa có tổ</span>
              )}
              {absentToday > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-semibold text-white">
                    vắng {absentToday} bạn
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Số của vai trò — 4 thẻ gradient kiểu bản prototype */}
          {roleGroup === "teacher" ? (
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-[#0284c7] to-[#38bdf8] p-4 text-white shadow">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">
                  Sĩ số
                </p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {studentCount}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#d97706] to-[#fbbf24] p-4 text-white shadow">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">
                  Việc đã chốt
                </p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {classTasks.filter((t) => t.status === DONE).length}/{classTasks.length}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] p-4 text-white shadow">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">
                  Bạn đã có điểm
                </p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {pointRows.length}/{studentCount}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] p-4 text-white shadow">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">
                  Tiêu chí
                </p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {criteriaCount}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-[#0284c7] to-[#38bdf8] p-4 text-white shadow">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">
                  Điểm của bạn
                </p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {formatNumber(data?.totalPoints ?? 0)}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#d97706] to-[#fbbf24] p-4 text-white shadow">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">
                  Hạng cá nhân
                </p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {data?.personalRank ? `#${data.personalRank}` : "—"}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] p-4 text-white shadow">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">
                  Tổ của bạn
                </p>
                <p className="mt-0.5 truncate text-xl font-extrabold">
                  {data?.team?.name ?? "Chưa vào tổ"}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] p-4 text-white shadow">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">
                  Việc chưa xong
                </p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {scopedTasks.filter((t) => t.status !== DONE).length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Lối tắt — launchpad theo vai trò, không lặp lại nav bằng chữ */}
        <div className="mt-5 flex flex-wrap gap-2.5 border-t border-white/20 pt-4">
          {ctas.map((cta) => (
            <Link
              key={cta.href + cta.label}
              href={cta.href}
              className={cn(
                "inline-flex h-10 items-center rounded-2xl px-4 text-sm font-extrabold transition-all",
                cta.primary
                  ? "bg-white text-[#0b3b4d] shadow-lg hover:bg-white/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  : "border border-white/50 bg-transparent text-white hover:bg-white/10"
              )}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Dải tiết học hôm nay (giống demo) — chỉ hiện khi có TKB ── */}
      {todaySubjects.some((s) => s) && (
        <section
          aria-label={`Tiết học hôm nay ${todayLabel}`}
          className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-md sm:px-6"
        >
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="shrink-0 text-xs font-extrabold uppercase tracking-wide text-text-muted">
              Hôm nay · {todayLabel}
            </span>
            {todaySubjects.map(
              (s, i) =>
                s && (
                  <span
                    key={i}
                    className="shrink-0 rounded-xl bg-primary-light px-3 py-1.5 text-xs font-bold text-primary"
                  >
                    T{i + 1} · {s}
                  </span>
                )
            )}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── P1 · Leaderboard là hero content ─────────────── */}
        <section className="rounded-[20px] border border-border bg-surface p-5 shadow-md sm:p-6">
          <SectionHeader
            icon={Trophy}
            title="Tổ nào đang dẫn?"
            subtitle="Bảng điểm vừa cập nhật"
            linkLabel="Xem chi tiết"
            href="/competition"
          />

          <ol className="mt-4">
            {displayTeams.length === 0 ? (
              <li className="py-6 text-center text-sm text-text-muted">
                Chưa có tổ nào. Vào{" "}
                <span className="font-semibold text-text-secondary">
                  {isTeacher ? "Dữ liệu lớp" : "Thành viên"}
                </span>{" "}
                {isTeacher ? "để tạo tổ và nhập danh sách học sinh." : "để vào tổ của bạn."}
              </li>
            ) : (
              displayTeams.slice(0, 4).map((team, idx) => {
                const isTop = idx === 0;
                const delta = deltas[team.id] ?? 0;

                return (
                  <li key={team.id}>
                    <Link
                      href="/competition"
                      className="flex items-center gap-4 rounded-lg border-b border-border px-1 py-3.5 transition-colors last:border-b-0 hover:bg-surface-hover"
                    >
                      <span
                        className={cn(
                          "medal tabular-nums",
                          isTop ? "medal-1 text-base" : "text-[13px]"
                        )}
                        aria-hidden
                      >
                        {idx + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate font-bold text-text",
                            isTop ? "text-xl" : "text-sm"
                          )}
                        >
                          {team.name}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-text-muted">
                          <span
                            className={cn(
                              "font-semibold",
                              delta > 0 ? "text-primary" : "text-text-muted"
                            )}
                          >
                            {delta > 0 ? "↑" : delta < 0 ? "↓" : "—"}{" "}
                            {delta > 0 ? "+" : ""}
                            {delta} hôm nay
                          </span>
                          <span aria-hidden>·</span>
                          <span>{team.memberCount} thành viên</span>
                        </p>
                        <div
                          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-light"
                          aria-hidden
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0e7490] to-[#2563eb]"
                            style={{
                              width: `${Math.max(4, Math.round((team.totalScore / (topTeam?.totalScore || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>

                      <p
                        className={cn(
                          "shrink-0 font-extrabold tabular-nums text-text",
                          isTop ? "text-2xl" : "text-base"
                        )}
                      >
                        {formatNumber(team.totalScore)}
                        <span
                          className={cn(
                            "font-bold text-text-muted",
                            isTop ? "text-sm" : "text-xs"
                          )}
                        >
                          đ
                        </span>
                      </p>
                    </Link>
                  </li>
                );
              })
            )}
          </ol>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-text-muted">
            <span>
              {criteriaCount > 0
                ? `Điểm dựa trên ${criteriaCount} tiêu chí học tập & nề nếp`
                : "Chưa thiết lập tiêu chí chấm điểm"}
            </span>
            <Link
              href="/competition"
              className="shrink-0 font-bold text-primary transition-colors hover:underline"
            >
              Nhập / Xem điểm chi tiết
            </Link>
          </div>
        </section>

        {/* ── P2 · Việc cần chốt — 3 việc, trạng thái thấy 0,5s ── */}
        <section className="flex flex-col rounded-[20px] border border-border bg-surface p-5 shadow-md sm:p-6">
          <SectionHeader
            icon={ListTodo}
            title={
              roleGroup === "teacher" || roleGroup === "monitor"
                ? "Việc cần chốt"
                : roleGroup === "leader"
                  ? "Việc của tổ"
                  : "Việc của bạn"
            }
            subtitle={
              roleGroup === "teacher"
                ? "Chốt sớm — lấy điểm cho tổ"
                : roleGroup === "monitor"
                  ? "Toàn bộ việc của lớp"
                  : "Việc áp cho bạn và tổ bạn"
            }
            linkLabel={roleGroup === "teacher" ? "Giao việc" : "Tất cả việc"}
            href="/tasks"
          />

          {sortedTasks.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-border bg-canvas px-4 py-5">
              <p className="text-center text-sm leading-relaxed text-text-muted">
                {scopedToMyTeam ? (
                  classTasks.length > 0 ? (
                    <>
                      Lớp đang có{" "}
                      <b className="text-text-secondary">{classTasks.length} việc</b> ({openTaskCount}{" "}
                      còn mở) nhưng chưa việc nào áp cho bạn.
                    </>
                  ) : (
                    <>Chưa có việc nào áp cho bạn lúc này.</>
                  )
                ) : (
                  <>
                    Lớp chưa có nhiệm vụ nào.{" "}
                    {isTeacher
                      ? "Bắt đầu giao việc cho tổ."
                      : "Hết việc rồi — nghỉ ngơi đi."}
                  </>
                )}
              </p>
              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
                {scopedToMyTeam && classTasks.length > 0 ? (
                  <>
                    <Link
                      href="/tasks"
                      className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                      Tất cả việc của lớp
                    </Link>
                    <Link
                      href="/feed"
                      className="inline-flex h-9 items-center rounded-2xl border-2 border-[#1E1B16] bg-white px-4 text-sm font-bold text-[#1E1B16] transition-colors hover:bg-surface-hover"
                    >
                      Bảng tin lớp
                    </Link>
                  </>
                ) : isTeacher ? (
                  <Link
                    href="/tasks"
                    className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    Giao việc cho tổ
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/competition"
                      className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                      Xem bảng điểm
                    </Link>
                    <Link
                      href="/achievements"
                      className="inline-flex h-9 items-center rounded-2xl border-2 border-[#1E1B16] bg-white px-4 text-sm font-bold text-[#1E1B16] transition-colors hover:bg-surface-hover"
                    >
                      Bảng thành tích
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <ul className="mt-4">
              {sortedTasks.map((task) => {
                const state = taskState(task, now);
                return (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 border-b border-border py-3.5 last:border-b-0"
                  >
                    <span
                      className={cn("size-2.5 shrink-0 rounded-full", state.dot)}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">
                        {task.title}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                        <span className={cn("font-semibold", state.labelColor)}>
                          {state.label}
                        </span>
                        <span className="text-text-muted" aria-hidden>
                          ·
                        </span>
                        <span className="text-text-muted">
                          {task.teamName ?? "Cả lớp"}
                        </span>
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-accent-light px-2 py-1 text-xs font-extrabold text-accent-ink">
                      +{task.points ?? 10}đ
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* ── P3 · Nhịp thi đua 7 ngày + P4 · Bảng tin ─────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-[20px] border border-border bg-surface p-5 shadow-md sm:p-6">
        <SectionHeader
          icon={Activity}
          title="Nhịp thi đua 7 ngày"
          subtitle="Điểm cộng mỗi ngày"
        />
        <svg
          viewBox="0 0 320 175"
          className="mt-4 w-full"
          role="img"
          aria-label="Biểu đồ điểm thi đua 7 ngày gần nhất"
        >
          <defs>
            <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e7490" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0e7490" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1="14"
              y1={12 + 120 * (1 - f)}
              x2={chartW - 14}
              y2={12 + 120 * (1 - f)}
              stroke="currentColor"
              opacity="0.12"
            />
          ))}
          {chartArea && <path d={chartArea} fill="url(#dashArea)" />}
          {chartLine && (
            <path
              d={chartLine}
              fill="none"
              stroke="#0e7490"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          )}
          {dailyWeek.map((d, i) => (
            <g key={d.key}>
              {d.total > 0 && (
                <text
                  x={chartX(i)}
                  y={chartY(d.total) - 9}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="currentColor"
                  opacity="0.75"
                >
                  {d.total}
                </text>
              )}
              <circle
                cx={chartX(i)}
                cy={chartY(d.total)}
                r={d.isToday ? 5 : 3.6}
                fill={d.isToday ? "#fbbf24" : "#ffffff"}
                stroke={d.isToday ? "#b45309" : "#0e7490"}
                strokeWidth="2.6"
              />
              <text
                x={chartX(i)}
                y="162"
                textAnchor="middle"
                fontSize="10.5"
                fontWeight={d.isToday ? 800 : 600}
                fill="currentColor"
                opacity={d.isToday ? 1 : 0.55}
              >
                {d.label}
              </text>
            </g>
          ))}
        </svg>
      </section>

      {/* ── P4 · Bảng tin — flatten, divider + timestamp ──────── */}
      <section className="rounded-[20px] border border-border bg-surface p-5 shadow-md sm:p-6">
        <SectionHeader
          icon={Megaphone}
          title={`Bảng tin ${classLabel}`}
          subtitle="Ban cán sự ghim"
        />

        <ul className="mt-3">
          {announcements.length === 0 ? (
            <li className="py-5 text-sm text-text-muted">
              Chưa có thông báo nào. Có gì cần cả lớp biết thì đăng ở Bảng lớp nhé.
            </li>
          ) : (
            announcements.map((a) => (
              <li
                key={a.id}
                className="flex gap-3 border-b border-border py-3.5 last:border-b-0"
              >
                <Pin className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{a.title}</p>
                  {a.content && (
                    <p className="mt-0.5 text-xs leading-relaxed text-text-secondary line-clamp-2">
                      {a.content}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-text-muted">
                    {formatRelativeTime(new Date(a.createdAt))}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
      </div>
    </div>
  );
}