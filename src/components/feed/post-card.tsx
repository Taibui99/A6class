"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Link2,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Send,
  Trash2,
} from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import {
  createComment,
  deletePost,
  toggleLike,
  togglePin,
} from "@/lib/feed-actions";
import type { FeedComment, FeedPost } from "@/lib/feed";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SerializedPost = Omit<FeedPost, "comments"> & { comments: FeedComment[] };

type Props = {
  post: SerializedPost;
  currentUserId: string;
  canPin: boolean;
};

function CommentRow({ comment }: { comment: FeedComment }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span className="grid size-6 shrink-0 select-none place-items-center rounded-full bg-surface-hover text-[10px] font-extrabold text-text-secondary">
        {getInitials(comment.authorName)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-1.5 truncate text-xs font-semibold text-text">
          {comment.authorName}
          <span className="shrink-0 text-[10px] font-normal text-text-muted">
            {comment.createdAtLabel}
          </span>
        </p>
        <p className="break-words text-sm text-text-secondary">{comment.content}</p>
      </div>
    </div>
  );
}

/** Ảnh first-class (§5.3): 1 ảnh full · 2–3 grid · 4+ grid 3 cột · radius 8px. */
function PostImages({
  urls,
  onOpen,
}: {
  urls: string[];
  onOpen: (url: string) => void;
}) {
  if (urls.length === 0) return null;
  const grid = urls.length > 1;

  return (
    <div
      className={cn(
        "mt-3 gap-1",
        grid && (urls.length >= 4 ? "grid grid-cols-3" : "grid grid-cols-2")
      )}
    >
      {urls.map((url) => (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh user-uploaded, domain không xác định trước nên không qua next/image
        <img
          key={url}
          src={url}
          alt=""
          loading="lazy"
          onClick={() => onOpen(url)}
          className={cn(
            "cursor-zoom-in rounded-lg object-cover transition-opacity hover:opacity-90",
            grid
              ? "aspect-square w-full"
              : "max-h-[520px] w-full",
            !grid && "object-center"
          )}
        />
      ))}
    </div>
  );
}

export function PostCard({ post, currentUserId, canPin }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const canDelete = post.authorId === currentUserId || canPin;

  // ESC đóng lightbox (§5.3).
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);

  function toggle() {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    startTransition(async () => {
      const res = await toggleLike(post.id);
      if (res?.error) {
        setLiked(!next);
        setLikeCount((c) => c + (next ? -1 : 1));
      } else {
        router.refresh();
      }
    });
  }

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const value = comment.trim();
    if (!value) return;
    setError(null);
    startTransition(async () => {
      const res = await createComment({ postId: post.id, content: value });
      if (res?.error) {
        setError(res.error);
      } else {
        setComment("");
        router.refresh();
      }
    });
  }

  function handlePin() {
    startTransition(async () => {
      const res = await togglePin(post.id);
      if (res?.error) alert(res.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm("Xóa bài viết này?")) return;
    startTransition(async () => {
      const res = await deletePost(post.id);
      if (res?.error) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <article className="border-b border-border py-5 last:border-b-0">
      <header className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 select-none place-items-center rounded-full text-sm font-extrabold",
            post.authorRole === "TEACHER"
              ? "bg-primary text-primary-foreground"
              : "bg-surface-hover text-text-secondary"
          )}
          aria-hidden
        >
          {getInitials(post.authorName)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 truncate text-sm font-semibold text-text">
            {post.authorName}
            {post.authorRole === "TEACHER" && (
              <span className="rounded bg-primary-light px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-primary">
                Giáo viên
              </span>
            )}
          </p>
          <p className="text-xs text-text-muted">{post.createdAtLabel}</p>
        </div>

        {post.isPinned && (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-accent-ink">
            <span className="size-2 rounded-[2px] bg-accent" aria-hidden />
            Ghim trên bảng
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Tùy chọn bài viết"
                disabled={pending}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text disabled:opacity-50"
              >
                <MoreHorizontal className="size-4" aria-hidden />
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard?.writeText(
                  `${window.location.origin}/feed`
                );
              }}
            >
              <Link2 className="size-4" aria-hidden />
              Sao chép link
            </DropdownMenuItem>
            {canPin && (
              <DropdownMenuItem onClick={handlePin}>
                <Pin className="size-4" aria-hidden />
                {post.isPinned ? "Bỏ ghim" : "Ghim bài"}
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <Trash2 className="size-4" aria-hidden />
                Xóa bài
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {post.content && (
        <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-text">
          {post.content}
        </p>
      )}

      <PostImages urls={post.imageUrls} onOpen={setLightbox} />

      <footer className="mt-3 flex items-center gap-1">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-pressed={liked}
          aria-label={liked ? "Bỏ thích bài viết" : "Thích bài viết"}
          className={cn(
            "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors duration-150 disabled:opacity-60",
            liked ? "text-danger" : "text-text-secondary hover:bg-surface-hover hover:text-text"
          )}
        >
          <Heart
            aria-hidden
            className={cn("size-4 transition-all duration-150", liked && "fill-current")}
          />
          <span className="tabular-nums transition-colors duration-150">
            {likeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          aria-expanded={showComments}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-text-secondary transition-colors duration-150 hover:bg-surface-hover hover:text-text"
        >
          <MessageCircle aria-hidden className="size-4" />
          <span className="tabular-nums">{post.commentCount}</span>
        </button>
      </footer>

      {showComments && (
        <div className="mt-2 border-t border-border pt-2">
          <div className="max-h-64 overflow-y-auto">
            {post.comments.length > 0 ? (
              post.comments.map((c) => <CommentRow key={c.id} comment={c} />)
            ) : (
              <p className="py-2 text-xs text-text-muted">
                Chưa có bình luận nào. Nói câu gì đi.
              </p>
            )}
          </div>

          <form onSubmit={submitComment} className="mt-2 flex items-center gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Viết bình luận…"
              aria-label="Bình luận"
              className="h-10 w-full rounded-lg bg-surface-hover/70 px-3 text-sm text-text outline-none ring-1 ring-transparent placeholder:text-text-muted focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={pending || !comment.trim()}
              aria-label="Gửi bình luận"
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <Send aria-hidden className="size-4" />
              )}
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-1.5 px-1 text-xs text-danger">
              {error}
            </p>
          )}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh user-uploaded */}
          <img
            src={lightbox}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
          />
          <p className="absolute bottom-5 text-xs text-white/60">
            Nhấn ESC hoặc click để đóng
          </p>
        </div>
      )}
    </article>
  );
}
