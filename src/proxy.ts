import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/server";

const PROTECTED_PATHS = ["/bang-dieu-khien", "/feed", "/nhan-tin", "/cau-hoi", "/ho-so"];
const AUTH_PATHS = ["/login", "/register"];

function isPath(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = isPath(pathname, PROTECTED_PATHS);
  const isAuthPage = isPath(pathname, AUTH_PATHS);

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
    url.pathname = "/bang-dieu-khien";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};