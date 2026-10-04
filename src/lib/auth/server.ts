import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    // OAuth quay lại web là một lần điều hướng cross-site. Cookie `strict`
    // (mặc định) sẽ không được gửi trong trường hợp đó, khiến cookie thử
    // thách phiên không tới nơi và không thể đổi verifier thành phiên.
    sameSite: "lax",
  },
});