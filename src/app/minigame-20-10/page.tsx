import type { Metadata } from "next";

import Minigame from "@/components/minigame-20-10/Minigame";

import "./minigame.css";

export const metadata: Metadata = {
  title: "Thật hay Thách 20/10 · Lớp 12A6",
  description:
    "Game Thật hay Thách mừng ngày Phụ nữ Việt Nam 20/10 — 50 hộp quà riêng biệt, quay ngẫu nhiên thật sự để mở câu Thật, màn Thách và Quà may mắn, có đếm ngược.",
};

export default function Minigame2010Page() {
  return <Minigame />;
}
