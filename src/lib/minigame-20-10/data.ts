export type BoxType = "truth" | "dare" | "gift";

export type BoxItem = {
  id: string;
  type: BoxType;
  title: string;
  prompt: string;
  answer?: string;
  video?: string;
  secs: number;
};

export type MinigameData = {
  title: string;
  wish: string;
  boxes: BoxItem[];
};

export const STORAGE_KEY = "hopqua_20_10_v3";
export const BOX_COUNT = 50;
export const DEFAULT_SECS = 45;

export const TYPE_META: Record<BoxType, { label: string; color: string; hint: string }> = {
  truth: { label: "CÂU HỎI", color: "#ff4d6d", hint: "Đọc xong bấm HIỆN ĐÁP ÁN" },
  dare: { label: "Thách", color: "#a259ff", hint: "Phải làm ngay" },
  gift: { label: "Quà", color: "#ffb703", hint: "Nhận quà may mắn" },
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
  prompt: string,
  answer = "",
  secs = DEFAULT_SECS,
  video?: string,
): BoxItem {
  const b: BoxItem = { id: uid(), type, title, prompt, secs };
  if (answer) b.answer = answer;
  if (video) b.video = video;
  return b;
}

/* ===== 50 câu hỏi cực khó (tổng hợp từ mạng: đố mẹo, logic, chơi chữ) — mỗi ô chỉ hiện câu hỏi, bấm HIỆN ĐÁP ÁN để xem đáp án ===== */
const QUESTIONS: BoxItem[] = [
  item("truth", "CÂU HỎI", "Thứ gì thuộc về bạn nhưng mọi người lại dùng nhiều hơn bạn?", "Tên của bạn."),
  item("truth", "CÂU HỎI", "Cái gì phải ném đi khi cần dùng, rồi thu lại khi không cần?", "Mỏ neo."),
  item("truth", "CÂU HỎI", "Cái gì có hai đầu nhưng không có chân?", "Cây cầu."),
  item("truth", "CÂU HỎI", "Từ nào trong tiếng Việt có chín mẫu tự?", "Chính."),
  item("truth", "CÂU HỎI", "Cái gì lớn bằng voi nhưng không nặng gram nào?", "Bóng con voi."),
  item("truth", "CÂU HỎI", "Cái gì đen khi mua, đỏ khi dùng, xám xịt khi vứt đi?", "Than."),
  item("truth", "CÂU HỎI", "Số gì khi xoay ngược lại thành 99 mà không cần tính toán?", "66."),
  item("truth", "CÂU HỎI", "Cái gì luôn tăng mà không bao giờ giảm?", "Tuổi tác."),
  item("truth", "CÂU HỎI", "Cái gì bạn không thể nhặt được từ trên sàn nhà?", "Cái bóng."),
  item("truth", "CÂU HỎI", "Bánh xe nào không quay khi ô tô rẽ về bên phải?", "Bánh xe dự phòng."),
  item("truth", "CÂU HỎI", "Có sông nhưng không nước, có thành phố nhưng không nhà, có rừng không cây — ở đâu?", "Trên bản đồ."),
  item("truth", "CÂU HỎI", "Bạn vượt qua người thứ nhì trong cuộc đua, bạn đang ở vị trí nào?", "Thứ nhì."),
  item("truth", "CÂU HỎI", "Bạn chạy qua người cuối cùng trong cuộc đua, bạn đang ở vị trí nào?", "Cuối cùng."),
  item("truth", "CÂU HỎI", "Cái gì không có chân, không có đuôi, không có cơ thể mà nhiều đầu?", "Cầu truyền hình."),
  item("truth", "CÂU HỎI", "Chuột nào đi bằng 2 chân?", "Chuột Mickey."),
  item("truth", "CÂU HỎI", "Bóng gì bạn mang khắp thế giới mà vẫn ở nguyên một chỗ?", "Tem thư."),
  item("truth", "CÂU HỎI", "Nhà nào lạnh lẽo nhưng ai cũng muốn tới?", "Nhà băng."),
  item("truth", "CÂU HỎI", "Hôn mà bị hôn lại gọi là gì?", "Đính hôn."),
  item("truth", "CÂU HỎI", "Từ gì bỏ đầu thành tên nước, mất đuôi thành loài chim?", "Cúc (bỏ C → Úc, mất c → cú)."),
  item("truth", "CÂU HỎI", "Túi gì nghe tên ngọt nhưng đắng ngắt, khó lọt khỏi người?", "Túi mật."),
  item("truth", "CÂU HỎI", "Quần rộng nhất là quần gì?", "Quần đảo."),
  item("truth", "CÂU HỎI", "Một xương sống, một đống xương sườn là cái gì?", "Cái lược."),
  item("truth", "CÂU HỎI", "Miệng rộng nhưng không nói một từ là gì?", "Con sông."),
  item("truth", "CÂU HỎI", "Đi thì đứng, đứng thì ngã là gì?", "Xe đạp."),
  item("truth", "CÂU HỎI", "Mặt bằng phẳng thênh thang, người đi muôn lối phố phường là gì?", "Mặt đất."),
  item("truth", "CÂU HỎI", "Hoa gì quân tử không chê mùi bùn?", "Hoa sen."),
  item("truth", "CÂU HỎI", "Nơi nào trên Trái Đất đàn ông khổ nhất?", "Nam Cực."),
  item("truth", "CÂU HỎI", "Cái gì trong trắng ngoài xanh, trồng đậu trồng hành rồi thả heo vào?", "Bánh chưng."),
  item("truth", "CÂU HỎI", "Con gì mang được miếng gỗ lớn nhưng không mang được hòn sỏi?", "Con sông."),
  item("truth", "CÂU HỎI", "Ở Việt Nam, rồng bay ở đâu và đáp ở đâu?", "Rồng bay ở Thăng Long, đáp ở Hạ Long."),
  item("truth", "CÂU HỎI", "Con gì có hai mắt mà không nhìn thấy?", "Con kim."),
  item("truth", "CÂU HỎI", "Cái gì chạy cả ngày không bao giờ mệt?", "Đồng hồ."),
  item("truth", "CÂU HỎI", "Bố mẹ có 6 người con trai, mỗi người trai có một em gái. Gia đình đó có bao nhiêu người?", "9 người (bố, mẹ, 6 con trai và 1 em gái)."),
  item("truth", "CÂU HỎI", "Có 3 quả táo, bạn lấy đi 2 quả, hỏi bạn còn mấy quả?", "2 quả (vì bạn lấy đi 2 quả)."),
  item("truth", "CÂU HỎI", "2 con vịt đi trước 2 con vịt, 2 con vịt đi sau 2 con vịt, 2 con vịt đi giữa 2 con vịt. Có mấy con vịt?", "4 con."),
  item("truth", "CÂU HỎI", "Cái gì có cổ nhưng không có đầu?", "Chai."),
  item("truth", "CÂU HỎI", "Cái gì bạn phải chia sẻ trước khi có thể giữ nó?", "Bí mật."),
  item("truth", "CÂU HỎI", "Cái gì có năm ngón tay nhưng không có thịt?", "Găng tay."),
  item("truth", "CÂU HỎI", "Cái gì có trước có sau mà không đi được?", "Đường."),
  item("truth", "CÂU HỎI", "Cái gì bạn cầm được bằng tay trái nhưng không cầm được bằng tay phải?", "Khuỷu tay phải."),
  item("truth", "CÂU HỎI", "Cái gì càng lớn thì lỗ càng lớn?", "Bánh donut."),
  item("truth", "CÂU HỎI", "Cái gì không có cánh mà bay, không có miệng mà kêu?", "Gió."),
  item("truth", "CÂU HỎI", "Cái gì bạn càng cho ăn thì càng lớn?", "Lửa."),
  item("truth", "CÂU HỎI", "Con gì có mắt nhưng không nhìn thấy?", "Con kim."),
  item("truth", "CÂU HỎI", "Cái gì luôn đi trước bạn nhưng không ai nhìn thấy?", "Tương lai."),
  item("truth", "CÂU HỎI", "Cái gì có lưng mà không có đầu?", "Sách."),
  item("truth", "CÂU HỎI", "Cái gì bạn nhìn thấy mỗi khi nhìn vào gương?", "Ảnh của bạn."),
  item("truth", "CÂU HỎI", "Cái gì có hàng ngàn phím nhưng không mở cửa nào?", "Bàn phím."),
  item("truth", "CÂU HỎI", "Cái gì không có chân mà đi khắp thế giới?", "Cầu vồng."),
];

export function defaultBoxes(): BoxItem[] {
  return QUESTIONS.map((b) => ({ ...b, id: uid() }));
}

export function emptyData(): MinigameData {
  return {
    title: "THẬT HAY THÁCH",
    wish: "50 câu hỏi cực khó đang chờ — đọc xong bấm HIỆN ĐÁP ÁN để xem đáp án. Cùng quay và khám phá nhé!",
    boxes: defaultBoxes(),
  };
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
