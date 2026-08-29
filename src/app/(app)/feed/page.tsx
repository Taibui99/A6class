import Link from "next/link";
import { redirect } from "next/navigation";
import { Newspaper, UserRoundPlus } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import { getClassName, getFeed, getUserClassId } from "@/lib/feed";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PostComposer } from "@/components/feed/post-composer";
import { PostCard } from "@/components/feed/post-card";

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const classId = await getUserClassId(user.id);
  const className = classId ? await getClassName(classId) : null;
  const posts = classId ? await getFeed(user.id, classId) : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
          Bảng tin
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Nơi {className ?? "lớp"} cập nhật những khoảnh khắc và hoạt động chung.
        </p>
      </header>

      {!classId ? (
        <section
          aria-label="Tham gia lớp"
          className="flex items-start gap-4 rounded-2xl border border-warning/25 bg-warning-light p-5"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-warning">
            <UserRoundPlus aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-text">Bạn chưa vào lớp 12A6</p>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              Nhờ giáo viên hoặc lớp trưởng thêm bạn vào lớp rồi quay lại để
              đọc và đăng bài nhé.
            </p>
            <Link
              href="/bang-dieu-khien"
              className="mt-3 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Về trang chủ
            </Link>
          </div>
        </section>
      ) : (
        <>
          <PostComposer />

          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Newspaper}
              mascot
              title="Chưa có bài viết nào"
              description="Đăng bài đầu tiên để mở đầu bảng tin của lớp!"
            />
          )}
        </>
      )}
    </div>
  );
}