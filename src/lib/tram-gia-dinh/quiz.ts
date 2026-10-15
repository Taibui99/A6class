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
    "text": "⚛️ Nhanh Như Chớp\nTrò chơi trí tuệ nhanh kiểm tra kiến thức cũ của cả lớp",
    "answers": []
  },
  {
    "round": "Luật chơi",
    "type": "info",
    "text": "LUẬT CHƠI ",
    "answers": []
  },
  {
    "round": "Luật chơi",
    "type": "info",
    "text": "Phần I. Trắc nghiệm nhanh\nHãy chọn đáp án đúng nhất trong 4 lựa chọn.",
    "answers": []
  },
  {
    "round": "Luật chơi",
    "type": "one",
    "text": "Câu 1: Để đúc một vật bằng đồng, cần nung nóng để đồng chuyển từ thể rắn thành thể lỏng. Quá trình này là quá trình",
    "answers": [
      { "text": "A. đông đặc.", "correct": false },
      { "text": "B. hoá hơi.", "correct": false },
      { "text": "C. nóng chảy", "correct": true },
      { "text": "D. ngưng tụ.", "correct": false }
    ]
  },
  {
    "round": "Luật chơi",
    "type": "one",
    "text": "Câu 2: Theo mô hình động học phân tử,",
    "answers": [
      { "text": "A. các phân tử chuyển động không ngừng", "correct": true },
      { "text": "B. giữa các phân tử không có khoảng cách.", "correct": false },
      { "text": "C. giữa các phân tử chỉ có lực đẩy.", "correct": false },
      { "text": "D. ngưng tụ.", "correct": false }
    ]
  },
  {
    "round": "Luật chơi",
    "type": "one",
    "text": "Câu 3 : Đơn vị của nhiệt dung riêng là",
    "answers": [
      { "text": "A.  (J/kg)  K", "correct": false },
      { "text": "B. J . (kg/K)", "correct": false },
      { "text": "C. (J / kg.K)", "correct": true },
      { "text": "D. J/ kg", "correct": false }
    ]
  },
  {
    "round": "Luật chơi",
    "type": "one",
    "text": "Câu 4 : Nhiệt dung riêng của rượu là  2500 J / (kg.K). Điều đó có ý nghĩa gì?",
    "answers": [
      { "text": "A. Để nâng 1 kg rượu lên nhiệt độ bay hơi ta phải cung cấp cho nó một nhiệt lượng là 2500 J", "correct": false },
      { "text": "B. 1 kg rượu bị đông đặc thì giải phóng nhiệt lượng là 2500 J .", "correct": false },
      { "text": "C. Để nâng 1 kg rượu tăng lên 1°C ta cần cung cấp cho nó nhiệt lượng là  2500J .", "correct": true },
      { "text": "D. Nhiệt lượng có trong 1 kg rượu ở nhiệt độ bình thường.", "correct": false }
    ]
  },
  {
    "round": "Luật chơi",
    "type": "one",
    "text": "Câu 5 : Nhiệt dung riêng của đồng lớn hơn chì. Vì vậy để tăng nhiệt độ của 3 kg đồng và 3 kg chì thêm 15°C  thì:",
    "answers": [
      { "text": "A. Khối chì cần nhiều nhiệt lượng hơn khối đồng.", "correct": false },
      { "text": "B. Khối đồng cần nhiều nhiệt lượng hơn khối chì.", "correct": true },
      { "text": "C. Hai khối đều cần nhiệt lượng như nhau.", "correct": false },
      { "text": "D. Không khẳng định được.", "correct": false }
    ]
  },
  {
    "round": "Luật chơi",
    "type": "one",
    "text": "Câu 6 : Nhiệt nóng chảy riêng của vàng là 62,8.10^3 J/kg. Phát biểu đúng là",
    "answers": [
      { "text": "A. khối vàng sẽ toả ra nhiệt lượng 62,8.10^3 J khi nóng chảy hoàn toàn.", "correct": false },
      { "text": "B. mỗi kg vàng cần thu nhiệt lượng 62,8.10^3 J hoá lỏng hoàn toàn ở nhiệt độ nóng chảy.", "correct": true },
      { "text": "C. khối vàng cần thu nhiệt lượng 62,8.10^3J để hoá lỏng.", "correct": false },
      { "text": "D. mỗi kg vàng toả ra nhiệt lượng 62,8.10^3J khi hoá lỏng hoàn toàn.", "correct": false }
    ]
  },
  {
    "round": "Luật chơi",
    "type": "one",
    "text": "Câu 7.  Nhiệt hoá hơi riêng của một chất là nhiệt lượng cần cung cấp để 1 kg chất đó",
    "answers": [
      { "text": "A. hoá hơi hoàn toàn.", "correct": false },
      { "text": "B. hoá hơi hoàn toàn ở nhiệt độ sôi.", "correct": true },
      { "text": "C. hoá hơi.", "correct": false },
      { "text": "D. bay hơi hết.", "correct": false }
    ]
  },
  {
    "round": "Luật chơi",
    "type": "one",
    "text": "Câu 8. Trong thí nghiệm đo nhiệt hoá hơi riêng của một chất, phương án chọn đo nhiệt hoá hơi của nước có ưu điểm là",
    "answers": [
      { "text": "A. nguyên liệu có sẵn, không độc hại, nhiệt độ sôi thấp, nhiệt hoá hơi riêng lớn.", "correct": true },
      { "text": "B. nguyên liệu có sẵn, không độc hại, nhiệt hoá hơi riêng nhỏ.", "correct": false },
      { "text": "C. nguyên liệu có sẵn, không độc hại, nhiệt độ sôi cao.", "correct": false },
      { "text": "D. nguyên liệu có sẵn, không độc hại, dẫn nhiệt tốt.", "correct": false }
    ]
  },
  {
    "round": "Luật chơi",
    "type": "one",
    "text": "Câu 9. Trong thí nghiệm đo nhiệt hoá hơi riêng của nước như SGK, phải mở nắp bình nhiệt lượng kế vì",
    "answers": [
      { "text": "A. để dễ dàng quan sát và đọc số liệu.", "correct": false },
      { "text": "B. để nước đã hoá hơi dễ dàng thoát ra ngoài.", "correct": true },
      { "text": "C. để giảm nhiệt trong bình nhiệt lượng kế cho khỏi hỏng dụng cụ thí nghiệm.", "correct": false },
      { "text": "D. tránh tình huống cạn nước mà ta không biết, dễ gây cháy nổ.", "correct": false }
    ]
  },
  {
    "round": "Luật chơi",
    "type": "one",
    "text": "Câu 10: Khi xoa cồn y tế lên da, ta thường cảm thấy lạnh ở vùng da đó. Nguyên nhân của hiện tượng này là do cồn:",
    "answers": [
      { "text": "A. thu nhiệt từ da để bay hơi.", "correct": true },
      { "text": "B. làm tăng sự lưu thông máu dưới da.", "correct": false },
      { "text": "C. tỏa nhiệt khi bay hơi.", "correct": false },
      { "text": "D. truyền nhiệt vào da để bay hơi.", "correct": false }
    ]
  },
  {
    "round": "Phần 2",
    "type": "info",
    "text": "Phần II. Dạng điền khuyết\nHãy điền đúng đáp án vào chổ còn trống hoặc trả lời câu hỏi.",
    "answers": []
  },
  {
    "round": "Phần 2",
    "type": "fill",
    "text": "Câu 11 : Ở áp suất tiêu chuẩn, chất rắn kết tinh có nhiệt độ nóng chảy 273K là ……..",
    "answers": [
      { "text": "Nước đá", "correct": true }
    ]
  },
  {
    "round": "Phần 2",
    "type": "fill",
    "text": "Câu 12.  Nhiệt hoá hơi riêng của một chất là nhiệt lượng cần cung cấp để 1 kg chất đó ……..",
    "answers": [
      { "text": "hoá hơi hoàn toàn ở nhiệt độ sôi.", "correct": true }
    ]
  },
  {
    "round": "Phần 2",
    "type": "fill",
    "text": "Câu 13: Sau khi chúng ta tắm hay lau mặt bằng nước, thường có cảm giác mát, lạnh. Vì sao?",
    "note": "Bản chất vật lí: Nước trên da bay hơi ở nhiệt độ thường. Để hóa hơi, nước phải nhận năng lượng từ da và môi trường xung quanh. Hệ quả: Da mất nhiệt lượng nên nhiệt độ bề mặt da giảm, tạo cảm giác mát hoặc lạnh.",
    "answers": [
      { "text": "Vì da của chúng ta đã cung cấp nhiệt lượng trong quá trình bay hơi của nước nên nhiệt độ trên da giảm xuống.", "correct": true }
    ]
  },
  {
    "round": "Phần 2",
    "type": "fill",
    "text": "Câu 14. Khi truyền cùng một nhiệt lượng cho hai vật có cùng khối lượng được làm từ hai chất khác nhau. Trong điều kiện không xảy ra sự chuyển thể, vật được làm từ chất có nhiệt dung riêng …………………. có độ biến thiên nhiệt độ lớn hơn.",
    "answers": [
      { "text": "nhỏ hơn", "correct": true }
    ]
  },
  {
    "round": "Về đích",
    "type": "info",
    "text": "🏆 VỀ ĐÍCH!\nCộng điểm và công bố nhà vô địch của lớp mình!",
    "answers": []
  }
];
