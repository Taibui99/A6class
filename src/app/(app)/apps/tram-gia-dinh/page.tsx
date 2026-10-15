import { redirect } from "next/navigation";
import { Clock, Trophy } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/roles";
import { getMyClass } from "@/lib/classes/service";
import { prisma } from "@/lib/prisma";
import { getQuiz } from "@/lib/game-quiz/service";
import TramGiaDinh from "@/components/tram-gia-dinh/TramGiaDinh";

export default async function TramGiaDinhPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Lớp của giáo viên (admin cũng vậy), hoặc lớp đầu tiên của học sinh.
  let classId: string | null = null;
  if (isStaff(user.role)) {
    classId = (await getMyClass())?.id ?? null;
  } else {
    const mem = await prisma.classMembership.findFirst({
      where: { userId: user.id },
      orderBy: { joinedAt: "asc" },
      select: { classId: true },
    });
    classId = mem?.classId ?? null;
  }
  if (!classId) redirect("/class");

  const quiz = await getQuiz(classId);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight text-text sm:text-2xl">
          Vua Vật lí
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Gameshow kiểm tra bài cũ Vật lí 12 kiểu &quot;Vua Vật lí&quot;:
          mỗi câu đúng leo một mốc thưởng, có 3 quyền trợ giúp. Câu hỏi soạn
          chung giữa trình chiếu và soạn đề, lưu theo lớp.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">
            {quiz.length} slide
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
            <Clock className="mr-1 inline size-3.5" />
            20 phút / phiên
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
            <Trophy className="mr-1 inline size-3.5" />
            15 mốc thưởng
          </span>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-800">
            ✂️ 50:50 · 📣 Hỏi cả lớp · 💡 Gợi ý
          </span>
        </div>
      </header>

      <TramGiaDinh
        classId={classId}
        initialQuiz={quiz}
        canEdit
      />

      <p className="text-xs text-text-secondary">
        Mẹo chiếu lớp: bấm F (hoặc nút ⛶ Chiếu) để lên chế độ chiếu full màn hình không vướng khung web, Esc để thoát. A+/A- chỉnh cỡ chữ, M tắt mở nhạc nền, phím 1–6 cộng điểm cho đội.
      </p>
    </div>
  );
}
