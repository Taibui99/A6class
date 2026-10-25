import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ROOM_CODE = "minigame_12a6_config";

export async function GET() {
  try {
    const room = await prisma.gameRoom.findUnique({
      where: { code: ROOM_CODE },
    });
    if (room && room.state && typeof room.state === "object") {
      return NextResponse.json({ ok: true, config: room.state });
    }
    return NextResponse.json({ ok: true, config: null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[minigame config API] GET error:", msg);
    return NextResponse.json({ ok: false, error: msg, config: null }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    // Merge với dữ liệu đang có trên DB để không ghi đè mất phần kia
    let existingState = {};
    try {
      const existing = await prisma.gameRoom.findUnique({ where: { code: ROOM_CODE } });
      if (existing?.state && typeof existing.state === "object") {
        existingState = existing.state;
      }
    } catch {
      /* ignore */
    }

    const merged = { ...existingState, ...body, updatedAt: new Date().toISOString() };

    const saved = await prisma.gameRoom.upsert({
      where: { code: ROOM_CODE },
      create: {
        code: ROOM_CODE,
        title: "100 Túi Mù 12A6",
        state: merged,
      },
      update: {
        title: "100 Túi Mù 12A6",
        state: merged,
      },
    });

    return NextResponse.json({ ok: true, updatedAt: saved.updatedAt, config: saved.state });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[minigame config API] POST error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
