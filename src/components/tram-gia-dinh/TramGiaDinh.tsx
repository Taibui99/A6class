"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/tram-gia-dinh/quiz";
import { SEED_QUIZ, SHARED_KEY } from "@/lib/tram-gia-dinh/quiz";
import Presenter from "./presenter";
import Editor from "./editor";

function readShared(): Slide[] | null {
  try {
    const raw = localStorage.getItem(SHARED_KEY);
    if (!raw) return null;
    const q = JSON.parse(raw);
    if (Array.isArray(q) && q.length) return q as Slide[];
    return null;
  } catch {
    return null;
  }
}

export default function TramGiaDinh() {
  const [tab, setTab] = useState<"play" | "edit">("play");
  const [present, setPresent] = useState(false);
  const [quiz, setQuiz] = useState<Slide[]>(() => readShared() ?? SEED_QUIZ);
  const [savedAt, setSavedAt] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: StorageEvent) => {
      if (e.key !== SHARED_KEY || !e.newValue) return;
      try {
        const nq = JSON.parse(e.newValue);
        if (Array.isArray(nq) && nq.length) setQuiz(nq as Slide[]);
      } catch {
        /* bỏ qua */
      }
    };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

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

  const update = useCallback((q: Slide[]) => {
    setQuiz(q);
    try {
      localStorage.setItem(SHARED_KEY, JSON.stringify(q));
      setSavedAt(new Date().toLocaleTimeString("vi-VN"));
    } catch {
      /* bỏ qua */
    }
  }, []);

  function switchTab(t: "play" | "edit") {
    setTab(t);
    setPresent(false);
  }

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
        <button
          className={`fbtn ${tab === "edit" ? "sun" : ""}`}
          onClick={() => switchTab("edit")}
        >
          📝 Soạn nội dung
        </button>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#55556e" }}>
          {tab === "edit"
            ? `Tự lưu thay đổi${savedAt ? ` · đã lưu ${savedAt}` : ""} — bản chiếu tự cập nhật`
            : `${quiz.length} slide · chuyển tab Soạn để sửa nội dung`}
        </span>
      </div>
      {tab === "play" ? (
        <Presenter quiz={quiz} onTogglePresent={togglePresent} />
      ) : (
        <Editor quiz={quiz} onChange={update} />
      )}
    </div>
  );
}
