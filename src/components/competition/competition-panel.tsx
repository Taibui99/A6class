"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Crown,
  Flame,
  Medal,
  Search,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import {
  POSITIVE_CATEGORIES,
  NEGATIVE_CATEGORIES,
} from "@/lib/competition/config";
import { recordCompetitionPoint } from "@/lib/competition/actions";
import { cn } from "@/lib/utils";

export type CompetitionStudent = {
  id: string;
  name: string;
  teamName: string;
  score: number;
};

export type CompetitionTeam = {
  id: string;
  name: string;
  score: number;
  memberCount: number;
};

export type CompetitionEvent = {
  id: string;
  amount: number;
  reason: string;
  targetName: string;
  giverName: string;
  createdAt: string;
};

type Props = {
  className: string;
  schoolYear: string;
  students: CompetitionStudent[];
  teams: CompetitionTeam[];
  events: CompetitionEvent[];
  canManage: boolean;
  hasDatabaseClass: boolean;
};

type Tab = "teams" | "students" | "history";

const podiumStyles = [
  {
    label: "Quán quân",
    ring: "ring-warning/30",
    icon: Crown,
    iconClass: "text-warning",
    badge: "bg-warning-light text-warning",
  },
  {
    label: "Á quân",
    ring: "ring-border",
    icon: Medal,
    iconClass: "text-text-secondary",
    badge: "bg-surface-hover text-text-secondary",
  },
  {
    label: "Hạng ba",
    ring: "ring-warning/20",
    icon: Medal,
    iconClass: "text-warning/80",
    badge: "bg-warning-light/70 text-warning",
  },
];

const tabStyles: { id: Tab; label: string }[] = [
  { id: "teams", label: "Bảng tổ" },
  { id: "students", label: "Cá nhân" },
  { id: "history", label: "Lịch sử" },
];

