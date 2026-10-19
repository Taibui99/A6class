import type { RebusIconKey } from "./rebus-icons";

export type BoxType = "truth" | "dare" | "gift";

export type BoxItem = {
  id: string;
  type: BoxType;
  title: string;
  prompt?: string;
  icon?: RebusIconKey;
  answer?: string;
  secs: number;
  video?: string;
};

export type MinigameData = {
  title: string;
  wish: string;
  boxes: BoxItem[];
};

export const STORAGE_KEY = "mg20_10_v9";
export const BOX_COUNT = 50;
export const DEFAULT_SECS = 45;

export const TYPE_META: Record<BoxType, { label: string; color: string; hint: string }> = {
  truth: { label: "CÂU HỎI", color: "#ff4d6d", hint: "Đọc xong bấm HIỆN ĐÁP ÁN" },
  dare: { label: "Thách", color: "#a259ff", hint: "Phải làm ngay trước lớp" },
  gift: { label: "Quà", color: "#ffb703", hint: "Nhận quà ngay, không hỏi" },
};

const uid = () => Math.random().toString(36).slice(2, 9);

/* Random THẬT bằng entropy phần cứng (không phải Math.random). */
export function cryptoRandom(max: number): number {
  if (max <= 0) return 0;
  try {
    const arr = new Uint32Array(1);
    const limit = Math.floor(4294967296 / max) * max;
    let v = 0;
    let guard = 0;
    do {
      crypto.getRandomValues(arr);
      v = arr[0];
      guard++;
    } while (v >= limit && guard < 64);
    return v % max;
  } catch {
    return Math.floor(Math.random() * max);
  }
}

