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

export const STORAGE_KEY = "mg20_10_v6";
export const BOX_COUNT = 50;
export const DEFAULT_SECS = 45;

export const TYPE_META: Record<BoxType, { label: string; color: string; hint: string }> = {
  truth: { label: "CÂU HỎI", color: "#ff4d6d", hint: "Đọc xong bấm HIỆN ĐÁP ÁN" },
  dare: { label: "Thách", color: "#a259ff", hint: "Phải làm ngay" },
  gift: { label: "Quà", color: "#ffb703", hint: "Nhận quà ngay" },
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

/* ===== 50 ô: nhìn hình thật (SVG), xếp chữ gạch nhọn, hỏi yêu cầu, quà ngẫu nhiên — liên quan 20/10 ===== */
const BOXES: BoxItem[] = [
  /* ---------- Nhìn hình thật đoán chữ ---------- */
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "nón lá", DEFAULT_SECS, undefined, "nonla"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "hoa hồng", DEFAULT_SECS, undefined, "hoa"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "tim", DEFAULT_SECS, undefined, "tim"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "mắt", DEFAULT_SECS, undefined, "mat"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "nước", DEFAULT_SECS, undefined, "nuoc"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "trăng", DEFAULT_SECS, undefined, "trang"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "sao", DEFAULT_SECS, undefined, "sao"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "nắng", DEFAULT_SECS, undefined, "nang"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "nhà", DEFAULT_SECS, undefined, "nha"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "cây", DEFAULT_SECS, undefined, "cay"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "nhẫn", DEFAULT_SECS, undefined, "nhan"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "miệng", DEFAULT_SECS, undefined, "mieung"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "đồng hồ", DEFAULT_SECS, undefined, "dongho"),
  item("truth", "NHÌN HÌNH ĐOÁN CHỮ", undefined, "túi xách", DEFAULT_SECS, undefined, "tui"),

  /* ---------- Sắp xếp lại câu (gạch nhọn) ---------- */
  item("truth", "XẾP LẠI CÂU", "n/ữ/a /v/iệ/t /n/a/m", "nữ Việt Nam"),
  item("truth", "XẾP LẠI CÂU", "h/ọ/a /h/ô/n/g", "hoa hồng"),
  item("truth", "XẾP LẠI CÂU", "m/ẹ", "mẹ"),
  item("truth", "XẾP LẠI CÂU", "b/à /t/r/i/ế/u", "bà Triệu"),
  item("truth", "XẾP LẠI CÂU", "h/ả/i /b/à /t/r/i/ế/u", "hai bà Trưng"),
  item("truth", "XẾP LẠI CÂU", "t/í/nh /y/ế/u", "tình yêu"),
  item("truth", "XẾP LẠI CÂU", "y/ế/u /t/h/ư/ờ/n/g", "yêu thương"),
  item("truth", "XẾP LẠI CÂU", "h/ọ/a /h/ậu", "hoa hậu"),
  item("truth", "XẾP LẠI CÂU", "n/ữ /n/h/â/n", "nữ nhân"),
  item("truth", "XẾP LẠI CÂU", "t/h/ể /g/i/o/ì /n/u/ờ/n/g", "thể giới nữ"),
  item("truth", "XẾP LẠI CÂU", "l/ễ /l/ộ/i /2/0/1/0", "lễ 20/10"),
  item("truth", "XẾP LẠI CÂU", "m/ẹ /c/h/ủ/a /n/h/à", "mẹ chủ nhà"),
  item("truth", "XẾP LẠI CÂU", "y/ế/u /m/ẹ", "yêu mẹ"),
  item("truth", "XẾP LẠI CÂU", "h/ọ/a /h/ậu /v/iệt /n/a/m", "hoa hậu Việt Nam"),
  item("truth", "XẾP LẠI CÂU", "n/ữ /t/h/ế /g/i/o/ì", "nữ thế giới"),
  item("truth", "XẾP LẠI CÂU", "b/à /m/ẹ /c/h/ị /e/m /p/h/ụ /n/ữ", "bà mẹ chị em phụ nữ"),
  item("truth", "XẾP LẠI CÂU", "n/ư/ố/n/g /c/õ/n/g /h/ò/a", "nước cộng hòa"),
  item("truth", "XẾP LẠI CÂU", "t/u/ơ/i /t/h/ơ", "tuổi thơ"),
  item("truth", "XẾP LẠI CÂU", "p/h/ụ /n/ữ /v/iệt /n/a/m", "phụ nữ Việt Nam"),
  item("truth", "XẾP LẠI CÂU", "c/u/ơ/n/g /n/u/ờ/n/g /v/iệt /n/a/m", "cường nữ Việt Nam"),

  /* ---------- Phụ nữ yêu cầu bạn nam (chúc/làm gì đó) ---------- */
  item("truth", "CÂU HỎI", "Bạn nam gửi 1 câu chúc 20/10 cho bạn nữ classe nào đẹp nhất?", "Gửi lời chúc thật lòng."),
  item("truth", "CÂU HỎI", "Bạn nam hẹn hò bạn nữ để làm gì vào tối 20/10?", "Đến tiệc/ăn tối cùng."),
  item("truth", "CÂU HỎI", "Bạn nam tặng bạn nữ cái gì vào ngày 20/10?", "Hoa hồng/quà tặng."),
  item("truth", "CÂU HỎI", "Bạn nam nói câu gì để bạn nữ cười nhất?", "Câu ngọt ngào/kịch liễu."),
  item("truth", "CÂU HỎI", "Bạn nam viết bài thơ bao nhiêu dòng cho bạn nữ?", "1 bài thơ ngắn."),
  item("truth", "CÂU HỎI", "Bạn nam hát 1 bài hát về phụ nữ là bài gì?", "Bài hát về mẹ/phụ nữ."),

  /* ---------- Quà ngẫu nhiên ---------- */
  item("gift", "QUÀ 20/10", "Được chọn 1 bài hát để cả lớp nghe ngay bây giờ!"),
  item("gift", "QUÀ 20/10", "Được miễn 1 bài tập về nhà sắp tới của thầy/cô."),
  item("gift", "QUÀ 20/10", "Cả lớp vỗ tay khen 'Bạn giỏi quá!' 3 lần."),
  item("gift", "QUÀ 20/10", "Chọn 1 bạn nữ trong lớp để tặng hoa 1 bông."),
  item("gift", "QUÀ 20/10", "Được ngồi 'ghế vinh danh' 5 phút tiếp theo."),
  item("gift", "QUÀ 20/10", "Nhận 1 lời chúc 20/10 dễ thương từ cả lớp."),
  item("gift", "QUÀ 20/10", "Bốc thăm: 1 phần quà nhỏ từ thầy/cô."),
  item("gift", "QUÀ 20/10", "Được miễn phạt cho lần chơi tiếp theo."),
  item("gift", "QUÀ 20/10", "Cả lớp hát 1 đoạn bài hát bạn yêu thích."),
  item("gift", "QUÀ 20/10", "Được chọn món quà 20/10 cho mình."),
  item("gift", "QUÀ 20/10", "Được nhận 1 biểu tình khen ngợi từ toàn lớp."),
  item("gift", "QUÀ 20/10", "Được chọn 1 bạn để ôn lại bài học cùng."),
  item("gift", "QUÀ 20/10", "Được ngồi ngay bên thầy/cô trong 1 tiết."),
  item("gift", "QUÀ 20/10", "Được chọn 1 món tráng miệng cho cả lớp."),
  item("gift", "QUÀ 20/10", "Nhận 1 lá thư chúc 20/10 từ bạn học cùng."),
  item("gift", "QUÀ 20/10", "Được miễn 1 câu hỏi bất ngờ lần tới."),
];

export function defaultBoxes(): BoxItem[] {
  return shuffle(BOXES).slice(0, BOX_COUNT).map((b) => ({ ...b, id: uid() }));
}

export function emptyData(): MinigameData {
  return {
    title: "TRẢ LỜI CÂU HỎI 20/10",
    wish: "50 ô trộn lẫn nhìn hình thật, xếp chữ và quà ngẫu nhiên — đọc xong bấm HIỆN ĐÁP ÁN để xem đáp án. Cùng quay và khám phá nhé!",
    boxes: defaultBoxes(),
  };
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
