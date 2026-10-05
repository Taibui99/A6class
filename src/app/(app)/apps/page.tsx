import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Rocket,
  Sparkles,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import { getHubOverview, getHubStats } from "@/lib/hub";
import { getUserClassId } from "@/lib/feed";
import { getActiveEvent } from "@/lib/events";
import { allTools, externalTools, type ToolIcon } from "@/lib/apps";
import { BentoWelcome } from "@/components/welcome/BentoWelcome";
import { LEDCountdown } from "@/components/ui/led-countdown";

const ICONS: Record<ToolIcon, LucideIcon> = {
  trophy: Trophy,
  clipboard: ClipboardList,
  docs: ClipboardList,
};

const ACCENTS = {
  sky: { bg: "bg-sky/10", ring: "ring-sky/25", text: "text-sky", glow: "bg-sky/20" },
  violet: {
    bg: "bg-violet/10",
    ring: "ring-violet/25",
    text: "text-violet",
    glow: "bg-violet/20",
  },
  amber: {
    bg: "bg-amber/10",
    ring: "ring-amber/25",
    text: "text-amber",
    glow: "bg-amber/20",
  },
  emerald: {
    bg: "bg-success/10",
    ring: "ring-success/25",
    text: "text-success",
    glow: "bg-success/20",
  },
  rose: { bg: "bg-danger/10", ring: "ring-danger/25", text: "text-danger", glow: "bg-danger/20" },
} as const;

