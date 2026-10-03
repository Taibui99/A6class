/**
 * KHO CÔNG CỤ CHUNG — trang chính của web lớp.
 *
 * Người dùng vào web, thấy danh sách công cụ, chọn cái cần dùng rồi
 * chuyển tới. Thi đua là công cụ nội bộ (mở trong app), các web app
 * khác của bạn là công cụ ngoài (mở trang mới).
 *
 * ── CÁCH THÊM MỘT WEB APP MỚI ──────────────────────────────────
 * Chỉ cần thêm 1 biến môi trường vào `.env.local` rồi thêm 1 mục vào
 * `EXTERNAL_APPS` bên dưới:
 *
 *   NEXT_PUBLIC_KHOA_APP_URL=https://ten-mien-cua-ban
 *
 * Bỏ trống (hoặc không khai báo) thì thẻ sẽ hiện "Chưa cấu hình" và không
 * bấm được — không có liên kết hỏng, không phải đoán URL.
 */

export type ToolAccent = "sky" | "violet" | "amber" | "emerald" | "rose";
export type ToolIcon = "trophy" | "clipboard" | "docs";

/** Công cụ nội bộ — nằm trong web lớp, mở bằng đường dẫn nội bộ. */
export type InternalTool = {
  id: string;
  name: string;
  summary: string;
  detail: string;
  href: string;
  icon: ToolIcon;
  accent: ToolAccent;
  external: false;
};

/** Công cụ ngoài — web app riêng của bạn, mở ở tab mới. */
export type ExternalTool = {
  id: string;
  name: string;
  summary: string;
  detail: string;
  /** Rỗng nghĩa là chưa cấu hình URL. */
  href: string;
  icon: ToolIcon;
  accent: ToolAccent;
  external: true;
  /** Gợi ý cho người quản trị khi thiếu URL. */
  envVar: string;
};

function env(name: string): string {
  const raw = process.env[name];
  return typeof raw === "string" ? raw.trim() : "";
}

/** URL đã chuẩn hoá để không tạo liên kết javascript: / rỗng. */
function safeUrl(raw: string): string {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

/** Điền 1 URL dưới đây (hoặc trong `.env.local`). */
export const EXTERNAL_APPS: readonly Omit<ExternalTool, "href">[] = [
  {
    id: "exam",
    name: "Tạo đề & làm bài thi",
    summary: "Soạn đề, trộn câu hỏi, chấm bài tự động",
    detail: "Dùng cho giáo viên tạo đề và cho học sinh làm bài thi.",
    icon: "clipboard",
    accent: "violet",
    external: true,
    envVar: "NEXT_PUBLIC_EXAM_APP_URL",
  },
];

function readUrl(envVar: string): string {
  const fromEnv = safeUrl(env(envVar));
  if (fromEnv) return fromEnv;
  // Cho phép đặt trực tiếp trong file này nếu bạn không dùng .env.local.
  const fromCode = safeUrl(HARDCODED_URLS[envVar] ?? "");
  return fromCode;
}

/** Điền URL tại đây nếu không muốn dùng file `.env.local`. */
const HARDCODED_URLS: Record<string, string> = {
  NEXT_PUBLIC_EXAM_APP_URL: "",
};

/** Trang chính của web lớp: kho công cụ. */
export const HUB_PATH = "/apps";

/** Công cụ nội bộ mở đầu danh sách. */
export function internalTools(): InternalTool[] {
  return [
    {
      id: "competition",
      name: "Thi đua lớp",
      summary: "Chấm điểm hằng tuần, xếp hạng tổ",
      detail:
        "Nhiệm vụ trọng tâm của lớp: nhập điểm theo 19 nhóm tiêu chí, xếp hạng 4 tổ theo trung bình và công bố kỳ.",
      href: "/competition",
      icon: "trophy",
      accent: "sky",
      external: false,
    },
  ];
}

export function externalTools(): ExternalTool[] {
  return EXTERNAL_APPS.map((app) => ({ ...app, href: readUrl(app.envVar) }));
}

export function allTools(): (InternalTool | ExternalTool)[] {
  return [...internalTools(), ...externalTools()];
}