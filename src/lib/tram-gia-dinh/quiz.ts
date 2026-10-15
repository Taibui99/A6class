export type SlideType = "info" | "one" | "many" | "fill" | "guess";
export interface Answer { text: string; correct: boolean }
export interface Slide { round: string; type: SlideType; text: string; answers: Answer[]; note?: string; img?: string }

const SLIDE_TYPES: SlideType[] = ["info", "one", "many", "fill", "guess"];

/** Kiểm tra mảng slide nhận từ DB/file có đúng dáng không. */
export function isSlideArray(v: unknown): v is Slide[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    (s) =>
      s &&
      typeof s === "object" &&
      SLIDE_TYPES.includes((s as Slide).type) &&
      typeof (s as Slide).text === "string" &&
      Array.isArray((s as Slide).answers)
  );
}
export const SEED_QUIZ: Slide[] = [
  {
    "round": "Khởi động",
    "type": "info",
    "text": "⚡ NHANH NHƯ CHỚP — VẬT LÍ 12\nTrả lời thật nhanh, giành điểm cho đội!\nTrắc nghiệm & điền khuyết kiểm tra bài cũ.",
    "answers": []
  },
  {
    "round": "Luật chơi",
    "type": "info",
    "text": "CÁCH CHƠI\n1️⃣ Đọc câu hỏi, chọn đáp án A / B / C / D (câu điền khuyết: trả lời miệng)\n2️⃣ Bấm 🔒 Chốt để khóa lựa chọn, rồi ✅ Chấm\n3️⃣ Trả lời đúng thì cộng điểm cho đội\nBa quyền trợ giúp (mỗi quyền 1 lần/câu): 50:50 · Hỏi cả lớp · Gợi ý",
    "answers": []
  },
  {
    "round": "Chương I · Dao động cơ",
    "type": "one",
    "text": "Con lắc lò xo gồm vật khối lượng m gắn vào lò xo độ cứng k. Chu kì dao động điều hòa được tính bằng:",
    "note": "T = 2π√(m/k) — chu kì chỉ phụ thuộc m và k.",
    "answers": [
      { "text": "T = 2π√(k/m)", "correct": false },
      { "text": "T = 2π√(m/k)", "correct": true },
      { "text": "T = (1/2π)√(k/m)", "correct": false },
      { "text": "T = 2π√(m.k)", "correct": false }
    ]
  },
  {
    "round": "Chương I · Dao động cơ",
    "type": "one",
    "text": "Con lắc đơn dài l dao động điều hòa tại nơi có gia tốc trọng trường g. Chu kì dao động là:",
    "note": "T = 2π√(l/g).",
    "answers": [
      { "text": "T = 2π√(g/l)", "correct": false },
      { "text": "T = 2π√(l/g)", "correct": true },
      { "text": "T = 2π√(l.g)", "correct": false },
      { "text": "T = √(l/g)", "correct": false }
    ]
  },
  {
    "round": "Chương I · Dao động cơ",
    "type": "one",
    "text": "Một vật dao động điều hòa với biên độ A. Quãng đường vật đi được trong một chu kì dao động là:",
    "note": "Một chu kì vật đi được 4A.",
    "answers": [
      { "text": "A", "correct": false },
      { "text": "2A", "correct": false },
      { "text": "4A", "correct": true },
      { "text": "3A", "correct": false }
    ]
  },
  {
    "round": "Chương II · Sóng cơ",
    "type": "one",
    "text": "Khoảng cách giữa hai điểm gần nhau nhất trên một phương truyền sóng mà dao động cùng pha là:",
    "note": "Hai điểm cùng pha gần nhau nhất cách nhau đúng một bước sóng λ.",
    "answers": [
      { "text": "λ/4", "correct": false },
      { "text": "λ/2", "correct": false },
      { "text": "λ", "correct": true },
      { "text": "2λ", "correct": false }
    ]
  },
  {
    "round": "Chương II · Sóng cơ",
    "type": "one",
    "text": "Phát biểu nào sau đây ĐÚNG về sóng cơ?",
    "note": "Sóng cơ cần môi trường vật chất để lan truyền, không truyền được trong chân không.",
    "answers": [
      { "text": "Sóng cơ không truyền được trong chân không.", "correct": true },
      { "text": "Sóng cơ truyền được trong chân không.", "correct": false },
      { "text": "Sóng cơ chỉ truyền được trong chất khí.", "correct": false },
      { "text": "Tần số sóng thay đổi khi truyền qua các môi trường khác nhau.", "correct": false }
    ]
  },
  {
    "round": "Chương III · Điện xoay chiều",
    "type": "one",
    "text": "Cảm kháng của cuộn cảm thuần có độ tự cảm L trong mạch xoay chiều tần số góc ω là:",
    "note": "ZL = ωL.",
    "answers": [
      { "text": "ZL = 1/(ωL)", "correct": false },
      { "text": "ZL = ωL", "correct": true },
      { "text": "ZL = ωC", "correct": false },
      { "text": "ZL = 1/(ωC)", "correct": false }
    ]
  },
  {
    "round": "Chương III · Điện xoay chiều",
    "type": "one",
    "text": "Trong mạch RLC mắc nối tiếp, hiện tượng cộng hưởng điện xảy ra khi:",
    "note": "Cộng hưởng khi ZL = ZC → Z = R, cường độ dòng điện hiệu dụng cực đại.",
    "answers": [
      { "text": "ZL > ZC", "correct": false },
      { "text": "ZL = ZC", "correct": true },
      { "text": "ZL < ZC", "correct": false },
      { "text": "R = ZL", "correct": false }
    ]
  },
  {
    "round": "Chương IV · Sóng điện từ",
    "type": "one",
    "text": "Sóng điện từ KHÔNG có đặc điểm nào sau đây?",
    "note": "Sóng điện từ luôn mang theo năng lượng.",
    "answers": [
      { "text": "Là sóng ngang.", "correct": false },
      { "text": "Truyền được trong chân không.", "correct": false },
      { "text": "Không mang theo năng lượng.", "correct": true },
      { "text": "Vectơ E và B vuông góc với nhau.", "correct": false }
    ]
  },
  {
    "round": "Chương V · Sóng ánh sáng",
    "type": "one",
    "text": "Hiện tượng tán sắc ánh sáng là:",
    "note": "Lăng kính phân tách chùm ánh sáng trắng thành các ánh sáng đơn sắc.",
    "answers": [
      { "text": "Sự phân tách chùm ánh sáng trắng thành các ánh sáng đơn sắc khi qua lăng kính.", "correct": true },
      { "text": "Ánh sáng bị lệch phương khi truyền qua mặt phân cách hai môi trường.", "correct": false },
      { "text": "Ánh sáng đổi màu khi truyền qua môi trường trong suốt.", "correct": false },
      { "text": "Sự giao thoa của hai chùm sáng kết hợp.", "correct": false }
    ]
  },
  {
    "round": "Chương VI · Lượng tử ánh sáng",
    "type": "one",
    "text": "Năng lượng của một photon ánh sáng có tần số f được tính bằng:",
    "note": "ε = hf = hc/λ.",
    "answers": [
      { "text": "ε = h/f", "correct": false },
      { "text": "ε = hf", "correct": true },
      { "text": "ε = f/h", "correct": false },
      { "text": "ε = h + f", "correct": false }
    ]
  },
  {
    "round": "Chương VII · Hạt nhân",
    "type": "one",
    "text": "Năng lượng liên kết riêng của một hạt nhân được xác định bởi:",
    "note": "Năng lượng liên kết riêng = Wlk/A.",
    "answers": [
      { "text": "Wlk / A", "correct": true },
      { "text": "Δm.c²", "correct": false },
      { "text": "A . Wlk", "correct": false },
      { "text": "Z . Wlk", "correct": false }
    ]
  },
  {
    "round": "Chương IV · Dao động điện từ",
    "type": "fill",
    "text": "Trong mạch dao động LC lí tưởng, tần số góc dao động điện từ riêng là ω = ___",
    "note": "ω = 1/√(LC).",
    "answers": [
      { "text": "1/√(LC)", "correct": true }
    ]
  },
  {
    "round": "Về đích",
    "type": "info",
    "text": "🏆 VỀ ĐÍCH!\nCộng điểm và công bố đội chiến thắng của lớp mình!",
    "answers": []
  }
];
