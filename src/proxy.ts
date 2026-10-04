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
 * tham số này, và trình duyệt mang theo cookie `__Secure-neon-auth.session_challenge`
 * đã được set lúc bắt đầu đăng nhập.
 *
 * Việc đổi verifier thành cookie phiên CHỈ nằm trong middleware của Neon
 * (`processAuthMiddleware`). Nếu ta tự kiểm tra phiên ở đây thì bước đó không
 * bao giờ chạy, cookie phiên không bao giờ được tạo, và người dùng cứ bị đá
 * về trang đăng nhập. Nên khi gặp tham số này, phải đưa request qua
 * middleware của SDK.
 */
const SESSION_VERIFIER_PARAM = "neon_auth_session_verifier";

/**
 * Middleware của Neon Auth: đổi verifier, làm mới token, và chặn các route
 * cần đăng nhập. Chỉ dùng ở nhánh có verifier vì các route công khai của
 * web (`/`, `/register`, ...) không nằm trong danh sách bỏ qua mặc định.
 */
const neonMiddleware = auth.middleware({ loginUrl: "/login" });

function isPath(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = isPath(pathname, PROTECTED_PATHS);
  const isAuthPage = isPath(pathname, AUTH_PATHS);

  // Vừa quay về từ OAuth: để Neon tự đổi verifier và set cookie phiên.
  if (request.nextUrl.searchParams.has(SESSION_VERIFIER_PARAM)) {
    return neonMiddleware(request);
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