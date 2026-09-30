import type { NextConfig } from "next";

/** Slug cũ tiếng Việt -> slug tiếng Anh. Giữ cho link đã lưu vẫn chạy. */
const LEGACY_SLUGS: Record<string, string> = {
  "bang-dieu-khien": "dashboard",
  "thi-dua": "competition",
  "nhan-tin": "messages",
  "cau-hoi": "help",
  "ho-so": "profile",
};

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(LEGACY_SLUGS).map(([from, to]) => ({
      source: `/${from}`,
      destination: `/${to}`,
      permanent: true,
    }));
  },
};

export default nextConfig;