import { getCurrentUser } from "@/lib/auth/current";
import { prisma } from "@/lib/prisma";
import { getMyClass } from "@/lib/classes/service";
import { isSlideArray, SEED_QUIZ, type Slide } from "@/lib/tram-gia-dinh/quiz";

const MAX_SLIDES = 200;

/** Bộ câu hỏi chung của lớp (DB). Chưa có thì trả bản gốc, chưa ghi gì. */
export async function getQuiz(classId: string): Promise<Slide[]> {
  try {
    const row = await prisma.gameQuiz.findUnique({ where: { classId } });
    if (row && isSlideArray(row.slides)) return row.slides;
  } catch {
    /* DB lỗi thì dùng bản gốc */
  }
  return JSON.parse(JSON.stringify(SEED_QUIZ)) as Slide[];
}

async function mustBeMyClass(classId: string) {
  // Mở cho mọi thành viên trong lớp cùng sửa (không riêng giáo viên).
  // Vẫn chặn người ngoài lớp và lớp khác.
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Bạn cần đăng nhập.");
  }
  const mem =
    user.role === "TEACHER"
      ? await getMyClass()
      : await prisma.classMembership.findFirst({
          where: { userId: user.id, classId },
        });
  const okId = user.role === "TEACHER" ? mem?.id === classId : !!mem;
  if (!okId) {
    throw new Error("Bạn chưa vào lớp nên không sửa được.");
  }
}

function sanitize(slides: Slide[]): Slide[] {
  if (!Array.isArray(slides) || slides.length > MAX_SLIDES) {
    throw new Error("Bộ câu hỏi không hợp lệ.");
  }
  return slides.slice(0, MAX_SLIDES).map((s) => ({
    round: String((s as Slide).round ?? "").slice(0, 80),
    type: (s as Slide).type,
    text: String((s as Slide).text ?? "").slice(0, 2000),
    answers: Array.isArray((s as Slide).answers)
      ? (s as Slide).answers.slice(0, 8).map((a) => ({
          text: String(a?.text ?? "").slice(0, 500),
          correct: !!a?.correct,
        }))
      : [],
    note: (s as Slide).note ? String((s as Slide).note).slice(0, 500) : undefined,
    img: (s as Slide).img ? String((s as Slide).img).slice(0, 500) : undefined,
  })) as Slide[];
}

export async function saveQuiz(classId: string, slides: Slide[]) {
  await mustBeMyClass(classId);
  const clean = sanitize(slides);
  if (!isSlideArray(clean)) throw new Error("Bộ câu hỏi không hợp lệ.");
  const row = await prisma.gameQuiz.upsert({
    where: { classId },
    create: { classId, slides: JSON.parse(JSON.stringify(clean)) },
    update: { slides: JSON.parse(JSON.stringify(clean)) },
  });
  return { updatedAt: row.updatedAt };
}
