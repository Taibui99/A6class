"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/tram-gia-dinh/quiz";
import { fetchQuizAction, saveQuizAction } from "@/lib/game-quiz/actions";
import Presenter from "./presenter";
import Editor from "./editor";

/** Kho câu hỏi riêng của bản công khai (lưu trên chính máy đang mở). */
const LOCAL_KEY = "nnc_quiz_v1";

/**
 * Bộ câu hỏi của game "Nhanh như chớp".
 *
 * - Chế độ lớp học (`classId` có giá trị): lưu database, mọi máy trong lớp
 *   thấy bản mới (tab Chơi tự đồng bộ mỗi 15 giây).
 * - Chế độ công khai (`standalone`): không cần đăng nhập, câu hỏi lưu ngay
 *   trên trình duyệt của máy đang mở — dành cho cô bộ môn khác dùng ké.
 */
export default function TramGiaDinh({
  classId,
  initialQuiz,
  canEdit,
  standalone = false,
}: {
  classId?: string;
  initialQuiz: Slide[];
  canEdit: boolean;
  standalone?: boolean;
}) {
  const [tab, setTab] = useState<"play" | "edit">("play");
  const [present, setPresent] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [quiz, setQuiz] = useState<Slide[]>(initialQuiz);
  const [savedAt, setSavedAt] = useState("");
  const [saving, setSaving] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | null>(null);

  const togglePresent = useCallback(() => setPresent((p) => !p), []);

  useEffect(() => {
    try {
      if (present) {
        const el = boxRef.current;
        if (el && !document.fullscreenElement)
          void el.requestFullscreen().catch(() => {});
      } else if (document.fullscreenElement) {
        void document.exitFullscreen();
      }
    } catch {
      /* bỏ qua */
    }
  }, [present]);

  useEffect(() => {
    const h = () => {
      if (!document.fullscreenElement) setPresent(false);
    };
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // Bản công khai: nạp lại đề đã lưu trên máy này (nếu có).
  useEffect(() => {
    if (!standalone) return;
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length) setQuiz(parsed as Slide[]);
    } catch {
      /* dữ liệu hỏng thì dùng đề gốc */
    }
  }, [standalone]);

  // Máy khác sửa → tab Chơi ở đây tự cập nhật (chỉ chế độ lớp học).
  useEffect(() => {
    if (standalone || !classId || tab !== "play") return;
    const id = window.setInterval(async () => {
      if (document.hidden) return;
      try {
        const fresh = await fetchQuizAction(classId);
        setQuiz((cur) => {
          const a = JSON.stringify(cur);
          const b = JSON.stringify(fresh);
          return a === b ? cur : fresh;
        });
      } catch {
        /* mạng lag thì giữ bản cũ */
      }
    }, 15000);
    return () => window.clearInterval(id);
  }, [tab, classId, standalone]);

  function switchTab(t: "play" | "edit") {
    setTab(t);
    setPresent(false);
  }

  const update = useCallback(
    (q: Slide[]) => {
      setQuiz(q);
      if (standalone) {
        try {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(q));
          setSavedAt(new Date().toLocaleTimeString("vi-VN"));
        } catch {
          /* hết dung lượng thì thôi */
        }
        return;
      }
      if (!classId) return;
      setSaving(true);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(async () => {
        try {
          const res = await saveQuizAction(classId, q);
          if (res.ok) setSavedAt(res.message);
        } catch {
          /* lần gõ sau sẽ lưu lại */
        } finally {
          setSaving(false);
        }
      }, 1200);
    },
    [classId, standalone]
  );

  useEffect(
    () => () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    },
    []
  );

  return (
    <div ref={boxRef} className={present ? "tgd present" : "tgd"}>
      {present && (
        <button className="exit-present" onClick={togglePresent}>
          ✕ Thoát chiếu (Esc)
        </button>
      )}
      <div
        className="present-tabs"
        style={{
          display: present ? "none" : "flex",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`fbtn ${tab === "play" ? "go" : ""}`}
          onClick={() => switchTab("play")}
        >
          🖥 Trình chiếu
        </button>
        {canEdit && (
          <button
            className={`fbtn ${tab === "edit" ? "sun" : ""}`}
            onClick={() => switchTab("edit")}
          >
            📝 Soạn nội dung
          </button>
        )}
        <span style={{ fontSize: 13, fontWeight: 800, color: "#55556e" }}>
          {tab === "edit" ? (
            <span>
              <span className={saving ? "savedot saving" : "savedot ok"} />
              {saving
                ? "Đang lưu…"
                : `${standalone ? "Lưu tự động trên máy này" : "Tự lưu bản chung"}${
                    savedAt ? ` · ${savedAt}` : ""
                  }`}
            </span>
          ) : standalone ? (
            `${quiz.length} slide · câu hỏi lưu trên máy này`
          ) : (
            `${quiz.length} slide · máy khác sửa thì tab này tự cập nhật`
          )}
        </span>
        {standalone && (
          <button className="fbtn" onClick={() => setGuideOpen(true)}>
            ❓ Hướng dẫn
          </button>
        )}
      </div>
      {tab === "play" || !canEdit ? (
        <Presenter quiz={quiz} onTogglePresent={togglePresent} />
      ) : (
        <Editor quiz={quiz} onChange={update} />
      )}
      {standalone && guideOpen && (
        <div id="guide" onClick={() => setGuideOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <h3>🎯 NHANH NHƯ CHỚP — HƯỚNG DẪN NHANH</h3>
            <ol>
              <li>
                Mở link bằng <b>Chrome</b> trên máy cô. Bấm <b>▶ BẮT ĐẦU</b> để
                vào game.
              </li>
              <li>
                <b>Soạn câu hỏi:</b> tab <b>📝 Soạn nội dung</b> → thêm/sửa câu.
                Chọn loại <b>Trắc nghiệm</b> (1 đáp án đúng) hoặc{" "}
                <b>Điền khuyết</b>. Câu hỏi <b>tự lưu trên máy này</b>, không cần
                bấm lưu.
              </li>
              <li>
                <b>Chơi:</b> bấm <kbd>→</kbd> hoặc <kbd>Space</kbd> đi tiếp /
                chấm đáp án. Chọn đáp án bằng chuột.
              </li>
              <li>
                <b>Đồng hồ đếm ngược:</b> bấm <kbd>T</kbd> để chạy/dừng — đồng
                hồ hiện giữa màn hình rồi thu về góc trái; <kbd>R</kbd> đặt lại.
                Muốn đổi <b>số giây mỗi câu</b>: cột trái “⏳ Số giây mỗi câu”
                hoặc nút <b>15s / 30s / 45s / 60s</b>.
              </li>
              <li>
                <b>Chiếu lên TV/máy chiếu:</b> bấm <kbd>F</kbd> (hoặc nút ⛶
                Chiếu) để full màn hình, <kbd>Esc</kbd> để thoát. Lúc chiếu chỉ
                hiện câu hỏi + đáp án.
              </li>
              <li>
                <b>Nhạc nền:</b> <kbd>M</kbd> bật/tắt. Nhấn lần đầu nếu chưa
                nghe tiếng.
              </li>
              <li>
                <b>Trợ giúp</b> (mỗi câu 1 lần): ✂️ 50:50 · 📣 Hỏi cả lớp · 💡
                Gợi ý.
              </li>
            </ol>
            <p style={{ opacity: 0.8 }}>
              💾 Câu hỏi lưu theo <b>trình duyệt của máy đang mở</b>. Sang máy
              khác thì dùng tab Soạn để nhập lại, hoặc nhờ cô Thu copy đề sang.
              Nhấn <kbd>H</kbd> bất cứ lúc nào để xem phím tắt.
            </p>
            <button className="fbtn sun" onClick={() => setGuideOpen(false)}>
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
