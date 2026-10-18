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
  truth: { label: "Thật", color: "#ff4d6d", hint: "Trả lời thật thà" },
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

/* ===== THẬT — câu hỏi để kể thật, gây cười (answer = gợi ý/bình luận khi hiện đáp án) ===== */
const TRUTHS: BoxItem[] = [
  item("truth", "Thật lòng nhé", "Điều xấu hổ nhất bạn từng làm trước mặt cả lớp là gì?", "Thật thà kể ra đi — lớp mình không ai chê đâu!"),
  item("truth", "Thật lòng nhé", "Bạn đã bao giờ nói dối mẹ để đi chơi chưa?", "Ai cũng từng 1 lần thôi — thừa nhận đi!"),
  item("truth", "Thật lòng nhé", "Bạn từng khóc vì xem phim chưa? Phim gì?", "Hỏi tên phim rồi cho cả lớp cười 1 trận."),
  item("truth", "Thật lòng nhé", "Thói quen xấu nhất của bạn là gì?", "Nói to cho cả lớp cùng biết nhé!"),
  item("truth", "Thật lòng nhé", "Sợ nhất con gì? Vì sao?", "Giải thích lý do phải làm cả lớp cười mới đạt."),
  item("truth", "Thật lòng nhé", "Bạn đã bao giờ ngủ gật trong lớp chưa?", "Thừa nhận đi, thầy/cô vẫn chưa biết đâu!"),
  item("truth", "Thật lòng nhé", "Điều bạn muốn nói với thầy/cô nhưng chưa dám nói là gì?", "Nói to lên — hôm nay ngày của phụ nữ mà!"),
  item("truth", "Thật lòng nhé", "Bạn đã bao giờ gian lận trong kiểm tra chưa?", "Thật thà — không ai làm gì bạn đâu."),
  item("truth", "Thật lòng nhé", "Món ăn ghét nhất của bạn là gì?", "Kể cho 1 bạn bên cạnh cùng sợ."),
  item("truth", "Thật lòng nhé", "Bạn đã bao giờ thức trắng đêm chưa? Để làm gì?", "Nói lý do — chơi game thì nói thật!"),
  item("truth", "Thật lòng nhé", "Kể 1 lần bạn bị điểm 0.", "Càng thảm càng vui — kể to lên!"),
  item("truth", "Thật lòng nhé", "Bạn đã bao giờ bị bắt gặp đang hát một mình chưa?", "Hát lại đoạn đó cho cả lớp nghe luôn."),
  item("truth", "Thật lòng nhé", "Nếu có 1 điều ước, bạn ước gì?", "Ước gì cũng được — trừ ước không phải học!"),
  item("truth", "Thật lòng nhé", "Bạn ghét nhất tính cách gì ở người khác?", "Nói chung chung thôi, đừng chỉa ai nhé."),
  item("truth", "Thật lòng nhé", "Bạn đã bao giờ thích 1 người hơn 1 năm chưa?", "Không cần nói tên — chỉ cần nói Có/Không!"),
  item("truth", "Thật lòng nhé", "Điều tồi tệ nhất bạn từng ăn là gì?", "Kể cho cả lớp cùng... sợ."),
  item("truth", "Thật lòng nhé", "Bạn hay cười nhất ở điểm nào trên gương mặt mình?", "Tự khen 1 câu thật to đi!"),
  item("truth", "Thật lòng nhé", "Điều gì làm bạn khóc dễ nhất?", "Nói ra — cả lớp sẽ thông cảm (hơi khó)."),
  item("truth", "Thật lòng nhé", "Bạn đã bao giờ nuốt lời hứa chưa?", "Hứa bù 1 điều ngay tại đây!"),
  item("truth", "Thật lòng nhé", "Bạn sợ nhất điều gì khi lên lớp 12?", "Nói to — rồi cả lớp cổ vũ cho bạn."),
  item("truth", "Thật lòng nhé", "Bạn đã bao giờ quên ngày sinh của người thân chưa?", "Nhớ lại ngay đi, món quà 20/10 đang chờ."),
  item("truth", "Thật lòng nhé", "Kể tên 1 bài hát bạn hát dở nhưng vẫn thích.", "Hát sẵn 1 câu luôn đi!"),
  item("truth", "Thật lòng nhé", "Điều gì khiến bạn đỏ mặt nhất?", "Nói to — rồi đỏ mặt thêm lần nữa."),
];

