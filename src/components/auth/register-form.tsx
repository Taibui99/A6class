"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, TriangleAlert, UserPlus } from "lucide-react";

import { signUp, type AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: AuthState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("STUDENT");

  return (
    <form action={formAction} className="space-y-4">
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
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          placeholder="Nguyễn Văn A"
          className="mt-1.5"
        />
      </div>

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
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative mt-1.5">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="Ít nhất 6 ký tự"
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

      <div>
        <Label htmlFor="role">Bạn là</Label>
        <Select
          id="role"
          name="role"
          value={role}
          onValueChange={(v: string | null) => {
            if (v) setRole(v);
          }}
        >
          <SelectTrigger data-size="default" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="STUDENT">Học sinh</SelectItem>
            <SelectItem value="TEACHER">Giáo viên</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <UserPlus aria-hidden="true" className="size-4" />
        )}
        {pending ? "Đang đăng ký…" : "Đăng ký"}
      </Button>

      <p className="text-center text-xs leading-relaxed text-text-muted">
        Bằng cách đăng ký, bạn đồng ý trở thành thành viên của lớp 12A6. Việc
        phân công vai trò sẽ do giáo viên xác nhận.
      </p>
    </form>
  );
}

export function RegisterFooter() {
  return (
    <p className="text-center text-sm text-text-secondary">
      Đã có tài khoản?{" "}
      <Link href="/login" className="font-medium text-primary hover:underline">
        Đăng nhập
      </Link>
    </p>
  );
}