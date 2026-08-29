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
  UserRoundPlus,
  Newspaper,
  MessagesSquare,
  CircleHelp,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import {
  getDashboardSummary,
  getRecentActivities,
  getScoreboard,
} from "@/lib/dashboard";
import { formatNumber, formatRelativeTime, getInitials } from "@/lib/utils";
import {
  TeacherActivityDialog,
  type ActivityItem,
} from "@/components/dashboard/teacher-activity-dialog";

const roleLabels: Record<string, string> = {
  TEACHER: "Giáo viên",
  STUDENT: "Học sinh",
};

function Chip({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}

type Tone = "primary" | "secondary" | "warning" | "neutral";

const quickTones: Record<Tone, string> = {
  primary: "bg-primary-light text-primary",
  secondary: "bg-success-light text-secondary",
  warning: "bg-warning-light text-warning",
  neutral: "bg-surface-hover text-text-secondary ring-1 ring-border",
};

const quickLinks: {
  href: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  tone: Tone;
}[] = [
  {
    href: "/feed",
    icon: Newspaper,
    label: "Bảng tin",
    desc: "Bài viết & hoạt động của lớp",
    tone: "primary",
  },
  {
    href: "/nhan-tin",
    icon: MessagesSquare,
    label: "Nhắn tin",
    desc: "Trò chuyện cùng nhau",
    tone: "secondary",
  },
  {
    href: "/cau-hoi",
    icon: CircleHelp,
    label: "Hỏi đáp",
    desc: "Hỏi gì đáp nấy",
    tone: "warning",
  },
  {
    href: "/ho-so",
    icon: UserRound,
    label: "Hồ sơ",
    desc: "Thông tin của bạn",
    tone: "neutral",
  },
];

function rankTone(rank: number | null): string {
  if (rank === 1) return "bg-warning-light text-warning";
  if (rank === 2) return "bg-success-light text-secondary";
  if (rank === 3) return "bg-primary-light text-primary";
  return "bg-surface-hover text-text-secondary";
}

function ScoreboardCard({
  className,
  icon: Icon,
  title,
  tone,
  children,
}: {
  className?: string;
  icon: LucideIcon;
  title: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={`rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border ${className ?? ""}`}
    >
      <h2 className="flex items-center gap-2 text-sm font-bold text-text">
        <span className={`grid size-7 place-items-center rounded-lg ${tone}`}>
          <Icon aria-hidden className="size-4" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDashboardSummary(user.id);
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

  const tasks = data?.pendingTasks ?? [];
  const announcements = data?.announcements ?? [];
  const hasLife = tasks.length > 0 || announcements.length > 0;

  return (
    <div className="space-y-8">
      {isTeacher && activityItems.length > 0 && (
        <TeacherActivityDialog activities={activityItems} />
      )}

      {/* Lời chào */}
      <section aria-label="Lời chào" className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            {today}
          </p>
          <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
            {greeting}, <span className="text-primary">{firstName}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {data?.className ? (
              <Chip
                icon={School}
                label={data.className}
                className="bg-primary-light text-primary"
              />
            ) : (
              <Chip
                icon={Sparkles}
                label="Chưa vào lớp"
                className="bg-warning-light text-warning"
              />
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary ring-1 ring-border">
              {roleLabels[user.role] ?? "Thành viên"}
            </span>
          </div>
        </div>
        <span
          aria-hidden
          className="grid size-12 shrink-0 select-none place-items-center rounded-2xl bg-primary-light text-sm font-extrabold text-primary sm:size-14 sm:text-base"
        >
          {getInitials(user.fullName)}
        </span>
      </section>

      {/* Giáo viên: bảng thi đua của lớp */}
      {isTeacher && classId && (
        <div className="space-y-4">
          <ScoreboardCard
            icon={Trophy}
            title="Bảng thi đua"
            tone="bg-warning-light text-warning"
          >
            {scoreboard.teams.length > 0 ? (
              <ul className="mt-4 space-y-1">
                {scoreboard.teams.map((team) => (
                  <li
                    key={team.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-hover"
                  >
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rounded-full ring-1 ring-black/5"
                      style={{ backgroundColor: team.color ?? "#94a3b8" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">
                        {team.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {team.memberCount} thành viên
                      </p>
                    </div>
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold tabular-nums ${rankTone(team.rank)}`}
                    >
                      {team.rank ?? "—"}
                    </span>
                    <span className="w-16 shrink-0 text-right text-base font-extrabold tabular-nums text-text">
                      {formatNumber(team.totalScore)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-text-muted">
                Lớp chưa có tổ nào — điểm thi đua sẽ hiện tại đây.
              </p>
            )}
          </ScoreboardCard>

          {scoreboard.students.length > 0 && (
            <ScoreboardCard
              icon={Flame}
              title="Cá nhân nổi bật"
              tone="bg-primary-light text-primary"
            >
              <ul className="mt-4 space-y-0.5">
                {scoreboard.students.slice(0, 5).map((student, i) => (
                  <li
                    key={student.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover"
                  >
                    <span
                      className={`w-5 shrink-0 text-right text-sm font-bold tabular-nums ${
                        i === 0 ? "text-warning" : "text-text-muted"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="grid size-8 shrink-0 select-none place-items-center rounded-full bg-surface-hover text-xs font-extrabold text-text-secondary">
                      {getInitials(student.fullName)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
                      {student.fullName}
                    </span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-text">
                      {formatNumber(student.points)}
                    </span>
                  </li>
                ))}
              </ul>
            </ScoreboardCard>
          )}
        </div>
      )}

      {/* Nhịp sống lớp hôm nay */}
      <section aria-label="Nhịp sống lớp" className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border">
        <h2 className="flex items-center gap-2 text-sm font-bold text-text">
          <span className="grid size-7 place-items-center rounded-lg bg-primary-light text-primary">
            <Activity aria-hidden className="size-4" />
          </span>
          Nhịp sống lớp hôm nay
        </h2>

        {!hasLife ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-surface-hover/60 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-text-muted">
              <Sparkles aria-hidden className="size-4" />
            </span>
            <p className="text-sm leading-relaxed text-text-secondary">
              Lớp đang yên tĩnh — chưa có việc gì gấp. Quay lại sau nhé!
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            {tasks.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                  <ListTodo aria-hidden className="size-3.5 text-primary" />
                  Bạn còn {tasks.length} nhiệm vụ:
                </p>
                <ul className="space-y-1">
                  {tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text">
                          {task.title}
                        </p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {task.deadline
                            ? `Hạn: ${formatRelativeTime(task.deadline)}`
                            : "Chưa có hạn chót"}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="size-2 shrink-0 rounded-full bg-primary/30"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {announcements.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                  <Megaphone aria-hidden className="size-3.5 text-warning" />
                  Lớp vừa nói:
                </p>
                <ul className="space-y-1">
                  {announcements.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover"
                    >
                      {a.isPinned && (
                        <Pin
                          aria-hidden
                          className="mt-0.5 size-3.5 shrink-0 text-warning"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text">{a.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">
                          {a.content}
                        </p>
                        <p className="mt-1 text-[11px] text-text-muted">
                          {formatRelativeTime(a.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Bắt đầu */}
      <section aria-label="Bắt đầu">
        <h2 className="mb-3 text-sm font-bold text-text">Bắt đầu</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border transition-colors hover:ring-primary/40"
            >
              <span
                aria-hidden
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${quickTones[link.tone]}`}
              >
                <link.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-text">
                  {link.label}
                </span>
                <span className="mt-0.5 block text-xs leading-tight text-text-muted">
                  {link.desc}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Chưa thuộc lớp */}
      {data && !data.classId && (
        <section
          aria-label="Tham gia lớp"
          className="flex items-start gap-4 rounded-2xl border border-warning/25 bg-warning-light p-5"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-warning">
            <UserRoundPlus aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-text">Bạn chưa vào nhà 12A6</p>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              Nhờ giáo viên hoặc lớp trưởng thêm bạn vào Lớp 12A6 để bắt đầu
              dùng đầy đủ tính năng.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}