"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link2,
  Lock,
  Maximize,
  Minimize,
  RotateCcw,
  Shuffle,
  Trophy,
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

/** Lấy giờ hệ thống / trộn mảng ngoài component để lint purity hài lòng. */
function nowMs(): number {
  return Date.now();
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
 * Kéo-thả (chuột) + bấm-chọn-rồi-bấm-ô (cảm ứng). Ghép đúng khóa xanh
 * ngay, sai rung đỏ rồi trả về kho. Mọi lượt đều lưu DB + máy khác poll theo.
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
  const [startedAt, setStartedAt] = useState<number | null>(initial.startedAt);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [selected, setSelected] = useState<number | null>(null);
  const [shakeSlot, setShakeSlot] = useState<number | null>(null);
  const [dragSlot, setDragSlot] = useState<number | null>(null);
  const [muted, setMuted] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("match-muted") === "1"
  );
  const [copied, setCopied] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [zoom, setZoom] = useState(() => {
    if (typeof window === "undefined") return 1.15;
    try {
      const v = parseFloat(localStorage.getItem("match-zoom") ?? "");
      if (v >= 0.8 && v <= 1.6) return v;
    } catch {}
    return 1.15;
  });
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const saveTimer = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const dragPayload = useRef<{ content: number; fromSlot: number | null } | null>(null);
  const dragging = useRef(false);
  const snapRef = useRef({ placements, locked, poolOrder, moves, startedAt });

  useEffect(() => {
    snapRef.current = { placements, locked, poolOrder, moves, startedAt };
  });

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const correctCount = locked.length;
  const won = n > 0 && locked.length === n;
  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;

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
          setStartedAt(fresh.state.startedAt);
          setSelected(null);
          setUpdatedAt(fresh.updatedAt);
        }
      } catch {
        /* mạng lag thì giữ bản cũ */
      }
    }, 4000);
    return () => window.clearInterval(id);
  }, [code, updatedAt]);

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

  function tick() {
    if (startedAt == null) setStartedAt(nowMs());
  }

  function place(contentIdx: number, slotIdx: number) {
    if (locked.includes(slotIdx)) return;
    const cur = placements[String(slotIdx)];
    if (cur === contentIdx) return;
    tick();
    const next = { ...placements };
    for (const [s, c] of Object.entries(next)) {
      if (c === contentIdx) delete next[s];
    }
    next[String(slotIdx)] = contentIdx;
    const nMoves = moves + 1;
    setPlacements(next);
    setMoves(nMoves);
    setSelected(null);
    if (contentIdx === slotIdx) {
      const nLocked = [...locked, slotIdx];
      setLocked(nLocked);
      beep(audioRef, muted, 523, 0.1);
      beep(audioRef, muted, 659, 0.1, 0.09);
      beep(audioRef, muted, 784, 0.16, 0.18);
      if (nLocked.length === n) {
        const end = nowMs();
        setFinalTime(startedAt ? Math.max(0, Math.floor((end - startedAt) / 1000)) : 0);
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
          beep(audioRef, muted, f, 0.14, i * 0.11)
        );
      }
    } else {
      beep(audioRef, muted, 150, 0.22, 0, "sawtooth", 0.11);
      setShakeSlot(slotIdx);
      window.setTimeout(() => {
        setShakeSlot(null);
        setPlacements((prev) => {
          if (prev[String(slotIdx)] !== contentIdx) return prev;
          const nx = { ...prev };
          delete nx[String(slotIdx)];
          return nx;
        });
        persist();
      }, 650);
    }
    persist();
  }

  function returnToPool(contentIdx: number) {
    tick();
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

  function doReplay() {
    setPlacements({});
    setLocked([]);
    setMoves(0);
    setStartedAt(null);
    setFinalTime(null);
    setSelected(null);
    setPoolOrder(shuffledCopy(poolOrder));
    persist();
  }

  function doReveal() {
    tick();
    const all: Record<string, number> = {};
    const lk: number[] = [];
    for (let i = 0; i < n; i++) {
      all[String(i)] = i;
      lk.push(i);
    }
    setPlacements(all);
    setLocked(lk);
    setSelected(null);
    {
      const end = nowMs();
      setFinalTime(startedAt ? Math.max(0, Math.floor((end - startedAt) / 1000)) : 0);
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
        beep(audioRef, muted, f, 0.14, i * 0.11)
      );
    }
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

  function changeZoom(d: number) {
    const nz = Math.min(1.6, Math.max(0.8, +(zoom + d).toFixed(2)));
    setZoom(nz);
    try {
      localStorage.setItem("match-zoom", String(nz));
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
  function copyLink(sach: boolean) {
    const url = `${window.location.origin}/p/${code}${sach ? "?sach=1" : ""}`;
    try {
      void navigator.clipboard?.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard bị chặn thì thôi */
    }
  }

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

  const confetti = useMemo(
    () =>
      won
        ? Array.from({ length: 42 }, (_, i) => ({
            left: (i * 47) % 100,
            delay: ((i * 13) % 10) / 10,
            dur: 2.4 + ((i * 29) % 20) / 10,
            color: ["#FFC531", "#FF5C8A", "#38bdf8", "#34d399", "#a78bfa"][i % 5],
            w: 7 + ((i * 17) % 6),
          }))
        : [],
    [won]
  );

  return (
    <div className="match-root" style={{ zoom }}>
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
          <span className="match-timer">{fmtTime(won && finalTime !== null ? finalTime : elapsed)}</span>
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
            <button type="button" className="match-btn" onClick={() => {
              setPoolOrder(shuffledCopy(poolOrder));
              persist();
            }}>
              <Shuffle aria-hidden className="size-4" /> Trộn kho
            </button>
            <button type="button" className="match-btn" onClick={() => setConfirmReveal(true)}>
              Hiện đáp án
            </button>
            <button type="button" className="match-btn" onClick={() => setConfirmReset(true)}>
              <RotateCcw aria-hidden className="size-4" /> Chơi lại
            </button>
            <button
              type="button"
              className="match-btn"
              onClick={() => {
                const nv = !muted;
                setMuted(nv);
                try {
                  localStorage.setItem("match-muted", nv ? "1" : "0");
                } catch {}
              }}
              aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
            >
              {muted ? <VolumeX aria-hidden className="size-4" /> : <Volume2 aria-hidden className="size-4" />}
            </button>
            <button type="button" className="match-btn" onClick={() => changeZoom(-0.1)} aria-label="Chữ nhỏ lại" title="Chữ nhỏ lại">
              A-
            </button>
            <button type="button" className="match-btn" onClick={() => changeZoom(0.1)} aria-label="Chữ to ra" title="Chữ to ra">
              A+
            </button>
            <button type="button" className="match-btn" onClick={() => copyLink(false)}>
              <Link2 aria-hidden className="size-4" /> {copied ? "Đã chép!" : "Chép link chơi"}
            </button>
            <button type="button" className="match-btn" onClick={() => copyLink(true)}>
              Link chiếu
            </button>
          </div>
        )}

        <div className="match-main">
        <div className="match-pairs">
        <div className="match-board">
          {pairs.map((p, i) => {
            const placed = placements[String(i)];
            const isLocked = locked.includes(i);
            const isShake = shakeSlot === i;
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
            {unplaced.length === 0 && !won && (
              <span className="match-empty">Hết mảnh ghép — bấm vào ô đã ghép để trả về kho.</span>
            )}
          </div>
          </div>
        </div>
        </div>
      </div>

      {won && (
        <div className="match-win" role="status">
          <div aria-hidden className="match-confetti">
            {confetti.map((f, i) => (
              <span
                key={i}
                style={{
                  left: `${f.left}%`,
                  width: f.w,
                  height: f.w * 0.6,
                  background: f.color,
                  animationDelay: `${f.delay}s`,
                  animationDuration: `${f.dur}s`,
                }}
              />
            ))}
          </div>
          <div className="match-win-card">
            <Trophy aria-hidden className="match-win-cup" />
            <h2>Tuyệt vời!</h2>
            <p>
              Ghép đúng cả {n} cặp · {fmtTime(finalTime ?? elapsed)} · {moves} lượt ghép
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
      <ConfirmDialog
        open={confirmReveal}
        title="Hiện toàn bộ đáp án?"
        message="Mọi ô sẽ tự điền đúng. Dùng khi chữa bài."
        confirmLabel="Hiện đáp án"
        onConfirm={() => {
          setConfirmReveal(false);
          doReveal();
        }}
        onCancel={() => setConfirmReveal(false)}
      />
    </div>
  );
}
