"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Crown,
  Eye,
  EyeOff,
  History,
  Lock,
  Pencil,
  Settings2,
  Trophy,
} from "lucide-react";

import {
  saveEntryAction,
  setPublishedAction,
  type ActionState,
} from "@/lib/competition/actions";
import type { CompetitionData } from "@/lib/competition/query";
import { cn } from "@/lib/utils";

type Props = {
  data: CompetitionData;
  viewPeriodId: string | null;
};

type Tab = "rank" | "entry" | "history";
type Scope = "week" | "year";

const PANEL = "rounded-2xl bg-surface border border-border";
const INITIAL: ActionState = { ok: true, message: "" };

/* ══════════════════════════════════════════════════════════ */


export default function CompetitionArena({ data, viewPeriodId }: Props) {
  const { access, period } = data;
  const [tab, setTab] = useState<Tab>("rank");
  const [scope, setScope] = useState<Scope>("week");
  const [toast, setToast] = useState<ActionState | null>(null);
  const [isPending, startTransition] = useTransition();

  const students = scope === "week" ? data.weekStudents : data.yearStudents;
  const teams = scope === "week" ? data.weekTeams : data.yearTeams;
  const me = data.weekStudents.find((s) => s.userId === data.meId);
  const meTeam = data.weekTeams.find((t) => t.teamId === access.teamId);

  const tabs: { key: Tab; label: string; icon: typeof Trophy; show: boolean }[] = [
    { key: "rank", label: "Bảng xếp hạng", icon: Trophy, show: true },
    { key: "entry", label: "Nhập điểm", icon: Pencil, show: access.canRecord },
    { key: "history", label: "Lịch sử", icon: History, show: true },
  ];

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
    });
  }

  async function publish(published: boolean) {
    const fd = new FormData();
    fd.set("classId", data.classId);
    if (!period) return;
    fd.set("periodId", period.id);
    fd.set("published", published ? "1" : "0");
    setToast(await setPublishedAction(INITIAL, fd));
  }

  return (
    <div className="min-h-[70vh] space-y-5 pb-10">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0B1020] text-white shadow-[0_24px_80px_rgba(15,23,42,.18)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[.035]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        </div>

        <div className="relative px-5 py-6 sm:px-7 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[.22em] text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.9)]" />
                A6Class · Arena
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-5xl">
                Thi đua lớp <span className="text-violet-300">{data.className}</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                Đấu trường thi đua của {data.schoolYear}. Theo dõi thứ hạng theo tuần,
                điểm cá nhân và thành tích của từng tổ — rõ ràng, nhanh và không rối.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {period ? (
                  <>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-xs font-bold text-slate-200">
                      <CalendarDays className="size-3.5 text-cyan-300" />
                      {period.name}
                    </span>
                    <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                      {period.daysLeft === 0 ? "Hết tuần" : "Còn " + period.daysLeft + " ngày"}
                    </span>
                  </>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-xs font-bold text-slate-300">
                    Chưa có kỳ thi đua
                  </span>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
              <PeriodPicker periods={data.periods} currentId={viewPeriodId ?? period?.id ?? null} />
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/[.05] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Học sinh</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{students.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.05] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổ</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{teams.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="flex items-center gap-2 text-[11px] leading-5 text-slate-400">
              <Lock className="size-3.5 shrink-0 text-violet-300" />
              {describeAccess(data)}
            </p>

            <div className="flex flex-wrap gap-2">
              {(access.isTeacher || access.role === "CLASS_MONITOR") && period && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => publish(!period.publishedAt))}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition",
                    period.publishedAt
                      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                      : "border-white/10 bg-white/[.06] text-slate-300 hover:bg-white/10",
                  )}
                >
                  {period.publishedAt ? <><Eye className="size-3.5" /> Đã công bố</> : <><EyeOff className="size-3.5" /> Chưa công bố</>}
                </button>
              )}
              {access.isTeacher && (
                <Link
                  href="/competition/settings"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.06] px-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <Settings2 className="size-3.5" /> Cấu hình
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Mục thi đua">
        <div className="flex flex-wrap rounded-2xl border border-border bg-surface p-1">
          {tabs.filter((t) => t.show).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-xs font-extrabold transition sm:px-4",
                tab === t.key
                  ? "bg-[#111827] text-white shadow-sm"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <t.icon className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {(tab === "rank" || tab === "history") && (
          <div className="ml-auto flex rounded-2xl border border-border bg-surface p-1">
            {(["week", "year"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={cn(
                  "h-9 rounded-xl px-3.5 text-xs font-extrabold transition",
                  scope === s ? "bg-violet-500/10 text-violet-700" : "text-muted hover:text-text",
                )}
              >
                {s === "week" ? "Tuần này" : "Cả năm"}
              </button>
            ))}
          </div>
        )}
      </nav>

      {toast && (
        <div
          role="status"
          className={cn(
            "rounded-2xl border px-4 py-3 text-xs font-semibold",
            toast.ok
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
              : "border-rose-500/20 bg-rose-500/10 text-rose-700",
          )}
        >
          {toast.message}
        </div>
      )}

      {tab === "rank" && (
        <RankPanel
          students={students}
          teams={teams}
          me={me}
          meTeam={meTeam}
          scope={scope}
          periodName={scope === "week" ? (period?.name ?? null) : null}
        />
      )}
      {tab === "entry" && access.canRecord && period && <EntryGrid data={data} onToast={setToast} />}
      {tab === "history" && <HistoryPanel data={data} />}
    </div>
  );
}