export default async function HubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const classId = await getUserClassId(user.id);
  const all = allTools();
  // Sản phẩm đã được lên thẻ "A6Class Edu" ở trên rồi thì không lặp lại
  // trong lưới công cụ.
  const tools = all.filter((t) => !t.external);
  const edu = externalTools().find((t) => t.href !== "");

  const [stats, overview, event] = await Promise.all([
    getHubStats(user.id),
    classId ? getHubOverview(classId) : null,
    classId ? getActiveEvent(classId) : null,
  ]);

  const now = new Date();
  const greeting = new Intl.DateTimeFormat("vi-VN", { hour: "numeric", hour12: true })
    .format(now)
    .replace(/^(\d+)\s*(AM|PM)$/i, (_m, h: string, p: string) => {
      const hour = Number(h) % 12;
      return `${hour === 0 ? 12 : hour} giờ ${p.toLowerCase() === "am" ? "sáng" : "chiều tối"}`;
    });
  const dateText = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(now);

  const classLabel = overview?.className ?? "lớp 12A6";

  return (
    <div className="space-y-6">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          
        </div>

        <div className="relative space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky/10 px-3 py-1 text-xs font-bold text-sky ring-1 ring-sky/25">
            <Sparkles aria-hidden className="size-3.5" />
            A6 LEGENDS · {classLabel}
          </span>

          <div>
            <h1 className="vt-neon-title text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Ngôi nhà số của {classLabel}
            </h1>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-text-secondary">
              {dateText} · {greeting}. Chọn một sản phẩm bên dưới để vào làm việc.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              <Rocket aria-hidden className="size-4" />
              Vào A6Class
            </Link>
            <Link
              href="/members"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-surface-2 px-5 text-sm font-bold text-text ring-1 ring-border transition hover:bg-surface-hover"
            >
              <UsersRound aria-hidden className="size-4" />
              Thành viên 3D
            </Link>
          </div>

          {/* Đồng hồ chỉ hiện khi lớp thật sự có sự kiện đang chạy. */}
          {event ? (
            <div className="max-w-lg">
              <LEDCountdown endsAt={event.endsAt} title={event.title} />
              {event.description ? (
                <p className="mt-2 text-xs text-text-muted">{event.description}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {/* ── 2 sản phẩm ────────────────────────────────────────── */}
      <section aria-label="Chọn sản phẩm" className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard"
          className="group relative block overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <div className="relative flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky/10 ring-1 ring-sky/25">
              <Rocket aria-hidden className="size-6 text-sky" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-text">Vào A6Class</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Nơi quản lý lớp: thi đua, nhiệm vụ, thông báo và điểm số từng tổ.
              </p>
            </div>
            <ChevronRight
              aria-hidden
              className="mt-1 size-5 shrink-0 text-text-muted transition group-hover:translate-x-0.5"
            />
          </div>
        </Link>

        {edu ? (
          <a
            href={edu.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-amber/20 blur-3xl"
            />
            <div className="relative flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber/10 ring-1 ring-amber/25">
                <GraduationCap aria-hidden className="size-6 text-amber" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-1.5 text-lg font-black text-text">
                  A6Class Edu
                  <ArrowUpRight aria-hidden className="size-4 shrink-0 text-text-muted" />
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Soạn đề, trộn câu hỏi và chấm bài tự động — mở ở tab mới.
                </p>
              </div>
            </div>
            <span className="sr-only">(mở ở tab mới)</span>
          </a>
        ) : null}
      </section>

      {overview ? (
        <BentoWelcome
          overview={overview}
          greeting={`${dateText} · ${greeting}`}
          userName={user.fullName ?? "bạn"}
        />
      ) : (
        <header className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span className="absolute -left-20 -top-24 size-56 rounded-full bg-sky/15 blur-[70px]" />
            <span className="absolute -right-16 top-4 size-48 rounded-full bg-neon-pink/15 blur-[70px]" />
          </div>
          <div className="relative">
            <h2 className="text-xl font-black tracking-tight text-text sm:text-2xl">
              Xin chào, {user.fullName ?? "bạn"}
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-text-secondary">
              {user.role === "TEACHER" ? (
                <>
                  Bạn chưa có lớp nào. Mở{" "}
                  <Link href="/class" className="font-bold text-sky hover:underline">
                    Dữ liệu lớp
                  </Link>{" "}
                  để tạo lớp, nhập danh sách học sinh và chia tổ.
                </>
              ) : (
                "Bạn chưa được thêm vào lớp nào. Hãy nhờ giáo viên thêm bạn vào lớp để xem điểm thi đua và nhiệm vụ."
              )}
            </p>
          </div>
        </header>
      )}

      {/* ── Kho công cụ ────────────────────────────────────────── */}
      <section aria-labelledby="kho-cong-cu" className="space-y-3 border-t border-border pt-6">
        <h2 id="kho-cong-cu" className="text-sm font-bold text-text">
          Kho công cụ
        </h2>

        {user.role === "TEACHER" ? (
          <Link
            href="/class"
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:bg-surface-hover"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-success/10 ring-1 ring-success/25">
                <UsersRound aria-hidden className="size-4.5 text-success" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-text">
                  Dữ liệu lớp
                </span>
                <span className="block truncate text-xs text-text-secondary">
                  Nhập danh sách học sinh, chia tổ
                </span>
              </span>
            </span>
            <ChevronRight aria-hidden className="size-4 shrink-0 text-text-muted" />
          </Link>
        ) : null}

        <div aria-label="Kho công cụ" className="grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => {
            const Icon = ICONS[tool.icon];
            const accent = ACCENTS[tool.accent];

            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`group relative block overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${accent.ring}`}
              >
                <div className="relative flex items-start gap-3">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-xl ${accent.bg} ring-1 ${accent.ring}`}
                  >
                    <Icon aria-hidden className={`size-5 ${accent.text}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-black text-text">{tool.name}</h3>
                    <p className="mt-0.5 text-sm text-text-secondary">{tool.summary}</p>
                  </div>
                </div>

                {tool.id === "competition" && stats ? (
                  <dl className="relative mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                    {stats.map((s) => (
                      <div key={s.label} className="min-w-0">
                        <dd className="truncate text-lg font-black tabular-nums text-text">
                          {s.value}
                        </dd>
                        <dt className="truncate text-[11px] text-text-muted">{s.label}</dt>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-bold text-text-secondary">
                  Mở
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}