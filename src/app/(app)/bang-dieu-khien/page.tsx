import { redirect } from "next/navigation";
import {
  Trophy,
  Medal,
  Users,
  ListTodo,
  Megaphone,
  UserRoundPlus,
  Pin,
  School,
  Sparkles,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import { getDashboardSummary, type DashboardTask } from "@/lib/dashboard";
import {
  formatNumber,
  formatRelativeTime,
  getInitials,
} from "@/lib/utils";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";

const priorityInfo: Record<
  DashboardTask["priority"],
  { label: string; className: string }
> = {
  URGENT: { label: "Khẩn cấp", className: "bg-danger-light text-danger" },
  HIGH: { label: "Cao", className: "bg-warning-light text-warning" },
  MEDIUM: { label: "Trung bình", className: "bg-primary-light text-primary" },
  LOW: {
    label: "Thấp",
    className: "bg-surface-hover text-text-secondary border border-border",
  },
};

const roleLabels: Record<string, string> = {
  TEACHER: "Giáo viên",
  STUDENT: "Học sinh",
};

function Chip({
  icon: Icon,
  label,
  className,
}: {
  icon: React.ComponentType<{ "aria-hidden"?: boolean; className?: string }>;
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

  const points = data?.totalPoints ?? 0;
  const rank = data?.personalRank ?? null;
  const team = data?.team ?? null;

  return (
    <div className="space-y-8">
      {/* Chào mừng — đúng kiểu ngôi nhà của lớp */}
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
            {(roleLabels[user.role] ?? "Thành viên") && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary ring-1 ring-border">
                {roleLabels[user.role] ?? "Thành viên"}
              </span>
            )}
            {team && (
              <Chip
                icon={Users}
                label={team.name}
                className="bg-success-light text-secondary"
              />
            )}
          </div>
        </div>
        <span
          aria-hidden
          className="grid size-12 shrink-0 select-none place-items-center rounded-2xl bg-primary-light text-sm font-extrabold text-primary sm:size-14 sm:text-base"
        >
          {getInitials(user.fullName)}
        </span>
      </section>

      {/* Bảng thi đua cá nhân — một thẻ thay cho 3 mảnh nhỏ */}
      <section
        aria-label="Thi đua của tôi"
        className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border"
      >
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="px-3 py-4 text-center sm:px-5 sm:py-5">
            <div className="mx-auto flex w-fit items-center gap-1 text-text-muted">
              <Trophy aria-hidden className="size-3.5" />
              <p className="text-[11px] font-medium">Điểm thi đua</p>
            </div>
            <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-warning sm:text-3xl">
              {formatNumber(points)}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {points > 0 ? "tổng điểm cá nhân" : "chưa có điểm thi đua"}
            </p>
          </div>
          <div className="px-3 py-4 text-center sm:px-5 sm:py-5">
            <div className="mx-auto flex w-fit items-center gap-1 text-text-muted">
              <Medal aria-hidden className="size-3.5" />
              <p className="text-[11px] font-medium">Hạng cá nhân</p>
            </div>
            <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
              {rank ? `#${rank}` : "—"}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {rank ? "trong lớp" : "chưa có dữ liệu"}
            </p>
          </div>
          <div className="px-3 py-4 text-center sm:px-5 sm:py-5">
            <div className="mx-auto flex w-fit items-center gap-1 text-text-muted">
              <Users aria-hidden className="size-3.5" />
              <p className="text-[11px] font-medium">Đội của tôi</p>
            </div>
            <p className="mt-1.5 truncate text-2xl font-extrabold tracking-tight text-secondary sm:text-3xl">
              {team ? team.name : "Chưa có"}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {team
                ? `${formatNumber(team.totalScore)} điểm · hạng ${team.rank ?? "—"}`
                : "anh chị em cùng bàn"}
            </p>
          </div>
        </div>
      </section>

      {/* Nhiệm vụ + chuyện của lớp */}
      <section
        aria-label="Nội dung chính"
        className="grid gap-6 lg:grid-cols-5 lg:items-start"
      >
        {/* Nhiệm vụ của tôi */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-text">
                <span className="grid size-7 place-items-center rounded-lg bg-primary-light text-primary">
                  <ListTodo aria-hidden className="size-4" />
                </span>
                Nhiệm vụ của tôi
              </h2>
              {data && data.pendingTaskCount > 0 && (
                <Badge className="bg-primary-light text-primary">
                  {data.pendingTaskCount} đang chờ
                </Badge>
              )}
            </div>

            {!data || data.pendingTasks.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title="Thảnh thơi! Chưa có nhiệm vụ mới"
                description="Khi giáo viên hoặc tổ trưởng giao việc, danh sách sẽ hiện ngay tại đây."
              />
            ) : (
              <ul className="divide-y divide-border">
                {data.pendingTasks.map((task) => {
                  const p = priorityInfo[task.priority];
                  return (
                    <li
                      key={task.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
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
                      <Badge className={p.className}>{p.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Chuyện của lớp */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-text">
              <span className="grid size-7 place-items-center rounded-lg bg-warning-light text-warning">
                <Megaphone aria-hidden className="size-4" />
              </span>
              Lớp nói gì?
            </h2>
            {!data || data.announcements.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="Lớp đang yên lặng"
                description="Thông báo từ giáo viên và ban cán sự sẽ xuất hiện ở đây."
              />
            ) : (
              <ul className="space-y-3">
                {data.announcements.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-surface-hover"
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
            )}
          </div>
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
            <p className="font-bold text-text">Bạn chưa vào nhà 11A6</p>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              Nhờ giáo viên hoặc lớp trưởng thêm bạn vào Lớp 11A6 để bắt đầu
              dùng đầy đủ tính năng.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}