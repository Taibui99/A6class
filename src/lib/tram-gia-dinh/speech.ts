import type { Slide } from "./quiz";

const LETTERS = ["A", "B", "C", "D"];

export function getVoices(): SpeechSynthesisVoice[] {
  try {
    return typeof speechSynthesis !== "undefined"
      ? speechSynthesis.getVoices()
      : [];
  } catch {
    return [];
  }
}

export function pickVoice(saved: string): SpeechSynthesisVoice | null {
  const vs = getVoices();
  if (!vs.length) return null;
  return (
    vs.find((v) => v.name === saved) ||
    vs.find((v) => /vi[-_]VN/i.test(v.lang)) ||
    vs.find((v) => /^vi/i.test(v.lang)) ||
    vs[0]
  );
}

export function ttsStop() {
  try {
    speechSynthesis.cancel();
  } catch {
    /* bỏ qua */
  }
}

export function speak(
  text: string,
  voice: SpeechSynthesisVoice | null,
  rate: number,
) {
  try {
    ttsStop();
    const parts =
      String(text).match(/[^.!?;\n]+[.!?;\n]*/g) || [String(text)];
    if (!voice) voice = pickVoice("");
    parts.forEach((p) => {
      const clean = p.trim();
      if (!clean) return;
      const u = new SpeechSynthesisUtterance(clean);
      if (voice) u.voice = voice;
      u.lang = (voice && voice.lang) || "vi-VN";
      u.rate = rate;
      speechSynthesis.speak(u);
    });
  } catch {
    /* bỏ qua */
  }
}

function cleanBlank(text: string): string {
  return text.replace(/_+/g, "còn trống");
}

/** Toàn văn đọc tự động khi sang câu mới (đáp án chỉ đọc khi chấm). */
export function slideSpeech(s: Slide): string {
  let tx = cleanBlank(s.text) + ". ";
  const v = s.answers || [];
  if (s.type === "many" && v.length)
    tx +=
      "Các nhận định sau, mỗi ý chọn đúng hoặc sai. " +
      v.map((a, k) => `Ý ${LETTERS[k] || k + 1}: ${a.text}`).join(". ");
  else if (s.type === "one" && v.length)
    tx +=
      "Các phương án trả lời. " +
      v.map((a, k) => `Phương án ${LETTERS[k] || k + 1}: ${a.text}`).join(". ");
  return tx;
}

/** Đọc thủ công nút Đọc đáp án (không bao giờ lộ đáp án điền từ/đoán hình). */
export function answersSpeech(s: Slide): string {
  const v = s.answers || [];
  if (s.type === "many" && v.length)
    return (
      "Các nhận định sau, mỗi ý chọn đúng hoặc sai. " +
      v.map((a, k) => `Ý ${LETTERS[k] || k + 1}: ${a.text}`).join(". ")
    );
  if (s.type === "fill") return "Câu điền từ. " + cleanBlank(s.text);
  if (s.type === "guess")
    return "Hãy nhìn kĩ hình và đoán xem đây là câu ca dao, tục ngữ nào.";
  return (
    "Các phương án trả lời. " +
    v.map((a, k) => `Phương án ${LETTERS[k] || k + 1}: ${a.text}`).join(". ")
  );
}

/** Câu công bố khi chấm (đọc đáp án đúng). */
export function verdictSpeech(s: Slide): string | null {
  const v = s.answers || [];
  if (s.type === "many") {
    const c = v
      .map((a, k) => (a.correct ? LETTERS[k] || String(k + 1) : ""))
      .join("")
      .split("")
      .join(", ");
    return c ? `Đáp án đúng là các ý ${c}.` : null;
  }
  if (s.type === "fill" && v[0])
    return `Từ cần điền là. ${v[0].text}`;
  if (s.type === "guess" && v[0])
    return `Câu trả lời là. ${v[0].text}`;
  const k = v.findIndex((a) => a.correct);
  if (k >= 0)
    return `Đáp án đúng là phương án ${LETTERS[k] || k + 1}. ${v[k].text}`;
  return null;
}

export function questionSpeech(s: Slide): string {
  return cleanBlank(s.text);
}