/* ── Mô tả quyền xem ─────────────────────────────────────── */

function describeAccess(d: CompetitionData): string {
  const { access, period, visibleTeamIds } = d;
  if (period?.publishedAt) {
    return "Kỳ này đã công bố kết quả nên cả lớp xem được tất cả các tổ. Quyền nhập điểm vẫn giữ nguyên theo vai trò.";
  }
  if (access.isTeacher) return "Bạn là giáo viên: xem và nhập điểm cho toàn bộ lớp.";
  if (access.role === "CLASS_MONITOR")
    return "Bạn là lớp trưởng: xem và nhập điểm cho toàn bộ lớp (ngoại lệ so với các cán sự khác).";
  if (access.canRecord && access.teamId)
    return `Bạn là cán sự: chỉ xem và nhập điểm cho ${teamNameOf(d, access.teamId)}. Các tổ khác sẽ công bố ở ngày tổng kết.`;
  if (visibleTeamIds?.length)
    return `Bạn xem được ${teamNameOf(d, access.teamId)} của mình. Các tổ khác sẽ mở công khai ở ngày tổng kết.`;
  return "Bạn chưa được xếp vào tổ nào nên chưa xem được bảng điểm của tổ nào. Liên hệ giáo viên để được xếp tổ.";
}

function teamNameOf(d: CompetitionData, teamId: string | null): string {
  if (!teamId) return "tổ của bạn";
  return d.teams.find((t) => t.id === teamId)?.name ?? "tổ của bạn";
}

/* ── Chọn kỳ thi ─────────────────────────────────────────── */

