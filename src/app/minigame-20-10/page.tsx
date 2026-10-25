import type { Metadata } from "next";

import Minigame from "@/components/minigame-20-10/Minigame";

import "./minigame.css";

export const metadata: Metadata = {
  title: "Túi Mù Đố Vui 12A6 · Toán Lí Văn Anh",
  description:
    "Game Xé Túi Mù Đố Vui dành riêng cho tập thể lớp 12A6 — 100 túi mù quay ngẫu nhiên: Kiến thức Toán Lí Văn Anh 12 (giữa kì 1), Đố mẹo dân gian, Đố mẹo xàm xàm bựa, Thử thách lầy lội và Thẻ bảo bối lấy quà liền tay. Tích hợp vòng quay chọn người chơi.",
};

export default function Minigame2010Page() {
  return <Minigame />;
}
