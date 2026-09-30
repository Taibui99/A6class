"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight, ArrowUpRight, Crown, Flame, Medal, Search, ShieldCheck,
  Sparkles, Swords, Trophy, Users, Zap,
} from "lucide-react";
import { POSITIVE_CATEGORIES, NEGATIVE_CATEGORIES } from "@/lib/competition/config";
import { recordCompetitionPoint } from "@/lib/competition/actions";

type Student = { id: string; name: string; teamName: string; score: number };
type Team = { id: string; name: string; score: number; memberCount: number };
type Event = { id: string; amount: number; reason: string; targetName: string; giverName: string; createdAt: string };
type Props = {
  className: string;
  schoolYear: string;
  students: Student[];
  teams: Team[];
  events: Event[];
  canManage: boolean;
  hasDatabaseClass: boolean;
};

const podium = [
  { icon: Crown, label: "QUÁN QUÂN", ring: "border-amber-300/60", glow: "shadow-amber-500/10", tint: "from-amber-400/20 to-orange-500/5", iconColor: "text-amber-300" },
  { icon: Medal, label: "Á QUÂN", ring: "border-slate-300/40", glow: "shadow-slate-400/10", tint: "from-slate-300/15 to-slate-500/5", iconColor: "text-slate-200" },
  { icon: Medal, label: "HẠNG BA", ring: "border-orange-400/40", glow: "shadow-orange-500/10", tint: "from-orange-400/15 to-amber-700/5", iconColor: "text-orange-300" },
];

