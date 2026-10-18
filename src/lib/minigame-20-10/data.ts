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

export const STORAGE_KEY = "mg20_10_v8";
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

/* ===== 50 ô: đố vui, lịch sử phụ nữ, kiến thức tổng hợp, "bạn chọn gì", thách vui, quà ngẫu nhiên ===== */
const BOXES: BoxItem[] = [
  /* ---------- Đố vui / tư duy ---------- */
  item("truth", "ĐỐ VUI", "Gì càng dùng càng ngắn đi?", "Cây bút chì."),
  item("truth", "ĐỐ VUI", "Gì có mắt mà không nhìn thấy gì?", "Cây kim."),
  item("truth", "ĐỐ VUI", "Gì có cổ mà không có đầu?", "Cái chai."),
  item("truth", "ĐỐ VUI", "Gì có 4 chân mà không đi lại được?", "Cái giường (hoặc cái bàn)."),
  item("truth", "ĐỐ VUI", "Con gì kêu 'quạc quạc'?", "Con vịt."),
  item("truth", "ĐỐ VUI", "Gì mỏng nhất mà ai cũng có trên đầu?", "Sợi tóc."),
  item("truth", "ĐỐ VUI", "Gì luôn chạy mà chẳng bao giờ mệt?", "Kim đồng hồ."),
  item("truth", "ĐỐ VUI", "Cái gì đập thì vỡ, không đập thì vẫn cứng?", "Trứng."),

  /* ---------- Lịch sử phụ nữ Việt Nam ---------- */
  item("truth", "LỊCH SỬ", "Hai bà Trưng khởi nghĩa chống giặc Hán vào năm nào?", "Năm 40 Công Nguyên."),
  item("truth", "LỊCH SỬ", "Ngày Phụ nữ Việt Nam 20/10 bắt nguồn từ năm nào?", "Năm 1930 (đồng chí Nguyễn Thị Minh Khai nhận nhiệm vụ thành lập Hội Phụ nữ phản đế)."),
  item("truth", "LỊCH SỬ", "Bà Triệu (Triệu Thị Trinh) nổi tiếng với câu nói nào?", "\"Tôi muốn cưỡi cơn gió mạnh, đập đầu chày sắt, để nước nhà khỏi lầm than.\""),
  item("truth", "LỊCH SỬ", "Mùng 8 tháng 3 là ngày gì?", "Ngày Quốc tế Phụ nữ."),
  item("truth", "LỊCH SỬ", "Hai bà Trưng tên là ai?", "Trưng Trắc và Trưng Nhị."),
  item("truth", "LỊCH SỬ", "Bà Nguyễn Thị Định là nữ tướng đầu tiên của Việt Nam, bà mang quân hàm gì?", "Thiếu tướng."),
  item("truth", "LỊCH SỬ", "Ngày Quốc khánh Việt Nam 2/9 là năm nào, có sự kiện gì?", "Năm 1945 — Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình."),
  item("truth", "LỊCH SỬ", "Phụ nữ Việt Nam trong kháng chiến còn được ví như 'thành đồng' — cụm từ đầy đủ là gì?", "Phụ nữ là 'tài sản quý giá', 'một nửa thế giới'."),

  /* ---------- Kiến thức tổng hợp ---------- */
  item("truth", "KIẾN THỨC", "Thủ đô của nước Pháp là gì?", "Paris."),
  item("truth", "KIẾN THỨC", "Con sông dài nhất thế giới là sông nào?", "Sông Nile."),
  item("truth", "KIẾN THỨC", "Núi cao nhất Việt Nam là núi nào?", "Núi Fansipan."),
  item("truth", "KIẾN THỨC", "Tính: 9 + 9 ÷ 9 = ?", "10 (vì 9 ÷ 9 = 1 trước)."),
  item("truth", "KIẾN THỨC", "Quốc gia nào có hình chữ S trên bản đồ?", "Việt Nam."),
  item("truth", "KIẾN THỨC", "Loại quả nào vừa là trái cây, vừa dùng làm nước sốt cho pizza?", "Cà chua."),
  item("truth", "KIẾN THỨC", "Đèn giao thông có mấy màu chính?", "3 màu: đỏ, vàng, xanh."),
  item("truth", "KIẾN THỨC", "Tổng: 1 + 2 + 3 + … + 10 = ?", "55."),

  /* ---------- Bạn chọn gì (thảo luận cả lớp) ---------- */
  item("truth", "BẠN CHỌN GÌ?", "Bay được hoặc biết 5 thứ ngoại ngữ — bạn chọn cái nào?", "Tùy bạn, cả lớp cùng bình chọn và tranh luận!"),
  item("truth", "BẠN CHỌN GÌ?", "Giỏi giang nhưng ít bạn, hoặc bình thường nhưng nhiều bạn thân — bạn chọn cái nào?", "Tùy bạn, cả lớp cùng bình chọn và tranh luận!"),
  item("truth", "BẠN CHỌN GÌ?", "Du lịch về quá khứ hoặc tương lai — bạn đi về đâu?", "Tùy bạn, cả lớp cùng bình chọn và tranh luận!"),
  item("truth", "BẠN CHỌN GÌ?", "Sống không có mạng xã hội hoặc không có âm nhạc — bạn giữ cái nào?", "Tùy bạn, cả lớp cùng bình chọn và tranh luận!"),
  item("truth", "BẠN CHỌN GÌ?", "Một ngày không được ăn hoặc một đêm không được ngủ — bạn chọn?", "Tùy bạn, cả lớp cùng bình chọn và tranh luận!"),

  /* ---------- Sự thật thú vị ---------- */
  item("truth", "SỰ THẬT", "Một năm thường có bao nhiêu ngày?", "365 ngày."),
  item("truth", "SỰ THẬT", "Cầu vồng có mấy màu chính?", "7 màu."),
  item("truth", "SỰ THẬT", "Trái Đất xoay quanh thiên thể nào?", "Mặt Trời."),
  item("truth", "SỰ THẬT", "Việt Nam có 54 dân tộc anh em, dân tộc nào đông nhất?", "Dân tộc Kinh."),
  item("truth", "SỰ THẬT", "Nhịp tim trung bình của người lớn mỗi phút khoảng bao nhiêu lần?", "Khoảng 70–80 lần/phút."),
  item("truth", "SỰ THẬT", "Một phút có bao nhiêu giây?", "60 giây."),

  /* ---------- Thách vui ---------- */
  item("dare", "THÁCH", "Khen 3 bạn nữ trong lớp một lời thật lòng, to và rõ.", "Phải nói ngay trước lớp!"),
  item("dare", "THÁCH", "Hát to 5 giây bất kỳ bài hát nào bạn thích.", "Phải hát đủ to cả lớp nghe!"),
  item("dare", "THÁCH", "Giả tiếng động hài hước (con vật/máy bay/…) trong 3 giây.", "Cả lớp đoán xem là tiếng gì."),
  item("dare", "THÁCH", "Nhảy cóc 3 bước như ếch từ đầu lớp đến giữa lớp.", "Phải nhảy thật giống!"),
  item("dare", "THÁCH", "Nói 'I love 12A6' bằng tiếng Anh rồi lặp lại 3 lần thật nhanh.", "Không được vấp!"),
  item("dare", "THÁCH", "Catwalk 3 bước như người mẫu trên sàn runway.", "Phải tạo dáng thật 'chất'."),
  item("dare", "THÁCH", "Ôm chặt một người bạn ngồi cạnh (nếu bạn đó đồng ý).", "Nếu từ chối thì hát thêm 5 giây thay thế."),

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
    title: "TRÒ CHƠI 20/10 LỚP 12A6",
    wish: "50 ô trộn đố vui, lịch sử phụ nữ, kiến thức, 'bạn chọn gì', thách vui và quà ngẫu nhiên — mở ô xong bấm HIỆN ĐÁP ÁN để xem đáp án. Cùng quay và khám phá nhé!",
    boxes: defaultBoxes(),
  };
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
