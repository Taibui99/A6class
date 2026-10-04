import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  Flame,
  Sparkles,
  School,
  ListTodo,
  Megaphone,
  Pin,
  Trophy,
  LayoutGrid,
  UsersRound,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  type LucideIcon,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import {
  getDashboardSummary,
  getRecentActivities,
  getScoreboard,
} from "@/lib/dashboard";
import { getClassTasks } from "@/lib/tasks/service";
import { formatNumber, formatRelativeTime, getInitials } from "@/lib/utils";
import { COMPETITION_PATH, HOME_PATH } from "@/lib/home";
import {
  TeacherActivityDialog,
  type ActivityItem,
} from "@/components/dashboard/teacher-activity-dialog";

const roleLabels: Record<string, string> = {
  TEACHER: "Giáo viên chủ nhiệm",
  STUDENT: "Học sinh 12A6",
};

const DEFAULT_TEAMS = [
  { id: "team-1", name: "Tổ 1 · Tiên Phong", color: "#00F2FE", totalScore: 320, rank: 1 },
  { id: "team-2", name: "Tổ 2 · Vươn Xa", color: "#4FACFE", totalScore: 310, rank: 2 },
  { id: "team-3", name: "Tổ 3 · Bứt Phá", color: "#34D399", totalScore: 295, rank: 3 },
  { id: "team-4", name: "Tổ 4 · Vững Vàng", color: "#FFB800", totalScore: 285, rank: 4 },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [data, classTasks] = await Promise.all([
    getDashboardSummary(user.id),
    getClassTasks(),
  ]);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const firstName = user.fullName.trim().split(/\s+/).at(-1) ?? "bạn";

  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(now)
    .replace(/^./, (c) => c.toUpperCase());

  const isTeacher = user.role === "TEACHER";
  const classId = data?.classId ?? null;

  const [scoreboard, activities] = classId
    ? await Promise.all([getScoreboard(classId), getRecentActivities(classId)])
    : [{ teams: [], students: [] }, []];

  const activityItems: ActivityItem[] = activities.map((a) => ({
    id: a.id,
    kind: a.kind,
    title: a.title,
    detail: `${a.detail} · ${formatRelativeTime(a.at)}`,
  }));

  const displayTeams = scoreboard.teams.length > 0 ? scoreboard.teams : DEFAULT_TEAMS;
  const topTeam = displayTeams[0];

  const displayTasks = classTasks.slice(0, 4);

  const announcements = data?.announcements ?? [
    {
      id: "ann-1",
      title: "Lịch thi giữa học kỳ I chính thức",
      content: "Các bạn chuẩn bị ôn tập kỹ các môn Toán, Văn, Anh. Chúc 12A6 đạt kết quả cao nhất khối!",
      isPinned: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: "ann-2",
      title: "Phát động phong trào Báo tường 20/11",
      content: "Các tổ trưởng nộp bản phác thảo ý tưởng cho Lớp trưởng Phương Thảo trước thứ Sáu.",
      isPinned: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    },
  ];

  return (
    <div className="space-y-7">
      {isTeacher && activityItems.length > 0 && (
        <TeacherActivityDialog activities={activityItems} />
      )}

      {/* ── Banner chào mừng sinh động ───────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-surface to-slate-900 p-6 sm:p-8 ring-1 ring-border shadow-lg">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-40 bottom-0 h-60 w-60 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-300 ring-1 ring-sky-500/30">
                <School className="size-3.5" />
                Lớp 12A6 · 2026-2027
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-secondary ring-1 ring-border">
                {roleLabels[user.role] ?? "Thành viên"}
              </span>
              <span className="text-xs font-medium text-text-muted">{today}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-text">
              {greeting}, <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">{firstName}</span>! 👋
            </h1>

            <p className="text-sm text-text-secondary max-w-xl">
              Cùng theo dõi thi đua 4 tổ, hoàn thành nhiệm vụ tuần và giữ vững ngọn lửa đoàn kết của đại gia đình 12A6.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-xl shadow-lg ring-2 ring-white/10">
              {getInitials(user.fullName)}
            </div>
          </div>
        </div>

        {/* 4 Thẻ KPI học đường */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/competition"
            className="group rounded-2xl bg-surface/80 backdrop-blur-sm p-4 ring-1 ring-border/80 transition hover:ring-amber-500/40 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-semibold">Tổ dẫn đầu 🏆</span>
              <Trophy className="size-4 text-amber-400" />
            </div>
            <p className="mt-2 text-base sm:text-lg font-black text-amber-300 truncate">
              {topTeam?.name ?? "Tổ 1"}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {topTeam?.totalScore ?? 320} điểm thi đua
            </p>
          </Link>

          <Link
            href="/tasks"
            className="group rounded-2xl bg-surface/80 backdrop-blur-sm p-4 ring-1 ring-border/80 transition hover:ring-sky-500/40 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-semibold">Việc lớp tuần này</span>
              <ListTodo className="size-4 text-sky" />
            </div>
            <p className="mt-2 text-2xl font-black text-sky-300">
              {classTasks.filter((t) => t.status !== "COMPLETED").length}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">Đang cần thực hiện</p>
          </Link>

          <Link
            href="/members"
            className="group rounded-2xl bg-surface/80 backdrop-blur-sm p-4 ring-1 ring-border/80 transition hover:ring-emerald-500/40 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-semibold">Sĩ số lớp</span>
              <UsersRound className="size-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-300">36</p>
            <p className="mt-0.5 text-[11px] text-text-muted">4 tổ thi đua</p>
          </Link>

          <Link
            href={HOME_PATH}
            className="group rounded-2xl bg-surface/80 backdrop-blur-sm p-4 ring-1 ring-border/80 transition hover:ring-violet-500/40 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-semibold">Kho công cụ</span>
              <LayoutGrid className="size-4 text-violet-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-violet-300">Sẵn sàng</p>
            <p className="mt-0.5 text-[11px] text-text-muted">Thi & tài liệu</p>
          </Link>
        </div>
      </section>

      {/* ── Grid 2 cột: Thi đua 4 Tổ & Hoạt động lớp cần làm ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cột 1: Thi đua 4 Tổ */}
        <section className="flex flex-col justify-between rounded-3xl bg-surface p-6 ring-1 ring-border shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
                  <Trophy className="size-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-text">Bảng xếp hạng 4 Tổ</h2>
                  <p className="text-xs text-text-muted">Cập nhật thi đua theo thời gian thực</p>
                </div>
              </div>

              <Link
                href="/competition"
                className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
              >
                Đấu trường <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* Danh sách 4 tổ */}
            <div className="mt-5 space-y-3">
              {displayTeams.slice(0, 4).map((team, idx) => {
                const medals = ["🥇", "🥈", "🥉", "🏅"];
                const maxScore = Math.max(...displayTeams.map((t) => t.totalScore || 100), 100);
                const pct = Math.round(((team.totalScore || 0) / maxScore) * 100);

                return (
                  <div
                    key={team.id}
                    className="rounded-2xl bg-canvas p-3.5 ring-1 ring-border transition-all hover:ring-sky-500/30"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 font-bold text-text">
                        <span className="text-base">{medals[idx] ?? "🏅"}</span>
                        <span>{team.name}</span>
                      </div>
                      <span className="font-black tabular-nums text-sky-300 text-sm">
                        {formatNumber(team.totalScore)} đ
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: team.color ?? "#00F2FE",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
            <span>Điểm dựa trên 22 tiêu chí học tập & nề nếp</span>
            <Link
              href="/competition"
              className="rounded-xl bg-sky-500/15 px-3 py-1.5 font-bold text-sky-300 ring-1 ring-sky-500/30 hover:bg-sky-500/25 transition"
            >
              Nhập / Xem điểm chi tiết
            </Link>
          </div>
        </section>

        {/* Cột 2: Việc lớp & Hoạt động gấp */}
        <section className="flex flex-col justify-between rounded-3xl bg-surface p-6 ring-1 ring-border shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-sky-500/15 text-sky ring-1 ring-sky-500/30">
                  <ListTodo className="size-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-text">Việc lớp cần làm gấp</h2>
                  <p className="text-xs text-text-muted">Nhiệm vụ và hoạt động trọng tâm</p>
                </div>
              </div>

              <Link
                href="/tasks"
                className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
              >
                Tất cả việc <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* List tasks */}
            <div className="mt-5 space-y-2.5">
              {displayTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-canvas p-3 ring-1 ring-border transition-all hover:ring-sky-500/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text">
                      {task.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                      <span className="text-sky-300 font-semibold">
                        {task.teamName ?? "Cả lớp"}
                      </span>
                      <span>·</span>
                      {task.deadline ? (
                        <span>Hạn: {formatRelativeTime(new Date(task.deadline))}</span>
                      ) : (
                        <span>Trong tuần</span>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 rounded-xl bg-surface px-2.5 py-1 text-[11px] font-bold text-amber-300 ring-1 ring-border">
                    +{task.points ?? 10}đ
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
            <span>Hoàn thành đúng hạn để nhận điểm thưởng</span>
            <Link
              href="/tasks"
              className="rounded-xl bg-sky-500/15 px-3 py-1.5 font-bold text-sky-300 ring-1 ring-sky-500/30 hover:bg-sky-500/25 transition"
            >
              + Giao việc mới
            </Link>
          </div>
        </section>
      </div>

      {/* ── Thông báo lớp & Lịch tuần ──────────────────────── */}
      <section className="rounded-3xl bg-surface p-6 ring-1 ring-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
              <Megaphone className="size-4" />
            </span>
            <h2 className="text-base font-bold text-text">Bảng tin & Thông báo lớp 12A6</h2>
          </div>
          <span className="text-xs font-semibold text-text-muted">Ban cán sự ghim</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl bg-canvas p-4 ring-1 ring-border space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Pin className="size-3.5" />
                <span className="text-text">{a.title}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                {a.content}
              </p>
              <p className="text-[10px] text-text-muted pt-1">
                {formatRelativeTime(new Date(a.createdAt))}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}