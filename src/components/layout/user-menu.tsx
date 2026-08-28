"use client";

import { useState, useTransition } from "react";
import { LogOut, Loader2, GraduationCap } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { getInitials } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth/current";

export function UserMenu({
  user,
  variant = "desktop",
}: {
  user: CurrentUser;
  variant?: "desktop" | "mobile";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function handleSignOut() {
    startTransition(async () => {
      try {
        await signOut();
      } catch {
        setError(true);
      }
    });
  }

  const isTeacher = user.role === "TEACHER";

  if (variant === "mobile") {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={pending}
          aria-label="Đăng xuất"
          className="inline-flex size-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text disabled:opacity-50"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <LogOut aria-hidden="true" className="size-4" />
          )}
        </button>
        <Avatar data-size="sm">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          ) : null}
          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-hover">
        <Avatar>
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          ) : null}
          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text">{user.fullName}</p>
          <p className="flex items-center gap-1 text-xs font-medium text-secondary">
            <GraduationCap aria-hidden="true" className="size-3.5" />
            {isTeacher ? "Giáo viên" : "Học sinh"}
            {user.className ? ` · ${user.className}` : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          disabled={pending}
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <LogOut aria-hidden="true" className="size-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="px-2 pb-1 text-xs text-danger">
          Không thể đăng xuất. Vui lòng thử lại.
        </p>
      )}
    </div>
  );
}