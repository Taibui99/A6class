"use client";

import {
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Flag,
  Home,
  LayoutGrid,
  ListTodo,
  Megaphone,
  MoreHorizontal,
  PencilLine,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trophy,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

type View = "overview" | "feed" | "competition" | "tasks" | "members" | "tools";

type Team = {
  name: string;
  color: string;
  soft: string;
  score: number;
  delta: number;
  status: string;
  short: string;
};

const TEAMS: Team[] = [
  { name: "Cáo Lửa", color: "#F43F5E", soft: "#FFF1F2", score: 326, delta: 14, status: "Đang dẫn", short: "CL" },
  { name: "Rùa Biển", color: "#10B981", soft: "#ECFDF5", score: 312, delta: 6, status: "Bám sát", short: "RB" },
  { name: "Ong Mật", color: "#F59E0B", soft: "#FFFBEB", score: 298, delta: -2, status: "Cần tăng tốc", short: "OM" },
  { name: "Cú Sao", color: "#6366F1", soft: "#EEF2FF", score: 284, delta: 9, status: "Có thể vượt", short: "CS" },
];

const TASKS = [
  {
    title: "Chốt báo cáo nề nếp hôm nay",
    meta: "Lớp trưởng",
    status: "Hôm nay",
    points: 8,
    tone: "today",
  },
  {
    title: "Cập nhật điểm tốt tiết 3",
    meta: "Phụ trách học tập",
    status: "Đang làm",
    points: 5,
    tone: "doing",
  },
  {
    title: "Kiểm tra trực nhật cuối buổi",
    meta: "Tổ trưởng",
    status: "Đã xong",
    points: 6,
    tone: "done",
  },
];

const POSTS = [
  {
    author: "Nguyễn Thị Lệ Thanh",
    role: "GIÁO VIÊN",
    time: "8 phút",
    text: "Bảng điểm vừa cập nhật. Hai tổ đang bám rất sát nhau, cố lên nhé.",
    kind: "teacher",
  },
  {
    author: "Lớp trưởng 12A6",
    role: "BAN CÁN SỰ",
    time: "32 phút",
    text: "Tổ 1 đang hơn Tổ 2 đúng 14 điểm. Chiều nay còn 2 nhiệm vụ có thể kéo lại bảng.",
    kind: "class",
  },
];

const MEMBERS = [
  ["Tài Bùi", "Cáo Lửa", "#F43F5E"],
  ["Minh Anh", "Cáo Lửa", "#F43F5E"],
  ["Hoàng Long", "Rùa Biển", "#10B981"],
  ["Ngọc Hân", "Rùa Biển", "#10B981"],
  ["Khánh Duy", "Ong Mật", "#F59E0B"],
  ["Thùy Linh", "Ong Mật", "#F59E0B"],
  ["Quang Huy", "Cú Sao", "#6366F1"],
  ["Yến Nhi", "Cú Sao", "#6366F1"],
];

function Pibo({ size = 94 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 180"
      fill="none"
      aria-label="Pibo"
      role="img"
    >
      <ellipse cx="80" cy="168" rx="48" ry="7" fill="#0F172A" opacity="0.12" />
      <rect x="48" y="150" width="22" height="11" rx="5.5" fill="#CBD5E1" stroke="#0F172A" strokeWidth="3" />
      <rect x="90" y="150" width="22" height="11" rx="5.5" fill="#CBD5E1" stroke="#0F172A" strokeWidth="3" />
      <path d="M80 26V10" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="8" r="8" fill="#FFC247" stroke="#0F172A" strokeWidth="3" />
      <rect x="28" y="28" width="104" height="128" rx="42" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
      <path d="M92 136C111 126 121 111 124 93V145C113 153 101 157 86 157C88 149 90 142 92 136Z" fill="#E2E8F0" />
      <rect x="43" y="48" width="74" height="58" rx="22" fill="#0B1220" stroke="#1E293B" strokeWidth="3" />
      <ellipse cx="67" cy="77" rx="8" ry="12" fill="#A7F3D0" />
      <ellipse cx="93" cy="77" rx="8" ry="12" fill="#A7F3D0" />
      <circle cx="64.5" cy="73.5" r="2.2" fill="white" opacity="0.9" />
      <circle cx="90.5" cy="73.5" r="2.2" fill="white" opacity="0.9" />
      <path d="M68 91Q80 100 92 91" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <circle cx="48" cy="96" r="4.5" fill="#FDA4AF" opacity="0.55" />
      <circle cx="112" cy="96" r="4.5" fill="#FDA4AF" opacity="0.55" />
      <rect x="15" y="76" width="15" height="42" rx="7.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
      <rect x="130" y="76" width="15" height="42" rx="7.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
      <rect x="58" y="122" width="44" height="18" rx="6" fill="#3B82F6" stroke="#0F172A" strokeWidth="3" />
      <text x="80" y="135" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700" fill="#FFFFFF">
        12A6
      </text>
    </svg>
  );
}

function TeamMark({ team, large = false }: { team: Team; large?: boolean }) {
  return (
    <div
      className="grid shrink-0 place-items-center border-2 border-current font-black"
      style={{
        color: team.color,
        background: team.soft,
        width: large ? 62 : 42,
        height: large ? 62 : 42,
        borderRadius: large ? 16 : 10,
      }}
      aria-hidden="true"
    >
      <span style={{ fontSize: large ? 16 : 12 }}>{team.short}</span>
    </div>
  );
}

function PageIcon({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={
        "grid size-9 place-items-center rounded-lg transition-colors " +
        (active ? "bg-[#EFF6FF] text-[#3B82F6]" : "text-[#64748B]")
      }
    >
      {children}
    </span>
  );
}

function Sidebar({
  view,
  setView,
}: {
  view: View;
  setView: (v: View) => void;
}) {
  const items = [
    ["overview", "Tổng quan", Home],
    ["feed", "Bảng lớp", Megaphone],
    ["competition", "Thi đua", Trophy],
    ["tasks", "Nhiệm vụ", ListTodo],
    ["members", "Thành viên", UsersRound],
    ["tools", "Công cụ", LayoutGrid],
  ] as const;

  return (
    <aside className="sticky top-0 hidden h-dvh w-[238px] shrink-0 border-r border-[#E2E8F0] bg-[#FFFFFF] lg:flex lg:flex-col">
      <div className="flex h-[72px] items-center gap-3 border-b border-[#E2E8F0] px-5">
        <div className="grid size-10 place-items-center rounded-xl bg-[#0F172A] text-lg font-black text-white">A6</div>
        <div>
          <div className="text-[17px] font-extrabold tracking-[-0.02em]">A6CLASS</div>
          <div className="text-[11px] font-semibold text-[#64748B]">12A6 · 2026–2027</div>
        </div>
      </div>

      <div className="px-3 pt-5">
        <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
          Lớp mình
        </div>

        <nav className="space-y-1">
          {items.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={
                "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[14px] font-semibold transition-colors " +
                (view === key
                  ? "bg-[#F1F5F9] text-[#0F172A]"
                  : "text-[#475569] hover:bg-[#F1F5F9]")
              }
            >
              <PageIcon active={view === key}>
                <Icon size={18} strokeWidth={2.2} />
              </PageIcon>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-[#E2E8F0] p-4">
        <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F3F6FB] p-3">
          <div className="grid size-10 place-items-center rounded-lg bg-[#0F172A] text-xs font-bold text-white">TL</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">Tài Bùi</div>
            <div className="text-xs text-[#64748B]">Học sinh</div>
          </div>
          <button
            type="button"
            className="ml-auto grid size-8 place-items-center rounded-lg text-[#64748B] hover:bg-white"
            aria-label="Cài đặt"
          >
            <Settings2 size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({
  mode,
  setMode,
  setOpenAction,
}: {
  mode: "explore" | "work";
  setMode: (v: "explore" | "work") => void;
  setOpenAction: (v: string | null) => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-[#F3F6FB] px-4 lg:hidden">
      <div className="flex items-center gap-2.5">
        <div className="grid size-9 place-items-center rounded-lg bg-[#0F172A] text-sm font-black text-white">A6</div>
        <div>
          <div className="text-[15px] font-extrabold">12A6</div>
          <div className="text-[10px] font-semibold text-[#64748B]">Thứ Năm · 08/10</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-1 sm:flex">
          <button
            type="button"
            onClick={() => setMode("explore")}
            className={"h-9 rounded-md px-3 text-xs font-bold " + (mode === "explore" ? "bg-[#0F172A] text-white" : "text-[#64748B]")}
          >
            Khám phá
          </button>
          <button
            type="button"
            onClick={() => setMode("work")}
            className={"h-9 rounded-md px-3 text-xs font-bold " + (mode === "work" ? "bg-[#0F172A] text-white" : "text-[#64748B]")}
          >
            Làm việc
          </button>
        </div>
        <button
          type="button"
          onClick={() => setOpenAction("notification")}
          className="relative grid size-10 place-items-center rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#475569]"
          aria-label="Thông báo"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#F43F5E]" />
        </button>
      </div>
    </header>
  );
}

function DesktopTopbar({
  mode,
  setMode,
  setOpenAction,
}: {
  mode: "explore" | "work";
  setMode: (v: "explore" | "work") => void;
  setOpenAction: (v: string | null) => void;
}) {
  return (
    <header className="hidden h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-[#F3F6FB] px-8 lg:flex">
      <div>
        <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#64748B]">BẢNG LỚP 12A6</div>
        <div className="mt-0.5 text-[18px] font-extrabold">Hôm nay, lớp mình thế nào?</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-1">
          <button
            type="button"
            onClick={() => setMode("explore")}
            className={"h-9 rounded-md px-4 text-xs font-bold transition-colors " + (mode === "explore" ? "bg-[#0F172A] text-white" : "text-[#64748B] hover:text-[#0F172A]")}
          >
            Khám phá
          </button>
          <button
            type="button"
            onClick={() => setMode("work")}
            className={"h-9 rounded-md px-4 text-xs font-bold transition-colors " + (mode === "work" ? "bg-[#0F172A] text-white" : "text-[#64748B] hover:text-[#0F172A]")}
          >
            Làm việc
          </button>
        </div>
        <button
          type="button"
          onClick={() => setOpenAction("notification")}
          className="relative grid size-10 place-items-center rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#475569]"
          aria-label="Thông báo"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#F43F5E]" />
        </button>
        <button
          type="button"
          onClick={() => setOpenAction("profile")}
          className="grid size-10 place-items-center rounded-full bg-[#0F172A] text-xs font-bold text-white"
          aria-label="Hồ sơ"
        >
          TL
        </button>
      </div>
    </header>
  );
}

function Hero({
  mode,
  setOpenAction,
}: {
  mode: "explore" | "work";
  setOpenAction: (v: string | null) => void;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-[#FFFFFF]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-[-40px] top-[-70px] size-56 rounded-full border border-[#3B82F6]/35" />
        <div className="absolute right-[60px] top-[20px] size-28 rounded-full border border-[#A3E635]/18" />
        <div className="absolute bottom-0 right-[26%] h-px w-[42%] bg-[#E2E8F0]" />
      </div>

      <div className="relative grid min-h-[322px] items-end lg:grid-cols-[1fr_300px]">
        <div className="px-5 pb-7 pt-8 sm:px-8 lg:px-10 lg:pb-10">
          <div className="inline-flex items-center gap-2 border border-[#E2E8F0] bg-[#F3F6FB] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.11em] text-[#475569]">
            <span className="size-2 rounded-full bg-[#22C55E]" />
            Đang hoạt động
          </div>

          <div className="mt-5 max-w-[720px]">
            <div className="text-[13px] font-semibold text-[#64748B]">12A6 · Thứ Năm, 08/10/2026</div>
            <h1 className="mt-2 max-w-[700px] text-[clamp(34px,5vw,60px)] font-black leading-[1.03] tracking-[-0.055em] text-[#0F172A]">
              12A6 đang dẫn đầu
              <br />
              <span className="relative inline-block">
                thi đua tuần này
                <span className="absolute -bottom-1 left-0 h-2 w-[84%] -rotate-1 bg-[#A3E635]/85" />
              </span>
            </h1>
            <p className="mt-4 max-w-[560px] text-[14px] leading-6 text-[#475569]">
              Bảng lớp vừa cập nhật. Tổ 1 đang hơn Tổ 2 <strong className="text-[#0F172A]">14 điểm</strong>, nhưng vẫn còn nhiều lượt ghi điểm hôm nay.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setOpenAction(mode === "work" ? "good" : "competition")}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0F172A] px-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {mode === "work" ? <Plus size={17} /> : <Trophy size={17} />}
              {mode === "work" ? "Ghi điểm mới" : "Xem cuộc đua"}
            </button>
            <button
              type="button"
              onClick={() => setOpenAction("weekly")}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-4 text-sm font-bold text-[#0F172A] hover:bg-[#F3F6FB]"
            >
              <FileText size={17} />
              Tổng kết tuần
            </button>
          </div>
        </div>

        <div className="relative hidden min-h-[322px] items-end justify-center overflow-hidden bg-[#0F172A] lg:flex">
          <div className="absolute bottom-[58px] left-7 h-px w-[230px] bg-[#E2E8F0]" />
          <div className="absolute bottom-[94px] left-16 h-px w-[184px] bg-[#E2E8F0]" />
          <div className="absolute bottom-[112px] left-[36%] h-12 w-px rotate-[17deg] bg-[#E2E8F0]" />
          <div className="absolute left-10 top-10 text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
            COACH
          </div>
          <div className="relative mb-5">
            <div className="absolute -bottom-1 left-1/2 h-4 w-28 -translate-x-1/2 rounded-full bg-[#3B82F6]/25 blur-sm" />
            <Pibo size={152} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreStrip() {
  const items = [
    ["38", "thành viên"],
    ["4", "tổ thi đua"],
    ["24", "điểm tốt"],
    ["6", "lỗi hôm nay"],
  ];

  return (
    <section className="grid grid-cols-2 border-b border-[#E2E8F0] bg-[#F3F6FB] sm:grid-cols-4">
      {items.map(([value, label], i) => (
        <div key={label} className={"px-5 py-4 sm:px-6 " + (i > 0 ? "border-l border-[#E2E8F0]" : "")}>
          <div className="font-black leading-none tracking-[-0.04em] text-[26px] text-[#0F172A]">{value}</div>
          <div className="mt-1 text-xs font-semibold text-[#64748B]">{label}</div>
        </div>
      ))}
    </section>
  );
}

function Leaderboard({
  setOpenAction,
}: {
  setOpenAction: (v: string | null) => void;
}) {
  return (
    <section className="border-b border-[#E2E8F0] bg-[#FFFFFF]">
      <div className="flex items-end justify-between gap-4 px-5 pb-3 pt-7 sm:px-8">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">THI ĐUA</div>
          <h2 className="mt-1 text-[24px] font-black tracking-[-0.03em]">Tổ nào đang dẫn?</h2>
        </div>
        <button
          type="button"
          onClick={() => setOpenAction("competition")}
          className="inline-flex h-9 items-center gap-1 text-xs font-bold text-[#3B82F6] hover:underline"
        >
          Xem chi tiết <ChevronRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-[#E2E8F0] px-5 pb-2 sm:px-8">
        {TEAMS.map((team, index) => {
          const isFirst = index === 0;
          return (
            <button
              key={team.name}
              type="button"
              onClick={() => setOpenAction("team:" + team.name)}
              className="group flex w-full items-center gap-3 py-4 text-left"
            >
              <div className={"w-8 shrink-0 text-center font-black " + (isFirst ? "text-[#0F172A]" : "text-[#64748B]")}>
                {index + 1}
              </div>
              <TeamMark team={team} large={isFirst} />
              <div className="min-w-0 flex-1">
                <div className={"flex items-center gap-2 " + (isFirst ? "text-[18px]" : "text-[14px]")}>
                  <span className="truncate font-black tracking-[-0.02em]">{team.name}</span>
                  {isFirst && (
                    <span className="hidden border border-[#A3E635] bg-[#ECFCCB] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] sm:inline-flex">
                      DẪN ĐẦU
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[#64748B]">
                  <span>{team.status}</span>
                  <span>·</span>
                  <span className={team.delta >= 0 ? "font-bold text-[#3B82F6]" : "font-bold text-[#F43F5E]"}>
                    {team.delta >= 0 ? "↑ +" : "↓ "}{Math.abs(team.delta)} hôm nay
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className={"font-black tracking-[-0.04em] " + (isFirst ? "text-[28px]" : "text-[20px]")}>{team.score}</div>
                <div className="text-[10px] font-bold text-[#64748B]">điểm</div>
              </div>
              <ChevronRight size={17} className="hidden text-[#94A3B8] transition-transform group-hover:translate-x-1 sm:block" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Tasks({
  mode,
  setOpenAction,
}: {
  mode: "explore" | "work";
  setOpenAction: (v: string | null) => void;
}) {
  return (
    <section className="border-b border-[#E2E8F0] bg-[#F3F6FB]">
      <div className="flex items-end justify-between gap-4 px-5 pb-3 pt-7 sm:px-8">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">HÀNH ĐỘNG</div>
          <h2 className="mt-1 text-[24px] font-black tracking-[-0.03em]">Việc cần chốt</h2>
          <p className="mt-1 text-sm text-[#64748B]">{mode === "work" ? "Chốt sớm — lấy điểm cho tổ." : "Một vài việc đang chờ lớp mình."}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpenAction("tasks")}
          className="inline-flex h-9 items-center gap-1 text-xs font-bold text-[#3B82F6] hover:underline"
        >
          Tất cả việc <ChevronRight size={14} />
        </button>
      </div>

      <div className="px-5 pb-6 sm:px-8">
        <div className="divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
          {TASKS.map((task) => {
            const done = task.tone === "done";
            const tone = task.tone === "today" ? "#F59E0B" : task.tone === "doing" ? "#3B82F6" : "#22C55E";
            return (
              <button
                key={task.title}
                type="button"
                onClick={() => setOpenAction("task:" + task.title)}
                className="flex w-full items-center gap-3 py-4 text-left hover:bg-white/45"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#CBD5E1] bg-[#FFFFFF]">
                  {done ? <Check size={16} className="text-[#22C55E]" /> : <span className="size-2.5 rounded-full" style={{ background: tone }} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={"block truncate text-[14px] font-bold " + (done ? "text-[#64748B] line-through" : "text-[#0F172A]")}>
                    {task.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#64748B]">{task.meta} · {task.status}</span>
                </span>
                <span className="shrink-0 border border-[#A3E635] bg-[#ECFCCB] px-2 py-1 text-[11px] font-black text-[#3F6212]">
                  +{task.points}đ
                </span>
                <ChevronRight size={16} className="shrink-0 text-[#94A3B8]" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Bulletin({
  setOpenAction,
}: {
  setOpenAction: (v: string | null) => void;
}) {
  return (
    <section className="border-b border-[#E2E8F0] bg-[#FFFFFF]">
      <div className="flex items-end justify-between gap-4 px-5 pb-3 pt-7 sm:px-8">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">BẢNG LỚP</div>
          <h2 className="mt-1 text-[24px] font-black tracking-[-0.03em]">Có gì mới?</h2>
        </div>
        <button
          type="button"
          onClick={() => setOpenAction("feed")}
          className="inline-flex h-9 items-center gap-1 text-xs font-bold text-[#3B82F6] hover:underline"
        >
          Mở bảng lớp <ChevronRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-[#E2E8F0] px-5 pb-5 sm:px-8">
        {POSTS.map((post) => (
          <article key={post.author + post.time} className="py-5">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#0F172A] text-xs font-black text-white">
                {post.author.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[14px] font-black">{post.author}</span>
                  <span className="text-[9px] font-black tracking-[0.1em] text-[#64748B]">{post.role}</span>
                  <span className="text-xs text-[#94A3B8]">· {post.time}</span>
                </div>
                <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#334155]">{post.text}</p>
                <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-[#64748B]">
                  <button type="button" onClick={() => setOpenAction("like")} className="hover:text-[#0F172A]">Thích 3</button>
                  <button type="button" onClick={() => setOpenAction("comment")} className="hover:text-[#0F172A]">Bình luận 2</button>
                  <button type="button" onClick={() => setOpenAction("more")} className="grid size-7 place-items-center rounded-md hover:bg-[#F1F5F9]" aria-label="Thêm">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Overview({
  mode,
  setOpenAction,
}: {
  mode: "explore" | "work";
  setOpenAction: (v: string | null) => void;
}) {
  return (
    <>
      <Hero mode={mode} setOpenAction={setOpenAction} />
      <ScoreStrip />
      <Leaderboard setOpenAction={setOpenAction} />
      <Tasks mode={mode} setOpenAction={setOpenAction} />
      <Bulletin setOpenAction={setOpenAction} />
    </>
  );
}

function Competition({
  setOpenAction,
}: {
  setOpenAction: (v: string | null) => void;
}) {
  const max = Math.max(...TEAMS.map((t) => t.score));
  return (
    <div className="bg-[#FFFFFF]">
      <div className="border-b border-[#E2E8F0] px-5 py-8 sm:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">THI ĐUA · TUẦN 6</div>
        <h1 className="mt-1 text-[34px] font-black tracking-[-0.05em]">Cuộc đua 4 tổ</h1>
        <p className="mt-2 max-w-[680px] text-sm leading-6 text-[#475569]">
          Chênh lệch hiện tại chỉ 42 điểm. Bảng được thiết kế để nhìn vào là biết tổ nào đang có lợi thế.
        </p>
      </div>
      <div className="space-y-0">
        {TEAMS.map((team, index) => (
          <button
            key={team.name}
            type="button"
            onClick={() => setOpenAction("team:" + team.name)}
            className="grid w-full grid-cols-[44px_1fr_auto] items-center gap-4 border-b border-[#E2E8F0] px-5 py-5 text-left hover:bg-[#F3F6FB] sm:px-8"
          >
            <div className="font-black text-[#64748B]">#{index + 1}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <TeamMark team={team} large />
                <div>
                  <div className="text-lg font-black">{team.name}</div>
                  <div className="mt-0.5 text-xs font-semibold text-[#64748B]">{team.status}</div>
                </div>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                <div className="h-full rounded-full" style={{ width: (team.score / max) * 100 + "%", background: team.color }} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[28px] font-black tracking-[-0.04em]">{team.score}</div>
              <div className={"text-xs font-bold " + (team.delta >= 0 ? "text-[#3B82F6]" : "text-[#F43F5E]")}>
                {team.delta >= 0 ? "+" : "-"}{Math.abs(team.delta)} hôm nay
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TasksView({ setOpenAction }: { setOpenAction: (v: string | null) => void }) {
  return (
    <div className="bg-[#FFFFFF]">
      <div className="border-b border-[#E2E8F0] px-5 py-8 sm:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">NHIỆM VỤ</div>
        <h1 className="mt-1 text-[34px] font-black tracking-[-0.05em]">Việc cần chốt</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="border border-[#F0D59A] bg-[#FFFBEB] px-2.5 py-1.5 text-xs font-bold text-[#92400E]">2 việc hôm nay</span>
          <span className="border border-[#CFE2FF] bg-[#EDF4FF] px-2.5 py-1.5 text-xs font-bold text-[#1D4ED8]">1 việc đang làm</span>
          <span className="border border-[#DCFCE7] bg-[#EBF8EE] px-2.5 py-1.5 text-xs font-bold text-[#166534]">1 việc đã xong</span>
        </div>
      </div>
      <div className="divide-y divide-[#E2E8F0]">
        {TASKS.map((task) => (
          <button
            key={task.title}
            type="button"
            onClick={() => setOpenAction("task:" + task.title)}
            className="flex w-full items-center gap-4 px-5 py-5 text-left hover:bg-[#F3F6FB] sm:px-8"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#E2E8F0] bg-[#F3F6FB]">
              {task.tone === "done" ? <Check size={18} className="text-[#22C55E]" /> : <ListTodo size={18} className="text-[#3B82F6]" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold">{task.title}</div>
              <div className="mt-1 text-xs text-[#64748B]">{task.meta} · {task.status}</div>
            </div>
            <span className="border border-[#A3E635] bg-[#ECFCCB] px-2 py-1 text-[11px] font-black text-[#3F6212]">
              +{task.points}đ
            </span>
            <ChevronRight size={17} className="text-[#94A3B8]" />
          </button>
        ))}
      </div>
      <div className="px-5 py-6 sm:px-8">
        <button
          type="button"
          onClick={() => setOpenAction("new-task")}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0F172A] px-4 text-sm font-bold text-white"
        >
          <Plus size={17} />
          Tạo nhiệm vụ
        </button>
      </div>
    </div>
  );
}

function FeedView({ setOpenAction }: { setOpenAction: (v: string | null) => void }) {
  return (
    <div className="bg-[#FFFFFF]">
      <div className="border-b border-[#E2E8F0] px-5 py-8 sm:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">BẢNG LỚP</div>
        <h1 className="mt-1 text-[34px] font-black tracking-[-0.05em]">Có gì mới ở 12A6?</h1>
        <button
          type="button"
          onClick={() => setOpenAction("compose")}
          className="mt-5 flex w-full max-w-[760px] items-center gap-3 border border-[#E2E8F0] bg-[#F3F6FB] px-4 py-4 text-left text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9]"
        >
          <PencilLine size={17} />
          Viết gì đó cho cả lớp...
        </button>
      </div>
      <div className="mx-auto max-w-[760px] divide-y divide-[#E2E8F0]">
        {POSTS.concat([
          {
            author: "Tổ trưởng Tổ 2",
            role: "HỌC SINH",
            time: "1 giờ",
            text: "Rùa Biển chiều nay sẽ cố kéo lại 14 điểm. Còn 2 nhiệm vụ để bứt lên.",
            kind: "student",
          },
        ]).map((post) => (
          <article key={post.author + post.time} className="px-5 py-6 sm:px-8">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#0F172A] text-xs font-black text-white">
                {post.author.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-black">{post.author}</span>
                  <span className="text-[9px] font-black tracking-[0.1em] text-[#64748B]">{post.role}</span>
                  <span className="text-xs text-[#94A3B8]">· {post.time}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#334155]">{post.text}</p>
                <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-[#64748B]">
                  <button type="button" onClick={() => setOpenAction("like")} className="hover:text-[#0F172A]">Thích 3</button>
                  <button type="button" onClick={() => setOpenAction("comment")} className="hover:text-[#0F172A]">Bình luận 2</button>
                  <button type="button" onClick={() => setOpenAction("more")} className="grid size-7 place-items-center rounded-md hover:bg-[#F1F5F9]">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MembersView() {
  return (
    <div className="bg-[#FFFFFF]">
      <div className="border-b border-[#E2E8F0] px-5 py-8 sm:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">THÀNH VIÊN</div>
        <h1 className="mt-1 text-[34px] font-black tracking-[-0.05em]">38 bạn trong lớp</h1>
        <div className="mt-4 flex max-w-[620px] items-center gap-2 border border-[#E2E8F0] bg-[#F3F6FB] px-3">
          <Search size={16} className="text-[#64748B]" />
          <input
            placeholder="Tìm tên học sinh..."
            className="h-11 w-full bg-transparent text-sm outline-none"
            aria-label="Tìm tên học sinh"
          />
        </div>
      </div>

      <div className="grid gap-px bg-[#E2E8F0] sm:grid-cols-2">
        {MEMBERS.map(([name, teamName, color]) => (
          <div key={name} className="flex items-center gap-3 bg-[#FFFFFF] px-5 py-4 sm:px-8">
            <div className="grid size-10 place-items-center rounded-full text-xs font-black" style={{ background: color + "18", color }}>
              {name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="font-bold">{name}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-[#64748B]">
                <span className="size-2 rounded-full" style={{ background: color }} />
                {teamName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolsView({ setOpenAction }: { setOpenAction: (v: string | null) => void }) {
  const tools = [
    [ClipboardCheck, "Báo cáo ngày", "Chốt tình hình lớp và gửi giáo viên.", "report"],
    [Zap, "Ghi điểm nhanh", "Thêm điểm tốt hoặc lỗi trong vài giây.", "good"],
    [BookOpen, "Tổng kết", "Xem tuần, tháng và các mốc của lớp.", "weekly"],
    [CircleHelp, "Hướng dẫn", "Các quy tắc dùng A6Class.", "help"],
  ] as const;

  return (
    <div className="bg-[#FFFFFF]">
      <div className="border-b border-[#E2E8F0] px-5 py-8 sm:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">CÔNG CỤ</div>
        <h1 className="mt-1 text-[34px] font-black tracking-[-0.05em]">Làm việc với lớp</h1>
      </div>
      <div className="grid gap-px bg-[#E2E8F0] sm:grid-cols-2">
        {tools.map(([Icon, title, text, action]) => (
          <button
            key={title}
            type="button"
            onClick={() => setOpenAction(action)}
            className="flex min-h-[160px] flex-col items-start justify-between bg-[#FFFFFF] p-5 text-left hover:bg-[#F3F6FB] sm:p-8"
          >
            <span className="grid size-10 place-items-center rounded-lg border border-[#E2E8F0] bg-[#F3F6FB]">
              <Icon size={18} />
            </span>
            <span>
              <span className="block text-lg font-black">{title}</span>
              <span className="mt-1 block max-w-[360px] text-sm leading-6 text-[#64748B]">{text}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionSheet({
  action,
  setAction,
}: {
  action: string | null;
  setAction: (v: string | null) => void;
}) {
  if (!action) return null;

  const parts = action.split(":");
  const kind = parts[0];
  const title = parts.slice(1).join(":");

  if (kind === "good" || kind === "report" || kind === "new-task" || kind === "compose") {
    const copy =
      kind === "good"
        ? ["Ghi điểm mới", "Chọn loại hoạt động rồi ghi nhanh cho học sinh hoặc tổ."]
        : kind === "report"
          ? ["Báo cáo ngày", "Hôm nay lớp đã đủ dữ liệu để gửi giáo viên."]
          : kind === "new-task"
            ? ["Tạo nhiệm vụ", "Giao một việc mới cho tổ hoặc cả lớp."]
            : ["Bài đăng mới", "Viết điều bạn muốn cả lớp biết."];

    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0F172A]/30 p-0 sm:items-center sm:p-6">
        <div className="w-full max-w-lg rounded-t-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_16px_50px_rgba(17,24,39,.18)] sm:rounded-2xl sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">THAO TÁC</div>
              <h3 className="mt-1 text-[24px] font-black tracking-[-0.03em]">{copy[0]}</h3>
              <p className="mt-1 text-sm leading-6 text-[#64748B]">{copy[1]}</p>
            </div>
            <button type="button" onClick={() => setAction(null)} className="grid size-10 place-items-center rounded-lg hover:bg-[#F3F6FB]" aria-label="Đóng">
              <X size={18} />
            </button>
          </div>

          {kind === "good" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="border border-[#E2E8F0] bg-[#F3F6FB] p-4 text-left hover:bg-[#EFF6FF]">
                  <div className="text-sm font-black">Điểm tốt</div>
                  <div className="mt-1 text-xs text-[#64748B]">+2 điểm</div>
                </button>
                <button type="button" className="border border-[#E2E8F0] bg-[#F3F6FB] p-4 text-left hover:bg-[#FFFBEB]">
                  <div className="text-sm font-black">Nhiệm vụ</div>
                  <div className="mt-1 text-xs text-[#64748B]">+5 điểm</div>
                </button>
              </div>
              <button type="button" onClick={() => setAction(null)} className="mt-2 h-11 w-full rounded-lg bg-[#0F172A] text-sm font-bold text-white">
                Tiếp tục
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-[#E2E8F0] bg-[#F3F6FB] p-4 text-sm leading-6 text-[#334155]">
                Đây là bản UI prototype: thao tác đã được nối với luồng giao diện, còn dữ liệu thật sẽ lấy từ database hiện tại của A6Class.
              </div>
              <button type="button" onClick={() => setAction(null)} className="h-11 w-full rounded-lg bg-[#0F172A] text-sm font-bold text-white">
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const titleMap: Record<string, string> = {
    competition: "Cuộc đua 4 tổ",
    tasks: "Danh sách nhiệm vụ",
    feed: "Bảng lớp",
    weekly: "Tổng kết tuần",
    notification: "Thông báo",
    profile: "Hồ sơ",
    like: "Đã thích bài viết",
    comment: "Bình luận",
    more: "Tùy chọn bài viết",
    help: "Hướng dẫn",
    "new-task": "Tạo nhiệm vụ",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0F172A]/30 p-0 sm:items-center sm:p-6">
      <div className="w-full max-w-lg rounded-t-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_16px_50px_rgba(17,24,39,.18)] sm:rounded-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">A6CLASS</div>
            <h3 className="mt-1 text-[24px] font-black tracking-[-0.03em]">{titleMap[kind] ?? title ?? "Chi tiết"}</h3>
          </div>
          <button type="button" onClick={() => setAction(null)} className="grid size-10 place-items-center rounded-lg hover:bg-[#F3F6FB]" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 border-y border-[#E2E8F0] py-5 text-sm leading-6 text-[#475569]">
          Prototype interaction: phần này sẵn sàng để nối vào data/action thật của ứng dụng.
        </div>
        <button type="button" onClick={() => setAction(null)} className="mt-5 h-11 w-full rounded-lg bg-[#0F172A] text-sm font-bold text-white">
          Đã hiểu
        </button>
      </div>
    </div>
  );
}

function BottomNav({
  view,
  setView,
}: {
  view: View;
  setView: (v: View) => void;
}) {
  const items = [
    ["overview", "Tổng quan", Home],
    ["feed", "Bảng lớp", Megaphone],
    ["competition", "Thi đua", Trophy],
    ["tasks", "Nhiệm vụ", ListTodo],
    ["tools", "Công cụ", LayoutGrid],
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E2E8F0] bg-[#FFFFFF] px-1 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-stretch justify-around">
        {items.map(([key, label, Icon]) => {
          const active = view === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={"flex min-h-[64px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold " + (active ? "text-[#3B82F6]" : "text-[#64748B]")}
            >
              <span className={"grid h-8 w-14 place-items-center rounded-lg " + (active ? "bg-[#EFF6FF]" : "")}>
                <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function A6ClassUiPreview() {
  const [view, setView] = useState<View>("overview");
  const [mode, setMode] = useState<"explore" | "work">("explore");
  const [action, setAction] = useState<string | null>(null);

  const heading = useMemo(() => {
    if (view === "overview") return "Tổng quan";
    if (view === "feed") return "Bảng lớp";
    if (view === "competition") return "Thi đua";
    if (view === "tasks") return "Nhiệm vụ";
    if (view === "members") return "Thành viên";
    return "Công cụ";
  }, [view]);

  return (
    <div className="min-h-dvh bg-[#F3F6FB] text-[#0F172A]">
      <div className="mx-auto flex min-h-dvh max-w-[1600px]">
        <Sidebar view={view} setView={setView} />

        <div className="min-w-0 flex-1">
          <MobileHeader mode={mode} setMode={setMode} setOpenAction={setAction} />
          <DesktopTopbar mode={mode} setMode={setMode} setOpenAction={setAction} />

          <main id="main-content" className="pb-[78px] lg:pb-8">
            <div className="sr-only">{heading}</div>

            <div className="mx-auto max-w-[1240px] border-x border-[#E2E8F0] bg-[#FFFFFF]">
              {view === "overview" && <Overview mode={mode} setOpenAction={setAction} />}
              {view === "feed" && <FeedView setOpenAction={setAction} />}
              {view === "competition" && <Competition setOpenAction={setAction} />}
              {view === "tasks" && <TasksView setOpenAction={setAction} />}
              {view === "members" && <MembersView />}
              {view === "tools" && <ToolsView setOpenAction={setAction} />}
            </div>
          </main>
        </div>
      </div>

      <BottomNav view={view} setView={setView} />
      <ActionSheet action={action} setAction={setAction} />
    </div>
  );
}
