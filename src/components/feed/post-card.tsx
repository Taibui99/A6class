"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, MessageCircle, Pin, Send } from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import { createComment, toggleLike } from "@/lib/feed-actions";
import type { FeedComment, FeedPost } from "@/lib/feed";

type SerializedPost = Omit<FeedPost, "comments"> & { comments: FeedComment[] };

function CommentRow({ comment }: { comment: FeedComment }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span className="grid size-7 shrink-0 select-none place-items-center rounded-full bg-surface-hover text-[10px] font-extrabold text-text-secondary">
        {getInitials(comment.authorName)}
      </span>
      <div className="min-w-0 flex-1 rounded-xl bg-surface-hover/70 px-3 py-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-xs font-semibold text-text">
            {comment.authorName}
          </p>
          <p className="shrink-0 text-[10px] text-text-muted">
            {comment.createdAtLabel}
          </p>
        </div>
        <p className="text-sm text-text-secondary">{comment.content}</p>
      </div>
    </div>
  );
}

export function PostCard({ post }: { post: SerializedPost }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  return (
    <article
      className={cn(
        "rounded-2xl bg-surface p-4 shadow-sm ring-1",
        post.isPinned ? "ring-primary/25" : "ring-border"
      )}
    >
      <header className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-9 shrink-0 select-none place-items-center rounded-full text-xs font-extrabold",
            post.authorRole === "TEACHER"
              ? "bg-primary text-primary-foreground"
              : "bg-warning-light text-warning"
          )}
        >
          {getInitials(post.authorName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-text">
            {post.authorName}
            {post.authorRole === "TEACHER" && (
              <span className="rounded-full bg-primary-light px-1.5 py-px text-[10px] font-semibold text-primary">
                Giáo viên
              </span>
            )}
          </p>
          <p className="text-xs text-text-muted">{post.createdAtLabel}</p>
        </div>
        {post.isPinned && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-light px-2 py-0.5 text-[10px] font-semibold text-warning">
            <Pin aria-hidden className="size-3" />
            Đã ghim
          </span>
        )}
      </header>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text">
        {post.content}
      </p>

      <footer className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-pressed={liked}
          className={cn(
            "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-60",
            liked
              ? "bg-danger-light text-danger"
              : "bg-surface-hover text-text-secondary hover:text-text"
          )}
        >
          <Heart
            aria-hidden
            className={cn("size-4", liked && "fill-current")}
          />
          {likeCount}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-surface-hover px-3.5 py-2 text-xs font-semibold text-text-secondary transition-colors hover:text-text"
        >
          <MessageCircle aria-hidden className="size-4" />
          {post.commentCount}
        </button>
      </footer>

      {showComments && (
        <div className="mt-3 border-t border-border pt-3">
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {post.comments.length > 0 ? (
              post.comments.map((c) => (
                <CommentRow key={c.id} comment={c} />
              ))
            ) : (
              <p className="py-2 text-center text-xs text-text-muted">
                Chưa có bình luận nào.
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
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
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
    </article>
  );
}