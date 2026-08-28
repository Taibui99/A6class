import { Newspaper, ImagePlus } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
          Feed lớp
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Nơi lớp 11A6 cập nhật những khoảnh khắc và hoạt động chung.
        </p>
      </header>

      {/* Khung đăng bài */}
      <div className="rounded-xl bg-surface p-4 ring-1 ring-border">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-hover text-text-muted">
            <ImagePlus aria-hidden="true" className="size-5" />
          </span>
          <input
            readOnly
            placeholder="Chia sẻ điều gì đó với lớp?"
            aria-label="Khung đăng bài (sẽ mở sau)"
            className="h-10 w-full cursor-not-allowed rounded-lg border border-border bg-transparent px-3 text-sm text-text-secondary outline-none"
          />
        </div>
      </div>

      <EmptyState
        icon={Newspaper}
        title="Feed vẫn chưa có bài viết nào"
        description="Bài viết, ảnh hoạt động và thông báo của lớp sẽ xuất hiện tại đây theo thời gian thực."
      />
    </div>
  );
}