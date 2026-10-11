/** Hằng số dùng chung client + server (file này KHÔNG import server). */

export const TT_DAYS = [1, 2, 3, 4, 5, 6] as const;

export const TT_DAY_LABEL: Record<number, string> = {
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
};

export const TT_PERIODS = [1, 2, 3, 4, 5] as const;
