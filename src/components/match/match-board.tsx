"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Lock,
  Maximize,
  Minimize,
  RotateCcw,
  TimerOff,
  Volume2,
  VolumeX,
} from "lucide-react";

import { fetchStateAction, saveStateAction } from "@/lib/gameroom/actions";
import type { MatchState } from "@/lib/gameroom/service";
import type { MatchPair } from "@/lib/gameroom/parse";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function beep(
  ctxRef: React.MutableRefObject<AudioContext | null>,
  muted: boolean,
  freq: number,
  dur = 0.08,
  delay = 0,
  type: OscillatorType = "sine",
  vol = 0.14
) {
  if (muted) return;
  try {
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;
      ctxRef.current = new AC();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") void ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t = ctx.currentTime + delay;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch {
    /* trình duyệt chặn audio thì thôi */
  }
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function shuffledCopy<T>(arr: T[]): T[] {
  const order = [...arr];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Bảng ghép cặp: trái khái niệm cố định, phải ô trống, dưới là kho.
 * Kéo-thả (chuột) + bấm-chọn-rồi-bấm-ô (cảm ứng). Ghép xong hết rồi bấm
 * Chấm: đúng khóa xanh, sai rung đỏ rồi trả về kho.
 */
export function MatchBoard({
  code,
  title,
  pairs,
  initial,
  initialUpdatedAt,
  clean,
}: {
  code: string;
  title: string;
  pairs: MatchPair[];
  initial: MatchState;
  initialUpdatedAt: string;
  clean: boolean;
}) {
  const n = pairs.length;
  const [placements, setPlacements] = useState<Record<string, number>>(initial.placements);
  const [locked, setLocked] = useState<number[]>(initial.locked);
  const [poolOrder, setPoolOrder] = useState<number[]>(initial.poolOrder);
  const [moves, setMoves] = useState(initial.moves);
  const [startedAt] = useState<number | null>(initial.startedAt);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [selected, setSelected] = useState<number | null>(null);
  const [shakeSlots, setShakeSlots] = useState<number[]>([]);
  const [dragSlot, setDragSlot] = useState<number | null>(null);
  const [muted, setMuted] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("match-muted") === "1"
  );
  const [confirmReset, setConfirmReset] = useState(false);
  const [isFull, setIsFull] = useState(false);
  // Mỗi lượt 60 giây: bắt đầu từ lượt ghép đầu, hết giờ khóa bảng.
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerOn, setTimerOn] = useState(false);
  const timeUp = timerOn && timeLeft <= 0;
  const timeUpRef = useRef(false);

  const saveTimer = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const dragPayload = useRef<{ content: number; fromSlot: number | null } | null>(null);
  const dragging = useRef(false);
  const snapRef = useRef({ placements, locked, poolOrder, moves, startedAt });

  useEffect(() => {
    snapRef.current = { placements, locked, poolOrder, moves, startedAt };
  });

  const correctCount = locked.length;

  // Máy khác thao tác → tab này tự cập nhật (bỏ qua lúc đang kéo).
  useEffect(() => {
    const id = window.setInterval(async () => {
      if (document.hidden || dragging.current) return;
      try {
        const fresh = await fetchStateAction(code);
        if (fresh && fresh.updatedAt > updatedAt) {
          setPlacements(fresh.state.placements);
          setLocked(fresh.state.locked);
          setPoolOrder(fresh.state.poolOrder);
          setMoves(fresh.state.moves);
          setSelected(null);
          setShakeSlots([]);
          setUpdatedAt(fresh.updatedAt);
        }
      } catch {
        /* mạng lag thì giữ bản cũ */
      }
    }, 4000);
    return () => window.clearInterval(id);
  }, [code, updatedAt]);

  // Đếm ngược 60 giây mỗi lượt. Hết giờ thì khóa bảng + kêu 1 tiếng.
  useEffect(() => {
    if (!timerOn || timeUp) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : t));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerOn, timeUp]);

  useEffect(() => {
    if (timeUp && !timeUpRef.current) {
      timeUpRef.current = true;
      beep(audioRef, muted, 150, 0.4, 0, "sawtooth", 0.12);
    }
    if (!timeUp) timeUpRef.current = false;
  }, [timeUp, muted]);

  function persist() {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        const r = await saveStateAction(code, snapRef.current);
        if (r.ok && r.updatedAt) setUpdatedAt(r.updatedAt);
      } catch {
        /* lần sau lưu lại */
      }
    }, 800);
  }

  function place(contentIdx: number, slotIdx: number) {
    if (timeUp || locked.includes(slotIdx)) return;
    const cur = placements[String(slotIdx)];
    if (cur === contentIdx) return;
    if (!timerOn) setTimerOn(true);
    const next = { ...placements };
    for (const [s, c] of Object.entries(next)) {
      if (c === contentIdx) delete next[s];
    }
    next[String(slotIdx)] = contentIdx;
    setPlacements(next);
    setMoves(moves + 1);
    setSelected(null);
    beep(audioRef, muted, 620, 0.06);
    persist();
  }

  function returnToPool(contentIdx: number) {
    if (timeUp) return;
    setPlacements((prev) => {
      const nx = { ...prev };
      for (const [s, c] of Object.entries(nx)) {
        if (c === contentIdx) delete nx[s];
      }
      return nx;
    });
    persist();
  }

  function onChipClick(c: number) {
    if (selected === c) {
      setSelected(null);
    } else {
      setSelected(c);
      beep(audioRef, muted, 620, 0.06);
    }
  }

  function onSlotClick(s: number) {
    if (locked.includes(s)) return;
    if (selected !== null) {
      place(selected, s);
    } else {
      const c = placements[String(s)];
      if (c !== undefined) returnToPool(c);
    }
  }

  function checkAll() {
    const newly: number[] = [];
    const wrong: number[] = [];
    for (const [s, c] of Object.entries(placements)) {
      const sIdx = Number(s);
      if (locked.includes(sIdx)) continue;
      if (c === sIdx) newly.push(sIdx);
      else wrong.push(sIdx);
    }
    if (newly.length === 0 && wrong.length === 0) {
      beep(audioRef, muted, 620, 0.06);
      return;
    }
    if (newly.length > 0) {
      setLocked((prev) => [...prev, ...newly]);
      beep(audioRef, muted, 523, 0.1);
      beep(audioRef, muted, 659, 0.1, 0.09);
      beep(audioRef, muted, 784, 0.16, 0.18);
    }
    if (wrong.length > 0) {
      beep(audioRef, muted, 150, 0.22, 0, "sawtooth", 0.11);
      setShakeSlots(wrong);
      window.setTimeout(() => {
        setShakeSlots([]);
        setPlacements((prev) => {
          const nx = { ...prev };
          for (const idx of wrong) delete nx[String(idx)];
          return nx;
        });
        persist();
      }, 650);
    }
    persist();
  }

  function doReplay() {
    setPlacements({});
    setLocked([]);
    setMoves(0);
    setSelected(null);
    setShakeSlots([]);
    setTimeLeft(60);
    setTimerOn(false);
    setPoolOrder(shuffledCopy(poolOrder));
    persist();
  }

  function toggleFull() {
    try {
      if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen().catch(() => {});
      } else {
        void document.exitFullscreen();
      }
    } catch {}
  }

  function toggleMute() {
    const nv = !muted;
    setMuted(nv);
    try {
      localStorage.setItem("match-muted", nv ? "1" : "0");
    } catch {}
  }

  useEffect(() => {
    const h = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "f" || e.key === "F") toggleFull();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const placedSet = new Set(Object.values(placements));
  const unplaced = poolOrder.filter((c) => !placedSet.has(c));

  const bits = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: (i * 61) % 100,
        delay: (i % 7) * 1.3,
        dur: 9 + ((i * 37) % 8),
        size: 13 + ((i * 29) % 12),
        ch: i % 2 === 0 ? "0" : "1",
      })),
    []
  );

  return (
    <div className="match-root">
      <div aria-hidden className="match-bits">
        {bits.map((b, i) => (
          <span
            key={i}
            style={{
              left: `${b.left}%`,
              fontSize: b.size,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.dur}s`,
            }}
          >
            {b.ch}
          </span>
        ))}
      </div>

      <div className="match-fit">
        <p className="match-eyebrow">Game · Nối khái niệm</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="min-w-0 flex-1 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {title}
          </h1>
          <span className="match-score">
            Đúng {correctCount}/{n}
          </span>
          <span className={`match-timer${timeLeft <= 10 ? " low" : ""}`}>
            {fmtTime(timeLeft)}
          </span>
          <button
            type="button"
            className="match-btn"
            onClick={toggleMute}
            aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
          >
            {muted ? <VolumeX aria-hidden className="size-4" /> : <Volume2 aria-hidden className="size-4" />}
          </button>
          <button
            type="button"
            className="match-btn"
            onClick={toggleFull}
            aria-label={isFull ? "Thoát toàn màn hình" : "Toàn màn hình"}
            title="Toàn màn hình (F)"
          >
            {isFull ? <Minimize aria-hidden className="size-4" /> : <Maximize aria-hidden className="size-4" />}
          </button>
        </div>
        <div className="match-progress">
          <i style={{ width: `${n ? Math.round((correctCount / n) * 100) : 0}%` }} />
        </div>

        {!clean && (
          <div className="match-controls">
            <button type="button" className="match-btn go" onClick={checkAll}>
              <Check aria-hidden className="size-4" /> Chấm
            </button>
            <button type="button" className="match-btn" onClick={() => setConfirmReset(true)}>
              <RotateCcw aria-hidden className="size-4" /> Chơi lại
            </button>
          </div>
        )}

        <div className="match-main">
        <div className="match-pairs">
        <div className="match-board">
          {pairs.map((p, i) => {
            const placed = placements[String(i)];
            const isLocked = locked.includes(i);
            const isShake = shakeSlots.includes(i);
            return (
              <div key={i} className="match-row">
                <div className="match-concept">{p.concept}</div>
                <div
                  className={`match-slot${placed !== undefined ? " filled" : ""}${isLocked ? " correct" : ""}${isShake ? " shake" : ""}${dragSlot === i ? " over" : ""}`}
                  onClick={() => onSlotClick(i)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragSlot(i);
                  }}
                  onDragLeave={() => setDragSlot((d) => (d === i ? null : d))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragSlot(null);
                    dragging.current = false;
                    const payload = dragPayload.current;
                    dragPayload.current = null;
                    if (!payload) {
                      const raw = e.dataTransfer.getData("text/plain");
                      const c = Number(raw);
                      if (Number.isInteger(c)) place(c, i);
                      return;
                    }
                    place(payload.content, i);
                  }}
                >
                  {placed !== undefined ? (
                    <span
                      className="match-placed"
                      draggable={!isLocked}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(placed));
                        e.dataTransfer.effectAllowed = "move";
                        dragPayload.current = { content: placed, fromSlot: i };
                        dragging.current = true;
                      }}
                      onDragEnd={() => {
                        dragging.current = false;
                        dragPayload.current = null;
                        setDragSlot(null);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLocked) returnToPool(placed);
                      }}
                    >
                      {pairs[placed]?.content ?? ""}
                      {isLocked && <Lock aria-hidden className="match-lock" />}
                    </span>
                  ) : (
                    <span className="match-hint">Kéo nội dung vào đây</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
        <div className="match-pool-side">
        <div
          className="match-pool"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const payload = dragPayload.current;
            dragPayload.current = null;
            dragging.current = false;
            if (!payload) {
              const raw = e.dataTransfer.getData("text/plain");
              const c = Number(raw);
              if (Number.isInteger(c)) returnToPool(c);
              return;
            }
            returnToPool(payload.content);
          }}
        >
          <p className="match-pool-label">
            Kho nội dung ({unplaced.length}) — kéo vào ô trống, hoặc bấm chọn rồi bấm ô
          </p>
          <div className="match-chips">
            {unplaced.map((c) => (
              <button
                key={c}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(c));
                  e.dataTransfer.effectAllowed = "move";
                  dragPayload.current = { content: c, fromSlot: null };
                  dragging.current = true;
                }}
                onDragEnd={() => {
                  dragging.current = false;
                  dragPayload.current = null;
                  setDragSlot(null);
                }}
                onClick={() => onChipClick(c)}
                className={`match-chip${selected === c ? " selected" : ""}`}
              >
                {pairs[c]?.content ?? ""}
              </button>
            ))}
            {unplaced.length === 0 && (
              <span className="match-empty">Hết mảnh ghép — bấm vào ô đã ghép để trả về kho.</span>
            )}
          </div>
        </div>
        </div>
      </div>
      </div>

      {timeUp && (
        <div className="match-win" role="status">
          <div className="match-win-card">
            <TimerOff aria-hidden className="match-win-cup" />
            <h2>Hết giờ!</h2>
            <p>
              Ghép đúng {correctCount}/{n} cặp
            </p>
            <button type="button" className="match-btn big" onClick={() => doReplay()}>
              <RotateCcw aria-hidden className="size-4" /> Chơi lại
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Chơi lại từ đầu?"
        message="Xóa hết lượt ghép để cả lớp chơi ván mới."
        confirmLabel="Chơi lại"
        onConfirm={() => {
          setConfirmReset(false);
          doReplay();
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
