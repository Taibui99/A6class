import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Crown,
  Flag,
  Gem,
  Heart,
  Lock,
  Medal,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  CheckCheck,
  PenLine,
  ListChecks,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import {
  getAchievementsForUser,
  type AchievementItem,
  type Rarity,
} from "@/lib/achievements";
import { cn, formatNumber } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  "pen-line": PenLine,
  newspaper: Newspaper,
  "message-circle": MessageCircle,
  "messages-square": MessagesSquare,
  "check-check": CheckCheck,
  "list-checks": ListChecks,
  target: Target,
  star: Star,
  gem: Gem,
  heart: Heart,
  "shield-check": ShieldCheck,
  medal: Medal,
  trophy: Trophy,
  flag: Flag,
  crown: Crown,
};

const RARITY_LABEL: Record<Rarity, string> = {
  COMMON: "Thường",
  UNCOMMON: "Hiếm",
  RARE: "Quý",
  EPIC: "Sử thi",
  LEGENDARY: "Huyền thoại",
};

const RARITY_TEXT: Record<Rarity, string> = {
  COMMON: "text-text-muted",
  UNCOMMON: "text-emerald-600",
  RARE: "text-primary",
  EPIC: "text-violet-600",
  LEGENDARY: "text-amber-700",
};

const RANK_METRICS = new Set(["personalTop", "teamRank"]);

function isRankMetric(item: AchievementItem) {
  return RANK_METRICS.has(item.metric);
}

function AchievementCard({ item, unlockedAt }: { item: AchievementItem; unlockedAt?: Date | null }) {
  const Icon = ICONS[item.icon] ?? Medal;
  const unlocked = item.unlocked;
  const isRank = isRankMetric(item);
  const pct = isRank
    ? item.current <= item.min
      ? 100
      : 0
    : Math.min(100, Math.round((item.current / item.min) * 100));

  return (
    <li
      className={cn(
        "relative flex flex-col rounded-2xl border bg-surface p-4",
        unlocked ? "border-border" : "border-border bg-surface/60"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            unlocked ? "bg-accent-light text-accent-ink" : "bg-surface-hover text-text-muted"
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-sm font-bold text-text">{item.title}</span>
            <span className={cn("text-[10px] font-bold uppercase tracking-wide", RARITY_TEXT[item.rarity])}>
              {RARITY_LABEL[item.rarity]}
            </span>
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{item.description}</p>
        </div>

        {unlocked ? (
          <span className="shrink-0 rounded-md bg-accent-light px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-accent-ink">
            Đã mở
          </span>
        ) : (
          <Lock className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden />
        )}
      </div>

      <div className="mt-3">
        {unlocked ? (
          <p className="text-[11px] text-text-muted">
            Mở {unlockedAt ? unlockedAt.toLocaleDateString("vi-VN") : "hôm nay"}
          </p>
        ) : isRank ? (
          <p className="text-[11px] text-text-muted">
            {item.current >= 999 ? "Chưa có hạng" : `Hạng hiện tại #${item.current}`} · cần top {item.min}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-text-muted">
              {formatNumber(item.current)}/{formatNumber(item.min)}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

export default async function AchievementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getAchievementsForUser(user.id);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text sm:text-2xl">
            Bảng thành tích
          </h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Mở bằng việc làm thật — đăng bài, chốt nhiệm vụ, ghi điểm cho tổ.
          </p>
        </div>
        {data && (
          <p className="text-sm font-semibold text-text">
            Bạn đã mở{" "}
            <span className="font-extrabold text-accent-ink">
              {data.unlockedCount}/{data.totalCount}
            </span>
            {data.teamItems.length > 0 && (
              <>
                {" · "}
                Tổ:{" "}
                <span className="font-extrabold text-accent-ink">
                  {data.teamItems.filter((i) => i.unlocked).length}/{data.teamItems.length}
                </span>
              </>
            )}
          </p>
        )}
      </header>

      {!data ? (
        <p className="rounded-2xl border border-border bg-surface px-5 py-8 text-center text-sm text-text-muted">
          Bạn chưa vào lớp nào nên chưa có thành tích để chấm. Vào lớp rồi quay lại nhé.
        </p>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-text-muted">
              Của bạn
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((item) => (
                <AchievementCard key={item.id} item={item} unlockedAt={item.unlockedAt} />
              ))}
            </ul>
          </section>

          {data.teamItems.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-text-muted">
                Của tổ
              </h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.teamItems.map((item) => (
                  <AchievementCard key={item.id} item={item} unlockedAt={item.unlockedAt} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="text-center text-xs text-text-muted">
        Trang này làm mới thành tích mỗi lần bạn mở.{" "}
        <Link
          href="/profile"
          className="inline-flex min-h-6 items-center font-semibold text-primary hover:underline"
        >
          Về hồ sơ
        </Link>
      </p>
    </div>
  );
}
