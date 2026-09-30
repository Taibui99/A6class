"use client";

import { useMemo, useState, useActionState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Crown,
  Flame,
  Loader2,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
  Trophy,
  Users,
} from "lucide-react";
import {
  POSITIVE_CATEGORIES,
  NEGATIVE_CATEGORIES,
  ROSTER,
} from "@/lib/competition/config";
import { recordCompetitionPoint } from "@/lib/competition/actions";
import { cn } from "@/lib/utils";

export type CompetitionStudent = {
  id: string;
  name: string;
  teamName: string;
  teamId: string | null;
  score: number;
};

export type CompetitionTeam = {
  id: string;
  name: string;
  score: number;
  memberCount: number;
  color: string | null;
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
  meId: string | null;
  period: { name: string; start: string; end: string; daysLeft: number } | null;
  trend: { label: string; amount: number }[];
  teamPointsDirect: number;
  teamPointsFromMembers: number;
};

type Tab = "teams" | "students" | "history";

type FormState = { ok: boolean; message: string } | null;

const NEON = "relative overflow-hidden rounded-3xl bg-surface text-text shadow-md ring-1 ring-border";
const FIELD =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25";

const podiumStyles = [
  {
    label: "Quán quân",
    icon: Crown,
    chip: "bg-amber-300/15 text-amber-200 ring-amber-300/30",
    lift: "sm:-mt-5",
    glow: "shadow-[0_18px_46px_-16px_rgba(251,191,36,.45)]",
  },
  {
    label: "Á quân",
    icon: Medal,
    chip: "bg-slate-300/15 text-slate-200 ring-slate-300/25",
    lift: "sm:mt-2",
    glow: "",
  },
  {
    label: "Hạng ba",
    icon: Medal,
    chip: "bg-orange-300/15 text-orange-200 ring-orange-300/25",
    lift: "sm:mt-6",
    glow: "",
  },
] as const;

const fallbackTeamColors = [
  "#38BDF8",
  "#A78BFA",
  "#34D399",
  "#FBBF24",
  "#FB7185",
  "#06B6D4",
];

const tabs: { id: Tab; label: string }[] = [
  { id: "teams", label: "Bảng tổ" },
  { id: "students", label: "Cá nhân" },
  { id: "history", label: "Lịch sử" },
];

const fmtDay = (iso: string) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(
    new Date(iso),
  );