/* ===== THÁCH — thử thách gây cười (có video mẫu, answer = tiêu chí ĐẠT) ===== */
const DARES: BoxItem[] = [
  item("dare", "Thách thật to", "Nói “Tôi yêu lớp 12A6” bằng giọng robot.", "Giọng robot rõ chữ & to = ĐẠT"),
  item("dare", "Thách thật to", "Giả tiếng gà kêu 3 lần, mỗi lần cao hơn 1 tông.", "Đủ 3 tiếng, lên dần = ĐẠT"),
  item("dare", "Thách thật to", "Khen 1 bạn nam trong lớp bằng 1 câu thơ tự sáng tác.", "Có vần & có ý nghĩa = ĐẠT"),
  item("dare", "Thách xem clip", "Xem clip rồi kể lại cái kết bằng 1 câu thật to.", "Kể đúng nội dung & to rõ = ĐẠT", 45, "/videos/tien-mat-tat-mang.mp4"),
  item("dare", "Thách xem clip", "Xem clip, rồi chỉ tay vào 1 bạn học chung lớp và khen 1 câu.", "Có khen & chỉ đúng người = ĐẠT", 45, "/videos/thanh-mai-truc-ma.mp4"),
  item("dare", "Thách xem clip", "Xem clip, sau đó diễn lại 1 biểu cảm hài hước trong 5 giây.", "Diễn giống & cả lớp cười = ĐẠT", 45, "/videos/tranh-vo-dua-gap-vo-dua.mp4"),
  item("dare", "Thách xem clip", "Xem clip, rồi nói to 1 câu “khoe” vui về lớp 12A6.", "To, rõ & gây cười = ĐẠT", 45, "/videos/yeu-trau-hon-khoe-bo.mp4"),
  item("dare", "Thách xem clip", "Xem clip, rồi thú nhận 1 lần bạn từng “nói có” nhưng thật ra là “không”.", "Thú nhận thật lòng = ĐẠT", 45, "/videos/an-khong-noi-co.mp4"),
  item("dare", "Thách thật to", "Giả làm phát thanh viên đọc tên 5 bạn nữ trong lớp.", "Đủ 5 tên & giọng trang trọng = ĐẠT"),
  item("dare", "Thách thật to", "Mô tả bạn bên cạnh trong 5 giây, tối đa 2 từ khen.", "Đúng 2 từ khen trong 5 giây = ĐẠT"),
  item("dare", "Thách vận động", "Nhảy 5 cái thật cao vừa đếm to từ 1 đến 5.", "Đủ 5 cái & đếm to = ĐẠT"),
  item("dare", "Thách vận động", "Đứng im như tượng đá 10 giây, ai cười trước là thua.", "Im 10 giây không cười = ĐẠT"),
  item("dare", "Thách vận động", "Múa 3 điệu nhảy khác nhau trong 10 giây.", "3 điệu khác biệt = ĐẠT"),
  item("dare", "Thách vận động", "Đi lại như người khổng lồ 5 bước, vừa đi vừa rên “ùm bẹp”.", "5 bước to & đủ tiếng = ĐẠT"),
  item("dare", "Thách bất ngờ", "Bất ngờ ôm bạn bên cạnh và nói “Cảm ơn bạn nha!”.", "Ôm thật & nói to = ĐẠT"),
  item("dare", "Thách bất ngờ", "Nói 1 sự thật về bản thân mình cho cả lớp nghe.", "Sự thật thật sự = ĐẠT"),
  item("dare", "Thách bất ngờ", "Nhắm mắt 5 giây, chỉ tay vào bạn mình quý nhất lớp.", "Nhắm mắt & chỉ đúng người = ĐẠT"),
];

/* ===== QUÀ — món quà may mắn cho ngày 20/10 ===== */
const GIFTS: BoxItem[] = [
  item("gift", "Quà bí mật", "Được chọn 1 bài hát để cả lớp nghe ngay bây giờ!"),
  item("gift", "Quà bí mật", "Được miễn 1 bài tập về nhà sắp tới của thầy/cô."),
  item("gift", "Quà bí mật", "Cả lớp vỗ tay khen “Bạn giỏi quá!” 3 lần."),
  item("gift", "Quà bí mật", "Chọn 1 người trong lớp để được khen ngay tại đây."),
  item("gift", "Quà bí mật", "Được chọn đồ ăn vặt cho cả lớp vào giờ ra chơi."),
  item("gift", "Quà bí mật", "Nhận 1 lời chúc 20/10 dễ thương từ cả lớp."),
  item("gift", "Quà bí mật", "Được ngồi “ghế vinh danh” 5 phút tiếp theo."),
  item("gift", "Quà bí mật", "Bốc thăm: 1 phần quà nhỏ từ thầy/cô."),
  item("gift", "Quà bí mật", "Được miễn phạt cho lần chơi tiếp theo."),
  item("gift", "Quà bí mật", "Cả lớp hát 1 đoạn bài hát bạn yêu thích."),
];

export function defaultBoxes(): BoxItem[] {
  const all: BoxItem[] = [...TRUTHS, ...DARES, ...GIFTS];
  return shuffle(all)
    .slice(0, BOX_COUNT)
    .map((b) => ({ ...b, id: uid() }));
}

export function emptyData(): MinigameData {
  return {
    title: "THẬT HAY THÁCH",
    wish: "50 hộp quà bí ẩn đang chờ — mỗi hộp là một câu Thật, một màn Thách hoặc một món Quà. Cùng quay và khám phá nhé!",
    boxes: defaultBoxes(),
  };
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
