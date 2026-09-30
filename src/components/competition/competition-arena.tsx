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
  Sparkles,
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

/* Bảng màu dùng chung với splash: nền #070B1A, nhấn sky→violet. */
const RING =
  "relative overflow-hidden rounded-3xl bg-[#070B1A] text-white ring-1 ring-white/10";

const podiumStyles = [
  {
    label: "Quán quân",
    icon: Crown,
    iconClass: "text-amber-300",
    chip: "bg-amber-300/15 text-amber-200 ring-amber-300/30",
    bar: "from-amber-300 to-orange-300",
    lift: "sm:-mt-5",
    glow: "shadow-[0_18px_46px_-16px_rgba(251,191,36,.5)]",
  },
  {
    label: "Á quân",
    icon: Medal,
    iconClass: "text-slate-200",
    chip: "bg-white/10 text-slate-200 ring-white/15",
    bar: "from-slate-200 to-slate-400",
    lift: "sm:mt-2",
    glow: "",
  },
  {
    label: "Hạng ba",
    icon: Medal,
    iconClass: "text-orange-300",
    chip: "bg-orange-300/15 text-orange-200 ring-orange-300/25",
    bar: "from-orange-300 to-rose-300",
    lift: "sm:mt-6",
    glow: "",
  },
] as const;

const tabs: { id: Tab; label: string }[] = [
  { id: "teams", label: "Bảng tổ" },
  { id: "students", label: "Cá nhân" },
  { id: "history", label: "Lịch sử" },
];

