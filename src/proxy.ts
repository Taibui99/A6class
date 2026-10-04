import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/server";
import { HOME_PATH } from "@/lib/home";

const PROTECTED_PATHS = [
  HOME_PATH,
  "/competition",
  "/class",
  "/dashboard",
  "/feed",
  "/messages",
  "/help",
  "/profile",
];
const AUTH_PATHS = ["/login", "/register"];

/**
 * Sau khi OAuth thành công, Neon chuyển người dùng về `callbackURL` kèm
 * tham số này. Session lúc đó CHƯA được đổi thành cookie trên domain của
 * app — việc đó chỉ xảy ra ở trình duyệt, khi `authClient.getSession()` gửi
 * tham số này lên máy chủ auth và nhận về `Set-Cookie`.
 *
 * Nếu ta chuyển hướng sang /login ngay ở đây thì client không bao giờ kịp
 * chạy, cookie không bao giờ được tạo, và người dùng cứ bị đá về trang
 * đăng nhập. Nên ta chuyển tạm sang trang `/auth/complete` để hoàn tất việc
 * đổi verifier, rồi trang đó mới đưa người dùng tới đích.
 */
const SESSION_VERIFIER_PARAM = "neon_auth_session_verifier";
const COMPLETE_PATH = "/auth/complete";

function isPath(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = isPath(pathname, PROTECTED_PATHS);
  const isAuthPage = isPath(pathname, AUTH_PATHS);

  if (pathname.startsWith(COMPLETE_PATH)) return NextResponse.next();

  // Vừa đăng nhập xong: đi qua trang hoàn tất để lấy cookie phiên.
  if (request.nextUrl.searchParams.has(SESSION_VERIFIER_PARAM)) {
    const url = request.nextUrl.clone();
    url.pathname = COMPLETE_PATH;
    url.searchParams.set("target", isAuthPage ? HOME_PATH : pathname);
    return NextResponse.rewrite(url);
  }

  if (!isProtected && !isAuthPage) return NextResponse.next();
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) {
    return NextResponse.next();
  }

  const { data: session } = await auth.getSession();
  const user = session?.user ?? null;

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = HOME_PATH;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};