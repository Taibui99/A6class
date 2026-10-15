import type { Metadata } from "next";

import { SEED_QUIZ } from "@/lib/tram-gia-dinh/quiz";
import TramGiaDinh from "@/components/tram-gia-dinh/TramGiaDinh";

export const metadata: Metadata = {
  title: "Nhanh như chớp ⚡ — Vật lí 12",
  description:
    "Game kiểm tra bài cũ Vật lí 12: trắc nghiệm & điền khuyết, chơi theo đội. Mở là chơi, không cần đăng nhập.",
};

/**
 * BẢN CÔNG KHAI — gửi thẳng link này cho giáo viên bộ môn khác.
 * Không cần đăng nhập; câu hỏi cô soạn được lưu ngay trên máy cô
 * (localStorage), không ảnh hưởng lớp 12A6.
 */
export default function NhanhNhuChopPage() {
  return <TramGiaDinh initialQuiz={SEED_QUIZ} canEdit standalone />;
}
