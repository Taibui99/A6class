import { prisma } from "@/lib/prisma";
import { parsePairs, shuffled, type MatchPair } from "@/lib/gameroom/parse";

export type MatchState = {
  poolOrder: number[];
  placements: Record<string, number>;
  locked: number[];
  moves: number;
  startedAt: number | null;
};

export type RoomData = {
  code: string;
  title: string;
  pairs: MatchPair[];
  state: MatchState;
  updatedAt: string;
};

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function genCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return s;
}

function blankState(n: number): MatchState {
  return {
    poolOrder: shuffled(n),
    placements: {},
    locked: [],
    moves: 0,
    startedAt: null,
  };
}

/** Tạo phòng mới, trả mã ngắn để chia sẻ link. */
export async function createRoom(title: string, text: string): Promise<string> {
  const pairs = parsePairs(text);
  if (pairs.length < 2) {
    throw new Error("Cần ít nhất 2 cặp khái niệm – nội dung.");
  }
  const cleanTitle = title.trim().slice(0, 60) || "Ghép cặp";
  for (let k = 0; k < 10; k++) {
    const code = genCode();
    try {
      const row = await prisma.gameRoom.create({
        data: { code, title: cleanTitle, pairs, state: blankState(pairs.length) },
        select: { code: true },
      });
      return row.code;
    } catch (e) {
      if (e && typeof e === "object" && (e as { code?: string }).code !== "P2002") {
        throw e;
      }
    }
  }
  throw new Error("Không tạo được phòng, thử lại nhé.");
}

function normalizeState(raw: unknown, n: number): MatchState {
  const st = (raw ?? {}) as Partial<MatchState>;
  const poolOrder = Array.isArray(st.poolOrder)
    ? st.poolOrder.filter(
        (i) => Number.isInteger(i) && (i as number) >= 0 && (i as number) < n
      )
    : [];
  const full = Array.from({ length: n }, (_, i) => i);
  const seen = new Set(poolOrder as number[]);
  for (const i of full) if (!seen.has(i)) (poolOrder as number[]).push(i);
  const placements: Record<string, number> = {};
  if (st.placements && typeof st.placements === "object") {
    for (const [k, v] of Object.entries(st.placements)) {
      const s = Number(k);
      if (Number.isInteger(s) && s >= 0 && s < n && Number.isInteger(v) && (v as number) >= 0 && (v as number) < n) {
        placements[String(s)] = v as number;
      }
    }
  }
  return {
    poolOrder: poolOrder as number[],
    placements,
    locked: Array.isArray(st.locked)
      ? (st.locked as unknown[]).filter(
          (i): i is number => Number.isInteger(i) && (i as number) >= 0 && (i as number) < n
        )
      : [],
    moves: typeof st.moves === "number" ? st.moves : 0,
    startedAt: typeof st.startedAt === "number" ? st.startedAt : null,
  };
}

/** Đọc phòng theo mã (không cần đăng nhập). */
export async function getRoom(code: string): Promise<RoomData | null> {
  const row = await prisma.gameRoom.findUnique({
    where: { code: code.toUpperCase().trim() },
  });
  if (!row) return null;
  const pairs = Array.isArray(row.pairs) ? (row.pairs as MatchPair[]) : [];
  return {
    code: row.code,
    title: row.title,
    pairs,
    state: normalizeState(row.state, pairs.length),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Ghi trạng thái bảng (kéo-thả từ máy nào cũng được). */
export async function saveRoomState(
  code: string,
  state: MatchState
): Promise<{ updatedAt: string }> {
  const clean: MatchState = {
    poolOrder: state.poolOrder.filter((i) => Number.isInteger(i)),
    placements: Object.fromEntries(
      Object.entries(state.placements ?? {}).filter(([k, v]) =>
        Number.isInteger(Number(k)) && Number.isInteger(v)
      )
    ),
    locked: (state.locked ?? []).filter((i) => Number.isInteger(i)),
    moves: typeof state.moves === "number" ? state.moves : 0,
    startedAt: typeof state.startedAt === "number" ? state.startedAt : null,
  };
  const row = await prisma.gameRoom.update({
    where: { code: code.toUpperCase().trim() },
    data: { state: JSON.parse(JSON.stringify(clean)) },
  });
  return { updatedAt: row.updatedAt.toISOString() };
}
