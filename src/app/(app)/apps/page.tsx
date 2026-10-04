import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import { getHubOverview, getHubStats } from "@/lib/hub";
import { getUserClassId } from "@/lib/feed";
import { allTools, type ToolIcon } from "@/lib/apps";
import { BentoWelcome } from "@/components/welcome/BentoWelcome";

const ICONS: Record<ToolIcon, LucideIcon> = {
  trophy: Trophy,
  clipboard: ClipboardList,
  docs: ClipboardList,
};

const ACCENTS = {
  sky: {
    ring: "ring-sky-500/30",
    bg: "bg-sky-500/12",
    text: "text-sky",
    glow: "bg-sky-500/25",
  },
  violet: {
    ring: "ring-violet-500/30",
    bg: "bg-violet-500/12",
    text: "text-violet",
    glow: "bg-violet-500/25",
  },
  amber: {
    ring: "ring-amber-500/30",
    bg: "bg-amber-500/12",
    text: "text-amber",
    glow: "bg-amber-500/25",
  },
  emerald: {
    ring: "ring-emerald-500/30",
    bg: "bg-emerald-500/12",
    text: "text-success",
    glow: "bg-emerald-500/25",
  },
  rose: {
    ring: "ring-rose-500/30",
    bg: "bg-rose-500/12",
    text: "text-danger",
    glow: "bg-rose-500/25",
  },
} as const;

export default async function HubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tools = allTools();
  const classId = await getUserClassId(user.id);

  const [stats, overview] = await Promise.all([
    getHubStats(user.id),
    classId ? getHubOverview(classId) : null,
  ]);

  const now = new Date();
  const greeting = new Intl.DateTimeFormat("vi-VN", {
    hour: "numeric",
    hour12: true,
  })
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

  return (
    <div className="space-y-6">
      {overview ? (
        <BentoWelcome
          overview={overview}
          greeting={`${dateText} · ${greeting}`}
          userName={user.fullName ?? "bạn"}
        />
      ) : (
        <header className="relative overflow-hidden rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span className="absolute -left-20 -top-24 size-56 rounded-full bg-sky/20 blur-[70px]" />
            <span className="absolute -right-16 top-4 size-48 rounded-full bg-violet/20 blur-[70px]" />
          </div>
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-text">
              {dateText} · {greeting}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-text sm:text-3xl">
              Xin chào, {user.fullName ?? "bạn"}
            </h1>
            {user.role === "TEACHER" ? (
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-text">
                Bạn chưa có lớp nào. Mở{" "}
                <Link
                  href="/class"
                  className="font-bold text-success hover:underline"
                >
                  Dữ liệu lớp
                </Link>{" "}
                để tạo lớp, nhập danh sách học sinh và chia tổ.
              </p>
            ) : (
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-text">
                Bạn chưa được thêm vào lớp nào. Hãy nhờ giáo viên thêm bạn vào
                lớp để xem điểm thi đua và nhiệm vụ.
              </p>
            )}
          </div>
        </header>
      )}

      <section
        aria-labelledby="kho-cong-cu"
        className="space-y-3 border-t border-border pt-6"
      >
        <h2 id="kho-cong-cu" className="text-sm font-bold text-text">
          Kho công cụ
        </h2>

      {/* ── Lưới công cụ ───────────────────────────────────── */}
      {user.role === "TEACHER" ? (
        <Link
          href="/class"
          className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border transition hover:bg-surface-hover"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/12 ring-1 ring-emerald-500/30">
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
          <ChevronRight aria-hidden className="size-4 shrink-0 text-text" />
        </Link>
      ) : null}

      <section aria-label="Kho công cụ" className="grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = ICONS[tool.icon];
          const accent = ACCENTS[tool.accent];
          const configured = !tool.external || tool.href !== "";

          const body = (
            <>
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <span
                  className={`absolute -right-10 -top-12 size-40 rounded-full ${accent.glow} blur-3xl`}
                />
              </div>

              <div className="relative flex items-start gap-3">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${accent.bg} ring-1 ${accent.ring}`}
                >
                  <Icon aria-hidden className={`size-5 ${accent.text}`} />
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="flex items-center gap-1.5 text-base font-black text-text">
                    <span className="truncate">{tool.name}</span>
                    {tool.external ? (
                      <ArrowUpRight
                        aria-hidden
                        className="size-3.5 shrink-0 text-text"
                      />
                    ) : null}
                  </h2>
                  <p className="mt-0.5 text-sm text-text">{tool.summary}</p>
                </div>
              </div>

              {/* Số liệu sống cho công cụ nội bộ */}
              {!tool.external && tool.id === "competition" && stats ? (
                <dl className="relative mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                  {stats.map((s) => (
                    <div key={s.label} className="min-w-0">
                      <dd className="truncate text-lg font-black tabular-nums text-text">
                        {s.value}
                      </dd>
                      <dt className="truncate text-[11px] text-text">{s.label}</dt>
                    </div>
                  ))}
                </dl>
              ) : null}

              {/* Trạng thái cấu hình cho công cụ ngoài */}
              {tool.external && !configured ? (
                <p className="relative mt-4 rounded-lg border border-border bg-surface-hover px-3 py-2 text-xs leading-relaxed text-text">
                  Chưa cấu hình địa chỉ. Thêm biến{" "}
                  <code className="rounded bg-canvas px-1 py-0.5 font-mono text-[11px]">
                    {tool.envVar}
                  </code>{" "}
                  vào file{" "}
                  <code className="rounded bg-canvas px-1 py-0.5 font-mono text-[11px]">
                    .env.local
                  </code>{" "}
                  rồi khởi động lại dev server.
                </p>
              ) : null}

              <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-bold text-text">
                {tool.external ? "Mở trang mới" : "Mở"}
                <ArrowUpRight aria-hidden className="size-3.5" />
              </span>
            </>
          );

          if (!configured) {
            return (
              <article
                key={tool.id}
                className="relative block overflow-hidden rounded-2xl bg-surface p-5 opacity-70 ring-1 ring-border"
              >
                <h2 className="sr-only">{tool.name} (chưa cấu hình)</h2>
                <span aria-hidden className="absolute inset-0" />
                {body}
              </article>
            );
          }

          if (tool.external) {
            return (
              <a
                key={tool.id}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative block overflow-hidden rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky ${accent.ring.replace("/30", "/50")}`}
              >
                {body}
                <span className="sr-only">(mở ở tab mới)</span>
              </a>
            );
          }

          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`group relative block overflow-hidden rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky ${accent.ring.replace("/30", "/50")}`}
            >
              {body}
            </Link>
          );
        })}
        </section>
      </section>
    </div>
  );
}