"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, TriangleAlert } from "lucide-react";

import { signIn, type AuthState } from "@/lib/auth/actions";
import { navigateWithTransition } from "@/lib/transition-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

export function LoginForm({ redirect }: { redirect: string | null }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      void navigateWithTransition(() =>
        router.push(state.redirectTo as string)
      );
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirect ?? ""} />

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger-light px-3 py-2.5 text-sm text-danger"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="email@school.edu.vn"
          className="mt-1.5"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mật khẩu</Label>
        </div>
        <div className="relative mt-1.5">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-text-muted transition-colors hover:text-text"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <LogIn aria-hidden="true" className="size-4" />
        )}
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </form>
  );
}

export function LoginFooter() {
  return (
    <p className="text-center text-sm text-text-secondary">
      Chưa có tài khoản?{" "}
      <Link href="/register" className="font-medium text-primary hover:underline">
        Đăng ký
      </Link>
    </p>
  );
}