export function shuffle<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = cryptoRandom(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function item(
  type: BoxType,
  title: string,
  prompt?: string,
  answer?: string,
  secs = DEFAULT_SECS,
  video?: string,
  icon?: RebusIconKey,
): BoxItem {
  const b: BoxItem = { id: uid(), type, title, secs };
  if (prompt !== undefined) b.prompt = prompt;
  if (answer) b.answer = answer;
  if (video) b.video = video;
  if (icon) b.icon = icon;
  return b;
}

/* ===== VUA TIẾNG VIỆT 20/10 — TOÀN BỘ TÁCH TỪNG KÍ TỰ, CHỦ ĐỀ 20/10 + ĐỐ VUI TIẾNG VIỆT ===== */
const BOXES: BoxItem[] = [
  /* ---------- Xếp chữ tách kí tự — chủ đề 20/10 ---------- */
  item("truth", "XẾP CHỮ", "p/h/ụ /n/ữ /v/i/ệ/t /n/a/m", "phụ nữ Việt Nam"),
  item("truth", "XẾP CHỮ", "n/g/à/y /p/h/ụ /n/ữ /v/i/ệ/t /n/a/m", "ngày phụ nữ Việt Nam"),
  item("truth", "XẾP CHỮ", "2/0 /t/h/á/n/g /1/0", "20 tháng 10"),
  item("truth", "XẾP CHỮ", "l/ễ /2/0 /1/0", "lễ 20/10"),
  item("truth", "XẾP CHỮ", "c/h/ú/c /m/ự/n/g /2/0 /1/0", "chúc mừng 20/10"),
  item("truth", "XẾP CHỮ", "h/ạ/i /b/à /t/r/ư/n/g", "hai bà Trưng"),
  item("truth", "XẾP CHỮ", "b/à /t/r/i/ệ/u", "bà Triệu"),
  item("truth", "XẾP CHỮ", "t/r/i/ệ/u /t/h/ị /t/r/i/n/h", "Triệu Thị Trinh"),
  item("truth", "XẾP CHỮ", "t/r/ư/n/g /t/r/ắ/c", "Trưng Trắc"),
  item("truth", "XẾP CHỮ", "t/r/ư/n/g /n/h/ị", "Trưng Nhị"),

  /* ---------- Xếp chữ tách kí tự — phụ nữ, tình yêu, cuộc sống ---------- */
  item("truth", "XẾP CHỮ", "m/ẹ", "mẹ"),
  item("truth", "XẾP CHỮ", "y/ê/u /m/ẹ", "yêu mẹ"),
  item("truth", "XẾP CHỮ", "t/ì/n/h /y/ê/u", "tình yêu"),
  item("truth", "XẾP CHỮ", "y/ê/u /t/h/ư/ơ/n/g", "yêu thương"),
  item("truth", "XẾP CHỮ", "n/ữ /n/h/â/n", "nữ nhân"),
  item("truth", "XẾP CHỮ", "c/ư/ờ/n/g /n/ữ", "cường nữ"),
  item("truth", "XẾP CHỮ", "c/ư/ờ/n/g /n/ữ /v/i/ệ/t /n/a/m", "cường nữ Việt Nam"),
  item("truth", "XẾP CHỮ", "n/ữ /t/h/ế /g/i/ớ/i", "nữ thế giới"),
  item("truth", "XẾP CHỮ", "t/h/ể /g/i/ớ/i /n/ữ", "thể giới nữ"),
  item("truth", "XẾP CHỮ", "h/ọ/a /h/ồ/n/g", "hoa hồng"),

  /* ---------- Xếp chữ tách kí tự — đố vui tiếng Việt ---------- */
  item("truth", "XẾP CHỮ", "t/h/ủ /đ/ô", "thủ đô"),
  item("truth", "XẾP CHỮ", "h/à /n/ộ/i", "Hà Nội"),
  item("truth", "XẾP CHỮ", "s/ả/i /g/ò/n", "Sài Gòn"),
  item("truth", "XẾP CHỮ", "v/i/ệ/t /n/a/m", "Việt Nam"),
  item("truth", "XẾP CHỮ", "m/ặ/t /t/r/ờ/i", "Mặt Trời"),
  item("truth", "XẾP CHỮ", "t/r/á/i /đ/ấ/t", "Trái Đất"),
  item("truth", "XẾP CHỮ", "c/ầ/u /v/ò/n/g", "cầu vồng"),
  item("truth", "XẾP CHỮ", "t/h/ơ/m /t/h/ư", "thơm thảo"),
  item("truth", "XẾP CHỮ", "h/ọ/c /t/ậ/p", "học tập"),
  item("truth", "XẾP CHỮ", "l/ị/c/h /s/ử", "lịch sử"),

  /* ---------- Xếp chữ tách kí tự — đố vui tiếng Việt (tiếp) ---------- */
  item("truth", "XẾP CHỮ", "v/ă/n /h/ọ/c", "văn học"),
  item("truth", "XẾP CHỮ", "t/i/ế/n/g /v/i/ệ/t", "tiếng Việt"),
  item("truth", "XẾP CHỮ", "t/ừ /đ/i/ể/n", "từ điển"),
  item("truth", "XẾP CHỮ", "đ/ố /v/u/i", "đố vui"),
  item("truth", "XẾP CHỮ", "t/r/í /t/u/ệ", "trí tuệ"),
  item("truth", "XẾP CHỮ", "s/á/n/g /t/ạ/o", "sáng tạo"),
  item("truth", "XẾP CHỮ", "t/h/â/n /t/h/à/n/h", "thân thiện"),
  item("truth", "XẾP CHỮ", "c/h/ấ/t /p/h/á/t", "chất phát"),
  item("truth", "XẾP CHỮ", "h/ả/i /l/ò/n/g", "hai lòng"),
  item("truth", "XẾP CHỮ", "t/ậ/n /t/ì/n/h", "tận tình"),

  /* ---------- Xếp chữ tách kí tự — từ vựng, lễ hội ---------- */
  item("truth", "XẾP CHỮ", "q/u/ố/c /k/h/á/n/h", "quốc khánh"),
  item("truth", "XẾP CHỮ", "n/g/à/y /q/u/ố/c /t/ế /p/h/ụ /n/ữ", "ngày Quốc tế Phụ nữ"),
  item("truth", "XẾP CHỮ", "n/g/à/y /q/u/ố/c /k/h/á/n/h /v/i/ệ/t /n/a/m", "ngày Quốc khánh Việt Nam"),
  item("truth", "XẾP CHỮ", "b/à /m/ẹ /v/i/ệ/t /n/a/m", "bà mẹ Việt Nam"),
  item("truth", "XẾP CHỮ", "c/h/ị /e/m /p/h/ụ /n/ữ", "chị em phụ nữ"),
  item("truth", "XẾP CHỮ", "t/h/à/n/h /c/ô/n/g", "thành công"),
  item("truth", "XẾP CHỮ", "h/ọ/c /g/i/ỏ/i", "học giỏi"),
  item("truth", "XẾP CHỮ", "c/ả /l/ớ/p", "cả lớp"),
  item("truth", "XẾP CHỮ", "l/ớ/p /1/2 /a/6", "lớp 12A6"),
  item("truth", "XẾP CHỮ", "c/h/ú/c /p/h/ụ /n/ữ /2/0 /1/0", "chúc phụ nữ 20/10"),
];

export function defaultBoxes(): BoxItem[] {
  return shuffle(BOXES).slice(0, BOX_COUNT).map((b) => ({ ...b, id: uid() }));
}

export function emptyData(): MinigameData {
  return {
    title: "VUA TIẾNG VIỆT 20/10",
    wish: "50 ô xếp chữ tách từng kí tự — chủ đề 20/10 và đố vui tiếng Việt. Mở ô → bấm HIỆN ĐÁP ÁN để xem đáp án.",
    boxes: defaultBoxes(),
  };
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