export function CompetitionArena(props: Props) {
  const {
    className,
    schoolYear,
    students,
    teams,
    events,
    canManage,
    hasDatabaseClass,
    meId,
    period,
    trend,
    teamPointsDirect,
    teamPointsFromMembers,
  } = props;

  const [tab, setTab] = useState<Tab>("teams");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [targetType, setTargetType] = useState<"student" | "team">("student");
  const [formState, formAction, formPending] = useActionState<
    FormState,
    FormData
  >(async (_prev, formData) => {
    try {
      await recordCompetitionPoint(formData);
      return { ok: true, message: "Đã ghi nhận điểm." };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error ? error.message : "Không ghi nhận được điểm.",
      };
    }
  }, null);

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

  const teamColor = (team: CompetitionTeam, index: number) =>
    team.color ?? fallbackTeamColors[index % fallbackTeamColors.length];

  const leaderScore = Math.max(0, ...sortedTeams.map((t) => t.score));
  const hasScores = events.length > 0;
  const myTeamId = meId
    ? (students.find((s) => s.id === meId)?.teamId ?? null)
    : null;
  const myTeam = myTeamId
    ? (teams.find((t) => t.id === myTeamId) ?? null)
    : null;
  const myScore = meId
    ? (students.find((s) => s.id === meId)?.score ?? 0)
    : 0;
  const myRank = useMemo(() => {
    if (!meId) return null;
    const i = sortedStudents.findIndex((s) => s.id === meId);
    return i === -1 ? null : i + 1;
  }, [meId, sortedStudents]);

  const query = search.trim().toLocaleLowerCase("vi");
  const visibleStudents = sortedStudents.filter((s) => {
    if (teamFilter !== "all" && s.teamId !== teamFilter) return false;
    if (!query) return true;
    return (
      s.name.toLocaleLowerCase("vi").includes(query) ||
      s.teamName.toLocaleLowerCase("vi").includes(query)
    );
  });

  const trendMax = Math.max(1, ...trend.map((d) => d.amount));
  const trendTotal = trend.reduce((s, d) => s + d.amount, 0);
  const podium = sortedTeams.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* ── Đầu trang ─────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
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
            Mỗi tuần là một trận. Tích luỹ điểm, bứt hạng và mở khóa danh hiệu —
            công khai, minh bạch, có lịch sử.
          </p>
        </div>

        <dl className="flex shrink-0 flex-wrap gap-2">
          {[
            { icon: Users, label: "Học sinh", value: String(students.length) },
            {
              icon: Trophy,
              label: "Tổ dẫn đầu",
              value: sortedTeams[0]?.name ?? "—",
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
              <dd className="mt-1 max-w-[9rem] truncate text-xl font-extrabold text-text">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {/* ── Kỳ thi đua + vị trí của tôi ─────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <section
          aria-label="Kỳ thi đua hiện tại"
          className={cn(NEON, "flex items-center gap-4 p-5")}
        >
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary"
          >
            <Target className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-text-muted">Kỳ đang chạy</p>
            <p className="truncate text-base font-extrabold text-text">
              {period ? period.name : "Chưa mở kỳ thi đua"}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {period
                ? `${fmtDay(period.start)} → ${fmtDay(period.end)} · còn ${period.daysLeft} ngày`
                : "Kỳ sẽ mở tự động khi có điểm đầu tiên."}
            </p>
          </div>
        </section>

        <section
          aria-label="Vị trí của bạn"
          className={cn(NEON, "flex items-center gap-4 p-5")}
        >
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary-light text-secondary"
          >
            <Flame className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-text-muted">Vị trí của bạn</p>
            <p className="truncate text-base font-extrabold text-text">
              {myRank ? `Hạng ${myRank}/${sortedStudents.length}` : "Chưa vào lớp"}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {meId
                ? `${myScore} điểm cá nhân · ${myTeam?.name ?? "chưa phân tổ"}`
                : "Đăng nhập để xem thứ hạng của bạn."}
            </p>
          </div>
        </section>
      </div>

      {!hasDatabaseClass && (
        <section
          aria-label="Cần thiết lập"
          className="rounded-3xl border border-warning/30 bg-warning-light p-5"
        >
          <h2 className="flex items-center gap-2 text-sm font-bold text-text">
            <TriangleAlert aria-hidden className="size-4 text-warning" />
            Chưa liên kết lớp {className} với dữ liệu A6Class
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
            Bảng dưới đây lấy từ danh sách nhập sẵn ({ROSTER.length} học sinh,{" "}
            {new Set(ROSTER.map((s) => s.team)).size} tổ) và hiển thị{" "}
            <strong className="text-text">0 điểm</strong> — đây chưa phải kết quả
            thi đua thật. Để ghi và lưu điểm, giáo viên cần:
          </p>
          <ol className="mt-3 space-y-1.5 text-sm text-text-secondary">
            {[
              "Tạo lớp 12A6 với năm học 2026-2027 trong A6Class",
              "Tạo 4 tổ và thêm 36 học sinh vào đúng tổ",
              "Gán quyền cán sự (lớp trưởng, tổ trưởng, bí thư…) để ghi điểm",
            ].map((step, i) => (
              <li key={step} className="flex gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-warning/20 text-[11px] font-black text-warning">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Nhịp độ 7 ngày ────────────────────────────────── */}
      {hasScores && trend.length > 0 && (
        <section aria-label="Nhịp độ thi đua 7 ngày" className={cn(NEON, "p-5")}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-text">
              <Flame aria-hidden className="size-4 text-primary" />
              Nhịp độ 7 ngày
            </h2>
            <p className="text-xs text-text-muted">
              <strong className="text-text">{trendTotal}</strong> điểm cộng trong tuần
            </p>
          </div>
          <div className="mt-4 flex h-24 items-end gap-2">
            {trend.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold tabular-nums text-text-secondary">
                  {d.amount > 0 ? d.amount : ""}
                </span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-violet-500/50 to-primary transition-[height] duration-500"
                  style={{
                    height: `${Math.max(3, (d.amount / trendMax) * 100)}%`,
                  }}
                />
                <span className="text-[10px] text-text-muted">{d.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Bảng xếp hạng ─────────────────────────────────── */}
      <section className={cn(NEON, "p-4 sm:p-6")}>
        {/* Quầng sáng trang trí — cùng tinh thần splash */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-sky-500/12 blur-[80px]" />
          <span className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-violet-500/12 blur-[80px]" />
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-text">
            <Trophy aria-hidden className="size-4 text-warning" />
            Bảng vinh danh
          </h2>

          <div
            role="tablist"
            aria-label="Chọn bảng thi đua"
            className="flex rounded-xl border border-border bg-background p-1"
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
                    ? "bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow"
                    : "text-text-secondary hover:bg-surface-hover",
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
                <ul className="grid gap-3 sm:grid-cols-3">
                  {podium.map((team, index) => {
                    const style = podiumStyles[index];
                    const Icon = style.icon;
                    const pct = leaderScore > 0 ? (team.score / leaderScore) * 100 : 0;
                    const isMine = team.id === myTeamId;
                    const color = teamColor(team, index);
                    return (
                      <li
                        key={team.id}
                        className={cn(
                          "relative rounded-2xl border border-border bg-surface-hover p-4",
                          style.lift,
                          style.glow,
                          isMine && "ring-2 ring-primary/70",
                        )}
                      >
                        {isMine && (
                          <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-background">
                            Tổ của bạn
                          </span>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ring-1",
                            style.chip,
                          )}
                        >
                          <Icon aria-hidden className="size-3.5" />
                          {style.label}
                        </span>
                        <p className="mt-3 flex items-center gap-2 truncate text-lg font-black text-text">
                          <span
                            aria-hidden
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          {team.name}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {team.memberCount} thành viên
                        </p>
                        <p className="mt-2 text-3xl font-black tabular-nums text-text">
                          {team.score}
                          <span className="ml-1 text-xs font-bold text-text-muted">
                            đ
                          </span>
                        </p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
                          <div
                            className="h-full rounded-full transition-[width] duration-700"
                            style={{
                              width: `${Math.max(0, pct)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {sortedTeams.length > 3 && (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {sortedTeams.slice(3).map((team, index) => (
                      <li
                        key={team.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border border-border bg-surface-hover px-3 py-2.5",
                          team.id === myTeamId && "ring-1 ring-primary/50",
                        )}
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-background text-xs font-black tabular-nums text-text-secondary">
                          #{index + 4}
                        </span>
                        <span
                          aria-hidden
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: teamColor(team, index + 3) }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-text">
                            {team.name}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {team.memberCount} thành viên
                          </p>
                        </div>
                        <p className="shrink-0 text-lg font-black tabular-nums text-text">
                          {team.score}
                          <span className="ml-0.5 text-[11px] font-bold text-text-muted">
                            đ
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-4 rounded-xl bg-background px-3 py-2 text-[11px] leading-relaxed text-text-muted">
                  Điểm tổ = điểm giao trực tiếp cho tổ ({teamPointsDirect} đ) +
                  tổng điểm cá nhân của các thành viên ({teamPointsFromMembers} đ).
                  Việc ghi nhận luôn được lưu vào lịch sử để đối chiếu.
                </p>

                {!hasScores && (
                  <p className="mt-4 text-center text-xs text-text-muted">
                    Chưa có giao dịch điểm trong kỳ thi đua. Thứ hạng tự cập nhật
                    khi có dữ liệu.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Bảng cá nhân ─────────────────────────────────── */}
        {tab === "students" && (
          <div className="relative mt-5">
            <div className="flex flex-wrap gap-2">
              <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <Search aria-hidden className="size-4 shrink-0 text-text-muted" />
                <span className="sr-only">Tìm học sinh</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm học sinh hoặc tổ…"
                  className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                />
              </label>

              <label className="flex items-center gap-2">
                <span className="sr-only">Lọc theo tổ</span>
                <select
                  value={teamFilter}
                  onChange={(event) => setTeamFilter(event.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
                >
                  <option value="all">Tất cả các tổ</option>
                  {sortedTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {meId && hasScores && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-primary-light px-3 py-2 text-xs text-text-secondary">
                <Crown aria-hidden className="size-4 shrink-0 text-warning" />
                <span className="truncate">
                  Hạng <strong className="text-text">{myRank}</strong> với{" "}
                  <strong className="text-text tabular-nums">{myScore} đ</strong>
                  {myTeam ? ` · ${myTeam.name}` : ""}
                </span>
              </p>
            )}

            <ul className="mt-3 divide-y divide-border">
              {visibleStudents.length === 0 ? (
                <Empty text="Không tìm thấy học sinh nào." />
              ) : (
                visibleStudents.slice(0, 60).map((student, index) => {
                  const isMe = student.id === meId;
                  return (
                    <li
                      key={student.id}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2.5",
                        isMe && "rounded-lg bg-primary-light",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-lg text-xs font-black tabular-nums",
                          index === 0 && student.score > 0
                            ? "bg-warning text-background"
                            : "bg-background text-text-secondary",
                        )}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm text-text",
                            isMe ? "font-black" : "font-semibold",
                          )}
                        >
                          {student.name}
                          {isMe && (
                            <span className="ml-1.5 text-[10px] font-black uppercase tracking-wide text-primary">
                              Bạn
                            </span>
                          )}
                        </p>
                        <p className="truncate text-[11px] text-text-muted">
                          {student.teamName}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-black tabular-nums text-text">
                        {student.score}
                        <span className="ml-0.5 text-[11px] font-medium text-text-muted">
                          đ
                        </span>
                      </p>
                    </li>
                  );
                })
              )}
            </ul>

            {visibleStudents.length > 60 && (
              <p className="mt-2 text-center text-xs text-text-muted">
                Hiển thị 60/{visibleStudents.length} học sinh — dùng ô tìm kiếm để
                lọc.
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
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface-hover px-3 py-2.5"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                      event.amount >= 0
                        ? "bg-success-light text-success"
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
                    <p className="text-sm font-bold text-text">
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
                      "shrink-0 text-sm font-black tabular-nums",
                      event.amount >= 0 ? "text-success" : "text-danger",
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
        <section className="rounded-3xl bg-surface p-5 shadow-md ring-1 ring-border">
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

          <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-semibold text-text-secondary">
              Đối tượng
              <select
                name="targetType"
                value={targetType}
                onChange={(event) =>
                  setTargetType(event.target.value as "student" | "team")
                }
                className={FIELD}
              >
                <option value="student">Học sinh</option>
                <option value="team">Tổ</option>
              </select>
            </label>

            <label className="text-xs font-semibold text-text-secondary">
              Học sinh / tổ
              <select name="targetId" className={FIELD}>
                {targetType === "student"
                  ? students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · {s.teamName}
                      </option>
                    ))
                  : teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
              </select>
            </label>

            <label className="text-xs font-semibold text-text-secondary">
              Loại ghi nhận
              <select name="category" className={FIELD}>
                <optgroup label="Điểm cộng">
                  {POSITIVE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      + · {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Điểm trừ">
                  {NEGATIVE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      − · {c}
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
                required
                className={FIELD}
              />
            </label>

            <label className="text-xs font-semibold text-text-secondary sm:col-span-2">
              Ghi chú (không bắt buộc)
              <input
                name="note"
                maxLength={240}
                placeholder="Ví dụ: phát biểu trong tiết Toán…"
                className={FIELD}
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={formPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formPending ? (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                ) : (
                  <Flame aria-hidden className="size-4" />
                )}
                {formPending ? "Đang ghi…" : "Ghi nhận điểm"}
              </button>
            </div>
          </form>

          {formState && (
            <p
              role="status"
              className={cn(
                "mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-medium",
                formState.ok
                  ? "bg-success-light text-success"
                  : "bg-danger-light text-danger",
              )}
            >
              {formState.ok ? (
                <CheckCircle2 aria-hidden className="mt-px size-4 shrink-0" />
              ) : (
                <TriangleAlert aria-hidden className="mt-px size-4 shrink-0" />
              )}
              {formState.message}
            </p>
          )}

          <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
            Danh sách học sinh được nhập từ Excel nên chưa gắn mức điểm cụ thể cho
            từng hành vi. Nhập đúng số điểm theo quy định lớp; hệ thống không tự áp
            đặt mức điểm.
          </p>
        </section>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <li className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-text-muted">
      {text}
    </li>
  );
}