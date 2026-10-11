"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/tram-gia-dinh/quiz";
import { fetchQuizAction, saveQuizAction } from "@/lib/game-quiz/actions";
import Presenter from "./presenter";
import Editor from "./editor";

/**
 * Trạm Gia Đình — bộ câu hỏi CHUNG của lớp, lưu database.
 * Giáo viên sửa trên máy nào, mọi máy khác (kể cả máy chiếu) thấy bản mới:
 * tab Chơi tự đồng bộ mỗi 15 giây khi đang mở.
 */
export default function TramGiaDinh({
  classId,
  initialQuiz,
  canEdit,
}: {
  classId: string;
  initialQuiz: Slide[];
  canEdit: boolean;
}) {
  const [tab, setTab] = useState<"play" | "edit">("play");
  const [present, setPresent] = useState(false);
  const [quiz, setQuiz] = useState<Slide[]>(initialQuiz);
  const [savedAt, setSavedAt] = useState("");
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

  // Máy khác sửa → tab Chơi ở đây tự cập nhật (15 giây/lần khi đang nhìn).
  useEffect(() => {
    if (tab !== "play") return;
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
  }, [tab, classId]);

  function switchTab(t: "play" | "edit") {
    setTab(t);
    setPresent(false);
  }

  // Soạn xong 1.2 giây thì lưu bản chung lên database (mọi thành viên
  // trong lớp đều sửa được).
  const update = useCallback(
    (q: Slide[]) => {
      setQuiz(q);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(async () => {
        try {
          const res = await saveQuizAction(classId, q);
          if (res.ok) setSavedAt(res.message);
        } catch {
          /* lần gõ sau sẽ lưu lại */
        }
      }, 1200);
    },
    [classId, canEdit]
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
          {tab === "edit"
            ? `Bản chung cả lớp — tự lưu thay đổi${savedAt ? ` · ${savedAt}` : ""}`
            : `${quiz.length} slide · máy khác sửa thì tab này tự cập nhật`}
        </span>
      </div>
      {tab === "play" || !canEdit ? (
        <Presenter quiz={quiz} onTogglePresent={togglePresent} />
      ) : (
        <Editor quiz={quiz} onChange={update} />
      )}
    </div>
  );
}
