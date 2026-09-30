import type { CriterionKind } from "@/lib/competition/config";
import { gradeTier } from "@/lib/competition/config";

/** Một tiêu chí đọc từ DB. `points` là mức dương, dấu lấy từ `kind`. */
export type CriterionRow = {
  id: string;
  key: string;
  label: string;
  kind: CriterionKind;
  points: number;
};

/** Một ô trong bảng Excel: số lần của học sinh với một tiêu chí trong kỳ.
 *  Dữ liệu cũ (trước khi có bảng Criterion) có criterionId = null,
 *  khi đó chỉ có amount đã ghi sẵn nên dùng luôn amount. */
export type EntryRow = {
  criterionId: string | null;
  targetUserId: string | null;
  count: number;
  amount?: number;
};

export type StudentScore = {
  userId: string;
  /** Tổng điểm tốt (dương). */
  positive: number;
  /** Tổng điểm trừ (âm). */
  negative: number;
  /** Tổng điểm ròng = positive + negative. */
  net: number;
  /** Tổng số lần bị ghi nhận. */
  marks: number;
  /** Chi tiết theo tiêu chí, để xem lịch sử. */
  byCriterion: Map<string, number>;
};

export type TeamInput = {
  teamId: string;
  teamName: string;
  color: string | null;
  memberIds: string[];
  /** Điểm ghi thẳng vào tổ (không qua học sinh). */
  direct: number;
};

export type TeamScore = TeamInput & {
  fromMembers: number;
  total: number;
  /** Trung bình mỗi thành viên — CHÍNH SỐ NÀY dùng để xếp hạng tổ,
   *  vì các tổ có 10/10/9/7 em nên tổng điểm không công bằng. */
  average: number;
  rank: number;
};

/** Điểm có dấu của một ô: số lần × mức điểm × dấu theo loại tiêu chí. */
export function cellPoints(count: number, criterion: Pick<CriterionRow, "kind" | "points">): number {
  const signed = criterion.kind === "NEGATIVE" ? -Math.abs(criterion.points) : Math.abs(criterion.points);
  return signed * count;
}

/**
 * Cộng dồn các ô thành điểm từng học sinh.
 * Bỏ qua ô có count <= 0 và ô của học sinh không thuộc lớp.
 */
export function scoreStudents(
  entries: readonly EntryRow[],
  criteria: readonly CriterionRow[],
  memberIds?: ReadonlySet<string>,
): Map<string, StudentScore> {
  const byId = new Map(criteria.map((c) => [c.id, c]));
  const out = new Map<string, StudentScore>();

  const ensure = (userId: string): StudentScore => {
    let s = out.get(userId);
    if (!s) {
      s = { userId, positive: 0, negative: 0, net: 0, marks: 0, byCriterion: new Map() };
      out.set(userId, s);
    }
    return s;
  };

  for (const e of entries) {
    if (!e.targetUserId) continue; // điểm ghi thẳng vào tổ, không tính vào cá nhân
    if (memberIds && !memberIds.has(e.targetUserId)) continue;
    if (!Number.isFinite(e.count) || e.count <= 0) continue;

    const c = e.criterionId ? byId.get(e.criterionId) : undefined;
    // Không còn tiêu chí (đã xoá) và cũng không có amount -> bỏ qua ô này.
    if (!c && typeof e.amount !== "number") continue;

    const pts = c ? cellPoints(e.count, c) : (e.amount as number);
    const s = ensure(e.targetUserId);
    if (pts >= 0) s.positive += pts;
    else s.negative += pts;
    s.net += pts;
    s.marks += 1;
    if (c) s.byCriterion.set(c.id, (s.byCriterion.get(c.id) ?? 0) + pts);
  }

  return out;
}

/**
 * Tổng hợp điểm tổ và xếp hạng theo TRUNG BÌNH mỗi thành viên.
 * Tổ nào không có thành viên thì average = 0 và đứng cuối.
 */
export function rankTeams(
  teams: readonly TeamInput[],
  scores: ReadonlyMap<string, StudentScore>,
): TeamScore[] {
  const rows = teams.map((t) => {
    const fromMembers = t.memberIds.reduce(
      (sum, id) => sum + (scores.get(id)?.net ?? 0),
      0,
    );
    const total = fromMembers + t.direct;
    const average = t.memberIds.length > 0 ? total / t.memberIds.length : 0;
    return { ...t, fromMembers, total, average, rank: 0 };
  });

  // Sắp xếp theo trung bình giảm dần; hòng thì tổ nhỏ hơn xếp trước cho ổn định.
  rows.sort((a, b) => b.average - a.average || b.total - a.total || a.memberIds.length - b.memberIds.length);

  let lastAverage = Number.NaN;
  let lastRank = 0;
  rows.forEach((row, i) => {
    if (row.average === lastAverage) {
      row.rank = lastRank; // đồng hạng
    } else {
      row.rank = i + 1;
      lastRank = row.rank;
      lastAverage = row.average;
    }
  });

  return rows;
}

/** Xếp hạng cá nhân: cùng điểm thì đồng hạng, sắp theo điểm giảm dần. */
export function rankStudents<T extends { net: number }>(rows: readonly T[]): (T & { rank: number })[] {
  const sorted = [...rows].sort((a, b) => b.net - a.net);
  let lastNet = Number.NaN;
  let lastRank = 0;
  return sorted.map((row, i) => {
    if (row.net === lastNet) return { ...row, rank: lastRank };
    lastRank = i + 1;
    lastNet = row.net;
    return { ...row, rank: lastRank };
  });
}

/** Nhãn xếp loại + màu tương ứng cho một điểm ròng. */
export function classify(net: number): { label: string; tone: string } {
  const t = gradeTier(net);
  return { label: t.label, tone: t.tone };
}

/** Gộp các ngày có phát sinh điểm thành chuỗi 7 ngày gần nhất, đủ điền 0. */
export function lastSevenDays(
  days: readonly string[],
  endDate: Date,
): { date: string; label: string; positive: number; negative: number; net: number }[] {
  const buckets = new Map<string, { positive: number; negative: number }>();
  for (const d of days) buckets.set(d, { positive: 0, negative: 0 });

  const out: { date: string; label: string; positive: number; negative: number; net: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const hit = buckets.get(key) ?? { positive: 0, negative: 0 };
    out.push({
      date: key,
      label: new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(d),
      positive: hit.positive,
      negative: hit.negative,
      net: hit.positive + hit.negative,
    });
  }
  return out;
}

/** Vòng thi (Tuần 1, Tuần 2...) tính từ ngày bắt đầu năm học 01/09. */
export function weekNumberOf(date: Date, schoolYearStart = new Date(date.getFullYear(), 8, 1)): number {
  const start = new Date(schoolYearStart);
  start.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / (7 * 86400000)) + 1;
}

/** Thứ Hai của tuần chứa `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // 0 = Thứ Hai
  d.setDate(d.getDate() - dow);
  return d;
}

/** Tên kỳ thi theo số tuần: "Tuần 3 · 15/09 – 21/09". */
export function periodLabel(startDate: Date, endDate: Date): string {
  const fmt = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" });
  return `Tuần ${weekNumberOf(startDate)} · ${fmt.format(startDate)} – ${fmt.format(endDate)}`;
}