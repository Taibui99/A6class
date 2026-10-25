import type { RebusIconKey } from "./rebus-icons";

export type BoxType = "truth" | "dare" | "gift" | "special";

export type BoxItem = {
  id: string;
  type: BoxType;
  title: string;
  category?: string;
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

export const STORAGE_KEY = "mg_12a6_100bags_v8";
export const BOX_COUNT = 100;
export const DEFAULT_SECS = 35;

export const TYPE_META: Record<BoxType, { label: string; color: string; hint: string }> = {
  truth: { label: "CÂU HỎI", color: "#ff4d6d", hint: "Suy nghĩ và trả lời trước cả lớp — bấm HIỆN ĐÁP ÁN để lấy quà" },
  dare: { label: "THỬ THÁCH / PHẠT", color: "#a259ff", hint: "Thực hiện ngay trước cả lớp để vượt qua!" },
  gift: { label: "QUÀ MAY MẮN", color: "#ffb703", hint: "Trúng quà may mắn từ quỹ lớp, nhận quà ngay không cần giải đố!" },
  special: { label: "HIỆU ỨNG ĐẶC BIỆT", color: "#06d6a0", hint: "Kích hoạt hiệu ứng thẻ bảo bối quyền lực!" },
};

const uid = () => Math.random().toString(36).slice(2, 9);

/* Random entropy phần cứng */
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
    [arr[j], arr[i]] = [arr[i], arr[j]];
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
  category?: string,
): BoxItem {
  const b: BoxItem = { id: uid(), type, title, secs };
  if (prompt !== undefined) b.prompt = prompt;
  if (answer) b.answer = answer;
  if (video) b.video = video;
  if (icon) b.icon = icon;
  if (category) b.category = category;
  return b;
}

