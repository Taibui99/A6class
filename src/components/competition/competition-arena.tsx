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

const PANEL = "rounded-2xl bg-surface ring-1 ring-border";
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
    { key: "rank", label: "Xếp hạng", icon: Trophy, show: true },
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
    if (period) {
      fd.set("periodId", period.id);
      fd.set("published", published ? "1" : "0");
      const res = await setPublishedAction(INITIAL, fd);
      setToast(res);
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Đầu trang ─────────────────────────────────────── */}
      <header className={cn(PANEL, "px-4 py-4 sm:px-5")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-text sm:text-xl">
              <Trophy aria-hidden className="size-5 text-sky" />
              Thi đua lớp {data.className}
              <span className="text-sm font-medium text-muted">· {data.schoolYear}</span>
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              {period ? (
                <>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays aria-hidden className="size-3.5" />
                    {period.name}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-semibold",
                      period.daysLeft === 0
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-sky-500/15 text-sky-300",
                    )}
                  >
                    {period.daysLeft === 0 ? "Hết tuần" : `Còn ${period.daysLeft} ngày`}
                  </span>
                </>
              ) : (
                <span>Chưa có kỳ thi</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PeriodPicker
              periods={data.periods}
              currentId={viewPeriodId ?? period?.id ?? null}
            />
            {(access.isTeacher || access.role === "CLASS_MONITOR") && period && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => run(() => publish(!period.publishedAt))}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition",
                  period.publishedAt
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-surface-2 text-muted ring-1 ring-border hover:text-text",
                )}
              >
                {period.publishedAt ? (
                  <>
                    <Eye aria-hidden className="size-3.5" /> Đã công bố
                  </>
                ) : (
                  <>
                    <EyeOff aria-hidden className="size-3.5" /> Chưa công bố
                  </>
                )}
              </button>
            )}
            {access.isTeacher && (
              <Link
                href="/competition/settings"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-surface-2 px-3 text-xs font-bold text-muted ring-1 ring-border transition hover:text-text"
              >
                <Settings2 aria-hidden className="size-3.5" /> Cấu hình điểm
              </Link>
            )}
          </div>
        </div>

        {/* Quyền xem hiện tại — luôn nói rõ để không hiểu nhầm */}
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-canvas px-3 py-2 text-[11px] leading-relaxed text-muted">
          <Lock aria-hidden className="mt-0.5 size-3.5 shrink-0 text-sky" />
          <p>{describeAccess(data)}</p>
        </div>
      </header>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <nav className="flex flex-wrap gap-1.5" aria-label="Mục thi đua">
        {tabs
          .filter((t) => t.show)
          .map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold transition",
                tab === t.key
                  ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30"
                  : "bg-surface text-muted ring-1 ring-border hover:text-text",
              )}
            >
              <t.icon aria-hidden className="size-3.5" />
              {t.label}
            </button>
          ))}

        {(tab === "rank" || tab === "history") && (
          <div className="ml-auto flex gap-1 rounded-xl bg-surface p-0.5 ring-1 ring-border">
            {(["week", "year"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={cn(
                  "h-8 rounded-lg px-3 text-xs font-bold transition",
                  scope === s ? "bg-sky-500/15 text-sky-300" : "text-muted hover:text-text",
                )}
              >
                {s === "week" ? "Tuần này" : "Cả năm"}
              </button>
            ))}
          </div>
        )}
      </nav>

      {toast && (
        <p
          role="status"
          className={cn(
            "rounded-xl px-3 py-2 text-xs font-semibold",
            toast.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300",
          )}
        >
          {toast.message}
        </p>
      )}

      {/* ── Nội dung ───────────────────────────────────────── */}
      {tab === "rank" && (
        <RankPanel students={students} teams={teams} me={me} meTeam={meTeam} />
      )}
      {tab === "entry" && access.canRecord && period && (
        <EntryGrid data={data} onToast={setToast} />
      )}
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
        className="h-9 appearance-none rounded-xl bg-surface-2 pl-3 pr-8 text-xs font-bold text-muted ring-1 ring-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
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
}: {
  students: StudentRow[];
  teams: CompetitionData["weekTeams"];
  me?: StudentRow;
  meTeam?: CompetitionData["weekTeams"][number];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* Xếp hạng tổ — theo trung bình mỗi thành viên */}
      <section className={cn(PANEL, "p-4")}>
        <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-text">
          <Crown aria-hidden className="size-4 text-amber" />
          Xếp hạng tổ
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Tổ có 10/10/9/7 em nên tính theo <b className="text-text">trung bình mỗi thành viên</b>{" "}
          cho công bằng, không tính tổng.
        </p>

        {teams.length > 0 && teams[0] && (
          <div className="mt-3 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent p-4 ring-1 ring-amber-500/30">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black text-xl shadow-md">
                🏆
              </span>
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-500/40">
                  TOP 1 XUẤT SẮC TUẦN NÀY
                </span>
                <p className="mt-0.5 truncate text-base font-black text-text">
                  {teams[0].teamName}
                </p>
                <p className="text-xs text-amber-300/90 font-medium">
                  Điểm trung bình: <strong className="font-extrabold">{teams[0].average.toFixed(1)}</strong> đ/bạn
                </p>
              </div>
            </div>
          </div>
        )}

        <ol className="mt-3 space-y-2.5">
          {teams.map((t, idx) => {
            const medals = ["🥇", "🥈", "🥉", "🏅"];
            const maxAvg = Math.max(...teams.map((x) => x.average), 1);
            const pct = Math.max(10, Math.min(100, Math.round((t.average / maxAvg) * 100)));

            return (
              <li
                key={t.teamId}
                className={cn(
                  "rounded-2xl bg-canvas p-3.5 ring-1 transition-all",
                  meTeam?.teamId === t.teamId
                    ? "ring-sky-500/50 bg-sky-950/20"
                    : "ring-border hover:ring-border-strong",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{medals[idx] ?? "🏅"}</span>
                    <span className="truncate text-sm font-bold text-text">{t.teamName}</span>
                    {meTeam?.teamId === t.teamId && (
                      <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 ring-1 ring-sky-500/30">
                        Tổ của bạn
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-base font-black tabular-nums" style={{ color: t.color ?? "#94A3B8" }}>
                    {t.average.toFixed(1)} <span className="text-xs font-normal text-muted">đ/bạn</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: t.color ?? "#00F2FE",
                    }}
                  />
                </div>

                <dl className="mt-2.5 grid grid-cols-3 gap-1 text-[10px] text-muted border-t border-border/50 pt-2">
                  <div>
                    <dt>Sĩ số</dt>
                    <dd className="font-semibold text-text tabular-nums">{t.memberIds.length} bạn</dd>
                  </div>
                  <div>
                    <dt>Từ cá nhân</dt>
                    <dd className="font-semibold text-text tabular-nums">{t.fromMembers}</dd>
                  </div>
                  <div>
                    <dt>Cộng tổ</dt>
                    <dd className="font-semibold text-text tabular-nums">{t.direct}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Xếp hạng cá nhân */}
      <section className={cn(PANEL, "overflow-hidden")}>
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-text">
            <BarChart3 aria-hidden className="size-4 text-violet" />
            Xếp hạng cá nhân
          </h2>
          <span className="text-[11px] text-muted">{students.length} học sinh</span>
        </div>

        {me && (
          <div className="mx-4 mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-sky-500/10 px-3 py-2 text-xs ring-1 ring-sky-500/25">
            <span className="font-bold text-sky-300">Bạn</span>
            <span className="text-muted">
              hạng <b className="tabular-nums text-text">#{me.rank}</b> ·{" "}
              <b className="tabular-nums text-text">{me.net > 0 ? `+${me.net}` : me.net}</b> điểm ·{" "}
              <span className={me.tierTone}>{me.tier}</span>
            </span>
          </div>
        )}

        <div className="max-h-[520px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-surface">
              <tr className="text-left text-[10px] uppercase tracking-wide text-muted">
                <th className="w-10 px-3 py-2 font-bold">#</th>
                <th className="px-2 py-2 font-bold">Học sinh</th>
                <th className="px-2 py-2 text-right font-bold">Cộng</th>
                <th className="px-2 py-2 text-right font-bold">Trừ</th>
                <th className="px-2 py-2 text-right font-bold">Ròng</th>
                <th className="px-3 py-2 text-right font-bold">Xếp loại</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.userId}
                  className="border-t border-border/60 text-xs hover:bg-surface-2/60"
                >
                  <td className="px-3 py-2 tabular-nums text-muted">{s.rank}</td>
                  <td className="px-2 py-2">
                    <span className="flex items-center gap-1.5">
                      {s.teamColor && (
                        <span
                          aria-hidden
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: s.teamColor }}
                        />
                      )}
                      <span className="truncate font-semibold text-text">{s.name}</span>
                      {s.role !== "STUDENT" && (
                        <span className="shrink-0 rounded bg-surface-2 px-1 text-[9px] font-bold text-muted">
                          {roleShort(s.role)}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-emerald-300">
                    {s.positive || "—"}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-rose-300">
                    {s.negative || "—"}
                  </td>
                  <td className="px-2 py-2 text-right font-bold tabular-nums text-text">
                    {s.net > 0 ? `+${s.net}` : s.net}
                  </td>
                  <td className={cn("px-3 py-2 text-right font-bold", s.tierTone)}>{s.tier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
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
                    g.kind === "POSITIVE" ? "text-emerald-300/90" : "text-rose-300/90",
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
                          ? "text-emerald-300"
                          : (week?.net ?? 0) < 0
                            ? "text-rose-300"
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
                r.points > 0 ? "text-emerald-300" : "text-rose-300",
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