export function CompetitionArena({ className, schoolYear, students, teams, events, canManage, hasDatabaseClass }: Props) {
  const [tab, setTab] = useState<"teams" | "students" | "history">("teams");
  const [search, setSearch] = useState("");
  const sortedTeams = useMemo(() => [...teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "vi")), [teams]);
  const sortedStudents = useMemo(() => [...students].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "vi")), [students]);
  const leaderScore = Math.max(0, ...sortedTeams.map((team) => team.score));
  const hasScores = events.length > 0;
  const visibleStudents = sortedStudents.filter((student) => student.name.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));

  return (
    <main id="main-content" className="min-h-screen overflow-hidden bg-[#080D1B] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/3 h-[34rem] w-[34rem] rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="absolute right-[-10rem] top-[35rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/30 bg-violet-400/10 shadow-lg shadow-violet-900/20">
              <Swords className="h-6 w-6 text-violet-200" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-200/80">A6Class · Competition mode</p>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">A6 <span className="text-violet-300">ARENA</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Năm học {schoolYear}
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-bold text-violet-200">
              <Sparkles className="h-3.5 w-3.5" /> WEEKLY CLASS BATTLE
            </div>
            <h2 className="max-w-3xl text-4xl font-black leading-[1.04] tracking-tight sm:text-6xl">
              Mỗi tuần là một <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-200 bg-clip-text text-transparent">đấu trường.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Thi đua tập thể và cá nhân của lớp {className}. Tích lũy điểm, bứt hạng và mở khóa danh hiệu — công bằng, minh bạch, có lịch sử.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400"><Users className="h-4 w-4" /> Chiến binh</div>
              <p className="mt-2 text-3xl font-black tabular-nums">{students.length}</p>
              <p className="mt-1 text-xs text-slate-400">học sinh trong danh sách</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400"><Zap className="h-4 w-4" /> Điểm cao nhất</div>
              <p className="mt-2 text-3xl font-black tabular-nums">{leaderScore}</p>
              <p className="mt-1 text-xs text-slate-400">điểm ghi nhận trong kỳ</p>
            </div>
          </div>
        </section>

        {!hasDatabaseClass && (
          <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            <strong>Danh sách đã được nhập từ Excel.</strong> Để lưu điểm thật, cần liên kết lớp 12A6 và thành viên với dữ liệu A6Class. Bảng đang hiển thị 0 điểm, không phải kết quả thi đua đã xác nhận.
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Leaderboard</p>
              <h3 className="mt-1 text-xl font-extrabold sm:text-2xl">Bảng vinh danh</h3>
            </div>
            <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
              {([{ id: "teams", label: "4 tổ" }, { id: "students", label: "Cá nhân" }, { id: "history", label: "Lịch sử" }] as const).map((item) => (
                <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-lg px-3 py-2 text-xs font-bold transition sm:px-4 ${tab === item.id ? "bg-violet-300 text-slate-950 shadow" : "text-slate-300 hover:bg-white/10"}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {tab === "teams" && (
            <>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {sortedTeams.slice(0, 3).map((team, index) => {
                  const style = podium[index];
                  const Icon = style.icon;
                  return (
                    <motion.article key={team.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${style.ring} ${style.tint} ${style.glow} p-5 shadow-xl `}>
                      <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[0.22em] text-slate-300">{style.label}</span><Icon className={`h-5 w-5 ${style.iconColor}`} /></div>
                      <div className="mt-5 flex items-end justify-between gap-2">
                        <div><h4 className="text-2xl font-black">{team.name}</h4><p className="mt-1 text-xs text-slate-400">{team.memberCount} thành viên</p></div>
                        <p className="text-3xl font-black tabular-nums">{team.score}<span className="ml-1 text-xs font-bold text-slate-400">đ</span></p>
                      </div>
                      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/30"><motion.div initial={{ width: 0 }} animate={{ width: leaderScore > 0 ? `${Math.max(0, team.score) / leaderScore * 100}%` : "0%" }} className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" /></div>
                    </motion.article>
                  );
                })}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {sortedTeams.slice(3).map((team, index) => (
                  <div key={team.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-slate-300">#{index + 4}</span>
                    <div className="min-w-0 flex-1"><p className="font-bold">{team.name}</p><p className="text-xs text-slate-400">{team.memberCount} thành viên</p></div>
                    <p className="text-xl font-black tabular-nums">{team.score}<span className="ml-1 text-xs text-slate-400">đ</span></p>
                  </div>
                ))}
              </div>
              {!hasScores && <p className="mt-5 text-center text-xs text-slate-500">Chưa có giao dịch điểm trong kỳ thi đua. Thứ hạng sẽ tự cập nhật khi có dữ liệu.</p>}
            </>
          )}

          {tab === "students" && (
            <div className="mt-5">
              <label className="mb-3 flex max-w-sm items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm học sinh..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" />
              </label>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                {visibleStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center gap-3 border-b border-white/[0.06] px-3 py-3 last:border-b-0 sm:px-4">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${index === 0 && student.score > 0 ? "bg-amber-300 text-slate-950" : "bg-white/5 text-slate-300"}`}>{index + 1}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{student.name}</p><p className="text-xs text-slate-400">{student.teamName}</p></div>
                    <span className="font-black tabular-nums">{student.score} <span className="text-xs font-medium text-slate-500">đ</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="mt-5 space-y-2">
              {events.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">Chưa có lịch sử điểm trong kỳ này.</div> : events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${event.amount >= 0 ? "bg-emerald-300/10 text-emerald-300" : "bg-rose-300/10 text-rose-300"}`}>{event.amount >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}</span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-bold">{event.targetName}</p><p className="mt-1 text-xs leading-5 text-slate-400">{event.reason}</p><p className="mt-1 text-[11px] text-slate-500">Ghi bởi {event.giverName} · {new Date(event.createdAt).toLocaleString("vi-VN")}</p></div>
                  <span className={`shrink-0 text-sm font-black ${event.amount >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{event.amount > 0 ? "+" : ""}{event.amount}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {canManage && hasDatabaseClass && (
          <section className="mt-6 rounded-3xl border border-violet-300/20 bg-violet-300/[0.06] p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-300/10 text-violet-200"><ShieldCheck className="h-5 w-5" /></div>
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Staff controls</p><h3 className="mt-1 text-xl font-extrabold">Ghi nhận điểm thi đua</h3><p className="mt-1 text-sm leading-6 text-slate-300">Chỉ giáo viên và thành viên ban cán sự được phân quyền mới thấy biểu mẫu này.</p></div>
            </div>
            <form action={recordCompetitionPoint} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs font-semibold text-slate-300">Đối tượng
                <select name="targetType" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0c1428] px-3 py-3 text-sm text-white" required>
                  <option value="student">Học sinh</option><option value="team">Tổ</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-300">Học sinh / tổ
                <select name="targetId" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0c1428] px-3 py-3 text-sm text-white" required>
                  <optgroup label="Học sinh">{students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.teamName}</option>)}</optgroup>
                  <optgroup label="Tổ">{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</optgroup>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-300">Loại ghi nhận
                <select name="category" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0c1428] px-3 py-3 text-sm text-white" required>
                  <optgroup label="Điểm cộng">{POSITIVE_CATEGORIES.map((category) => <option key={category} value={category}>+ · {category}</option>)}</optgroup>
                  <optgroup label="Điểm trừ">{NEGATIVE_CATEGORIES.map((category) => <option key={category} value={category}>− · {category}</option>)}</optgroup>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-300">Số điểm (+/-)
                <input name="amount" type="number" min="-100" max="100" step="1" defaultValue="1" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0c1428] px-3 py-3 text-sm text-white" required />
              </label>
              <label className="text-xs font-semibold text-slate-300 sm:col-span-2 lg:col-span-3">Ghi chú (không bắt buộc)
                <input name="note" maxLength={240} placeholder="Ví dụ: phát biểu trong tiết Toán..." className="mt-2 w-full rounded-xl border border-white/10 bg-[#0c1428] px-3 py-3 text-sm text-white placeholder:text-slate-500" />
              </label>
              <div className="flex items-end"><button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-300 to-cyan-200 px-4 py-3 text-sm font-black text-slate-950 transition hover:brightness-110"><Flame className="h-4 w-4" /> Ghi nhận điểm</button></div>
            </form>
            <p className="mt-3 text-xs leading-5 text-amber-200/80">Lưu ý: file Excel không ghi mức điểm cụ thể cho từng hành vi. Nhập đúng số điểm theo quy định lớp; hệ thống không tự áp đặt mức điểm.</p>
          </section>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 py-8 text-xs text-slate-500">
          <span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> A6Class · {className}</span>
          <span>Điểm số minh bạch · Tinh thần đồng đội · Tiến bộ mỗi tuần</span>
        </footer>
      </div>
    </main>
  );
}
