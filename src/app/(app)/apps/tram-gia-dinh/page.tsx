import { Clock, Trophy } from "lucide-react";

import TramGiaDinh from "@/components/tram-gia-dinh/TramGiaDinh";

export default function TramGiaDinhPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight text-text sm:text-2xl">
          Trạm Gia Đình
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Gameshow 40 phút về trách nhiệm với gia đình: trắc nghiệm, đúng/sai,
          tình huống thực tế. Điểm, đội và câu hỏi dùng chung giữa trình chiếu
          và soạn đề.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
            34 slide
          </span>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">
            40 phút
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
            <Trophy className="mr-1 inline size-3.5" />
            Chơi theo đội
          </span>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-800">
            <Clock className="mr-1 inline size-3.5" />
            Mở màn 2&apos; · V1 13&apos; · V2 8&apos; · V3 14&apos; · Về đích
            1&apos;
          </span>
        </div>
      </header>

      <TramGiaDinh />

      <p className="text-xs text-text-secondary">
        Mẹo chiếu lớp: bấm F (hoặc nút ⛶ Chiếu) để lên chế độ chiếu full màn hình không vướng khung web, Esc để thoát. A+/A- chỉnh cỡ chữ, M tắt mở nhạc nền.
      </p>
    </div>
  );
}
