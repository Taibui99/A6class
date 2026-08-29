"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export type AuthState = { error?: string; ok?: boolean; redirectTo?: string };

const INTERNAL_PREFIXES = [
  "/bang-dieu-khien",
  "/feed",
  "/nhan-tin",
  "/cau-hoi",
  "/ho-so",
  "/",
];

function safeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/bang-dieu-khien";
  if (raw.startsWith("//")) return "/bang-dieu-khien";
  const sameOriginOk = INTERNAL_PREFIXES.some(
    (p) => raw === "/" || raw.startsWith(p)
  );
  if (!sameOriginOk) return "/bang-dieu-khien";
  return raw;
}

function normalizeEmail(input: FormDataEntryValue | null): string {
  return String(input ?? "").trim().toLowerCase();
}

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Vui lòng nhập đầy đủ email và mật khẩu." };
  }

  const { error } = await auth.signIn.email({ email, password });
  if (error) {
    return { error: "Email hoặc mật khẩu không đúng. Vui lòng thử lại." };
  }

  return {
    ok: true,
    redirectTo: safeRedirect(formData.get("redirect") as string | null),
  };
}

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const userRole = String(formData.get("role") ?? "STUDENT");

  if (!email || !password || !fullName) {
    return { error: "Vui lòng điền đầy đủ họ tên, email và mật khẩu." };
  }
  if (password.length < 6) {
    return { error: "Mật khẩu phải có ít nhất 6 ký tự." };
  }

  const role =
    userRole === "TEACHER" ? "TEACHER" : "STUDENT";

  const { error } = await auth.signUp.email({
    email,
    password,
    name: fullName,
  });

  if (error) {
    console.error("[auth:signUp]", error.code, error.status, error.message);
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("already") || error.code === "USER_ALREADY_EXISTS") {
      return { error: "Email này đã được đăng ký. Vui lòng đăng nhập." };
    }
    return { error: "Đăng ký thất bại. Vui lòng thử lại." };
  }

  try {
    await prisma.user.upsert({
      where: { email },
      create: { email, fullName, role },
      update: { fullName, role },
    });
  } catch {
    // Hồ sơ DB chưa được tạo — auth vẫn hoạt động; sẽ đồng bộ ở lần sau.
  }

  return { ok: true, redirectTo: "/bang-dieu-khien" };
}

export async function signOut(): Promise<void> {
  await auth.signOut();
  redirect("/login");
}

export async function getClientIP(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for") ?? h.get("x-real-ip");
}