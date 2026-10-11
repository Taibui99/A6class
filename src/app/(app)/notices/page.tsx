import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current";
import { getMyClass } from "@/lib/classes/service";
import { prisma } from "@/lib/prisma";
import { deleteNoticeAction } from "@/lib/notices/actions";
import { NoticeComposer } from "@/components/notices/notice-composer";

export const metadata = {
  title: "Thông báo · A6Class",
  description: "Tin tức chung của lớp.",
};

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const klass = await getMyClass();
  if (!klass) redirect("/class");

  const now = new Date();
  const notices = await prisma.announcement.findMany({
    where: {
      classId: klass.id,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: { author: { select: { fullName: true } } },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  const isTeacher = user.role === "TEACHER";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight text-text sm:text-2xl">
          Thông báo
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Tin tức chung của lớp {klass.name}.
        </p>
      </header>

      {isTeacher && (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-md sm:p-6">
          <h2 className="mb-4 text-base font-extrabold text-text">Đăng thông báo</h2>
          <NoticeComposer />
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-md sm:p-6">
        <h2 className="mb-4 text-base font-extrabold text-text">
          Bảng thông báo ({notices.length})
        </h2>
        {notices.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            Chưa có thông báo nào.
          </p>
        ) : (
          <div className="space-y-2.5">
            {notices.map((n) => (
              <article
                key={n.id}
                className={
                  n.isPinned
                    ? "rounded-xl border border-amber-ink/40 bg-amber-100/40 p-3.5"
                    : "rounded-xl border border-border bg-surface-hover/50 p-3.5"
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-text">
                    {n.isPinned && (
                      <span className="mr-1.5 rounded-full bg-amber px-2 py-0.5 text-[11px] font-extrabold text-[#1A1200]">
                        Ghim
                      </span>
                    )}
                    {n.title}
                  </p>
                  <span className="shrink-0 text-xs text-text-muted">
                    {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                {n.content && (
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    {n.content}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-text-muted">{n.author.fullName}</span>
                  {isTeacher && (
                    <form
                      action={async (formData: FormData) => {
                        "use server";
                        await deleteNoticeAction({ ok: true, message: "" }, formData);
                      }}
                    >
                      <input type="hidden" name="id" value={n.id} />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-text-muted underline hover:text-danger"
                      >
                        Xóa
                      </button>
                    </form>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
