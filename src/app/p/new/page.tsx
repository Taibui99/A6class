import { CreateForm } from "@/components/match/create-form";

export const metadata = {
  title: "Tạo game ghép cặp · A6Class",
  description: "Tạo phòng game nối khái niệm, chia sẻ link cho cả lớp cùng chơi.",
};

const DEFAULT_TEXT = `Tôn trọng: Tôn trọng quyền riêng tư, quan điểm, suy nghĩ và sự khác biệt của mỗi cá nhân khi giao tiếp trên không gian mạng, không phát tán thông tin riêng tư của người khác mà không có sự cho phép của họ…
Thấu hiểu: Cảm thông với người khác và thấu hiểu những khó khăn họ gặp phải, biết đặt mình vào hoàn cảnh của người khác để hiểu được những suy nghĩ, tình cảm và vấn đề của họ.
Hỗ trợ: Là sẵn sàng giúp đỡ, hỗ trợ, động viên và an ủi người khác khi họ gặp khó khăn hoặc cần sự giúp đỡ, góp phần xây dựng môi trường giao tiếp trực tuyến tích cực, an toàn và cùng nhau phát triển.
Lịch sự: Là sử dụng ngôn ngữ đúng mực, phù hợp; giao tiếp nhã nhặn, tôn trọng người đối thoại và tránh những lời nói lăng mạ, châm chọc, phỉ báng, phân biệt chủng tộc, giới tính, trách lan truyền thông tin sai lệch, tin đồn.. trên không gian mạng.`;

/**
 * Trang công khai — ai cũng tạo phòng được, không cần đăng nhập
 * (để cô bộ môn khác dùng ké cho tiết dự giờ).
 */
export default function NewMatchPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-md sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">
          Game mới · Nối khái niệm
        </p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-text sm:text-2xl">
          Tạo phòng ghép cặp
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Dán danh sách cặp khái niệm – nội dung, bấm tạo phòng rồi gửi link
          cho cả lớp. Người chơi không cần đăng nhập.
        </p>
        <div className="mt-5">
          <CreateForm defaultText={DEFAULT_TEXT} />
        </div>
      </div>
    </main>
  );
}
