// Pure — không import server, dùng chung cho form nhập (client) và service.

export type MatchPair = { concept: string; content: string };

/**
 * Mỗi dòng 1 cặp. Phân cách ưu tiên `|`, tab, `;`, cuối cùng là dấu hai
 * chấm đầu tiên ("Khái niệm: Nội dung"). Dòng # và dòng trống bỏ qua.
 */
export function parsePairs(raw: string): MatchPair[] {
  const out: MatchPair[] = [];
  for (const rawLine of String(raw ?? "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    let concept = "";
    let content = "";
    let parts: string[] | null = null;
    for (const sep of ["|", "\t", ";"]) {
      if (line.includes(sep)) {
        parts = line.split(sep);
        break;
      }
    }
    if (parts) {
      concept = (parts[0] ?? "").trim();
      content = parts
        .slice(1)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" ");
    } else {
      const ci = line.indexOf(": ");
      if (ci > 0) {
        concept = line.slice(0, ci).trim();
        content = line.slice(ci + 2).trim();
      } else {
        continue;
      }
    }
    if (!concept || !content) continue;
    out.push({ concept: concept.slice(0, 80), content: content.slice(0, 500) });
    if (out.length >= 20) break;
  }
  return out;
}

export function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
