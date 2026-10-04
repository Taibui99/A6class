"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  CheckCircle2,
  Layers,
  Flame,
  ChevronRight,
  ArrowRight,
  GraduationCap,
  CalendarClock,
} from "lucide-react";

import type { HubOverview } from "@/lib/hub";

type Props = {
  overview: HubOverview;
  greeting: string;
  userName: string;
};

const AVATAR_TONES = [
  "bg-sky/20 ring-sky/40 text-sky",
  "bg-violet/20 ring-violet/40 text-violet",
  "bg-success/20 ring-success/40 text-success",
  "bg-amber/20 ring-amber/40 text-amber",
];

const DONE = new Set(["COMPLETED"]);

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const tail = parts.slice(-2);
  return tail.map((p) => p[0]!.toUpperCase()).join("");
}

function toneFor(id: string): string {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return AVATAR_TONES[sum % AVATAR_TONES.length]!;
}

function Avatar({
  name,
  avatarUrl,
  id,
  size = "size-9",
}: {
  name: string;
  avatarUrl: string | null;
  id: string;
  size?: string;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={`${size} shrink-0 rounded-full object-cover ring-1 ring-border`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${size} grid shrink-0 place-items-center rounded-full text-xs font-black ring-1 ${toneFor(id)}`}
    >
      {initials(name)}
    </span>
  );
}

export function BentoWelcome({ overview, greeting, userName }: Props) {
  const [selected, setSelected] = useState(0);
  const teams = overview.teams;
  const active = teams[Math.min(selected, Math.max(teams.length - 1, 0))];
  const hasScores = teams.some((t) => t.average !== 0);
  const openTasks = overview.tasks.filter((t) => !DONE.has(t.status)).length;

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute -left-24 -top-28 size-72 rounded-full bg-sky/20 blur-[80px]" />
        <span className="absolute -right-20 top-10 size-64 rounded-full bg-violet/20 blur-[80px]" />
      </div>

      <div className="relative space-y-6">
        <header className="relative overflow-hidden rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-text/70">
                {greeting}
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-text sm:text-3xl">
                Xin chào, {userName}
              </h1>
              <p className="mt-1 text-sm text-text/70">
                Lớp {overview.className}
                {overview.schoolYear ? ` · ${overview.schoolYear}` : ""}
                {overview.school ? ` · ${overview.school}` : ""}
              </p>
            </div>

            {overview.daysLeft !== null ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-3 py-1.5 text-xs font-bold text-amber ring-1 ring-amber/30">
                <CalendarClock aria-hidden className="size-3.5" />
                {overview.periodName ?? "Kỳ thi"} · còn {overview.daysLeft} ngày
              </span>
            ) : null}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* ① Thi đua — 2 cột */}
          <section
            aria-labelledby="bento-thi-dua"
            className="relative overflow-hidden rounded-2xl bg-surface/60 p-5 shadow-sm ring-1 ring-border backdrop-blur-md transition-colors hover:ring-amber/40 lg:col-span-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber ring-1 ring-amber/30">
                  <Trophy aria-hidden className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <h2 id="bento-thi-dua" className="text-sm font-bold text-text">
                    Đấu trường thi đua
                  </h2>
                  <p className="text-[11px] text-text/60">
                    Xếp hạng theo điểm trung bình mỗi thành viên
                  </p>
                </div>
              </div>
              {overview.canSeeAllTeams ? (
                <Link
                  href="/competition"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-amber hover:underline"
                >
                  Xem bảng điểm
                  <ChevronRight aria-hidden className="size-3.5" />
                </Link>
              ) : null}
            </div>

            {teams.length === 0 ? (
              <p className="mt-5 rounded-xl border border-border bg-canvas/40 p-4 text-xs text-text/70">
                Lớp chưa có tổ nào. Vào{" "}
                <Link href="/class" className="font-bold text-amber hover:underline">
                  Dữ liệu lớp
                </Link>{" "}
                để tạo tổ.
              </p>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {teams.map((team, i) => {
                    const isActive = i === Math.min(selected, teams.length - 1);
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => setSelected(i)}
                        aria-pressed={isActive}
                        className={`rounded-xl p-3 text-left ring-1 transition-colors ${
                          isActive
                            ? "bg-sky/10 ring-sky/50"
                            : "bg-canvas/30 ring-border hover:bg-canvas/50"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-black text-text/80">
                            #{team.rank || i + 1}
                          </span>
                          <span
                            aria-hidden
                            className="size-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                team.color ?? "color-mix(in oklab, var(--color-text) 40%, transparent)",
                            }}
                          />
                        </span>
                        <span className="mt-2 block truncate text-xs font-bold text-text">
                          {team.name}
                        </span>
                        <span className="block text-lg font-black tabular-nums text-amber">
                          {hasScores ? team.average.toFixed(1) : "—"}
                          {hasScores ? (
                            <span className="ml-1 text-[10px] font-medium text-text/60">
                              đ/bạn
                            </span>
                          ) : null}
                        </span>
                        <span className="block text-[10px] text-text/60">
                          {team.memberCount} bạn
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-canvas/40 p-3 text-xs ring-1 ring-border">
                  <span className="min-w-0 truncate text-text/70">
                    {active ? (
                      <>
                        <span className="font-bold text-text">{active.name}</span>
                        {hasScores
                          ? ` đang xếp hạng #${active.rank} với ${active.average.toFixed(1)} điểm mỗi bạn.`
                          : " chưa có điểm trong kỳ này."}
                      </>
                    ) : null}
                  </span>
                  <Link
                    href="/competition"
                    className="inline-flex shrink-0 items-center gap-1 font-bold text-amber hover:underline"
                  >
                    Chi tiết
                    <ChevronRight aria-hidden className="size-3.5" />
                  </Link>
                </div>
              </>
            )}
          </section>

          {/* ② Thành viên — 1 cột */}
          <section
            aria-labelledby="bento-thanh-vien"
            className="relative overflow-hidden rounded-2xl bg-surface/60 p-5 shadow-sm ring-1 ring-border backdrop-blur-md transition-colors hover:ring-violet/40"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet/15 text-violet ring-1 ring-violet/30">
                <Users aria-hidden className="size-4.5" />
              </span>
              <div className="min-w-0">
                <h2 id="bento-thanh-vien" className="text-sm font-bold text-text">
                  Thành viên
                </h2>
                <p className="text-[11px] text-text/60">
                  {overview.studentCount} học sinh · {overview.staffCount} ban cán sự
                </p>
              </div>
            </div>

            {overview.staff.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {overview.staff.slice(0, 4).map((m) => (
                  <li key={m.id} className="flex items-center gap-2.5">
                    <Avatar name={m.fullName} avatarUrl={m.avatarUrl} id={m.id} />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-text">
                        {m.fullName}
                      </span>
                      <span className="block truncate text-[11px] text-text/60">
                        {m.roleLabel ?? m.teamName}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl bg-canvas/40 p-3 text-xs text-text/70 ring-1 ring-border">
                Chưa phân công ban cán sự.
              </p>
            )}

            {overview.students.length > 0 ? (
              <div className="mt-4">
                <div className="flex flex-wrap gap-1.5">
                  {overview.students.slice(0, 12).map((m) => (
                    <Avatar
                      key={m.id}
                      name={m.fullName}
                      avatarUrl={m.avatarUrl}
                      id={m.id}
                      size="size-8"
                    />
                  ))}
                  {overview.students.length > 12 ? (
                    <span className="grid size-8 place-items-center rounded-full bg-surface-hover text-[10px] font-black text-text ring-1 ring-border">
                      +{overview.students.length - 12}
                    </span>
                  ) : null}
                </div>
                <Link
                  href="/members"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet hover:underline"
                >
                  Xem tất cả thành viên
                  <ChevronRight aria-hidden className="size-3.5" />
                </Link>
              </div>
            ) : null}
          </section>

          {/* ③ Nhiệm vụ — 2 cột */}
          <section
            aria-labelledby="bento-nhiem-vu"
            className="relative overflow-hidden rounded-2xl bg-surface/60 p-5 shadow-sm ring-1 ring-border backdrop-blur-md transition-colors hover:ring-sky/40 lg:col-span-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky/15 text-sky ring-1 ring-sky/30">
                  <CheckCircle2 aria-hidden className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <h2 id="bento-nhiem-vu" className="text-sm font-bold text-text">
                    Nhiệm vụ lớp
                  </h2>
                  <p className="text-[11px] text-text/60">
                    Việc mới nhất trong lớp
                  </p>
                </div>
              </div>
              {openTasks > 0 ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-danger/15 px-2.5 py-0.5 text-[10px] font-bold text-danger ring-1 ring-danger/30">
                  <Flame aria-hidden className="size-3" />
                  {openTasks} việc chưa xong
                </span>
              ) : null}
            </div>

            {overview.tasks.length === 0 ? (
              <p className="mt-5 rounded-xl bg-canvas/40 p-4 text-xs text-text/70 ring-1 ring-border">
                Lớp chưa có nhiệm vụ nào.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {overview.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-canvas/30 p-2.5 ring-1 ring-border"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className={`size-2 shrink-0 rounded-full ${
                          DONE.has(task.status) ? "bg-success" : "bg-amber"
                        }`}
                      />
                      <span
                        className={`truncate text-xs font-medium ${
                          DONE.has(task.status) ? "text-text/50" : "text-text"
                        }`}
                      >
                        {task.title}
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] font-bold text-text/60">
                      {task.teamName ? `${task.teamName} · ` : ""}
                      <span className={task.isOverdue ? "text-danger" : undefined}>
                        {task.dueText}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/tasks"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky hover:underline"
            >
              Xem tất cả nhiệm vụ
              <ChevronRight aria-hidden className="size-3.5" />
            </Link>
          </section>

          {/* ④ Thông tin lớp — 1 cột */}
          <section
            aria-labelledby="bento-lop"
            className="relative overflow-hidden rounded-2xl bg-surface/60 p-5 shadow-sm ring-1 ring-border backdrop-blur-md transition-colors hover:ring-success/40"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-success/15 text-success ring-1 ring-success/30">
                <GraduationCap aria-hidden className="size-4.5" />
              </span>
              <div className="min-w-0">
                <h2 id="bento-lop" className="text-sm font-bold text-text">
                  Lớp của tôi
                </h2>
                <p className="text-[11px] text-text/60">{overview.schoolYear}</p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-canvas/40 p-2.5 ring-1 ring-border">
                <dt className="text-[10px] text-text/60">Số tổ</dt>
                <dd className="text-lg font-black tabular-nums text-text">
                  {overview.teamCount}
                </dd>
              </div>
              <div className="rounded-xl bg-canvas/40 p-2.5 ring-1 ring-border">
                <dt className="text-[10px] text-text/60">Học sinh</dt>
                <dd className="text-lg font-black tabular-nums text-text">
                  {overview.studentCount}
                </dd>
              </div>
            </dl>

            {overview.description ? (
              <p className="mt-3 text-xs leading-relaxed text-text/70">
                {overview.description}
              </p>
            ) : null}

            <Link
              href="/apps"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-success hover:underline"
            >
              <Layers aria-hidden className="size-3.5" />
              Kho công cụ
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}