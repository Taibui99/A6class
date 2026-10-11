"use server";

import { getQuiz, saveQuiz } from "@/lib/game-quiz/service";
import { isSlideArray, type Slide } from "@/lib/tram-gia-dinh/quiz";

/** Máy chiếu/máy khác gọi để lấy bản mới nhất (poll). */
export async function fetchQuizAction(classId: string): Promise<Slide[]> {
  return getQuiz(classId);
}

export async function saveQuizAction(
  classId: string,
  slides: Slide[]
): Promise<{ ok: boolean; message: string }> {
  try {
    if (!isSlideArray(slides)) {
      return { ok: false, message: "Bộ câu hỏi không hợp lệ." };
    }
    const { updatedAt } = await saveQuiz(classId, slides);
    return {
      ok: true,
      message: `Đã lưu bản chung · ${updatedAt.toLocaleTimeString("vi-VN")}`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không lưu được, thử lại nhé.",
    };
  }
}
