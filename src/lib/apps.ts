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
name: "A6Class Edu",
      summary: "Soạn đề, trộn câu hỏi, chấm bài tự động",
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

/**
 * URL mặc định đặt thẳng trong code.
 *
 * Biến `NEXT_PUBLIC_*` được Next.js **nội tuyến lúc build**, nên URL chỉ
 * tồn tại trong bản build nếu biến đó có trong môi trường build (Vercel).
 * `.env.local` bị gitignore nên không bao giờ lên production — dẫn tới
 * thẻ hiện "Chưa cấu hình" và không bấm được. Đặt sẵn ở đây để bản
 * deploy luôn chạy được; biến môi trường vẫn ghi đè được nếu bạn muốn
 * trỏ sang địa chỉ khác (ví dụ khi phát triển).
 */
const HARDCODED_URLS: Record<string, string> = {
  NEXT_PUBLIC_EXAM_APP_URL: "https://edutest-vn.vercel.app/",
};

/** Trang chính của web lớp: kho công cụ. */
export const HUB_PATH = "/apps";

export function internalTools(): InternalTool[] {
  return [
    {
      id: "competition",
      name: "Thi đua lớp",
      summary: "Chấm điểm hằng tuần, xếp hạng tổ, vinh danh Top 1",
      href: "/competition",
      icon: "trophy",
      accent: "sky",
      external: false,
    },
    {
      id: "tasks",
      name: "Hoạt động & Việc lớp",
      summary: "Giao việc theo tổ, theo dõi hạn chót và tiến độ nộp bài",
      href: "/tasks",
      icon: "clipboard",
      accent: "violet",
      external: false,
    },
    {
      id: "members",
      name: "Học sinh & các tổ",
      summary: "Danh bạ học sinh, ban cán sự và sơ đồ tổ",
      href: "/members",
      icon: "docs",
      accent: "emerald",
      external: false,
    },
    {
      id: "feed",
      name: "Bảng lớp",
      summary: "Tin tức, bài đăng và tương tác của lớp",
      href: "/feed",
      icon: "docs",
      accent: "sky",
      external: false,
    },
    {
      id: "messages",
      name: "Nhắn tin",
      summary: "Trao đổi riêng hoặc theo đội",
      href: "/messages",
      icon: "docs",
      accent: "violet",
      external: false,
    },
    {
      id: "help",
      name: "Hỏi đáp",
      summary: "Hỏi bài tập, cả lớp cùng giúp nhau",
      href: "/help",
      icon: "docs",
      accent: "amber",
      external: false,
    },
    {
      id: "profile",
      name: "Hồ sơ",
      summary: "Thông tin cá nhân của bạn",
      href: "/profile",
      icon: "docs",
      accent: "rose",
      external: false,
    },
    {
      id: "achievements",
      name: "Thành tích",
      summary: "Huy hiệu và bảng vinh danh",
      href: "/achievements",
      icon: "trophy",
      accent: "amber",
      external: false,
    },
    {
      id: "dashboard",
      name: "Bảng điều khiển",
      summary: "Tổng quan nhịp sống lớp, thông báo và lịch trình",
      href: "/dashboard",
      icon: "clipboard",
      accent: "amber",
      external: false,
    },
    {
      id: "match",
      name: "Game ghép cặp",
      summary: "Nối khái niệm – nội dung, link khách không cần đăng nhập",
      href: "/p/new",
      icon: "trophy",
      accent: "violet",
      external: false,
    },
    {
      id: "tram-gia-dinh",
      name: "Ai là Triệu Phú Vật lí",
      summary: "Gameshow 20 phút kiểm tra bài cũ Vật lí 12 · tự soạn đề, chơi cả lớp",
      href: "/apps/tram-gia-dinh",
      icon: "trophy",
      accent: "amber",
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