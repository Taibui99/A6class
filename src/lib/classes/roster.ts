/**
 * Đọc danh sách học sinh dán từ Excel / Google Sheets.
 *
 * Module thuần — không import gì từ server — để test được độc lập.
 */

export type RosterRole =
  | "STUDENT"
  | "TEAM_LEADER"
  | "TEAM_VICE_LEADER"
  | "CLASS_MONITOR";

export type ParsedRosterRow = {
  fullName: string;
  email: string | null;
  teamName: string | null;
  role: RosterRole;
};

/**
 * Bỏ dấu + hạ chữ thường + bỏ ký tự lạ, để so khớp tên không vướng lỗi gõ
 * dấu khi giáo viên nhập lại danh sách.
 */
export function looseName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

/**
 * Email sinh ra từ seed hoặc từ dòng nhập không có email — tức là chưa phải
 * email thật của học sinh, nên có thể đổi thoải mái.
 */
export function isPlaceholderEmail(email: string): boolean {
  const e = email.toLowerCase();
  return (
    e.endsWith("@a6class.test") ||
    e.endsWith("@a6class.local") ||
    e.endsWith("@example.com")
  );
}

/** Chuẩn hoá: bỏ khoảng trắng thừa, giữ dấu tiếng Việt. */
function tidy(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/** Cách viết tắt giáo viên hay dùng khi nhập nhanh. */
const ROLE_WORDS: Record<string, RosterRole> = {
  hs: "STUDENT",
  "học sinh": "STUDENT",
  tl: "TEAM_LEADER",
  "tổ trưởng": "TEAM_LEADER",
  tlt: "TEAM_VICE_LEADER",
  "tổ phó": "TEAM_VICE_LEADER",
  cm: "CLASS_MONITOR",
  lt: "CLASS_MONITOR",
  "lớp trưởng": "CLASS_MONITOR",
};

export function roleLabel(role: string): string {
  switch (role) {
    case "TEACHER":
      return "Giáo viên";
    case "TEAM_LEADER":
      return "Tổ trưởng";
    case "TEAM_VICE_LEADER":
      return "Tổ phó";
    case "CLASS_MONITOR":
      return "Lớp trưởng";
    case "LABOR_VICE_MONITOR":
      return "Bí thư lao động";
    case "ACADEMIC_VICE_MONITOR":
      return "Bí thư học tập";
    case "ACTIVITY_VICE_MONITOR":
      return "Bí thư hoạt động";
    default:
      return "Học sinh";
  }
}

export function isRoleWord(raw: string): boolean {
  return ROLE_WORDS[raw.toLowerCase().replace(/\s+/g, " ").trim()] !== undefined;
}

function parseRole(raw: string): RosterRole {
  return ROLE_WORDS[raw.toLowerCase().replace(/\s+/g, " ").trim()] ?? "STUDENT";
}

function looksLikeEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
}

/**
 * Tách cột của một dòng. Ưu tiên `|` rồi tab, sau đó mới tới dấu phẩy /
 * chấm phẩy — tên tiếng Việt hiếm khi chứa các ký tự này.
 */
function splitColumns(line: string): string[] {
  for (const sep of ["|", "\t", ";", ","]) {
    if (line.includes(sep)) {
      return line.split(sep).map(tidy);
    }
  }
  return [tidy(line)];
}

/**
 * Mỗi dòng một học sinh, cột theo thứ tự:
 *
 *     Họ tên | Email | Tổ | Chức vụ
 *
 * Cột nào để trống cũng được — chỉ cần có Họ tên. Dòng bắt đầu bằng `#`
 * là chú thích nên bị bỏ qua. Email trùng trong cùng lần nhập thì bỏ dòng sau.
 */
export function parseRoster(raw: string): ParsedRosterRow[] {
  const rows: ParsedRosterRow[] = [];
  const seenEmails = new Set<string>();

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const cols = splitColumns(line);
    const fullName = tidy(cols[0] ?? "");
    if (!fullName) continue;

    let email: string | null = null;
    let teamName: string | null = null;
    let role: RosterRole = "STUDENT";

    for (const col of cols.slice(1)) {
      if (!col) continue;
      if (!email && looksLikeEmail(col)) {
        email = col.toLowerCase();
      } else if (isRoleWord(col)) {
        role = parseRole(col);
      } else if (!teamName) {
        teamName = col;
      }
    }

    if (email) {
      if (seenEmails.has(email)) continue;
      seenEmails.add(email);
    }

    rows.push({ fullName, email, teamName, role });
  }

  return rows;
}