/* ===== TOÀN BỘ 100 TÚI MÙ ĐÃ TRỘN LẪN LỘN XEN KẼ KHẮP NƠI ===== */
const BOXES: BoxItem[] = [
  /* 1 */
  item("truth", "ĐỐ VUI LOÀI VẬT", "Con chuột nào đi bằng 2 chân?", "Chuột Mickey! (Và chuột bị gãy 2 chân trước)", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 2 */
  item("truth", "CỰC TRỊ HÀM SỐ", "Nếu đạo hàm f'(x) đổi dấu từ DƯƠNG sang ÂM khi qua điểm x = 2 thì tại x = 2 hàm số đạt cực đại hay cực tiểu?", "Hàm số đạt CỰC ĐẠI tại x = 2!", 30, undefined, undefined, "📐 TOÁN 12"),

  /* 3 */
  item("special", "GẬY NHƯ Ý", "BẢO BỐI CHUYỂN QUYỀN: Bạn có quyền CHỈ ĐỊNH 1 người bất kỳ trong lớp đứng dậy gánh vác câu hỏi tiếp theo thay bạn!", undefined, 0, undefined, undefined, "🌟 BẢO BỐI"),

  /* 4 */
  item("truth", "3 CÔNG TẮC 1 BÓNG ĐÈN", "Bạn đứng ngoài một căn phòng đóng kín có 1 bóng đèn sợi đốt bên trong. Bên ngoài có 3 công tắc A, B, C (chỉ 1 công tắc bật đèn). Bạn chỉ được mở cửa bước vào phòng DUY NHẤT 1 LẦN. Làm thế nào để biết chính xác công tắc nào bật đèn?", "Bật công tắc A trong 5 phút cho bóng đèn nóng lên. Tắt A, bật ngay công tắc B rồi bước vào phòng: Nếu đèn đang sáng -> là B; nếu đèn tắt nhưng sờ bóng thấy nóng -> là A; nếu đèn tắt và bóng nguội hoàn toàn -> là C!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 5 */
  item("truth", "THANG NHIỆT ĐỘ KELVIN", "Nhiệt độ phòng là 27°C thì tương ứng với bao nhiêu Kelvin (K) trong thang nhiệt độ tuyệt đối?", "T(K) = 27 + 273 = 300 K!", 30, undefined, undefined, "⚡ VẬT LÍ 12"),

  /* 6 */
  item("truth", "ĐỐ VUI LOÀI VẬT", "Thế con vịt nào đi bằng 2 chân?", "Tất cả các con vịt bình thường đều đi bằng 2 chân! (Ai bảo vịt Donald là bị lừa nhé)", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 7 */
  item("truth", "SÓI CỪU VÀ BẮP CẢI", "Một bác nông dân cần chở qua sông 1 con sói, 1 con cừu và 1 bắp cải. Thuyền chỉ chở được bác và 1 trong 3 thứ. Nếu bác đi vắng: Sói ăn cừu, Cừu ăn bắp cải. Bác làm thế nào để chở cả 3 thứ qua sông an toàn?", "Chuyến 1: Chở CỪU qua sông (sói không ăn bắp cải). Chuyến 2: Chở SÓI qua sông rồi CHỞ CỪU QUAY VỀ. Chuyến 3: Chở BẮP CẢI qua sông. Chuyến 4: Quay về đón CỪU qua nốt!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 8 */
  item("truth", "CHÍN MẮT CHÍN ĐẦU", "Trùng trục như con chó thui, chín mắt chín mũi chín đuôi chín đầu. Hỏi là con gì?", "Con chó thui chín (chín ở đây là nấu chín, nướng chín chứ không phải số 9)!", 30, undefined, undefined, "🏮 ĐỐ DÂN GIAN"),

  /* 9 */
  item("truth", "CHIA TÁO TRONG RỔ", "Có 5 quả táo trong một chiếc rổ. Làm thế nào để chia cho 5 bạn, mỗi bạn được đúng 1 quả táo, nhưng trong rổ vẫn còn lại đúng 1 quả táo?", "Chia cho 4 bạn đầu mỗi người 1 quả táo rời, còn bạn thứ 5 thì đưa cả chiếc rổ có quả táo cuối cùng bên trong!", 35, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 10 */
  item("special", "VÒNG QUAY MAY MẮN 12A6", "🎡 BẠN ĐÃ MỞ TRÚNG VÒNG QUAY 12A6! Bấm chọn 1 trong 2 chế độ quay bên dưới để tìm ra bạn may mắn tiếp theo:", undefined, 0, undefined, undefined, "🎡 VÒNG QUAY 12A6"),

  /* 11 */
  item("truth", "ĐƯỜNG TIỆM CẬN", "Đồ thị hàm số y = (2x + 1) / (x - 1) có tiệm cận đứng là đường thẳng nào và tiệm cận ngang là đường thẳng nào?", "Tiệm cận đứng: x = 1; Tiệm cận ngang: y = 2!", 30, undefined, undefined, "📐 TOÁN 12"),

  /* 12 */
  item("gift", "QUÀ MAY MẮN", "HỘP QUÀ VÀNG: Chúc mừng bạn trúng quà ăn vặt / bánh kẹo từ ban cán sự lớp mà không cần trả lời câu đố nào!", undefined, 0, undefined, undefined, "🌟 BẢO BỐI"),

  /* 13 */
  item("truth", "ĐOÁN SỐ TUỔI BỐ VÀ CON", "Năm nay tuổi của bố gấp 4 lần tuổi của con. Sau 20 năm nữa, tuổi của bố chỉ còn gấp 2 lần tuổi của con. Hỏi năm nay con bao nhiêu tuổi và bố bao nhiêu tuổi?", "Con 10 tuổi và Bố 40 tuổi! (Sau 20 năm nữa: con 30 tuổi, bố 60 tuổi, đúng gấp đôi 60 = 30 × 2)!", 40, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 14 */
  item("truth", "NHIỆT DUNG RIÊNG", "Đại lượng đo bằng nhiệt lượng cần cung cấp để 1 kg chất tăng thêm 1°C (hoặc 1 K) gọi là gì?", "Nhiệt dung riêng (kí hiệu là c, đơn vị là J/kg.K)!", 30, undefined, undefined, "⚡ VẬT LÍ 12"),

  /* 15 */
  item("dare", "HÌNH PHẠT HÍT ĐẤT", "Thực hiện chống đẩy (hít đất) đúng 5 cái ngay tại chỗ để vượt qua thử thách!", undefined, 30, undefined, undefined, "⚡ HÌNH PHẠT"),

  /* 16 */
  item("truth", "3 VIÊN THUỐC CỦA BÁC SĨ", "Bác sĩ kê đơn cho bạn đúng 3 viên thuốc và dặn: 'Cứ đúng 30 phút thì uống 1 viên'. Hỏi sau bao nhiêu phút bạn sẽ uống hết cả 3 viên thuốc?", "Đúng 60 phút! (Phút 0 uống viên đầu tiên, phút 30 uống viên thứ hai, phút 60 uống viên thứ ba — nhiều bạn vội tính 30 × 3 = 90 phút là dính bẫy)!", 35, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 17 */
  item("truth", "THỂ TÍCH KHỐI CHÓP", "Nếu tăng chiều cao của một khối chóp lên gấp 3 lần và giữ nguyên diện tích đáy thì thể tích của khối chóp đó sẽ tăng lên bao nhiêu lần?", "Thể tích sẽ TĂNG LÊN ĐÚNG 3 LẦN! (Công thức V = 1/3 . B . h, thể tích tỉ lệ thuận bậc nhất với chiều cao h)!", 30, undefined, undefined, "📐 TOÁN 12"),

  /* 18 */
  item("truth", "ĐẠO HÀM CỦA HẰNG SỐ", "Đạo hàm f'(x) của hàm hằng f(x) = 2026 bằng bao nhiêu?", "Đạo hàm bằng 0! (Đạo hàm của bất kỳ số thực hằng số nào cũng luôn bằng 0)!", 20, undefined, undefined, "📐 TOÁN 12"),

  /* 19 */
  item("special", "THÊM LƯỢT BỐC", "🎯 THÊM LƯỢT: Bạn nhận được thêm 1 lượt bốc túi mù tiếp theo ngay lập tức!", undefined, 0, undefined, undefined, "🌟 BẢO BỐI"),

  /* 20 */
  item("truth", "ỐC SÊN TRÈO CỘT 10 MÉT", "Một chú ốc sên leo lên cây cột cao 10 mét. Ban ngày leo được 3 mét, ban đêm ngủ bị tuột xuống 2 mét. Hỏi sau bao nhiêu ngày thì chú ốc sên leo chạm tới đỉnh cột?", "Đúng 8 ngày! (Hết ngày thứ 7 ốc sên leo được 7m. Sang ban ngày của ngày thứ 8, ốc sên bò thêm 3m là chạm đỉnh 10m luôn, không còn bị tụt nữa)!", 40, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 21 */
  item("truth", "TÍNH ĐƠN ĐIỆU HÀM SỐ", "Nếu đạo hàm f'(x) > 0 với mọi x thuộc khoảng (1; 5) thì trên khoảng đó hàm số đồng biến hay nghịch biến?", "Hàm số ĐỒNG BIẾN trên khoảng (1; 5)!", 30, undefined, undefined, "📐 TOÁN 12"),

  /* 22 */
  item("truth", "TAY NÀO CẦM ĐƯỢC", "Cái gì bạn có thể cầm được bằng tay trái nhưng không bao giờ cầm được bằng bàn tay phải của mình?", "Khuỷu tay phải (hoặc mu bàn tay phải) của chính bạn!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 23 */
  item("special", "KHIÊN HỘ MỆNH", "BẢO BỐI KIM CƯƠNG: Bạn được MIỄN TRỪ trả lời câu hỏi hôm nay, nhận quà trực tiếp hoặc nhượng lại khiên cho đứa bạn thân!", undefined, 0, undefined, undefined, "🌟 BẢO BỐI"),

  /* 24 */
  item("truth", "ĐỊNH LUẬT BOYLE", "Trong quá trình đẳng nhiệt của một lượng khí lí tưởng xác định, khi thể tích V giảm đi 2 lần thì áp suất p sẽ biến đổi như thế nào?", "Áp suất p sẽ TĂNG LÊN 2 LẦN (áp suất tỉ lệ nghịch với thể tích: p.V = const)!", 30, undefined, undefined, "⚡ VẬT LÍ 12"),

  /* 25 */
  item("dare", "CATWALK ĐỈNH CAO", "Thực hiện màn Catwalk thần thái đỉnh cao từ cửa lớp lên bục giảng, kết thúc bằng một nụ cười rạng rỡ và vẫy tay chào cả lớp!", undefined, 35, undefined, undefined, "🎭 THỬ THÁCH"),

  /* 26 */
  item("truth", "CÂN 9 VIÊN BI TÌM BI NHẸ", "Có 9 viên bi sắt bề ngoài giống hệt nhau, trong đó có 1 viên bi rỗng nhẹ hơn 8 viên còn lại. Chỉ dùng một chiếc cân đĩa thăng bằng đúng 2 lần, làm sao để chắc chắn tìm ra viên bi nhẹ đó?", "Lần 1: Chia 9 viên thành 3 nhóm (3-3-3), đặt 2 nhóm lên 2 đĩa cân. Nếu thăng bằng -> bi nhẹ ở nhóm còn lại; nếu lệch -> bi nhẹ ở đĩa bổng lên. Lần 2: Lấy nhóm 3 viên đó đặt 1-1 lên cân, xác định ngay viên nhẹ nhất!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 27 */
  item("truth", "CÂN NẶNG CON CÁ", "Một con cá có đuôi nặng 150g, đầu nặng bằng đuôi cộng một nửa thân, thân nặng bằng đầu cộng đuôi. Hỏi cả con cá nặng bao nhiêu gam?", "Cả con cá nặng đúng 1200g (1,2 kg)! (Giải thích: Đuôi = 150g; Thân = 600g; Đầu = 150 + 300 = 450g. Tổng = 150 + 600 + 450 = 1200g)!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 28 */
  item("gift", "HỘP QUÀ CÔ CHỦ NHIỆM (LƯỢT 1)", "👩‍🏫 HỘP QUÀ ĐẶC BIỆT TỪ CÔ CHỦ NHIỆM: Chúc mừng bạn đã mở trúng món quà danh dự từ Cô Chủ Nhiệm! Bạn nhận được quà trực tiếp và được quyền xin Cô gợi ý hoặc giải cứu qua ải ở lượt sau!", undefined, 0, undefined, undefined, "👩‍🏫 CÔ CHỦ NHIỆM"),

  /* 29 */
  item("truth", "SINH NHẬT BÍ ẨN CỦA NAM", "Hôm kia Nam mới 17 tuổi, nhưng sang năm sau Nam sẽ tròn 20 tuổi. Hỏi hôm nay là ngày nào và sinh nhật của Nam là ngày nào?", "Hôm nay là ngày 1 tháng 1! Sinh nhật Nam là ngày 31 tháng 12. Hôm kia (30/12) Nam 17 tuổi, hôm qua (31/12) Nam tròn 18 tuổi. Năm nay Nam 19 tuổi và sang năm sau Nam tròn 20 tuổi!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 30 */
  item("special", "MẤT LƯỢT BỐC TÚI", "⛔ MẤT LƯỢT: Bạn bị rơi vào ô đóng băng! Hãy nhường quyền bốc túi mù tiếp theo cho bạn ngồi cạnh bạn!", undefined, 0, undefined, undefined, "🌟 BẢO BỐI"),

  /* 31 */
  item("truth", "HÀM SỐ Y = |X| VÀ CỰC TRỊ", "Hàm số y = |x| có đạo hàm tại điểm x = 0 hay không, và tại điểm x = 0 hàm số có đạt cực trị (cực đại/cực tiểu) hay không?", "Không có đạo hàm tại x = 0, NHƯNG vẫn đạt CỰC TIỂU tại x = 0! (Vì y = |x| liên tục và đổi chiều biến thiên từ giảm sang tăng qua x = 0, giá trị nhỏ nhất f(0) = 0)!", 35, undefined, undefined, "📐 TOÁN 12"),

  /* 32 */
  item("truth", "GIÁ TRỊ LỚN NHẤT NHỎ NHẤT", "Giá trị nhỏ nhất (GTNN) của hàm số y = (x - 2)² + 5 bằng bao nhiêu và đạt được khi x bằng mấy?", "GTNN bằng 5 khi x = 2!", 30, undefined, undefined, "📐 TOÁN 12"),

  /* 33 */
  item("truth", "BỨT KHÔNG RỜI", "Cái gì chặt không đứt, bứt không rời, phơi không khô, đốt không cháy?", "Nước!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 34 */
  item("truth", "NHIỆT ĐỘ KHÔNG TUYỆT ĐỐI", "Nhiệt độ 'Không tuyệt đối' (0 Kelvin) tương ứng với bao nhiêu độ Celsius (°C)?", "Xấp xỉ -273°C (chính xác là -273.15°C)!", 30, undefined, undefined, "⚡ VẬT LÍ 12"),

  /* 35 */
  item("special", "VÒNG QUAY MAY MẮN 12A6", "🎡 BẠN ĐÃ MỞ TRÚNG VÒNG QUAY 12A6! Bấm chọn 1 trong 2 chế độ quay bên dưới để tìm ra bạn may mắn tiếp theo:", undefined, 0, undefined, undefined, "🎡 VÒNG QUAY 12A6"),

  /* 36 */
  item("special", "VÉ MIỄN TRỰC NHẬT", "TẤM VÉ VÀNG 12A6: Bạn nhận được 1 phiếu miễn trực nhật lớp trong tuần tới (hoặc được quyền trao tặng vé cho bạn khác)!", undefined, 0, undefined, undefined, "🌟 BẢO BỐI"),

  /* 37 */
  item("truth", "3 NGƯỜI ĐỘI MŨ ĐOÁN MÀU", "Có 3 bạn A, B, C đứng xếp hàng (C thấy B và A; B thấy A; A không thấy ai). Thầy giáo lấy mũ từ hộp (3 mũ đen, 2 mũ trắng) đội cho 3 bạn. C chịu không đoán được. B nhìn A rồi cũng chịu. Khi đó A lập tức đoán trúng màu mũ của mình. Hỏi mũ của A màu gì và vì sao?", "Mũ A màu ĐEN! Vì nếu A và B cùng đội mũ trắng thì C đã biết ngay mình đội mũ đen. C chịu chứng tỏ ít nhất một trong hai bạn A, B phải đội mũ đen. Nếu A đội mũ trắng thì B đã biết mình đội mũ đen, nhưng B cũng chịu -> Bắt buộc A phải đội mũ ĐEN!", 50, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 38 */
  item("truth", "THÂN NHIỆT THANG KELVIN", "Một bạn học sinh 12A6 khỏe mạnh có thân nhiệt chuẩn là 37°C. Khi đổi sang thang nhiệt độ tuyệt đối Kelvin (K), thân nhiệt của bạn ấy là bao nhiêu K?", "T(K) = 37 + 273,15 = 310,15 K (hoặc 310 K)!", 25, undefined, undefined, "⚡ VẬT LÍ 12"),

  /* 39 */
  item("truth", "CÁI GÌ LẠ LÙNG", "Cái gì đi thì nằm, đứng thì nằm, nhưng nằm thì lại đứng?", "Bàn chân người!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 40 */
  item("truth", "QUÁ TRÌNH ĐẲNG TÍCH", "Trong quá trình đẳng tích (thể tích không đổi) của một lượng khí lí tưởng xác định, khi nhiệt độ tuyệt đối T tăng lên 2 lần thì áp suất p biến đổi như thế nào?", "Áp suất p TĂNG LÊN 2 LẦN! (Định luật Sác-lơ: áp suất tỉ lệ thuận với nhiệt độ tuyệt đối: p / T = hằng số)!", 30, undefined, undefined, "⚡ VẬT LÍ 12"),

  /* 41 */
  item("truth", "KHÔNG CÁNH MÀ BAY", "Không cánh mà biết bay, không chân mà biết chạy, không miệng mà biết gào thét. Là gì?", "Cơn gió (hoặc Cơn bão)!", 25, undefined, undefined, "🏮 ĐỐ DÂN GIAN"),

  /* 42 */
  item("truth", "THỨ GÌ BIẾN MÀU", "Thứ gì mua về màu đen, khi đem xài biến thành màu đỏ, xài xong vứt đi lại màu xám trắng?", "Hòn than củi (hoặc than tổ ong)!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 43 */
  item("truth", "BẰNG QUẢ CAU", "Cái gì bằng quả cau, chẳng ai lau mà sạch bóng?", "Mặt trời (hoặc Mặt trăng / Con ngươi mắt)!", 25, undefined, undefined, "🏮 ĐỐ DÂN GIAN"),

  /* 44 */
  item("gift", "HỘP QUÀ BẰNG HỮU", "🤝 HỘP QUÀ ĐỒNG ĐỘI TIẾP SỨC: Hộp quà chia đôi ngọt bùi! Bạn được quyền chỉ định ngay 1 bạn thân bất kỳ trong lớp cùng lên nhận quà ăn vặt và cùng bạn chiến tiếp lượt sau!", undefined, 0, undefined, undefined, "🤝 TRỢ GIÚP BẠN BÈ"),

  /* 45 */
  item("truth", "TOÁN ĐỐ VỊT ĐI HÀNG", "Hai con vịt đi trước hai con vịt, hai con vịt đi sau hai con vịt, hai con vịt đi giữa hai con vịt. Hỏi có tất cả bao nhiêu con vịt?", "Chỉ có đúng 4 con vịt đi thành 1 hàng dọc!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 46 */
  item("dare", "MEME SỐNG 12A6", "Tạo liên tiếp 3 biểu cảm khuôn mặt meme hài hước nhất để các bạn xung quanh chụp ảnh dìm làm kỷ niệm!", undefined, 30, undefined, undefined, "⚡ HÌNH PHẠT"),

  /* 47 */
  item("truth", "KHÓI ĐOÀN TÀU ĐIỆN", "Một đoàn tàu điện đang chạy về hướng Nam với vận tốc 80 km/h. Gió đang thổi mạnh từ hướng Bắc xuống Nam với vận tốc 40 km/h. Hỏi khói của đoàn tàu sẽ bay về hướng nào?", "Tàu điện KHÔNG CÓ KHÓI! (Cả lớp đừng vội cộng trừ vận tốc vectơ của gió nhé)!", 30, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 48 */
  item("truth", "BÔI XÓA ĐIỂM SỐ", "Càng bôi xóa nhiều thì điểm càng dễ bị trừ, càng để yên không tẩy xóa thì thầy cô càng khen. Là cái gì?", "Bài thi / Bài kiểm tra trên giấy!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 49 */
  item("truth", "ĐÊM TRÒN VÂY QUANH", "Một mẹ sinh được ngàn con, ngày thì tan tác đêm tròn vây quanh. Là gì?", "Mặt trăng và ngàn vì sao trên bầu trời!", 25, undefined, undefined, "🏮 ĐỐ DÂN GIAN"),

  /* 50 */
  item("special", "THÊM LƯỢT BỐC", "🎯 THÊM LƯỢT: Bạn bốc trúng thẻ may mắn! Được quyền bốc thêm 1 túi mù nữa ngay bây giờ!", undefined, 0, undefined, undefined, "🌟 BẢO BỐI"),

  /* 51 */
  item("truth", "ĐIỂM CỰC TRỊ TRÙNG PHƯƠNG", "Hàm số trùng phương y = ax⁴ + bx² + c có 3 điểm cực trị khi tích hai hệ số a và b mang dấu gì?", "Khi tích a.b < 0 (a và b trái dấu)!", 30, undefined, undefined, "📐 TOÁN 12"),

  /* 52 */
  item("truth", "CỦA BẠN MÀ NGƯỜI KHÁC XÀI", "Thứ gì là tài sản của bạn, nhưng bạn bè và mọi người xung quanh lại xài nó nhiều hơn bạn rất nhiều lần?", "Tên gọi của bạn!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 53 */
  item("truth", "HOA GÌ THỀM NHÀ", "Hoa gì chỉ nở ban đêm, hương thơm ngào ngạt bên thềm nhà ai?", "Hoa quỳnh (hoặc Hoa dạ lý hương)!", 25, undefined, undefined, "🏮 ĐỐ DÂN GIAN"),

  /* 54 */
  item("truth", "ĐỊNH LUẬT CHARLES", "Trong quá trình đẳng áp của một lượng khí lí tưởng xác định, thể tích V và nhiệt độ tuyệt đối T tỉ lệ thuận hay tỉ lệ nghịch với nhau?", "Tỉ lệ thuận với nhau: V / T = hằng số!", 30, undefined, undefined, "⚡ VẬT LÍ 12"),

  /* 55 */
  item("dare", "SOÁI CA TỎ TÌNH", "Cầm một cây bút đóng vai soái ca/nữ chính nói một lời tỏ tình lãng mạn và sến sẩm nhất với bạn cùng bàn!", undefined, 40, undefined, undefined, "🎭 THỬ THÁCH"),

  /* 56 */
  item("truth", "PHỤ NỮ VÀ ĐÀN ÔNG", "Cái gì của người phụ nữ càng kéo dài thì càng xinh, còn đàn ông càng kéo dài thì càng sốt ruột?", "Thời gian trang điểm / sửa soạn quần áo ra ngoài!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 57 */
  item("truth", "TIỆM TẠP HÓA VÀ TIỀN GIẢ", "Khách mua món đồ 20k bằng tờ 100k giả. Chủ quán không có tiền lẻ nên chạy sang tiệm bên đổi tờ 100k lấy tiền lẻ rồi thối khách 80k. Tiệm bên phát hiện tiền giả, chủ quán phải đền 100k thật. Hỏi chủ quán lỗ bao nhiêu tiền?", "Chủ quán bị lỗ đúng 100k (gồm món đồ 20k và 80k tiền thối cho tên lừa đảo)! Tiệm bên cạnh hòa vốn không lỗ không lãi!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 58 */
  item("truth", "VI KHUẨN NHÂN ĐÔI", "Một loại vi khuẩn cứ 1 phút lại nhân đôi một lần. Nếu ban đầu cho 1 con vi khuẩn vào lọ thí nghiệm thì sau đúng 60 phút lọ sẽ đầy ắp vi khuẩn. Hỏi nếu ban đầu cho 2 con vi khuẩn thì sau bao nhiêu phút lọ sẽ đầy?", "Đúng 59 phút! (Vì 2 con vi khuẩn tương đương với trạng thái của lọ ban đầu sau 1 phút. Sau 59 phút tiếp theo lọ sẽ đầy ắp vi khuẩn)!", 40, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 59 */
  item("truth", "NĂM NÀO 28 NGÀY", "Có những tháng có 31 ngày, có những tháng có 30 ngày. Hỏi trong một năm có tất cả bao nhiêu tháng có 28 ngày?", "TẤT CẢ 12 THÁNG trong năm đều có ít nhất 28 ngày! (Ai trả lời chỉ có tháng 2 là dính bẫy rồi nhé)!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 60 */
  item("gift", "HỘP QUÀ SỨC MẠNH CẢ TỔ", "👥 HỘP QUÀ TỔ ĐỘI: Toàn bộ thành viên trong Tổ của bạn cùng được nhận quà ăn vặt / điểm cộng thi đua từ quỹ lớp 12A6!", undefined, 0, undefined, undefined, "👥 TRỢ GIÚP TỔ"),

  /* 61 */
  item("truth", "TIẾP TUYẾN ĐỒ THỊ", "Hệ số góc k của tiếp tuyến với đồ thị hàm số y = f(x) tại điểm có hoành độ x₀ bằng giá trị nào?", "k = f'(x₀) (đạo hàm của hàm số tại điểm x₀)!", 30, undefined, undefined, "📐 TOÁN 12"),

  /* 62 */
  item("truth", "HAI THỢ CẮT TÓC Ở THỊ TRẤN", "Thị trấn nọ chỉ có đúng 2 thợ cắt tóc A và B. Bạn đến tiệm ông A thấy tiệm bừa bộn và đầu tóc ông A cắt rất xấu. Đến tiệm ông B thấy tiệm sạch bóng và đầu tóc ông B cắt cực đẹp. Bạn nên chọn ai cắt tóc cho mình?", "Nên chọn ông A! Vì cả thị trấn chỉ có 2 thợ cắt tóc nên họ phải cắt tóc cho nhau. Tóc ông B rất đẹp là do ông A cắt (ông A tay nghề giỏi); còn tóc ông A xấu là do ông B cắt!", 40, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 63 */
  item("dare", "ĐỨNG HÌNH BẤT ĐỘNG", "Tạo dáng tượng hài hước và đứng bất động trong 20 giây, mặc cho các bạn xung quanh làm trò trêu chọc!", undefined, 20, undefined, undefined, "⚡ HÌNH PHẠT"),

  /* 64 */
  item("truth", "NHIỆT NÓNG CHẢY RIÊNG", "Đại lượng đo bằng nhiệt lượng cần cung cấp để 1 kg chất rắn nóng chảy hoàn toàn ở nhiệt độ nóng chảy gọi là gì?", "Nhiệt nóng chảy riêng (kí hiệu là λ, đơn vị J/kg)!", 30, undefined, undefined, "⚡ VẬT LÍ 12"),

  /* 65 */
  item("special", "VÒNG QUAY MAY MẮN 12A6", "🎡 BẠN ĐÃ MỞ TRÚNG VÒNG QUAY 12A6! Bấm chọn 1 trong 2 chế độ quay bên dưới để tìm ra bạn may mắn tiếp theo:", undefined, 0, undefined, undefined, "🎡 VÒNG QUAY 12A6"),

  /* 66 */
  item("truth", "GIẢI ĐẤU LOẠI TRỰC TIẾP", "Có 32 đội bóng tham gia giải đấu loại trực tiếp (thua 1 trận bị loại ngay). Cần tổ chức tổng cộng bao nhiêu trận đấu để tìm ra đội vô địch?", "Đúng 31 trận đấu! (Suy luận logic: Để tìm ra 1 đội vô địch thì phải loại bỏ 31 đội còn lại. Mỗi trận loại đúng 1 đội nên cần đúng 31 trận đấu)!", 35, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 67 */
  item("truth", "TẤT ĐEN TRẮNG TRONG BÓNG TỐI", "Trong ngăn kéo có 10 chiếc tất đen và 10 chiếc tất trắng để lẫn lộn. Trong phòng tối om không nhìn thấy gì, bạn cần lấy ra ít nhất bao nhiêu chiếc tất để CHẮC CHẮN có được ít nhất một đôi tất cùng màu?", "Chỉ cần lấy ít nhất 3 chiếc tất! (Theo nguyên lý Dirichlet, vì chỉ có 2 màu đen và trắng nên khi lấy 3 chiếc bất kỳ, chắc chắn sẽ có ít nhất 2 chiếc cùng màu)!", 35, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 68 */
  item("truth", "CỰC TRỊ HÀM PHÂN THỨC BẬC NHẤT", "Đồ thị hàm số phân thức bậc nhất trên bậc nhất y = (ax + b) / (cx + d) có bao nhiêu điểm cực trị?", "KHÔNG CÓ ĐIỂM CỰC TRỊ NÀO CẢ! (Vì đạo hàm y' luôn mang một dấu âm hoặc dương không đổi trên từng khoảng xác định, không bao giờ đổi dấu)!", 30, undefined, undefined, "📐 TOÁN 12"),

  /* 69 */
  item("truth", "CÁ GÌ LẠ LÙNG", "Cá gì có vây có vảy nhưng thả xuống nước là chìm nghỉm không biết bơi?", "Cá khô (hoặc cá gỗ, cá kho)! Có bạn bảo cá độ nữa!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 70 */
  item("truth", "THỂ TÍCH KHỐI HỘP", "Một khối hộp chữ nhật có 3 kích thước lần lượt là a = 2, b = 3, c = 4 thì có thể tích V bằng bao nhiêu?", "V = a.b.c = 2 × 3 × 4 = 24!", 25, undefined, undefined, "📐 TOÁN 12"),

  /* 71 */
  item("truth", "HÁ MỒM LÀ ĐỨT", "Hai lưỡi cùng chung một cốt, há mồm là đứt vải lụa giấy tờ. Là cái gì?", "Cái kéo!", 25, undefined, undefined, "🏮 ĐỐ DÂN GIAN"),

  /* 72 */
  item("dare", "THI SĨ BẤT ĐẮC DĨ", "Sáng tác ngay tại chỗ một bài thơ 4 câu gieo vần về kỳ thi đại học sắp tới của lớp 12A6!", undefined, 45, undefined, undefined, "🎭 THỬ THÁCH"),

  /* 73 */
  item("truth", "MÔ HÌNH ĐỘNG HỌC KHÍ", "Theo mô hình động học phân tử chất khí, khi nhiệt độ của khối khí tăng lên thì vận tốc chuyển động nhiệt của các phân tử sẽ như thế nào?", "Vận tốc chuyển động nhiệt của các phân tử TĂNG LÊN!", 30, undefined, undefined, "⚡ VẬT LÍ 12"),

  /* 74 */
  item("gift", "KIM BÀI CÔ CHỦ NHIỆM (LƯỢT 2)", "👩‍🏫 KIM BÀI CÔ CHỦ NHIỆM: Hộp quà tối thượng từ Cô Chủ Nhiệm! Nhận quà may mắn liền tay và nhờ Cô Chủ Nhiệm chọn 1 bạn gánh thay thử thách hoặc gửi một lời chúc tới cả lớp!", undefined, 0, undefined, undefined, "👩‍🏫 CÔ CHỦ NHIỆM"),

  /* 75 */
  item("truth", "SỐ CẠNH HÌNH HỘP LẬP PHƯƠNG", "Một khối lập phương có bao nhiêu đỉnh, bao nhiêu mặt và có tất cả bao nhiêu cạnh?", "8 đỉnh, 6 mặt và 12 cạnh!", 25, undefined, undefined, "📐 TOÁN 12"),

  /* 76 */
  item("truth", "EM CƯỜI NÓ CƯỜI", "Sáng trưa chiều tối đứng nhìn em, em cười nó cười, em khóc nó khóc. Là cái gì?", "Cái gương soi!", 25, undefined, undefined, "🏮 ĐỐ DÂN GIAN"),

  /* 77 */
  item("truth", "CẮT XÍCH VÀNG TRẢ TIỀN PHÒNG", "Ở trọ 7 ngày, mỗi ngày trả đúng 1 mắt xích vàng. Bạn có đoạn xích gồm 7 mắt liền nhau. Cần cưa cắt ít nhất mấy mắt xích để ngày nào cũng trả được đúng 1 mắt xích?", "Chỉ cần cắt ĐÚNG 1 MẮT XÍCH (mắt xích thứ 3)! Lúc này đoạn xích tách thành 3 phần: 1 mắt rời, đoạn 2 mắt, đoạn 4 mắt. Ngày 1 trả 1; Ngày 2 đưa 2 lấy lại 1; Ngày 3 đưa 1; Ngày 4 đưa 4 lấy lại 1 và 2... trả đủ 7 ngày!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 78 */
  item("truth", "KHÔNG ĐẬP THÌ CHẾT", "Cái gì đập thì sống, không đập thì chết ngắc?", "Trái tim con người!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 79 */
  item("truth", "ỨNG DỤNG ĐẠO HÀM", "Để tìm giá trị lớn nhất và nhỏ nhất của hàm số liên tục trên đoạn [a; b], ta tính giá trị f(x) tại các điểm nào?", "Tại hai đầu mút a, b và tại các điểm cực trị x nằm trong khoảng (a; b)!", 30, undefined, undefined, "📐 TOÁN 12"),

  /* 80 */
  item("truth", "8 ĐỒNG XU CÓ 1 ĐỒNG NHẸ", "Có 8 đồng xu giống hệt nhau, trong đó có 1 đồng xu giả nhẹ hơn 7 đồng còn lại. Bạn có một chiếc cân đĩa thăng bằng (không có quả cân). Hỏi cần ít nhất mấy lần cân để chắc chắn tìm ra đồng xu giả?", "Chỉ cần đúng 2 lần cân! (Lần 1: Chia 8 đồng thành 3-3-2, đặt 3 đồng lên mỗi bên đĩa. Nếu bằng nhau -> xu giả ở nhóm 2. Lần 2: Cân 1-1 trong nhóm chứa xu giả để xác định ngay)!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 81 */
  item("dare", "UỐNG NƯỚC CHÚC LỚP", "Uống một ngụm nước và nói to rõ ràng câu: 'Chúc toàn thể 12A6 cùng đỗ đại học nguyện vọng 1!'", undefined, 30, undefined, undefined, "⚡ HÌNH PHẠT"),

  /* 82 */
  item("truth", "ÁP SUẤT VÀ NHIỆT ĐỘ", "Đơn vị đo áp suất chuẩn trong hệ đơn vị SI là gì?", "Paxcan (Pa) hoặc N/m²!", 25, undefined, undefined, "⚡ VẬT LÍ 12"),

  /* 83 */
  item("truth", "CÀNG CHO CÀNG NHIỀU", "Cái gì của bạn mà khi bạn cho người khác, bạn không hề bị mất đi mà thậm chí còn có nhiều hơn?", "Nụ cười (hoặc Lời khuyên, tình yêu thương)!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 84 */
  item("truth", "CHUYẾN BAY VÀ GIÓ", "Máy bay bay khứ hồi Hà Nội - TP.HCM: Ngày 1 trời lặng gió; Ngày 2 có gió thổi đều liên tục từ Bắc vào Nam suốt cả chuyến đi và về. Hỏi ngày nào chuyến bay khứ hồi mất ít thời gian hơn?", "Ngày 1 (lặng gió) mất ÍT thời gian hơn! Lý do: Thời gian bay chậm khi ngược gió kéo dài nhiều hơn so với thời gian tiết kiệm được khi xuôi gió!", 40, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 85 */
  item("truth", "ĐONG ĐÚNG 4 LÍT NƯỚC", "Có một bình 5 lít, một bình 3 lít và một vòi nước vô tận (không có vạch đo nào khác). Làm sao để đong được CHÍNH XÁC đúng 4 lít nước?", "Đổ đầy bình 5L, rót sang bình 3L cho đầy (bình 5L còn 2L). Đổ hết bình 3L đi, trút 2L từ bình 5L sang bình 3L. Múc đầy bình 5L rồi rót bù 1L vào bình 3L cho đầy. Lúc này bình 5L còn đúng 4L!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 86 */
  item("special", "SỨC MẠNH CẢ TỔ", "👥 TỔ ĐỘI HỘI Ý: Toàn bộ thành viên trong Tổ của bạn được phép cùng nhau chụm đầu mách nước đáp án cho bạn trong 30 giây để mang quà về cho tổ!", undefined, 0, undefined, undefined, "👥 TRỢ GIÚP TỔ"),

  /* 87 */
  item("dare", "VŨ ĐIỆU BẮT TREND", "Nhảy một đoạn vũ điệu ngắn bắt trend TikTok 15 giây hoặc tự biên đạo một điệu nhảy tự do trước lớp!", undefined, 30, undefined, undefined, "🎭 THỬ THÁCH"),

  /* 88 */
  item("special", "VÒNG QUAY MAY MẮN 12A6", "🎡 BẠN ĐÃ MỞ TRÚNG VÒNG QUAY 12A6! Bấm chọn 1 trong 2 chế độ quay bên dưới để tìm ra bạn may mắn tiếp theo:", undefined, 0, undefined, undefined, "🎡 VÒNG QUAY 12A6"),

  /* 89 */
  item("truth", "ĐI ĐẾN MÃI MÃI", "Cái gì luôn luôn đi đến mà không bao giờ thực sự đến nơi?", "Ngày mai! (Vì khi bạn đến nơi thì nó đã thành ngày hôm nay rồi)!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 90 */
  item("truth", "CẦU GÌ KHÔNG QUA SÔNG", "Cầu gì không bắc qua sông, bắc qua trời rộng bảy màu lung linh?", "Cầu vồng sau cơn mưa!", 25, undefined, undefined, "🏮 ĐỐ DÂN GIAN"),

  /* 91 */
  item("dare", "LỜI NỊNH BÍ THƯ", "Khen ngợi Lớp trưởng hoặc Bí thư bằng 3 tính từ hoa mỹ nhất có thể nghĩ ra!", undefined, 30, undefined, undefined, "🎭 THỬ THÁCH"),

  /* 92 */
  item("truth", "THÌ THẦM BÊN TAI", "Con kiến bò lên tai con voi rồi thì thầm câu gì mà con voi lăn đùng ra ngất xỉu?", "Kiến bảo: 'Tao có bầu với mày rồi đó voi ơi!'", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 93 */
  item("truth", "BA ANH EM CHUNG NHÀ", "Ba anh cùng chung một nhà, anh ngắn đi chậm, anh dài đi nhanh, anh gầy chạy suốt ngày đêm. Là gì?", "Ba kim của chiếc đồng hồ (kim giờ, kim phút, kim giây)!", 25, undefined, undefined, "🏮 ĐỐ DÂN GIAN"),

  /* 94 */
  item("special", "CHUYỂN NHƯỢNG QUYỀN LỰC", "🎯 NÉ ĐẠN NGOẠN MỤC: Bạn được quyền nhường câu này cho 1 bạn bất kỳ trong lớp. Bạn đó trả lời đúng thì nhận quà, trả lời sai sẽ chịu hình phạt thay bạn!", undefined, 0, undefined, undefined, "🌟 BẢO BỐI"),

  /* 95 */
  item("truth", "ĐO 45 PHÚT BẰNG 2 SỢI DÂY", "Có 2 sợi dây thừng cháy không đều nhau, mỗi sợi khi đốt cháy hết mất đúng 60 phút. Làm thế nào để dùng 2 sợi dây này đo chính xác thời gian 45 phút?", "Đốt cùng lúc 2 đầu sợi dây thứ nhất và 1 đầu sợi dây thứ hai. Khi sợi thứ nhất cháy hết (30 phút), lập tức châm lửa đầu còn lại của sợi thứ hai. Khi sợi thứ hai cháy hết là thêm 15 phút -> Tổng cộng đúng 45 phút!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 96 */
  item("truth", "TỪ ĐIỂN TIẾNG VIỆT", "Từ nào trong từ điển tiếng Việt mà người Việt Nam nào đọc cũng phát âm là 'sai'?", "Chính là từ 'SAI'!", 25, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 97 */
  item("truth", "THÁM HIỂM BĂNG QUA SA MẠC", "Muốn băng qua sa mạc mất 4 ngày đi bộ. Mỗi người chỉ mang được lương thực tối đa cho 3 ngày. Cần ít nhất bao nhiêu người cùng xuất phát để ít nhất 1 người qua được sa mạc và những người hỗ trợ đều quay về an toàn?", "Cần ít nhất 3 người cùng xuất phát! (Hết ngày 1: Người thứ 1 chia bớt 2 phần ăn cho 2 người kia rồi dùng 1 phần ăn còn lại quay về. Hết ngày 2: Người thứ 2 đưa 1 phần ăn cho người thứ 3 rồi quay về. Người thứ 3 có đủ 3 phần ăn đi tiếp 2 ngày nữa đến đích)!", 50, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 98 */
  item("truth", "LỚP NÀO VÔ ĐỊCH", "Lớp nào lầy lội nhất trường, vui tính nhất trường và 100% đỗ nguyện vọng 1 năm nay?", "TẬP THỂ LỚP 12A6 CHỨ CÒN AI NỮA!", 20, undefined, undefined, "🤪 ĐỐ MẸO XÀM"),

  /* 99 */
  item("truth", "NGƯỜI NÓI THẬT VÀ NÓI DỐI", "Đến ngã ba có 2 người đứng gác: 1 người luôn nói thật, 1 người luôn nói dối (bạn không biết ai là ai). Chỉ được hỏi 1 CÂU DUY NHẤT với một người để tìm đường về trường học, bạn sẽ hỏi câu gì?", "Hỏi: 'Nếu tôi hỏi người kia con đường nào về trường, người đó sẽ chỉ con đường nào?'. Sau đó bạn cứ đi theo con đường NGƯỢC LẠI với câu trả lời của người được hỏi!", 45, undefined, undefined, "🧠 SUY LUẬN LOGIC"),

  /* 100 */
  item("special", "ĐẠI HỢP XƯỚNG 12A6", "HIỆU ỨNG TRÙM CUỐI: Toàn bộ lớp 12A6 cùng đứng dậy, vỗ tay và đồng thanh hô vang: '12A6 MÃI ĐỈNH — TẤT CẢ CÙNG ĐỖ ĐẠI HỌC NHA!'", undefined, 0, undefined, undefined, "🌟 BẢO BỐI"),
];

function isValidData(x: unknown): x is MinigameData {
  const d = x as MinigameData | null;
  return !!d && typeof d.title === "string" && Array.isArray(d.boxes) && d.boxes.length > 0;
}

export function defaultBoxes(): BoxItem[] {
  return [...BOXES].map((b) => ({ ...b, id: uid() }));
}

export function recoverStoredData(): MinigameData | null {
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    if (currentRaw) {
      const parsed: unknown = JSON.parse(currentRaw);
      if (isValidData(parsed)) {
        return { ...parsed, boxes: parsed.boxes.slice(0, BOX_COUNT) };
      }
    }
  } catch {
    /* bỏ qua */
  }
  return null;
}

export function emptyData(): MinigameData {
  return {
    title: "100 TÚI MÙ ĐỐ VUI · LỚP 12A6",
    wish: "100 chiếc túi mù trộn lẫn lộn: Suy luận Logic đỉnh cao, Toán & Lí 12 Giữa Kì 1, Đố mẹo xàm bựa, Thử thách & Hình phạt, Thêm lượt, Mất lượt và Vòng quay may mắn rải đều khắp nơi!",
    boxes: defaultBoxes(),
  };
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
