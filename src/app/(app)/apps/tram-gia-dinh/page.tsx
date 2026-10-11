import { redirect } from "next/navigation";
import { Clock, Trophy } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import { getMyClass } from "@/lib/classes/service";
import { prisma } from "@/lib/prisma";
import { getQuiz } from "@/lib/game-quiz/service";
import TramGiaDinh from "@/components/tram-gia-dinh/TramGiaDinh";

export default async function TramGiaDinhPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Lớp của giáo viên, hoặc lớp đầu tiên của học sinh.
  let classId: string | null = null;
  if (user.role === "TEACHER") {
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
          Trạm Gia Đình
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Gameshow 40 phút về trách nhiệm với gia đình: trắc nghiệm, đúng/sai,
          tình huống thực tế. Điểm, đội và câu hỏi dùng chung giữa trình chiếu
          và soạn đề.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
            {quiz.length} slide
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

      <TramGiaDinh
        classId={classId}
        initialQuiz={quiz}
        canEdit={user.role === "TEACHER"}
      />

      <p className="text-xs text-text-secondary">
        Mẹo chiếu lớp: bấm F (hoặc nút ⛶ Chiếu) để lên chế độ chiếu full màn hình không vướng khung web, Esc để thoát. A+/A- chỉnh cỡ chữ, M tắt mở nhạc nền.
      </p>
    </div>
  );
}
