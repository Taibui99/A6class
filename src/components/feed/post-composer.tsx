"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";

import { createPost } from "@/lib/feed-actions";

export function PostComposer() {
  const [content, setContent] = useState("");
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
        formRef.current?.reset();
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Chia sẻ điều gì đó với lớp?"
        aria-label="Nội dung bài viết"
        className="w-full resize-none rounded-xl bg-surface-hover/60 p-3 text-sm text-text outline-none ring-1 ring-transparent placeholder:text-text-muted focus:ring-primary/40"
      />
      {error && (
        <p role="alert" className="mt-2 px-1 text-xs text-danger">
          {error}
        </p>
      )}
      <div className="mt-2.5 flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={pending || !trimmed}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <Send aria-hidden className="size-4" />
          )}
          Đăng bài
        </button>
      </div>
    </form>
  );
}