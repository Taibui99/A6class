"use server";

import { redirect } from "next/navigation";

import {
  createRoom,
  getRoom,
  saveRoomState,
  type MatchState,
} from "@/lib/gameroom/service";

export type RoomActionState = { ok: boolean; message: string };

/** Tạo phòng từ form (ai cũng tạo được, không cần đăng nhập). */
export async function createRoomAction(
  _prev: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  let code = "";
  try {
    code = await createRoom(
      String(formData.get("title") ?? ""),
      String(formData.get("text") ?? "")
    );
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không tạo được phòng.",
    };
  }
  redirect(`/p/${code}`);
}

/** Máy chiếu poll bản mới. */
export async function fetchStateAction(code: string) {
  try {
    const room = await getRoom(code);
    return room ? { state: room.state, updatedAt: room.updatedAt } : null;
  } catch {
    return null;
  }
}

/** Lưu trạng thái bảng sau mỗi lượt kéo-thả. */
export async function saveStateAction(
  code: string,
  state: MatchState
): Promise<{ ok: boolean; updatedAt?: string }> {
  try {
    const r = await saveRoomState(code, state);
    return { ok: true, updatedAt: r.updatedAt };
  } catch {
    return { ok: false };
  }
}