export function CompetitionArena({
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

  const leaderScore = Math.max(0, ...sortedTeams.map((t) => t.score));
  const topStudent = sortedStudents[0];
  const hasScores = events.length > 0;
  const query = search.trim().toLocaleLowerCase("vi");
  const visibleStudents = query
    ? sortedStudents.filter((s) =>
        s.name.toLocaleLowerCase("vi").includes(query),
      )
    : sortedStudents;
  const podium = sortedTeams.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* ── Đầu trang ─────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-400/80">
            <Sparkles aria-hidden className="size-3.5" />
            Đấu trường lớp
          </p>
          <h1 className="mt-1 flex flex-wrap items-baseline gap-x-2 text-2xl font-black tracking-tight text-text sm:text-3xl">
            Thi đua {className}
            <span className="text-sm font-semibold text-text-muted">
              {schoolYear}
            </span>
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-text-secondary">
            Mỗi tuần là một trận. Tích lũi điểm, bứt hạng và mở khóa danh hiệu —
            công bằng, minh bạch, có lịch sử.
          </p>
        </div>

        <dl className="flex shrink-0 gap-2">
          {[
            { icon: Users, label: "Học sinh", value: students.length },
            {
              icon: Flame,
              label: "Tổ dẫn đầu",
              value: leaderScore,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-surface px-4 py-3 shadow-sm ring-1 ring-border"
            >
              <dt className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
                <stat.icon aria-hidden className="size-3.5" />
                {stat.label}
              </dt>
              <dd className="mt-1 text-xl font-extrabold tabular-nums text-text">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {!hasDatabaseClass && (
        <p className="rounded-2xl border border-warning/25 bg-warning-light px-4 py-3 text-xs leading-relaxed text-text-secondary">
          <strong className="font-bold text-text">
            Danh sách đã được nhập từ Excel.
          </strong>{" "}
          Để lưu điểm thật cần liên kết lớp {className} và thành viên với dữ
          liệu A6Class. Bảng đang hiển thị 0 điểm, không phải kết quả thi đua đã
          xác nhận.
        </p>
      )}

      {/* ── Bảng xếp hạng ─────────────────────────────────── */}
      <section className={cn(RING, "p-4 sm:p-6")}>
        {/* Quầng sáng trang trí — cùng tinh thần splash */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-sky-500/15 blur-[80px]" />
          <span className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-violet-500/15 blur-[80px]" />
          <span
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize: "46px 46px",
            }}
          />
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Trophy aria-hidden className="size-4 text-amber-300" />
            Bảng vinh danh
          </h2>

          <div
            role="tablist"
            aria-label="Chọn bảng thi đua"
            className="flex rounded-xl border border-white/10 bg-black/25 p-1"
          >
            {tabs.map((item) => (
              <button
                key={item.id}
                role="tab"
                type="button"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  tab === item.id
                    ? "bg-gradient-to-r from-sky-400 to-violet-300 text-[#070B1A] shadow"
                    : "text-slate-300 hover:bg-white/10",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bảng tổ ─────────────────────────────────────── */}
        {tab === "teams" && (
          <div className="relative mt-5">
            {sortedTeams.length === 0 ? (
              <Empty text="Lớp chưa có tổ nào để thi đua." />
            ) : (
              <>
                {podium.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {podium.map((team, index) => {
                      const style = podiumStyles[index];
                      const Icon = style.icon;
                      const pct =
                        leaderScore > 0
                          ? (team.score / leaderScore) * 100
                          : 0;
                      return (
                        <article
                          key={team.id}
                          className={cn(
                            "relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4",
                            style.glow,
                            style.lift,
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ring-1",
                              style.chip,
                            )}
                          >
                            <Icon aria-hidden className="size-3.5" />
                            {style.label}
                          </span>
                          <p className="mt-3 truncate text-lg font-black text-white">
                            {team.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {team.memberCount} thành viên
                          </p>
                          <p className="mt-2 text-3xl font-black tabular-nums text-white">
                            {team.score}
                            <span className="ml-1 text-xs font-bold text-slate-400">
                              đ
                            </span>
                          </p>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">
                            <div
                              className={cn(
                                "h-full rounded-full bg-gradient-to-r transition-[width] duration-700",
                                style.bar,
                              )}
                              style={{ width: `${Math.max(0, pct)}%` }}
                            />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {sortedTeams.length > 3 && (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {sortedTeams.slice(3).map((team, index) => (
                      <li
                        key={team.id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-black text-slate-300 tabular-nums">
                          #{index + 4}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">
                            {team.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {team.memberCount} thành viên
                          </p>
                        </div>
                        <p className="shrink-0 text-lg font-black tabular-nums text-white">
                          {team.score}
                          <span className="ml-0.5 text-[11px] font-bold text-slate-400">
                            đ
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                {!hasScores && (
                  <p className="mt-4 text-center text-xs text-slate-500">
                    Chưa có giao dịch điểm trong kỳ thi đua. Thứ hạng tự cập
                    nhật khi có dữ liệu.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Bảng cá nhân ─────────────────────────────────── */}
        {tab === "students" && (
          <div className="relative mt-5">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
              <Search aria-hidden className="size-4 shrink-0 text-slate-400" />
              <span className="sr-only">Tìm học sinh</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm học sinh…"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>

            {topStudent && hasScores && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-amber-300/10 px-3 py-2 text-xs text-amber-100 ring-1 ring-amber-300/20">
                <Crown aria-hidden className="size-4 shrink-0 text-amber-300" />
                <span className="truncate">
                  <strong className="font-bold">{topStudent.name}</strong> đang
                  dẫn đầu cá nhân với{" "}
                  <strong className="font-bold tabular-nums">
                    {topStudent.score} đ
                  </strong>
                </span>
              </p>
            )}

            <ul className="mt-3 divide-y divide-white/[0.07]">
              {visibleStudents.length === 0 ? (
                <Empty text="Không tìm thấy học sinh nào." />
              ) : (
                visibleStudents.slice(0, 60).map((student, index) => (
                  <li
                    key={student.id}
                    className="flex items-center gap-3 px-1 py-2.5"
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg text-xs font-black tabular-nums",
                        index === 0 && student.score > 0
                          ? "bg-amber-300 text-[#070B1A]"
                          : "bg-white/5 text-slate-300",
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {student.teamName}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-black tabular-nums text-white">
                      {student.score}
                      <span className="ml-0.5 text-[11px] font-medium text-slate-500">
                        đ
                      </span>
                    </p>
                  </li>
                ))
              )}
            </ul>

            {visibleStudents.length > 60 && (
              <p className="mt-2 text-center text-xs text-slate-500">
                Hiển thị 60/{visibleStudents.length} học sinh — dùng ô tìm kiếm
                để lọc.
              </p>
            )}
          </div>
        )}

        {/* ── Lịch sử ─────────────────────────────────────── */}
        {tab === "history" && (
          <ul className="relative mt-5 space-y-2">
            {events.length === 0 ? (
              <Empty text="Chưa có lịch sử điểm trong kỳ này." />
            ) : (
              events.map((event) => (
                <li
                  key={event.id}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                      event.amount >= 0
                        ? "bg-emerald-300/15 text-emerald-300"
                        : "bg-rose-300/15 text-rose-300",
                    )}
                  >
                    {event.amount >= 0 ? (
                      <ArrowUpRight className="size-4" />
                    ) : (
                      <ArrowDownRight className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">
                      {event.targetName}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                      {event.reason}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Ghi bởi {event.giverName} ·{" "}
                      {new Date(event.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-black tabular-nums",
                      event.amount >= 0 ? "text-emerald-300" : "text-rose-300",
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
      </section>

      {/* ── Ghi nhận điểm ──────────────────────────────────── */}
      {canManage && hasDatabaseClass && (
        <section className="rounded-3xl bg-surface p-5 shadow-sm ring-1 ring-border">
          <h2 className="flex items-center gap-2 text-sm font-bold text-text">
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-lg bg-primary-light text-primary"
            >
              <ShieldCheck className="size-4" />
            </span>
            Ghi nhận điểm thi đua
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Chỉ giáo viên và thành viên ban cán sự được phân quyền mới thấy biểu
            mẫu này.
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
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
              >
                <option value="student">Học sinh</option>
                <option value="team">Tổ</option>
              </select>
            </label>

            <label className="text-xs font-semibold text-text-secondary">
              Học sinh / tổ
              <select
                name="targetId"
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
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
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
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
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
              />
            </label>

            <label className="text-xs font-semibold text-text-secondary sm:col-span-2">
              Ghi chú (không bắt buộc)
              <input
                name="note"
                maxLength={240}
                placeholder="Ví dụ: phát biểu trong tiết Toán…"
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2"
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
        </section>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <li className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-slate-400">
      {text}
    </li>
  );
}