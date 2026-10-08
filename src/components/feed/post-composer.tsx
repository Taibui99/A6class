"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";

import { createPost } from "@/lib/feed-actions";

/**
 * Composer compact (§5.3): thu về ~68px với placeholder "Có gì mới ở 12A6?",
 * click/focus mới expand. Bỏ câu hỏi lòng vòng "Chia sẻ điều gì đó với lớp?".
 */
export function PostComposer() {
  const [content, setContent] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const trimmed = content.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const res = await createPost({ content: trimmed });
      if (res?.error) {
        setError(res.error);
      } else {
        setContent("");
        setExpanded(false);
        formRef.current?.reset();
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="rounded-2xl border border-border bg-surface px-4 py-3.5"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setExpanded(true)}
        onBlur={() => {
          if (!content.trim()) setExpanded(false);
        }}
        rows={expanded ? 3 : 1}
        placeholder="Có gì mới ở 12A6?"
        aria-label="Nội dung bài viết"
        className={`w-full resize-none bg-transparent text-sm text-text outline-none focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-primary placeholder:text-text-muted ${
          expanded ? "min-h-20 py-1" : "leading-9"
        }`}
      />

      {error && (
        <p role="alert" className="mt-1.5 px-1 text-xs text-danger">
          {error}
        </p>
      )}

      {expanded && (
        <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-2.5">
          <button
            type="button"
            onClick={() => {
              setContent("");
              setExpanded(false);
            }}
            className="inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={pending || !trimmed}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <Send aria-hidden className="size-4" />
            )}
            Đăng bài
          </button>
        </div>
      )}
    </form>
  );
}
