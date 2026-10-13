import { notFound } from "next/navigation";

import { getRoom } from "@/lib/gameroom/service";
import { MatchBoard } from "@/components/match/match-board";

export const dynamic = "force-dynamic";

/**
 * Phòng chơi công khai theo mã ngắn (?sach=1 = bản chiếu sạch cho máy chiếu).
 * Không yêu cầu đăng nhập để cô bộ môn khác dùng ké được.
 */
export default async function MatchRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ sach?: string }>;
}) {
  const { code } = await params;
  const sp = await searchParams;
  const room = await getRoom(code);
  if (!room || room.pairs.length < 2) notFound();

  return (
    <MatchBoard
      code={room.code}
      title={room.title}
      pairs={room.pairs}
      initial={room.state}
      initialUpdatedAt={room.updatedAt}
      clean={sp.sach === "1"}
    />
  );
}
