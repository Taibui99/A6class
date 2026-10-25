import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const LIVE_CODE = "minigame_12a6_live_state";

export type LiveGameState = {
  curIdx: number | null;
  curBox: {
    id: string;
    type: string;
    title: string;
    category?: string;
    prompt?: string;
    answer?: string;
    secs: number;
  } | null;
  currentPlayer: string | null;
  wheelWinner: string | null;
  timeLeft: number | null;
  expired: boolean;
  answerShown: boolean;
  stage: string;
  remoteCommand?: "reveal" | "close" | "spin_wheel" | null;
  updatedAt: number;
};

// In-memory fallback cache in case DB has latency or rate limit
let memoryCache: LiveGameState = {
  curIdx: null,
  curBox: null,
  currentPlayer: null,
  wheelWinner: null,
  timeLeft: null,
  expired: false,
  answerShown: false,
  stage: "cover",
  remoteCommand: null,
  updatedAt: Date.now(),
};

export async function GET() {
  try {
    const room = await prisma.gameRoom.findUnique({
      where: { code: LIVE_CODE },
    });
    if (room && room.state && typeof room.state === "object") {
      const dbState = room.state as unknown as LiveGameState;
      // If DB state is newer than memory cache, use it
      if (dbState.updatedAt && dbState.updatedAt >= memoryCache.updatedAt) {
        memoryCache = dbState;
      }
    }
  } catch (err) {
    // If DB is busy, memoryCache keeps realtime flow running smoothly
    console.warn("[minigame live API] GET DB read error, using cache:", err);
  }

  return NextResponse.json(
    { ok: true, state: memoryCache },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}

// Máy chiếu gửi state mới lên (khi bốc túi, hiện đáp án, quay vòng quay)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const nextState: LiveGameState = {
      ...memoryCache,
      ...body,
      // Khi máy chiếu báo state mới, nếu không truyền remoteCommand thì giữ hoặc xóa lệnh cũ đã xử lý
      remoteCommand: body.remoteCommand !== undefined ? body.remoteCommand : null,
      updatedAt: Date.now(),
    };

    memoryCache = nextState;

    // Lưu vào database asynchronously để không làm chậm request
    prisma.gameRoom
      .upsert({
        where: { code: LIVE_CODE },
        create: {
          code: LIVE_CODE,
          title: "Trạng thái Realtime Máy Chiếu 12A6",
          state: nextState as unknown as object,
        },
        update: {
          title: "Trạng thái Realtime Máy Chiếu 12A6",
          state: nextState as unknown as object,
        },
      })
      .catch((e) => console.warn("[minigame live API] DB write error:", e));

    return NextResponse.json({ ok: true, updatedAt: nextState.updatedAt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[minigame live API] POST error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// MC trên điện thoại gửi lệnh điều khiển từ xa (Bấm Hiện Đáp Án / Đóng Hộp / Mở Vòng Quay)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const command = body?.command as "reveal" | "close" | "spin_wheel" | null;

    memoryCache = {
      ...memoryCache,
      remoteCommand: command,
      updatedAt: Date.now(),
    };

    prisma.gameRoom
      .upsert({
        where: { code: LIVE_CODE },
        create: {
          code: LIVE_CODE,
          title: "Trạng thái Realtime Máy Chiếu 12A6",
          state: memoryCache as unknown as object,
        },
        update: {
          state: memoryCache as unknown as object,
        },
      })
      .catch(() => {});

    return NextResponse.json({ ok: true, command });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