export function CompetitionPanel({
  className,
  schoolYear,
  students,
  teams,
  events,
  canManage,
  hasDatabaseClass,
}: Props) {
  const [tab, setTab] = useState<Tab>("teams");
  const [search, setSearch] = useState("");
  const [targetType, setTargetType] = useState<"student" | "team">("student");

  const sortedTeams = useMemo(
    () =>
      [...teams].sort(
        (a, b) => b.score - a.score || a.name.localeCompare(b.name, "vi"),
      ),
    [teams],
  );
  const sortedStudents = useMemo(
    () =>
      [...students].sort(
        (a, b) => b.score - a.score || a.name.localeCompare(b.name, "vi"),
      ),
    [students],
  );
  const leaderScore = Math.max(0, ...sortedTeams.map((team) => team.score));
  const hasScores = events.length > 0;
  const query = search.trim().toLocaleLowerCase("vi");
  const visibleStudents = query
    ? sortedStudents.filter((student) =>
        student.name.toLocaleLowerCase("vi").includes(query),
      )
    : sortedStudents;

  return (
    <section aria-label="Thi đua" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-text">
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-lg bg-warning-light text-warning"
          >
            <Trophy className="size-4" />
          </span>
          Thi đua {className}
          <span className="text-xs font-medium text-text-muted">
            {schoolYear}
          </span>
        </h2>
      </div>

      {!hasDatabaseClass && (
        <p className="rounded-xl bg-warning-light px-4 py-3 text-xs leading-relaxed text-text-secondary">
          Danh sách lớp đã nhập sẵn nhưng chưa liên kết với dữ liệu A6Class.
          Bảng đang hiển thị 0 điểm, chưa phải kết quả thi đua đã xác nhận.
        </p>
      )}

      <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <Users aria-hidden className="size-3.5" />
              {students.length} học sinh
            </span>
            <span className="flex items-center gap-1.5">
              <Flame aria-hidden className="size-3.5 text-warning" />
              Cao nhất {leaderScore} đ
            </span>
          </div>
          <div
            role="tablist"
            aria-label="Chọn bảng thi đua"
            className="flex rounded-xl bg-surface-hover p-1"
          >
            {tabStyles.map((item) => (
              <button
                key={item.id}
                role="tab"
                type="button"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                  tab === item.id
                    ? "bg-surface text-primary shadow-sm"
                    : "text-text-secondary hover:text-text",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "teams" && (
          <div className="mt-5 space-y-2">
            {sortedTeams.length === 0 ? (
              <EmptyState text="Lớp chưa có tổ nào để thi đua." />
            ) : (
              sortedTeams.map((team, index) => {
                const style = podiumStyles[index];
                const Icon = style?.icon ?? Users;
                const width =
                  leaderScore > 0 ? (team.score / leaderScore) * 100 : 0;
                return (
                  <div
                    key={team.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3",
                      index === 0 && leaderScore > 0
                        ? "bg-warning-light/60 ring-1 ring-warning/25"
                        : "bg-surface-hover/60",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold",
                        style?.badge ?? "bg-surface text-text-muted",
                      )}
                    >
                      {index < 3 ? <Icon className={cn("size-4", style?.iconClass)} /> : index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-text">
                        {team.name}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {team.memberCount} thành viên
                      </p>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${Math.max(0, width)}%` }}
                        />
                      </div>
                    </div>
                    <p className="shrink-0 text-base font-extrabold tabular-nums text-text">
                      {team.score}
                      <span className="ml-0.5 text-[11px] font-medium text-text-muted">
                        đ
                      </span>
                    </p>
                  </div>
                );
              })
            )}
            {!hasScores && (
              <p className="pt-2 text-center text-xs text-text-muted">
                Chưa có giao dịch điểm trong kỳ thi đua. Thứ hạng tự cập nhật
                khi có dữ liệu.
              </p>
            )}
          </div>
        )}

        {tab === "students" && (
          <div className="mt-5 space-y-3">
            <label className="flex items-center gap-2 rounded-xl bg-surface-hover px-3 py-2">
              <Search aria-hidden className="size-4 shrink-0 text-text-muted" />
              <span className="sr-only">Tìm học sinh</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm học sinh…"
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
              />
            </label>
            <ul className="divide-y divide-border">
              {visibleStudents.length === 0 ? (
                <li>
                  <EmptyState text="Không tìm thấy học sinh nào." />
                </li>
              ) : (
                visibleStudents.slice(0, 50).map((student, index) => (
                  <li
                    key={student.id}
                    className="flex items-center gap-3 px-1 py-2.5"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold tabular-nums",
                        index === 0 && student.score > 0
                          ? "bg-warning-light text-warning"
                          : "bg-surface-hover text-text-muted",
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {student.teamName}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-text">
                      {student.score}
                      <span className="ml-0.5 text-[11px] font-medium text-text-muted">
                        đ
                      </span>
                    </span>
                  </li>
                ))
              )}
            </ul>
            {visibleStudents.length > 50 && (
              <p className="text-center text-xs text-text-muted">
                Hiển thị 50/{visibleStudents.length} học sinh — dùng ô tìm kiếm
                để lọc.
              </p>
            )}
          </div>
        )}

        {tab === "history" && (
          <ul className="mt-5 space-y-2">
            {events.length === 0 ? (
              <EmptyState text="Chưa có lịch sử điểm trong kỳ này." />
            ) : (
              events.map((event) => (
                <li
                  key={event.id}
                  className="flex items-start gap-3 rounded-xl bg-surface-hover/60 px-3 py-3"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                      event.amount >= 0
                        ? "bg-success-light text-secondary"
                        : "bg-danger-light text-danger",
                    )}
                  >
                    {event.amount >= 0 ? (
                      <ArrowUpRight className="size-4" />
                    ) : (
                      <ArrowDownRight className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text">
                      {event.targetName}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                      {event.reason}
                    </p>
                    <p className="mt-1 text-[11px] text-text-muted">
                      Ghi bởi {event.giverName} ·{" "}
                      {new Date(event.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-extrabold tabular-nums",
                      event.amount >= 0 ? "text-secondary" : "text-danger",
                    )}
                  >
                    {event.amount > 0 ? "+" : ""}
                    {event.amount}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {canManage && hasDatabaseClass && (
        <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border">
          <h3 className="flex items-center gap-2 text-sm font-bold text-text">
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-lg bg-primary-light text-primary"
            >
              <ShieldCheck className="size-4" />
            </span>
            Ghi nhận điểm thi đua
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            Chỉ giáo viên và thành viên ban cán sự được phân quyền.
          </p>
          <form
            action={recordCompetitionPoint}
            className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="text-xs font-semibold text-text-secondary">
              Đối tượng
              <select
                name="targetType"
                value={targetType}
                onChange={(event) =>
                  setTargetType(event.target.value as "student" | "team")
                }
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text"
              >
                <option value="student">Học sinh</option>
                <option value="team">Tổ</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-text-secondary">
              Học sinh / tổ
              <select
                name="targetId"
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text"
              >
                {targetType === "student"
                  ? students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} · {student.teamName}
                      </option>
                    ))
                  : teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-text-secondary">
              Loại ghi nhận
              <select
                name="category"
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text"
              >
                <optgroup label="Điểm cộng">
                  {POSITIVE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      + · {category}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Điểm trừ">
                  {NEGATIVE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      − · {category}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <label className="text-xs font-semibold text-text-secondary">
              Số điểm (+/−)
              <input
                name="amount"
                type="number"
                min="-100"
                max="100"
                step="1"
                defaultValue="1"
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text"
              />
            </label>
            <label className="text-xs font-semibold text-text-secondary sm:col-span-2 lg:col-span-2">
              Ghi chú (không bắt buộc)
              <input
                name="note"
                maxLength={240}
                placeholder="Ví dụ: phát biểu trong tiết Toán…"
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
              >
                <Flame aria-hidden className="size-4" />
                Ghi nhận điểm
              </button>
            </div>
          </form>
          <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
            File Excel không ghi mức điểm cụ thể cho từng hành vi. Nhập đúng số
            điểm theo quy định lớp; hệ thống không tự áp đặt mức điểm.
          </p>
        </div>
      )}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">
      {text}
    </p>
  );
}