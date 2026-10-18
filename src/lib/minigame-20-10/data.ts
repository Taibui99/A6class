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

/* ===== VUA TIẾNG VIỆT 20/10 — 50 ô đa thể loại ===== */
const BOXES: BoxItem[] = [
  /* ---------- Sắp chữ / Ghép từ ---------- */
  item("truth", "SẮP CHỮ", "Xếp lại cho đúng: việt / phụ / nữ / nam", "phụ nữ Việt Nam"),
  item("truth", "SẮP CHỮ", "Xếp lại cho đúng: hồng / hoa", "hoa hồng"),
  item("truth", "SẮP CHỮ", "Xếp lại cho đúng: triệu / bà", "bà Triệu"),
  item("truth", "SẮP CHỮ", "Xếp lại cho đúng: trưng / hai / bà", "hai bà Trưng"),
  item("truth", "SẮP CHỮ", "Xếp lại cho đúng: hậu / hoa", "hoa hậu"),
  item("truth", "SẮP CHỮ", "Xếp lại cho đúng: yêu / tình", "tình yêu"),
  item("truth", "SẮP CHỮ", "Xếp lại cho đúng: sử / lịch", "lịch sử"),
  item("truth", "SẮP CHỮ", "Xếp lại cho đúng: mẹ / yêu", "yêu mẹ"),
  item("truth", "SẮP CHỮ", "Xếp lại cho đúng: thơ / tuổi", "tuổi thơ"),
  item("truth", "SẮP CHỮ", "Xếp lại cho đúng: hoa / hồng / đỏ", "hoa hồng đỏ"),

  /* ---------- Điền từ khuyết / Trắc nghiệm ngôn ngữ ---------- */
  item("truth", "ĐIỀN TỪ", "Hà Nội là ______ của Việt Nam.", "thủ đô"),
  item("truth", "ĐIỀN TỪ", "Trong câu 'Tôi yêu Việt Nam', từ 'yêu' là từ loại gì?", "động từ"),
  item("truth", "ĐIỀN TỪ", "Từ nào là danh từ trong: 'chạy – hoa – đẹp'?", "hoa"),
  item("truth", "ĐIỀN TỪ", "Từ đồng nghĩa với 'vui vẻ' là gì?", "hạnh phúc"),
  item("truth", "ĐIỀN TỪ", "Từ trái nghĩa với 'cao' là gì?", "thấp"),
  item("truth", "ĐIỀN TỪ", "Số 'hai mươi mốt' viết bằng số là?", "21"),
  item("truth", "ĐIỀN TỪ", "Con vật kêu 'meo meo' là con gì?", "con mèo"),
  item("truth", "ĐIỀN TỪ", "Thành phố Hồ Chí Minh còn gọi là gì?", "Sài Gòn"),
  item("truth", "ĐIỀN TỪ", "Từ nào bắt đầu bằng chữ 'nh': 'nhà – hoa – cá'?", "nhà"),
  item("truth", "ĐIỀN TỪ", "Từ 'bạn' gồm mấy chữ cái?", "3 chữ cái (b, ạ, n)"),

  /* ---------- Đố vui / Trắc nghiệm tổng hợp ---------- */
  item("truth", "ĐỐ VUI", "Thủ đô của nước Pháp là gì?", "Paris."),
  item("truth", "ĐỐ VUI", "Con sông dài nhất thế giới là sông nào?", "Sông Nile."),
  item("truth", "ĐỐ VUI", "Núi cao nhất Việt Nam là núi nào?", "Núi Fansipan."),
  item("truth", "ĐỐ VUI", "Trái Đất xoay quanh thiên thể nào?", "Mặt Trời."),
  item("truth", "ĐỐ VUI", "Cầu vồng có mấy màu chính?", "7 màu."),
  item("truth", "ĐỐ VUI", "Tính: 9 + 9 ÷ 9 = ?", "10 (vì 9 ÷ 9 = 1 tính trước)."),
  item("truth", "ĐỐ VUI", "Đèn giao thông có mấy màu chính?", "3 màu: đỏ, vàng, xanh."),
  item("truth", "ĐỐ VUI", "Quốc khánh Việt Nam là ngày nào?", "Ngày 2 tháng 9."),
  item("truth", "ĐỐ VUI", "Quốc gia nào có hình chữ S trên bản đồ?", "Việt Nam."),
  item("truth", "ĐỐ VUI", "Một năm thường có bao nhiêu ngày?", "365 ngày."),

  /* ---------- Xếp chữ gạch nhọn ---------- */
  item("truth", "XẾP CHỮ", "n/ữ/a /v/iệ/t /n/a/m", "nữ Việt Nam"),
  item("truth", "XẾP CHỮ", "h/ọ/a /h/ô/n/g", "hoa hồng"),
  item("truth", "XẾP CHỮ", "b/à /t/r/i/ế/u", "bà Triệu"),
  item("truth", "XẾP CHỮ", "h/ả/i /b/à /t/r/i/ế/u", "hai bà Trưng"),
  item("truth", "XẾP CHỮ", "h/ọ/a /h/ậu", "hoa hậu"),
  item("truth", "XẾP CHỮ", "t/í/nh /y/ế/u", "tình yêu"),
  item("truth", "XẾP CHỮ", "t/u/ơ/i /t/h/ơ", "tuổi thơ"),
  item("truth", "XẾP CHỮ", "p/h/ụ /n/ữ /v/iệt /n/a/m", "phụ nữ Việt Nam"),
  item("truth", "XẾP CHỮ", "l/ễ /l/ộ/i /2/0/1/0", "lễ 20/10"),

  /* ---------- Quà ngẫu nhiên (nhận trực tiếp) ---------- */
  item("gift", "QUÀ 20/10", "Được chọn 1 bài hát để cả lớp nghe ngay bây giờ."),
  item("gift", "QUÀ 20/10", "Được miễn 1 bài tập về nhà sắp tới của thầy/cô."),
  item("gift", "QUÀ 20/10", "Cả lớp vỗ tay khen 'Bạn giỏi quá!' 3 lần."),
  item("gift", "QUÀ 20/10", "Nhận 1 phần quà nhỏ từ thầy/cô."),
  item("gift", "QUÀ 20/10", "Chọn 1 bạn nữ trong lớp để tặng hoa 1 bông."),
  item("gift", "QUÀ 20/10", "Được ngồi 'ghế vinh danh' 5 phút tiếp theo."),
  item("gift", "QUÀ 20/10", "Được chọn món quà 20/10 bất ngờ cho chính mình."),

  /* ---------- Ô trống để bạn điền câu hỏi ---------- */
  item("truth", "", "", undefined, DEFAULT_SECS),
  item("truth", "", "", undefined, DEFAULT_SECS),
  item("truth", "", "", undefined, DEFAULT_SECS),
  item("truth", "", "", undefined, DEFAULT_SECS),
];

export function defaultBoxes(): BoxItem[] {
  return shuffle(BOXES).slice(0, BOX_COUNT).map((b) => ({ ...b, id: uid() }));
}

export function emptyData(): MinigameData {
  return {
    title: "VUA TIẾNG VIỆT 20/10 — LỚP 12A6",
    wish: "50 ô trộn Sắp chữ, Điền từ, Đố vui và Xếp chữ gạch nhọn — mở ô xong bấm HIỆN ĐÁP ÁN để xem đáp án. Cùng quay và thể hiện mình là Vua Tiếng Việt nhé!",
    boxes: defaultBoxes(),
  };
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
