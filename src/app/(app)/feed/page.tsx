import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  ListTodo,
  Medal,
  Newspaper,
  Pin,
  Trophy,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import { getActiveEvent, type EventSummary } from "@/lib/events";
import { getClassName, getFeed, getUserClassId } from "@/lib/feed";
import { HOME_PATH } from "@/lib/home";
import { prisma } from "@/lib/prisma";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PostComposer } from "@/components/feed/post-composer";
import { PostCard } from "@/components/feed/post-card";

// Bảng lớp (§5.3): wall + divider, cột 720–760px, không bộ sưu tập card.
// Desktop rộng (≥xl): giữ wall 740px + cột phụ 300px (ghim/sự kiện/lối tắt)
// cho hết khoảng trống hai bên mà không phá spec wall.
type Announcement = {
  id: string;
  title: string;
  content: string | null;
  isPinned: boolean;
  createdAt: Date;
};

const QUICK_LINKS: { label: string; href: string; icon: LucideIcon; chip: string }[] = [
  { label: "Bảng điểm thi đua", href: "/competition", icon: Trophy, chip: "bg-[#FFE08A]" },
  { label: "Việc của tôi", href: "/tasks", icon: ListTodo, chip: "bg-[#B9E8C9]" },
  { label: "Bảng thành tích", href: "/achievements", icon: Medal, chip: "bg-[#FFC9D9]" },
];

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const classId = await getUserClassId(user.id);

  let posts: Awaited<ReturnType<typeof getFeed>> = [];
  let announcements: Announcement[] = [];
  let activeEvent: EventSummary | null = null;
  let className: string | null = null;

  if (classId) {
    [className, posts, announcements, activeEvent] = await Promise.all([
      getClassName(classId),
      getFeed(user.id, classId),
      prisma.announcement.findMany({
        where: { classId },
        select: { id: true, title: true, content: true, isPinned: true, createdAt: true },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 4,
      }),
      getActiveEvent(classId),
    ]);
  }

  return (
    <div className="mx-auto grid w-full max-w-[740px] grid-cols-1 gap-5 xl:max-w-[1064px] xl:grid-cols-[740px_300px] xl:items-start xl:gap-6">
      <div className="min-w-0 space-y-5">
        <header>
          <h1 className="text-xl font-black tracking-tight text-text sm:text-2xl">
            Bảng lớp
          </h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {className ? `Cả lớp ${className} cùng xem và cùng đăng.` : "Nơi cả lớp cùng đọc và đăng bài."}
          </p>
        </header>

        {!classId ? (
          <section
            aria-label="Tham gia lớp"
            className="flex items-start gap-4 rounded-[20px] border-2 border-[#1E1B16] bg-[#FFE08A] p-5 shadow-[4px_4px_0_#1E1B16]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-[#1E1B16] bg-white text-[#1E1B16]">
              <UserRoundPlus aria-hidden className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-text">Bạn chưa vào lớp nào</p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                Nhờ giáo viên hoặc lớp trưởng thêm bạn vào lớp rồi quay lại để
                đọc và đăng bài nhé.
              </p>
              <Link
                href={HOME_PATH}
                className="mt-3 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Về trang công cụ
              </Link>
            </div>
          </section>
        ) : (
          <>
            <PostComposer />

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user.id}
                    canPin={user.role === "TEACHER"}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Newspaper}
                title="Bảng còn trống"
                description="Có gì hay thì đăng lên cho cả lớp xem nhé."
              />
            )}
          </>
        )}
      </div>

      {/* Cột phụ desktop — ẩn dưới xl để wall luôn có đủ chỗ 740px */}
      {classId && (
        <aside className="hidden space-y-4 xl:block xl:sticky xl:top-[72px]">
          <section className="rounded-[20px] border-2 border-[#1E1B16] bg-[#FFF3D6] p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-text">
              <Pin aria-hidden className="size-4 text-accent-ink" />
              Thông báo ghim
            </h2>
            {announcements.length === 0 ? (
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                Chưa có thông báo nào. Có gì cần cả lớp biết thì đăng ở Bảng lớp nhé.
              </p>
            ) : (
              <ul className="mt-1">
                {announcements.map((a) => (
                  <li key={a.id} className="border-b border-border py-2.5 last:border-b-0 last:pb-0">
                    <p className="truncate text-xs font-bold text-text">{a.title}</p>
                    {a.content && (
                      <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary line-clamp-2">
                        {a.content}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-text-muted">
                      {formatRelativeTime(new Date(a.createdAt))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {activeEvent && (
            <section className="rounded-2xl border border-border bg-surface p-4">
              <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-text">
                <CalendarDays aria-hidden className="size-4 text-sky" />
                Sự kiện của lớp
              </h2>
              <p className="mt-2 text-xs font-bold text-text">{activeEvent.title}</p>
              {activeEvent.description && (
                <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary line-clamp-2">
                  {activeEvent.description}
                </p>
              )}
              <p className="mt-1.5 text-[11px] text-text-muted">
                {formatDate(activeEvent.startsAt)} – {formatDate(activeEvent.endsAt)}
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-sm font-extrabold text-text">Đi nhanh</h2>
            <ul className="mt-2 space-y-1">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-xs font-bold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
                  >
                    <span className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 border-[#1E1B16] ${link.chip}`}>
                      <link.icon aria-hidden className="size-3.5 shrink-0 text-[#1E1B16]" />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      )}
    </div>
  );
}
