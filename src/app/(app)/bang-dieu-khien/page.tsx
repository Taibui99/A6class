import { redirect } from "next/navigation";
import {
  Trophy,
  Medal,
  Users,
  ListTodo,
  Megaphone,
  UserRoundPlus,
  Pin,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import { getDashboardSummary, type DashboardTask } from "@/lib/dashboard";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";

const priorityInfo: Record<
  DashboardTask["priority"],
  { label: string; className: string }
> = {
  URGENT: { label: "Khẩn cấp", className: "bg-danger-light text-danger" },
  HIGH: { label: "Cao", className: "bg-warning-light text-warning" },
  MEDIUM: { label: "Trung bình", className: "bg-primary-light text-primary" },
  LOW: { label: "Thấp", className: "bg-surface-hover text-text-secondary border border-border" },
};

function PageHeader({
  greeting,
  name,
  date,
  className,
}: {
  greeting: string;
  name: string;
  date: string;
  className?: string | null;
}) {
  return (
    <header className="mb-6">
      <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
        {greeting}, <span className="text-primary">{name.split(" ").slice(-1)[0]}</span>
      </h1>
      <p className="mt-0.5 text-sm text-text-secondary">
        {date}
        {className ? ` · ${className}` : ""}
      </p>
    </header>
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

  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);

  return (
    <div className="space-y-8">
      <PageHeader
        greeting={greeting}
        name={user.fullName}
        date={today}
        className={data?.className}
      />

      {/* Thống kê nhanh */}
      <section aria-label="Thống kê nhanh" className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Trophy}
          label="Điểm thi đua"
          value={formatNumber(data?.totalPoints ?? 0)}
          sub="Tổng điểm cá nhân"
          tone="accent"
        />
        <StatCard
          icon={Medal}
          label="Hạng cá nhân"
          value={data?.personalRank ? `#${data.personalRank}` : "—"}
          sub={data?.personalRank ? "Trong lớp" : "Chưa có dữ liệu"}
          tone="primary"
        />
        <StatCard
          icon={Users}
          label="Đội của tôi"
          value={data?.team?.name ?? "Chưa có"}
          sub={
            data?.team
              ? `${formatNumber(data.team.totalScore)} điểm · Hạng ${data.team.rank ?? "—"}`
              : "Anh chị em cùng bàn"
          }
          tone="secondary"
        />
      </section>

      {/* Nhiệm vụ + thông tin bên phải */}
      <section
        aria-label="Nội dung chính"
        className="grid gap-6 lg:grid-cols-5 lg:items-start"
      >
        {/* Nhiệm vụ */}
        <div className="lg:col-span-3">
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                <ListTodo aria-hidden="true" className="size-4 text-primary" />
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
                description="Khi giáo viên hoặc tổ trưởng giao nhiệm vụ, danh sách sẽ hiện ngay tại đây."
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

        {/* Cột phải */}
        <div className="space-y-6 lg:col-span-2">
          {/* Đội */}
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
              <Users aria-hidden="true" className="size-4 text-secondary" />
              Đội của tôi
            </h2>
            {data?.team ? (
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="size-3 shrink-0 rounded-full bg-secondary"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-text">
                    {data.team.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatNumber(data.team.totalScore)} điểm · hạng{" "}
                    {data.team.rank ?? "—"}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Chưa tham gia đội"
                description="Khi được phân công vào đội, thông tin thi đua của đội sẽ hiển thị ở đây."
              />
            )}
          </div>

          {/* Thông báo */}
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
              <Megaphone aria-hidden="true" className="size-4 text-warning" />
              Thông báo mới
            </h2>
            {!data || data.announcements.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="Chưa có thông báo"
                description="Thông báo từ lớp sẽ xuất hiện ở đây."
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
                        aria-hidden="true"
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
        <section aria-label="Tham gia lớp" className="lg:w-3/5">
          <EmptyState
            icon={UserRoundPlus}
            title="Bạn chưa thuộc lớp nào"
            description="Nhờ giáo viên hoặc người quản lý lớp thêm bạn vào Lớp 11A6 để bắt đầu sử dụng đầy đủ tính năng."
          />
        </section>
      )}
    </div>
  );
}