function PeriodPicker({
  periods,
  currentId,
}: {
  periods: CompetitionData["periods"];
  currentId: string | null;
}) {
  return (
    <form action="" className="relative">
      <select
        name="period"
        defaultValue={currentId ?? ""}
        onChange={(e) => {
          const v = e.currentTarget.value;
          window.location.href = v ? `/competition?period=${v}` : "/competition";
        }}
        aria-label="Chọn tuần"
        className="h-9 appearance-none rounded-xl bg-surface-2 pl-3 pr-8 text-xs font-bold text-muted border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
      >
        {periods.length === 0 && <option value="">Chưa có tuần nào</option>}
        {periods.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {p.isActive ? " · đang chạy" : ""}
            {p.publishedAt ? " · đã công bố" : ""}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted"
      />
    </form>
  );
}

/* ── Bảng xếp hạng ───────────────────────────────────────── */

type StudentRow = CompetitionData["weekStudents"][number];


function RankPanel({
  students,
  teams,
  me,
  meTeam,
  scope,
  periodName,
}: {
  students: StudentRow[];
  teams: CompetitionData["weekTeams"];
  me?: StudentRow;
  meTeam?: CompetitionData["weekTeams"][number];
  scope: Scope;
  periodName: string | null;
}) {
  const hasScore = students.some((s) => s.marks > 0) || teams.some((t) => t.direct !== 0);
  const maxAvg = Math.max(...teams.map((t) => t.average), 1);
  const topFive = students.slice(0, 5);

  return (
    <div className="space-y-4">
      {!hasScore && <EmptyScoreState scope={scope} periodName={periodName} />}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
        <section className={cn(PANEL, "overflow-hidden")}>
          <SectionHeader
            icon={Trophy}
            title="Đấu trường 4 tổ"
            subtitle={scope === "week" ? "Xếp theo điểm trung bình mỗi thành viên" : "Tích lũy từ đầu năm"}
          />
          <div className="space-y-2 px-4 pb-4">
            {teams.map((team, index) => (
              <TeamRace
                key={team.teamId}
                team={team}
                index={index}
                max={maxAvg}
                mine={meTeam?.teamId === team.teamId}
              />
            ))}
          </div>
        </section>

        <section className={cn(PANEL, "overflow-hidden")}>
          <SectionHeader
            icon={BarChart3}
            title="Top cá nhân"
            subtitle={scope === "week" ? "5 học sinh dẫn đầu kỳ này" : "5 học sinh dẫn đầu cả năm"}
          />
          <div className="divide-y divide-border px-4 pb-1">
            {topFive.map((s) => (
              <StudentMiniRow key={s.userId} student={s} mine={me?.userId === s.userId} />
            ))}
            {topFive.length === 0 && <div className="py-8 text-center text-xs text-muted">Chưa có dữ liệu.</div>}
          </div>
        </section>
      </div>

      <section className={cn(PANEL, "overflow-hidden")}>
        <SectionHeader
          icon={Activity}
          title="Nhịp điểm"
          subtitle="Cộng / trừ phát sinh trong 7 ngày gần nhất"
        />
        <TrendBars data={useTrendData(teams, students)} />
      </section>

      <section className={cn(PANEL, "overflow-hidden")}>
        <SectionHeader
          icon={Users}
          title="Bảng cá nhân"
          subtitle={`${students.length} học sinh · ${scope === "week" ? "kỳ đang xem" : "cả năm"}`}
        />
        <StudentTable students={students} me={me} compact />
      </section>
    </div>
  );
}

function EmptyScoreState({ scope, periodName }: { scope: Scope; periodName: string | null }) {
  return (
    <div className="rounded-[22px] border border-dashed border-border-strong bg-canvas px-5 py-7">
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-2 text-muted">
          <Target className="size-5" />
        </div>
        <div>
          <h2 className="text-sm font-black text-text">Chưa có điểm trong phạm vi này</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            {scope === "week" ? `Kỳ ${periodName ?? "đang xem"} chưa có ghi nhận nào.` : "Từ đầu năm học chưa có ghi nhận nào."}
          </p>
        </div>
      </div>
    </div>
  );
}

function TeamRace({
  team,
  index,
  max,
  mine,
}: {
  team: CompetitionData["weekTeams"][number];
  index: number;
  max: number;
  mine: boolean;
}) {
  const pct = Math.max(4, Math.round((team.average / max) * 100));
  return (
    <article className={cn(
      "rounded-2xl border p-3.5 transition",
      mine ? "border-primary/30 bg-primary/[.045]" : "border-border bg-canvas",
    )}>
      <div className="flex items-center gap-3">
        <RankBadge rank={index + 1} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="size-2 shrink-0 rounded-full" style={{ background: team.color ?? "#64748b" }} />
              <span className="truncate text-sm font-black text-text">{team.teamName}</span>
              {mine && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-black text-primary">Tổ bạn</span>}
            </div>
            <span className="shrink-0 text-sm font-black tabular-nums text-text">
              {formatScore(team.average)} <span className="text-[9px] font-bold text-muted">đ/bạn</span>
            </span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: team.color ?? "#64748b" }} />
          </div>
          <div className="mt-2 flex justify-between text-[9px] font-semibold text-muted">
            <span>{team.memberIds.length} thành viên</span>
            <span>Tổng {formatSigned(team.total)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function StudentMiniRow({ student, mine }: { student: StudentRow; mine: boolean }) {
  return (
    <div className="flex items-center gap-2.5 py-2.5">
      <RankBadge rank={student.rank} small />
      <span className="size-2 shrink-0 rounded-full" style={{ background: student.teamColor ?? "#94a3b8" }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-text">{student.name}</p>
        <p className="text-[9px] font-semibold text-muted">{student.teamName ?? "Chưa xếp tổ"}</p>
      </div>
      <span className={cn("text-xs font-black tabular-nums", student.net < 0 ? "text-rose-600" : "text-text")}>{formatSigned(student.net)}</span>
      {mine && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-black text-primary">Bạn</span>}
    </div>
  );
}

function StudentTable({
  students,
  me,
  compact = false,
}: {
  students: StudentRow[];
  me?: StudentRow;
  compact?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-xs">
        <thead className="bg-canvas">
          <tr className="border-y border-border text-left text-[9px] font-black uppercase tracking-wider text-muted">
            <th className="w-12 px-4 py-2.5">#</th>
            <th className="px-2 py-2.5">Học sinh</th>
            <th className="px-2 py-2.5">Tổ</th>
            <th className="px-2 py-2.5 text-right">Cộng</th>
            <th className="px-2 py-2.5 text-right">Trừ</th>
            <th className="px-2 py-2.5 text-right">Ròng</th>
            <th className="px-4 py-2.5 text-right">Xếp loại</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.userId} className={cn(
              "border-b border-border/60",
              me?.userId === s.userId && "bg-primary/[.045]",
            )}>
              <td className="px-4 py-2.5"><RankBadge rank={s.rank} small={!compact} /></td>
              <td className="px-2 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: s.teamColor ?? "#94a3b8" }} />
                  <span className="font-bold text-text">{s.name}</span>
                  {me?.userId === s.userId && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-black text-primary">Bạn</span>}
                </div>
              </td>
              <td className="px-2 py-2.5 text-muted">{s.teamName ?? "—"}</td>
              <td className="px-2 py-2.5 text-right font-bold tabular-nums text-emerald-600">{s.positive || "—"}</td>
              <td className="px-2 py-2.5 text-right font-bold tabular-nums text-rose-600">{s.negative || "—"}</td>
              <td className={cn("px-2 py-2.5 text-right font-black tabular-nums", s.net < 0 ? "text-rose-600" : "text-text")}>{formatSigned(s.net)}</td>
              <td className="px-4 py-2.5 text-right">
                <span className={cn("rounded-full bg-surface-2 px-2 py-1 text-[9px] font-black", s.tierTone)}>{s.tier}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrendBars({ data }: { data: CompetitionData["trend"] }) {
  const max = Math.max(...data.map((d) => Math.max(d.positive, Math.abs(d.negative))), 1);
  return (
    <div className="px-5 pb-5">
      <div className="grid h-36 grid-cols-7 items-end gap-2 border-b border-border">
        {data.map((d) => {
          const pos = Math.max(3, Math.round((d.positive / max) * 88));
          const neg = d.negative < 0 ? Math.max(3, Math.round((Math.abs(d.negative) / max) * 45)) : 0;
          return (
            <div key={d.date} className="flex h-full flex-col justify-end">
              <div className="flex h-[112px] flex-col items-center justify-end gap-1">
                <div className="w-full max-w-9 rounded-t-md bg-emerald-500/70" style={{ height: `${pos}px` }} />
                {neg > 0 && <div className="w-full max-w-9 rounded-b-md bg-rose-500/55" style={{ height: `${neg}px` }} />}
              </div>
              <p className="mt-2 text-center text-[9px] font-bold text-muted">{d.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function useTrendData(
  _teams: CompetitionData["weekTeams"],
  _students: StudentRow[],
): CompetitionData["trend"] {
  // Trend đã được tính server-side trong query; RankPanel nhận trực tiếp qua
  // data.trend ở wrapper. Đây là fallback để giữ component thuần dữ liệu.
  return [];
}
function roleShort(role: string): string {
  switch (role) {
    case "CLASS_MONITOR":
      return "LT";
    case "ACADEMIC_VICE_MONITOR":
      return "PHT";
    case "ACTIVITY_VICE_MONITOR":
      return "PT";
    case "LABOR_VICE_MONITOR":
      return "TQ";
    case "TEAM_LEADER":
      return "TT";
    case "TEAM_VICE_LEADER":
      return "TTV";
    default:
      return "";
  }
}

/* ── Bảng nhập điểm kiểu Excel ───────────────────────────── */

function EntryGrid({
  data,
  onToast,
}: {
  data: CompetitionData;
  onToast: (s: ActionState) => void;
}) {
  const { access, period, groups, members, cells } = data;

  const editableTeams = useMemo(() => {
    if (access.canEditAll) return null; // null = được sửa tất cả
    return access.teamId ? [access.teamId] : [];
  }, [access.canEditAll, access.teamId]);

  const rows = useMemo(() => {
    const list = members.filter((m) => (editableTeams ? editableTeams.includes(m.teamId ?? "") : true));
    const sorted = [...list].sort((a, b) =>
      (a.teamName ?? "").localeCompare(b.teamName ?? "") || a.name.localeCompare(b.name, "vi"),
    );
    const out: ({ row: (typeof sorted)[number]; stt: number } | { header: string })[] = [];
    let team = "";
    let stt = 0;
    for (const row of sorted) {
      const name = row.teamName ?? "Chưa xếp tổ";
      if (name !== team) {
        team = name;
        stt = 0;
        out.push({ header: name });
      }
      stt += 1;
      out.push({ row, stt });
    }
    return out;
  }, [members, editableTeams]);

  if (!period) return null;

  if (rows.every((r) => "header" in r)) {
    return (
      <div className={cn(PANEL, "px-4 py-8 text-center text-sm text-muted")}>
        Bạn chưa được xếp vào tổ nào nên chưa nhập điểm được. Liên hệ giáo viên.
      </div>
    );
  }

  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <h2 className="text-sm font-extrabold text-text">
          Nhập điểm · {period.name}
        </h2>
        <p className="text-[11px] text-muted">
          {access.canEditAll
            ? "Bạn nhập được cho cả lớp."
            : `Bạn chỉ nhập được cho ${teamNameOf(data, access.teamId)}.`}{" "}
          Sửa ô rồi nhấn Enter hoặc click ra ngoài để lưu.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-20 bg-surface">
            <tr>
              <th rowSpan={2} className="sticky left-0 z-30 w-8 bg-surface px-1 py-1.5 text-[10px] font-bold text-muted">
                STT
              </th>
              <th rowSpan={2} className="sticky left-8 z-30 min-w-40 bg-surface px-2 py-1.5 text-left text-[10px] font-bold text-muted">
                Học sinh
              </th>
              <th rowSpan={2} className="min-w-20 bg-surface px-2 py-1.5 text-left text-[10px] font-bold text-muted">
                Tổ
              </th>
              {groups.map((g) => (
                <th
                  key={g.key}
                  colSpan={g.input === "GRADE" ? 1 : 1}
                  className={cn(
                    "min-w-16 border-l border-border px-1 py-1.5 align-bottom text-[9px] font-bold leading-tight",
                    g.kind === "POSITIVE" ? "text-emerald-600/90" : "text-rose-600/90",
                  )}
                >
                  <span title={g.label}>{shortGroupLabel(g.label)}</span>
                </th>
              ))}
              <th rowSpan={2} className="border-l border-border bg-surface px-2 py-1.5 text-right text-[10px] font-bold text-muted">
                Ròng
              </th>
            </tr>
            <tr>
              {groups.map((g) => (
                <th key={`sub-${g.key}`} className="border-l border-border px-1 py-1 text-[9px] font-medium text-muted">
                  {g.input === "GRADE" ? "7/8/9/10" : g.kind === "NEGATIVE" ? `−${g.points}` : `+${g.points}`}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => {
              if ("header" in r) {
                const t = data.teams.find((tm) => tm.name === r.header);
                return (
                  <tr key={`h-${r.header}-${i}`}>
                    <td
                      colSpan={groups.length + 4}
                      className="border-y border-border bg-canvas px-3 py-1.5 text-[11px] font-extrabold"
                      style={{ color: t?.color ?? "#94A3B8" }}
                    >
                      {r.header}
                      <span className="ml-2 text-[10px] font-medium text-muted">
                        ({t?.memberCount ?? 0} em)
                      </span>
                    </td>
                  </tr>
                );
              }

              const m = r.row;
              const week = data.weekStudents.find((s) => s.userId === m.userId);
              return (
                <tr key={m.userId} className="border-t border-border/50 hover:bg-surface-2/40">
                  <td className="sticky left-0 z-10 bg-surface px-1 py-1 text-center tabular-nums text-[10px] text-muted">
                    {r.stt}
                  </td>
                  <td className="sticky left-8 z-10 bg-surface px-2 py-1 font-semibold text-text">
                    <span className="flex items-center gap-1.5">
                      {m.teamColor && (
                        <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: m.teamColor }} />
                      )}
                      <span className="truncate">{m.name}</span>
                      {m.role !== "STUDENT" && (
                        <span className="shrink-0 rounded bg-surface-2 px-1 text-[9px] font-bold text-muted">
                          {roleShort(m.role)}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-[10px] text-muted">{m.teamName ?? "—"}</td>

                  {groups.map((g) =>
                    g.input === "GRADE" ? (
                      <td key={g.key} className="border-l border-border px-1 py-1">
                        <GradeSelect
                          criteria={g.criteria}
                          userId={m.userId}
                          cells={cells}
                          classId={data.classId}
                          periodId={period.id}
                          onToast={onToast}
                        />
                      </td>
                    ) : (
                      <td key={g.key} className="border-l border-border px-1 py-1">
                        <CountInput
                          criterionId={g.criteria[0].id}
                          userId={m.userId}
                          cells={cells}
                          classId={data.classId}
                          periodId={period.id}
                          onToast={onToast}
                        />
                      </td>
                    ),
                  )}

                  <td className="border-l border-border px-2 py-1 text-right">
                    <span
                      className={cn(
                        "font-bold tabular-nums",
                        (week?.net ?? 0) > 0
                          ? "text-emerald-600"
                          : (week?.net ?? 0) < 0
                            ? "text-rose-600"
                            : "text-muted",
                      )}
                    >
                      {week && week.net !== 0 ? (week.net > 0 ? `+${week.net}` : week.net) : "0"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function shortGroupLabel(label: string): string {
  const cut = label.split(/[,—(]/)[0].trim();
  return cut.length > 22 ? `${cut.slice(0, 21)}…` : cut;
}

/** Ô số lần — không kiểm soát (uncontrolled) để bảng 36×19 ô không render lại liên tục. */
function CountInput({
  criterionId,
  userId,
  cells,
  classId,
  periodId,
  onToast,
}: {
  criterionId: string;
  userId: string;
  cells: Record<string, number>;
  classId: string;
  periodId: string;
  onToast: (s: ActionState) => void;
}) {
  const key = `${criterionId}:${userId}`;
  const [busy, setBusy] = useState(false);

  async function commit(value: string) {
    const count = value === "" ? 0 : Number(value);
    if (!Number.isInteger(count) || count < 0 || count > 50) {
      onToast({ ok: false, message: "Số lần phải là số nguyên từ 0 đến 50." });
      return;
    }
    if (count === (cells[key] ?? 0)) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("classId", classId);
    fd.set("periodId", periodId);
    fd.set("criterionId", criterionId);
    fd.set("targetUserId", userId);
    fd.set("count", String(count));
    onToast(await saveEntryAction(INITIAL, fd));
    setBusy(false);
  }

  return (
    <input
      type="number"
      min={0}
      max={50}
      inputMode="numeric"
      defaultValue={cells[key] ?? ""}
      disabled={busy}
      aria-label="Số lần"
      onBlur={(e) => void commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={cn(
        "h-7 w-10 rounded-md border border-transparent bg-transparent text-center tabular-nums text-text",
        "focus:border-sky focus:bg-canvas focus:outline-none",
        cells[key] ? "font-bold" : "text-muted",
        busy && "opacity-50",
      )}
    />
  );
}

/** Ô chọn con điểm 7/8/9/10 — nhóm "Điểm tốt". */
function GradeSelect({
  criteria,
  userId,
  cells,
  classId,
  periodId,
  onToast,
}: {
  criteria: CompetitionData["groups"][number]["criteria"];
  userId: string;
  cells: Record<string, number>;
  classId: string;
  periodId: string;
  onToast: (s: ActionState) => void;
}) {
  // Mỗi mức điểm là một criterion riêng; đang chọn mức nào thì mức đó có số lần = 1.
  const chosen = criteria.find((c) => (cells[`${c.id}:${userId}`] ?? 0) > 0);
  const grade = chosen?.key.replace("DIEM_", "") ?? "";
  const [busy, setBusy] = useState(false);

  async function commit(next: string) {
    setBusy(true);
    // Ghi 1 cho mức được chọn, 0 cho các mức còn lại của nhóm này.
    for (const c of criteria) {
      const count = c.key.replace("DIEM_", "") === next ? 1 : 0;
      const fd = new FormData();
      fd.set("classId", classId);
      fd.set("periodId", periodId);
      fd.set("criterionId", c.id);
      fd.set("targetUserId", userId);
      fd.set("count", String(count));
      const res = await saveEntryAction(INITIAL, fd);
      if (!res.ok) {
        onToast(res);
        setBusy(false);
        return;
      }
    }
    onToast(
      next
        ? { ok: true, message: `Đã ghi nhận điểm ${next}.` }
        : { ok: true, message: "Đã xoá điểm tốt của học sinh này." },
    );
    setBusy(false);
  }

  return (
    <select
      defaultValue={grade}
      disabled={busy}
      aria-label="Con điểm kiểm tra"
      onChange={(e) => void commit(e.target.value)}
      className={cn(
        "h-7 w-12 rounded-md border border-transparent bg-transparent text-center text-xs font-bold text-text",
        "focus:border-sky focus:bg-canvas focus:outline-none",
        !grade && "text-muted",
        busy && "opacity-50",
      )}
    >
      <option value="">—</option>
      {criteria.map((c) => (
        <option key={c.key} value={c.key.replace("DIEM_", "")}>
          {c.key.replace("DIEM_", "")} (+{c.points})
        </option>
      ))}
    </select>
  );
}

/* ── Lịch sử ─────────────────────────────────────────────── */

function HistoryPanel({ data }: { data: CompetitionData }) {
  if (data.recent.length === 0) {
    return (
      <div className={cn(PANEL, "px-4 py-10 text-center text-sm text-muted")}>
        Chưa có dữ liệu trong kỳ này.
      </div>
    );
  }
  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <div className="px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-text">
          <History aria-hidden className="size-4 text-sky" />
          Lịch sử ghi điểm
        </h2>
        <p className="mt-0.5 text-[11px] text-muted">40 ghi nhận gần nhất trong kỳ đang xem.</p>
      </div>
      <ul className="max-h-[520px] divide-y divide-border/60 overflow-y-auto">
        {data.recent.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-xs">
            {r.teamColor && (
              <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: r.teamColor }} />
            )}
            <span className="font-bold text-text">{r.userName}</span>
            <span className="text-muted">·</span>
            <span className="min-w-0 flex-1 truncate text-muted">{r.criterionLabel}</span>
            <span className="tabular-nums text-muted">×{r.count}</span>
            <span
              className={cn(
                "w-14 text-right font-extrabold tabular-nums",
                r.points > 0 ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {r.points > 0 ? `+${r.points}` : r.points}
            </span>
            <span className="w-28 text-right text-[10px] text-muted">{r.giverName}</span>
            <span className="w-24 text-right text-[10px] tabular-nums text-muted">
              {new Intl.DateTimeFormat("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(r.createdAt))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
