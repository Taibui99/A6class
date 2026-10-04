"use client";

import { useState, useTransition } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Plus,
  Sparkles,
  Users,
  Award,
  AlertCircle,
  Check,
  ChevronRight,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import type { TaskItem } from "@/lib/tasks/service";
import { createTaskAction, updateTaskStatusAction } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Props = {
  tasks: TaskItem[];
  userRole?: string;
  userName?: string;
};

const TEAM_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  "Tổ 1": { bg: "bg-sky-500/15", text: "text-sky-300", ring: "ring-sky-500/30" },
  "Tổ 2": { bg: "bg-violet-500/15", text: "text-violet-300", ring: "ring-violet-500/30" },
  "Tổ 3": { bg: "bg-emerald-500/15", text: "text-emerald-300", ring: "ring-emerald-500/30" },
  "Tổ 4": { bg: "bg-amber-500/15", text: "text-amber-300", ring: "ring-amber-500/30" },
  "Cả lớp": { bg: "bg-fuchsia-500/15", text: "text-fuchsia-300", ring: "ring-fuchsia-500/30" },
};

const PRIORITY_CONFIG = {
  URGENT: { label: "Khẩn cấp", icon: Flame, badge: "bg-rose-500/15 text-rose-300 ring-rose-500/30" },
  HIGH: { label: "Quan trọng", icon: AlertCircle, badge: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  MEDIUM: { label: "Thường", icon: Clock, badge: "bg-sky-500/15 text-sky-300 ring-sky-500/30" },
  LOW: { label: "Nhẹ nhàng", icon: Sparkles, badge: "bg-slate-500/15 text-slate-300 ring-slate-500/30" },
};

export function TaskManager({ tasks: initialTasks, userRole }: Props) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterTeam, setFilterTeam] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Thống kê nhanh
  const totalCount = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const urgentCount = tasks.filter((t) => t.priority === "URGENT" || t.priority === "HIGH").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  // Lọc
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
    if (filterTeam !== "ALL") {
      if (filterTeam === "CLASS" && t.assigneeType !== "CLASS") return false;
      if (filterTeam !== "CLASS" && t.teamName !== filterTeam) return false;
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = (task: TaskItem) => {
    const nextStatus: TaskItem["status"] =
      task.status === "COMPLETED" ? "TODO" : task.status === "TODO" ? "IN_PROGRESS" : "COMPLETED";

    // Cập nhật lạc quan
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    startTransition(async () => {
      await updateTaskStatusAction(task.id, nextStatus as "TODO" | "IN_PROGRESS" | "COMPLETED");
      showToast(`Đã chuyển trạng thái sang "${nextStatus === "COMPLETED" ? "Đã xong 🎉" : "Đang làm"}"`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2">
          <Check className="size-4 stroke-[3]" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-accent/5 p-6 sm:p-8 ring-1 ring-border shadow-md">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-40 bottom-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-300 ring-1 ring-sky-500/30">
              <Sparkles className="size-3.5" />
              Kế hoạch & Hoạt động lớp 12A6
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
              Hoạt động & Nhiệm vụ theo tổ
            </h1>
            <p className="text-sm text-text-secondary max-w-xl">
              Nơi giao việc, theo dõi tiến độ nộp bài, phân công trực nhật và cộng điểm thi đua cho từng tổ xuất sắc.
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="self-start md:self-auto gap-2 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="size-4 stroke-[2.5]" />
            Giao việc / Thêm hoạt động
          </Button>
        </div>

        {/* 4 Thẻ thống kê */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-surface/80 backdrop-blur-sm p-4 ring-1 ring-border/80">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-semibold">Tổng việc</span>
              <ListTodo className="size-4 text-sky" />
            </div>
            <p className="mt-2 text-2xl font-black text-text">{totalCount}</p>
          </div>

          <div className="rounded-2xl bg-surface/80 backdrop-blur-sm p-4 ring-1 ring-border/80">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-semibold">Đang triển khai</span>
              <Clock className="size-4 text-amber" />
            </div>
            <p className="mt-2 text-2xl font-black text-amber-300">{inProgressCount}</p>
          </div>

          <div className="rounded-2xl bg-surface/80 backdrop-blur-sm p-4 ring-1 ring-border/80">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-semibold">Gấp / Quan trọng</span>
              <Flame className="size-4 text-rose-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-rose-300">{urgentCount}</p>
          </div>

          <div className="rounded-2xl bg-surface/80 backdrop-blur-sm p-4 ring-1 ring-border/80">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-xs font-semibold">Đã hoàn tất</span>
              <CheckCircle2 className="size-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-300">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Bộ lọc và Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border">
        {/* Lọc theo Trạng thái */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-text-muted mr-1.5 flex items-center gap-1">
            <Filter className="size-3.5" /> Trạng thái:
          </span>
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "TODO", label: "Cần làm" },
            { key: "IN_PROGRESS", label: "Đang làm" },
            { key: "COMPLETED", label: "Đã xong" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterStatus(item.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                filterStatus === item.key
                  ? "bg-sky-500/20 text-sky ring-1 ring-sky-500/40 shadow-sm"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Lọc theo Tổ */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-muted flex items-center gap-1">
            <Users className="size-3.5" /> Phụ trách:
          </span>
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text focus-visible:outline-2 focus-visible:outline-sky"
          >
            <option value="ALL">Mọi đối tượng</option>
            <option value="Tổ 1">Tổ 1</option>
            <option value="Tổ 2">Tổ 2</option>
            <option value="Tổ 3">Tổ 3</option>
            <option value="Tổ 4">Tổ 4</option>
            <option value="CLASS">Cả lớp</option>
          </select>
        </div>
      </div>

      {/* Danh sách nhiệm vụ dạng Grid Thẻ */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface/40 p-12 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface-hover text-text-muted">
            <ListTodo className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-text">Không có hoạt động nào phù hợp</h3>
          <p className="mt-1 text-xs text-text-secondary">Hãy thử đổi bộ lọc hoặc thêm việc mới cho lớp nhé!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => {
            const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
            const PriorityIcon = priorityInfo.icon;
            const teamStyle = task.teamName ? TEAM_COLORS[task.teamName] ?? TEAM_COLORS["Cả lớp"] : null;
            const isDone = task.status === "COMPLETED";
            const isInProgress = task.status === "IN_PROGRESS";

            return (
              <div
                key={task.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface p-5 ring-1 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  isDone
                    ? "ring-emerald-500/25 bg-emerald-950/10 opacity-80"
                    : "ring-border hover:ring-sky-500/40"
                }`}
              >
                {/* Viền màu nhỏ phía trên thể hiện trạng thái */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isDone ? "bg-emerald-500" : isInProgress ? "bg-amber-500" : "bg-sky-500"
                  }`}
                />

                <div className="space-y-3">
                  {/* Badges đầu thẻ */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${priorityInfo.badge}`}
                    >
                      <PriorityIcon className="size-3" />
                      {priorityInfo.label}
                    </span>

                    {task.points ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 ring-1 ring-amber-500/30">
                        <Award className="size-3" />+{task.points} điểm thi đua
                      </span>
                    ) : null}
                  </div>

                  {/* Tiêu đề & mô tả */}
                  <div>
                    <h3
                      className={`text-base font-bold tracking-tight text-text line-clamp-2 ${
                        isDone ? "line-through text-text-muted" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="mt-1.5 text-xs leading-relaxed text-text-secondary line-clamp-3">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Thông tin phụ trách & hạn chót */}
                  <div className="space-y-2 pt-2 border-t border-border/70 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center gap-1">
                        <Users className="size-3.5" /> Phụ trách:
                      </span>
                      {teamStyle ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold ring-1 ${teamStyle.bg} ${teamStyle.text} ${teamStyle.ring}`}
                        >
                          {task.teamName}
                        </span>
                      ) : (
                        <span className="font-semibold text-text">
                          {task.assigneeType === "CLASS" ? "Cả lớp" : "Cá nhân"}
                        </span>
                      )}
                    </div>

                    {task.deadline && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted flex items-center gap-1">
                          <Calendar className="size-3.5" /> Hạn chót:
                        </span>
                        <span className="font-semibold text-sky-300">
                          {new Intl.DateTimeFormat("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(task.deadline))}
                        </span>
                      </div>
                    )}

                    {task.creatorName && (
                      <div className="text-[11px] text-text-muted truncate">
                        Giao bởi: <span className="text-text font-medium">{task.creatorName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30"
                        : isInProgress
                        ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500/30"
                        : "bg-surface-hover text-text-secondary hover:text-text hover:bg-surface-elevated ring-1 ring-border"
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="size-3.5" /> Đã hoàn thành
                      </>
                    ) : isInProgress ? (
                      <>
                        <Clock className="size-3.5" /> Đang triển khai
                      </>
                    ) : (
                      <>
                        <ListTodo className="size-3.5" /> Cần làm (Bấm để nhận)
                      </>
                    )}
                  </button>

                  <span className="text-[11px] font-semibold text-text-muted flex items-center gap-0.5">
                    {task.submissionCount > 0 ? `${task.submissionCount} nộp` : "Chưa nộp"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tạo Hoạt Động Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-surface p-6 ring-1 ring-border shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-text">Giao việc / Thêm hoạt động mới</h3>
                <p className="text-xs text-text-secondary">Tạo nhiệm vụ cho các tổ hoặc toàn bộ lớp</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-text-muted hover:bg-surface-hover hover:text-text"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                const title = formData.get("title") as string;
                const points = Number(formData.get("points")) || 10;
                const priority = (formData.get("priority") as TaskItem["priority"]) || "MEDIUM";
                const teamName = formData.get("teamName") as string;

                // Thêm vào UI ngay lập tức
                const newTask: TaskItem = {
                  id: "task-" + Date.now(),
                  title,
                  description: (formData.get("description") as string) || null,
                  deadline: formData.get("deadline") ? new Date(formData.get("deadline") as string) : null,
                  priority,
                  status: "TODO",
                  points,
                  assigneeType: teamName === "Cả lớp" ? "CLASS" : "TEAM",
                  teamId: null,
                  teamName: teamName || "Cả lớp",
                  creatorName: "Bạn (Cán sự)",
                  submissionCount: 0,
                  createdAt: new Date(),
                };

                setTasks((prev) => [newTask, ...prev]);
                setShowCreateModal(false);
                showToast("Đã giao việc mới cho lớp thành công! 🚀");

                await createTaskAction({ ok: true, message: "" }, formData);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-text mb-1">Tiêu đề hoạt động / nhiệm vụ *</label>
                <Input
                  name="title"
                  placeholder="Ví dụ: Chuẩn bị trang trí báo tường 20/11..."
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-text mb-1">Mô tả chi tiết</label>
                <Textarea
                  name="description"
                  placeholder="Ghi rõ yêu cầu, các bạn cần chuẩn bị những gì..."
                  rows={3}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text mb-1">Đối tượng phụ trách</label>
                  <select
                    name="teamName"
                    className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text focus-visible:outline-2 focus-visible:outline-sky"
                  >
                    <option value="Cả lớp">Cả lớp 12A6</option>
                    <option value="Tổ 1">Tổ 1</option>
                    <option value="Tổ 2">Tổ 2</option>
                    <option value="Tổ 3">Tổ 3</option>
                    <option value="Tổ 4">Tổ 4</option>
                    <option value="Các Tổ trưởng">Các Tổ trưởng</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">Mức độ ưu tiên</label>
                  <select
                    name="priority"
                    className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text focus-visible:outline-2 focus-visible:outline-sky"
                  >
                    <option value="URGENT">🔥 Khẩn cấp</option>
                    <option value="HIGH">⚡ Quan trọng</option>
                    <option value="MEDIUM">Thường</option>
                    <option value="LOW">Nhẹ nhàng</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text mb-1">Hạn chót (Deadline)</label>
                  <Input
                    name="deadline"
                    type="datetime-local"
                    className="h-10 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">Điểm thi đua thưởng (+)</label>
                  <Input
                    name="points"
                    type="number"
                    defaultValue="15"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl text-xs"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                >
                  Tạo và giao việc
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
