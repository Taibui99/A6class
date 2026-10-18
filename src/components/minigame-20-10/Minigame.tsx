"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  BOX_COUNT,
  DEFAULT_SECS,
  TYPE_META,
  cryptoRandom,
  defaultBoxes,
  emptyData,
  formatTime,
  shuffle,
  STORAGE_KEY,
  type BoxItem,
  type BoxType,
  type MinigameData,
} from "@/lib/minigame-20-10/data";
import { isVideoFile, titleFromFileName, uploadVideo } from "@/lib/minigame-20-10/upload";
import { RebusIcon } from "@/lib/minigame-20-10/rebus-icons";
import { GiftBox } from "@/lib/minigame-20-10/gift-boxes";
import {
  cycleSoundMode,
  getSoundMode,
  sfxBlip,
  sfxClick,
  sfxExpire,
  sfxGift,
  sfxLand,
  sfxOpen,
  sfxReveal,
  sfxSecond,
  sfxStart,
  sfxTickStep,
  soundLabel,
  startMusic,
  stopMusic,
  unlockAudio,
  type SoundMode,
} from "@/lib/minigame-20-10/audio";

type Stage = "cover" | "play" | "edit";

type PendingVideo = {
  key: string;
  name: string;
  path: string;
  question: string;
  type: BoxType;
  answer: string;
  secs: number;
  status: "uploading" | "ok" | "fail";
  msg?: string;
};

/* React chưa có props cho input chọn folder. */
const DIR_PICK = { webkitdirectory: "", directory: "" } as unknown as React.InputHTMLAttributes<HTMLInputElement>;

function Confetti({ dense = false }: { dense?: boolean }) {
  const colors = ["#ff4d6d", "#ff9f43", "#a259ff", "#4ecdc4", "#ffe66d", "#ffb3d9", "#55efc4", "#c77dff"];
  const dots = Array.from({ length: dense ? 40 : 22 }, (_, i) => ({
    x: (i * 37) % 100,
    y: (i * 53) % 100,
    c: colors[i % colors.length],
    d: (i * 11) % 360,
  }));
  return (
    <div className="mg-confetti" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="mg-dot"
          style={{ left: `${d.x}%`, top: `${d.y}%`, backgroundColor: d.c, transform: `rotate(${d.d}deg)` }}
        />
      ))}
    </div>
  );
}

function HeartSvg({ size = 26, color = "#ff4d6d" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color} aria-hidden="true">
      <path d="M10 18C4 12.5 0 8.8 0 5.5 0 2.5 2.3 0 5.2 0 7 0 8.9 1 10 2.7 11.1 1 13 0 14.8 0 17.7 0 20 2.5 20 5.5c0 3.3-4 7-10 12.5z" />
    </svg>
  );
}

/* Hoa hồng 20/10 — vẽ tay 6 cánh. */
function FlowerSvg({ size = 40, color = "#ff4d6d", leaf = "#2fb36b" }: { size?: number; color?: string; leaf?: string }) {
  const petals = [0, 60, 120, 180, 240, 300];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 40 L20 24" stroke={leaf} strokeWidth="3" strokeLinecap="round" />
      <path d="M20 32 Q26 31 27 28" stroke={leaf} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="27" cy="28" rx="4" ry="2.2" fill={leaf} transform="rotate(20 27 28)" />
      {petals.map((deg) => (
        <ellipse key={deg} cx="20" cy="14" rx="7" ry="4.4" fill={color} transform={`rotate(${deg} 20 14)`} opacity={0.95} />
      ))}
      <circle cx="20" cy="14" r="5" fill="#ffe08a" />
      <circle cx="20" cy="14" r="2.4" fill="#ffb703" />
    </svg>
  );
}


/* Bảng màu hồng 20/10 */
const ROSES = [
  { c: "#ff2d6f", d: "#a80d3c" },
  { c: "#ff6fb5", d: "#c9145c" },
  { c: "#ff9f43", d: "#c25a09" },
  { c: "#ffd166", d: "#d98a0b" },
  { c: "#ff4d6d", d: "#b01038" },
];

/* Hoa hồng 20/10 — vẽ tay nhiều lớp cánh, không dùng icon. */
function RoseSvg({
  size = 64,
  c = "#ff2d6f",
  d = "#a80d3c",
  leaf = "#2fb36b",
}: {
  size?: number;
  c?: string;
  d?: string;
  leaf?: string;
}) {
  const ring = (n: number, r: number, rx: number, ry: number, rot: number, fill: string) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse
        key={`${r}-${i}`}
        cx={50}
        cy={50 - r}
        rx={rx}
        ry={ry}
        fill={fill}
        transform={`rotate(${rot + (360 / n) * i} 50 50)`}
      />
    ));
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="gb-rose" aria-hidden="true">
      <ellipse cx="21" cy="79" rx="17" ry="9" fill={leaf} transform="rotate(-24 21 79)" />
      <ellipse cx="79" cy="81" rx="17" ry="9" fill={leaf} transform="rotate(24 79 81)" />
      {ring(7, 31, 18, 15, 12, d)}
      {ring(6, 22, 15, 12, 42, c)}
      {ring(5, 13, 11, 9, 14, "#ffb9d0")}
      <circle cx="50" cy="50" r="10" fill={d} />
      <path d="M50 42c8 0 13 5 13 11s-6 11-13 11-13-5-13-11" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <path d="M50 47c5 0 8 3 8 6s-4 6-8 6" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* Mưa cánh hoa hồng 20/10 */
function PetalRain({ count = 26, subtle = false }: { count?: number; subtle?: boolean }) {
  const petals = Array.from({ length: count }, (_, i) => ({
    i,
    x: (i * 37 + 5) % 100,
    delay: -((i * 1.9) % 16),
    dur: 12 + ((i * 7) % 11),
    s: 0.55 + ((i * 5) % 12) / 16,
    rot: (i * 47) % 360,
    drift: ((i * 13) % 44) - 22,
    c: ["#ff5f8f", "#ff8fab", "#ffb3cd", "#ffd166", "#ff2d6f", "#fff0f5"][i % 6],
  }));
  return (
    <div className={`mg-petals${subtle ? " is-subtle" : ""}`} aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.i}
          className="mg-petal"
          style={
            {
              left: `${p.x}%`,
              width: `${26 * p.s}px`,
              height: `${26 * p.s}px`,
              color: p.c,
              "--delay": `${p.delay}s`,
              "--dur": `${p.dur}s`,
              "--rot": `${p.rot}deg`,
              "--drift": `${p.drift}vw`,
            } as unknown as React.CSSProperties
          }
        >
          <svg viewBox="0 0 48 48" width="100%" height="100%">
            <path d="M24 5C14 0 2 5 2 15c0 10 10 18 22 27 12-9 22-17 22-27C46 5 34 0 24 5z" fill="currentColor" />
          </svg>
        </span>
      ))}
    </div>
  );
}

function SparkleSvg({ size = 26, color = "#ffd166" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 0l2.6 8.4L24 11l-9.4 2.6L12 24l-2.6-10.4L0 11l9.4-2.6z" />
    </svg>
  );
}

/* Rèm hiệu ứng 20/10 trong lúc quay: tim, lấp lánh, hộp quà bay lên. */
function SpinCurtain() {
  const items = Array.from({ length: 24 }, (_, i) => ({
    i,
    x: (i * 43 + 7) % 100,
    delay: (i % 8) * 0.24,
    dur: 1.5 + ((i * 3) % 9) / 7,
    s: 0.7 + ((i * 5) % 10) / 16,
  }));
  return (
    <div className="mg-curtain" aria-hidden="true">
      <div className="mg-curtain-veil" />
      {items.map((it) => (
        <span
          key={it.i}
          className="mg-curtain-item"
          style={
            {
              left: `${it.x}%`,
              "--delay": `${it.delay}s`,
              "--dur": `${it.dur}s`,
              "--s": it.s,
            } as unknown as React.CSSProperties
          }
        >
          {it.i % 3 === 0 ? (
            <HeartSvg size={40} color={it.i % 2 ? "#ff8fab" : "#ff4d6d"} />
          ) : it.i % 3 === 1 ? (
            <SparkleSvg size={34} color={it.i % 2 ? "#ffd166" : "#fff0a3"} />
          ) : (
            <GiftBox index={(it.i * 7) % BOX_COUNT} size={64} />
          )}
        </span>
      ))}
      <span className="mg-curtain-label">
        <HeartSvg size={30} color="#ff8fab" />
        ĐANG QUAY…
        <HeartSvg size={30} color="#ff8fab" />
      </span>
    </div>
  );
}

function Burst() {
  const colors = ["#ff4d6d", "#a259ff", "#ff9f43", "#4ecdc4", "#ffe66d"];
  const dirs = [45, 135, 225, 315, 0, 90, 180, 270, 30, 150, 210, 330, 60, 120, 240, 300, 15, 105, 195, 285];
  return (
    <div className="mg-burst" aria-hidden="true">
      {dirs.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <span
            key={i}
            className="mg-piece"
            style={
              {
                backgroundColor: colors[i % colors.length],
                "--dx": `${Math.cos(rad) * 190}px`,
                "--dy": `${Math.sin(rad) * 190}px`,
              } as unknown as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

export default function Minigame() {
  const [stage, setStage] = useState<Stage>("cover");
  const [data, setData] = useState<MinigameData>(() => emptyData());
  const [opened, setOpened] = useState<boolean[]>(() => Array(BOX_COUNT).fill(false));
  const [highlight, setHighlight] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [picking, setPicking] = useState(false);
  const [curIdx, setCurIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  /* video của hộp Thách chưa chạy hết → chưa cho đếm ngược */
  const [videoEnded, setVideoEnded] = useState(true);
  const [answerShown, setAnswerShown] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  /* Danh sách video đang nhập từ folder (màn Soạn) */
  const [pending, setPending] = useState<PendingVideo[]>([]);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  /* 0 tắt · 1 hiệu ứng · 2 hiệu ứng + nhạc nền (mặc định: 2) */
  const [snd, setSnd] = useState<SoundMode>(2);

  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const cellRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const landingRef = useRef(false);

  useEffect(() => {
    let d = emptyData();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MinigameData;
        if (parsed && typeof parsed.title === "string" && Array.isArray(parsed.boxes) && parsed.boxes.length) {
          d = { ...parsed, boxes: parsed.boxes.slice(0, BOX_COUNT) };
        }
      }
    } catch {
      /* dữ liệu hỏng → dùng mặc định */
    }
    setData(d);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  /* Nạp mức âm thanh đã lưu trước đó. */
  useEffect(() => {
    setSnd(getSoundMode());
  }, []);

  /* Trình duyệt chỉ cho phép bật audio sau lần bấm đầu tiên (nhạc nền sẽ chạy từ đó). */
  useEffect(() => {
    const first = () => {
      unlockAudio();
      window.removeEventListener("pointerdown", first);
      window.removeEventListener("keydown", first);
    };
    window.addEventListener("pointerdown", first);
    window.addEventListener("keydown", first);
    const h = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest("button")) sfxClick();
    };
    window.addEventListener("click", h);
    return () => {
      window.removeEventListener("pointerdown", first);
      window.removeEventListener("keydown", first);
      window.removeEventListener("click", h);
    };
  }, []);

  /* Nhạc nền chỉ chạy ở màn bìa/chơi và khi không mở thẻ nội dung. */
  useEffect(() => {
    if (snd === 2 && stage !== "edit" && curIdx === null && !helpOpen) startMusic();
    else stopMusic();
    return () => stopMusic();
  }, [snd, stage, curIdx, helpOpen]);

  const persist = useCallback((next: MinigameData) => {
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* hết dung lượng thì thôi */
    }
  }, []);

  const openedCount = opened.filter(Boolean).length;
  const allDone = openedCount >= BOX_COUNT;
  const curBox: BoxItem | null = curIdx !== null ? data.boxes[curIdx] ?? null : null;

  function start() {
    unlockAudio();
    sfxStart();
    setStage("play");
    setOpened(Array(BOX_COUNT).fill(false));
    setHighlight(null);
    setPicked(null);
    setPicking(false);
    landingRef.current = false;
    setCurIdx(null);
    setTimeLeft(null);
    setExpired(false);
    setVideoEnded(true);
    setAnswerShown(false);
  }

  function openBox(i: number) {
    const b = data.boxes[i];
    if (!b) return;
    sfxOpen();
    if (b.type === "gift") window.setTimeout(sfxGift, 220);
    setOpened((o) => o.map((v, idx) => (idx === i ? true : v)));
    setPicked(null);
    setHighlight(null);
    setCurIdx(i);
    /* Hộp có video → chờ video xong mới bắt đầu đếm; hộp Quà thì không đếm. */
    setVideoEnded(!b.video);
    setTimeLeft(!b.video && b.type !== "gift" ? b.secs : null);
    setAnswerShown(false);
    setExpired(false);
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 900);
  }

  function spin() {
    if (picking || landingRef.current || curIdx !== null || picked !== null || allDone) return;
    const cand: number[] = [];
    for (let i = 0; i < BOX_COUNT; i++) if (!opened[i]) cand.push(i);
    if (!cand.length) return;
    const target = cand[cryptoRandom(cand.length)];
    setPicking(true);
    landingRef.current = true;
    const TOTAL = 46;
    let step = 0;
    const tick = () => {
      if (step >= TOTAL) {
        setHighlight(target);
        timerRef.current = window.setTimeout(() => {
          setPicking(false);
          setPicked(target);
          sfxLand();
        }, 240);
        return;
      }
      setHighlight(cand[cryptoRandom(cand.length)]);
      step++;
      const p = step / TOTAL;
      sfxTickStep(p);
      const delay = 34 + Math.pow(p, 2.7) * 360;
      timerRef.current = window.setTimeout(tick, delay);
    };
    tick();
  }

  /* Quay trúng → tự cuộn màn hình tới hộp đó để cả lớp nhìn thấy. */
  useEffect(() => {
    if (picked === null || opened[picked]) return;
    landingRef.current = false;
    const id = window.setTimeout(() => {
      try {
        cellRefs.current[picked]?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      } catch {
        /* bỏ qua */
      }
    }, 60);
    return () => window.clearTimeout(id);
  }, [picked, opened]);

  function closeModal() {
    setCurIdx(null);
    setTimeLeft(null);
    setExpired(false);
    setVideoEnded(true);
    setAnswerShown(false);
  }

  /* Video kết thúc (hoặc bỏ qua) → mới bắt đầu đếm ngược. */
  function endVideo() {
    setVideoEnded(true);
    if (curBox && curBox.type !== "gift") setTimeLeft(curBox.secs);
  }

  function updateBox(i: number, patch: Partial<BoxItem>) {
    persist({ ...data, boxes: data.boxes.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) });
  }

  /* ---- Nhập video từ folder ---- */
  async function handlePickFiles(list: FileList | null) {
    if (!list || !list.length) return;
    const videos = Array.from(list).filter(isVideoFile);
    if (!videos.length) {
      setImportMsg("Không tìm thấy file video (.mp4/.webm/.mov/.m4v) trong lựa chọn này.");
      return;
    }
    setImportMsg(null);
    const stamp = Date.now();
    const items: PendingVideo[] = videos.map((f, i) => ({
      key: `${stamp}-${i}`,
      name: f.name,
      path: "",
      question: titleFromFileName(f.name),
      type: "truth",
      answer: "",
      secs: DEFAULT_SECS,
      status: "uploading",
    }));
    setPending((p) => [...p, ...items]);
    setImporting(true);

    let ok = 0;
    let fail = 0;
    for (let i = 0; i < videos.length; i++) {
      const item = items[i];
      const r = await uploadVideo(videos[i]);
      if (r.ok) ok++;
      else fail++;
      setPending((p) =>
        p.map((it) =>
          it.key === item.key
            ? r.ok
              ? { ...it, status: "ok", path: r.video.path }
              : { ...it, status: "fail", msg: r.error }
            : it,
        ),
      );
      setImportMsg(`Đang tải lên ${i + 1}/${videos.length}…`);
    }
    setImporting(false);
    setImportMsg(
      fail
        ? `Tải xong ${ok} file, lỗi ${fail} file (xem dòng ✗ bên dưới).`
        : `Đã lưu ${ok} video vào public/videos/ — giờ nhập câu hỏi/đáp án rồi bấm PHÂN BỐ NGẪU NHIÊN.`,
    );
  }

  function patchPending(key: string, patch: Partial<PendingVideo>) {
    setPending((p) => p.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function removePending(key: string) {
    setPending((p) => p.filter((it) => it.key !== key));
  }

  function distributeVideos() {
    const ready = pending.filter((p) => p.status === "ok" && p.path).slice(0, BOX_COUNT);
    if (!ready.length) {
      setImportMsg("Chưa có video nào tải xong để phân bổ.");
      return;
    }
    const pool = shuffle(Array.from({ length: BOX_COUNT }, (_, i) => i)).slice(0, ready.length);
    const boxes = [...data.boxes];
    ready.forEach((it, k) => {
      const i = pool[k];
      const q = it.question.trim();
      const label = titleFromFileName(it.name).slice(0, 28) || q || boxes[i].title;
      boxes[i] = {
        ...boxes[i],
        type: it.type,
        title: label,
        prompt: q,
        video: it.path,
        answer: it.answer || undefined,
        secs: Math.max(5, Math.min(300, it.secs)),
      };
    });
    persist({ ...data, boxes });
    const nums = [...pool].sort((a, b) => a - b).map((n) => n + 1);
    setPending([]);
    setEditIdx(null);
    setImportMsg(
      `Đã gán ${ready.length} video vào các hộp: ${nums.join(", ")}. Nội dung lưu tự động — bấm Chơi để kiểm tra.`,
    );
    sfxGift();
  }

  /* Xóa hết câu hỏi, đáp án và video trên 50 hộp (đặt về mặc định). */
  function resetEverything() {
    if (
      !window.confirm(
        "Xóa HẾT câu hỏi, đáp án và video trên 50 hộp? Thao tác này không hoàn tác được.",
      )
    ) {
      return;
    }
    persist({ ...data, boxes: defaultBoxes() });
    setPending([]);
    setImportMsg("Đã xóa hết nội dung 50 hộp — về mặc định.");
    setEditIdx(null);
  }

  function toggleSound() {
    unlockAudio();
    const next = cycleSoundMode();
    setSnd(next);
    if (next > 0) sfxBlip();
  }

  const soundBtn = (
    <button
      className={`mg-btn mg-sound ${snd > 0 ? "is-on" : ""}`}
      onClick={toggleSound}
      title="Bật/tắt tiếng hiệu ứng và nhạc nền"
    >
      {soundLabel(snd)}
    </button>
  );

  function toggleFullscreen() {
    try {
      const el = rootRef.current;
      if (el && !document.fullscreenElement) void el.requestFullscreen().catch(() => {});
      else if (document.fullscreenElement) void document.exitFullscreen();
    } catch {
      /* bỏ qua */
    }
  }

  useEffect(() => {
    if (curIdx === null || expired || timeLeft === null) return;
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }
    sfxSecond(timeLeft <= 10);
    const id = window.setTimeout(() => setTimeLeft((t) => (t === null ? null : t - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [curIdx, timeLeft, expired]);

  useEffect(() => {
    if (expired) sfxExpire();
  }, [expired]);

  useEffect(() => {
    if (answerShown) sfxReveal();
  }, [answerShown]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape") {
        if (curIdx !== null) closeModal();
        else if (helpOpen) setHelpOpen(false);
        else if (picked !== null) {
          setPicked(null);
          setHighlight(null);
          landingRef.current = false;
        }
        return;
      }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "h" || e.key === "H") setHelpOpen((v) => !v);
      if (e.key === "Enter" && stage === "cover") start();
      if ((e.key === " " || e.key === "Enter") && stage === "play" && curIdx === null) {
        e.preventDefault();
        if (picked !== null) openBox(picked);
        else spin();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  if (stage === "cover") {
    const floatItems = [0, 3, 7, 11, 14, 18, 22, 26, 31, 36, 40, 45];
    return (
      <div className="mg" ref={rootRef}>
        <PetalRain count={30} />
        <div className="mg-cover">
          <Confetti />
          <div className="mg-garland" aria-hidden="true">
            {Array.from({ length: 11 }).map((_, i) => {
              const p = ROSES[i % ROSES.length];
              return (
                <span key={i} style={{ ["--d" as string]: `${i * 0.32}s` }}>
                  <RoseSvg size={44 + (i % 3) * 16} c={p.c} d={p.d} />
                </span>
              );
            })}
          </div>
          <div className="mg-float" aria-hidden="true">
            {floatItems.map((i, k) => {
              const p = ROSES[k % ROSES.length];
              return (
                <span key={i} className="mg-float-box" style={{ ["--d" as string]: `${(i % 7) * 0.7}s` }}>
                  {k % 3 === 1 ? <RoseSvg size={74} c={p.c} d={p.d} /> : <GiftBox index={i} size={70} />}
                </span>
              );
            })}
          </div>
          <div className="mg-ribbon">CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM</div>

          <div className="mg-hero">
            <span className="mg-hero-rose">
              <RoseSvg size={74} c="#ff2d6f" d="#a80d3c" />
            </span>
            <span className="mg-hero-num">20/10</span>
            <span className="mg-hero-rose">
              <RoseSvg size={74} c="#ffd166" d="#d98a0b" />
            </span>
          </div>

          <p className="mg-eyebrow">
            <RoseSvg size={17} c="#ff6fb5" d="#c9145c" />
            LỚP 12A6 · 20 THÁNG 10 NĂM 2026
            <RoseSvg size={17} c="#ffd166" d="#d98a0b" />
          </p>

          <h1 className="mg-title">{data.title}</h1>
          <p className="mg-wish">{data.wish}</p>
          <div className="mg-actions">
            <button className="mg-btn mg-primary" onClick={start}>
              BẮT ĐẦU CHƠI
            </button>
            <button className="mg-btn" onClick={() => setStage("edit")}>
              Soạn nội dung
            </button>
            <button className="mg-btn" onClick={() => setHelpOpen(true)}>
              Hướng dẫn
            </button>
            {soundBtn}
          </div>
          <p className="mg-hint">Enter bắt đầu · Space quay · F toàn màn hình · H hướng dẫn · Esc đóng thẻ</p>
        </div>
        {helpOpen && <Help onClose={() => setHelpOpen(false)} />}
      </div>
    );
  }

  if (stage === "edit") {
    return (
      <div className="mg" ref={rootRef}>
        <div className="mg-top">
          <button className="mg-btn" onClick={() => setStage("cover")}>
            Về bìa
          </button>
          <button className="mg-btn mg-primary" onClick={start}>
            Chơi
          </button>
          {soundBtn}
          <button className="mg-btn" onClick={resetEverything}>
            XÓA HẾT NỘI DUNG
          </button>
          <span className="mg-saved">Lưu tự động trên máy này</span>
        </div>
        <div className="mg-edit">
          <section className="mg-card">
            <h2>Bìa hộp quà</h2>
            <label>
              Tiêu đề
              <input value={data.title} onChange={(e) => persist({ ...data, title: e.target.value })} />
            </label>
            <label>
              Lời chúc
              <textarea rows={4} value={data.wish} onChange={(e) => persist({ ...data, wish: e.target.value })} />
            </label>
            <p className="mg-note">
              Nút <b>Soạn video/đáp án</b> nằm ở ngay dưới — bấm vào số hộp bất kỳ để sửa câu Thật / Thách / Quà của hộp đó.
            </p>
          </section>

          <section className="mg-card mg-import">
            <h2>Nhập video câu hỏi từ folder</h2>
            <p className="mg-note">
              Chọn <b>folder chứa video</b> → file được tải vào <b>public/videos/</b> → nhập <b>câu hỏi</b> và{" "}
              <b>đáp án</b> cho từng video → bấm <b>PHÂN BỐ NGẪU NHIÊN</b> để hệ thống gán vào hộp quà bất kỳ.
            </p>
            <p className="mg-note">
              Chức năng này <b>chỉ chạy khi bạn mở bản local</b> (npm run dev) — file mới nằm ở máy bạn, xong thì báo
              mình <b>push</b> lên để cả lớp thấy.
            </p>

            <div className="mg-import-picks">
              <label className="mg-btn mg-primary mg-pick">
                Chọn folder video
                <input
                  {...DIR_PICK}
                  type="file"
                  multiple
                  onChange={(e) => {
                    void handlePickFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              <label className="mg-btn mg-pick">
                Chọn nhiều file lẻ
                <input
                  type="file"
                  multiple
                  accept="video/*,.mp4,.webm,.mov,.m4v"
                  onChange={(e) => {
                    void handlePickFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {importMsg && <p className="mg-import-msg">{importMsg}</p>}

            {pending.length > 0 && (
              <div className="mg-import-list">
                {pending.map((it) => (
                  <div key={it.key} className={`mg-import-item is-${it.status}`}>
                    <div className="mg-import-file">
                      <span className="mg-import-name" title={it.name}>
                        {it.name}
                      </span>
                      <span className="mg-import-status">
                        {it.status === "uploading"
                          ? "Đang tải lên…"
                          : it.status === "ok"
                            ? `✓ ${it.path}`
                            : `✗ ${it.msg}`}
                      </span>
                      <button className="mg-btn" onClick={() => removePending(it.key)}>
                        Bỏ
                      </button>
                    </div>

                    <label>
                      Câu hỏi
                      <textarea
                        rows={2}
                        value={it.question}
                        placeholder="Câu hỏi hiện trên thẻ (để trống thì lấy tên file)…"
                        onChange={(e) => patchPending(it.key, { question: e.target.value })}
                      />
                    </label>

                    <label>
                      Đáp án — hiện ra khi bấm HIỆN ĐÁP ÁN
                      <textarea
                        rows={2}
                        value={it.answer}
                        placeholder="Để trống nếu không cần đáp án…"
                        onChange={(e) => patchPending(it.key, { answer: e.target.value })}
                      />
                    </label>

                    <div className="mg-import-row">
                      <label>
                        Loại hộp
                        <select
                          value={it.type}
                          onChange={(e) => patchPending(it.key, { type: e.target.value as BoxType })}
                        >
                          <option value="truth">Thật — câu hỏi</option>
                          <option value="dare">Thách — thử thách</option>
                          <option value="gift">Quà — không đếm giờ</option>
                        </select>
                      </label>
                      <label>
                        Số giây
                        <input
                          type="number"
                          min={5}
                          max={300}
                          value={it.secs}
                          onChange={(e) =>
                            patchPending(it.key, {
                              secs: Math.max(5, Math.min(300, Number(e.target.value) || DEFAULT_SECS)),
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}

                <div className="mg-import-actions">
                  <button className="mg-btn mg-primary" disabled={importing} onClick={distributeVideos}>
                    PHÂN BỐ NGẪU NHIÊN VÀO 50 HỘP
                  </button>
                  <button
                    className="mg-btn"
                    disabled={importing}
                    onClick={() => {
                      setPending([]);
                      setImportMsg(null);
                    }}
                  >
                    Xóa danh sách
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="mg-card mg-boxcard">
            <h2>Nội dung 50 hộp</h2>
            <p className="mg-note">
              Video: dùng mục <b>Nhập video câu hỏi từ folder</b> ở trên cho nhanh, hoặc tự đặt file <b>.mp4</b> vào{" "}
              <b>public/videos/</b> rồi điền đường dẫn dạng <b>/videos/clip1.mp4</b>. Trình duyệt chỉ đếm ngược{" "}
              <b>sau khi video chạy hết</b>.
            </p>

            <div className="mg-edit-grid">
              {data.boxes.map((b, i) => (
                <button
                  key={b.id}
                  className={`mg-edit-cell ${editIdx === i ? "is-active" : ""}`}
                  onClick={() => setEditIdx(editIdx === i ? null : i)}
                  title={b.prompt}
                >
                  <b>{i + 1}</b>
                  <i style={{ background: TYPE_META[b.type].color }} />
                  {b.video && <span className="mg-edit-flag">▶</span>}
                </button>
              ))}
            </div>

            {editIdx !== null && data.boxes[editIdx] && (
              <div className="mg-edit-form">
                <div className="mg-edit-head">
                  <span className="mg-badge" style={{ ["--c" as string]: TYPE_META[data.boxes[editIdx].type].color }}>
                    <i className="mg-badge-dot" aria-hidden="true" />
                    Hộp {editIdx + 1}
                  </span>
                  <button className="mg-btn" onClick={() => setEditIdx(null)}>
                    Đóng
                  </button>
                </div>

                <label>
                  Loại hộp
                  <select
                    value={data.boxes[editIdx].type}
                    onChange={(e) => updateBox(editIdx, { type: e.target.value as BoxType })}
                  >
                    <option value="truth">Thật — hỏi/thú tội</option>
                    <option value="dare">Thách — làm ngay (thường có video)</option>
                    <option value="gift">Quà — không đếm giờ</option>
                  </select>
                </label>

                <label>
                  Tiêu đề nhỏ
                  <input
                    value={data.boxes[editIdx].title}
                    onChange={(e) => updateBox(editIdx, { title: e.target.value })}
                  />
                </label>

                <label>
                  Câu hỏi / thử thách
                  <textarea
                    rows={3}
                    value={data.boxes[editIdx].prompt}
                    onChange={(e) => updateBox(editIdx, { prompt: e.target.value })}
                  />
                </label>

                <label>
                  Video (.mp4) — chạy hết video mới đếm giờ
                  <input
                    value={data.boxes[editIdx].video ?? ""}
                    placeholder="/videos/clip1.mp4"
                    onChange={(e) => updateBox(editIdx, { video: e.target.value.trim() || undefined })}
                  />
                </label>

                <label>
                  Đáp án — để trống nếu không cần; nút HIỆN ĐÁP ÁN chỉ hiện khi có đáp án
                  <textarea
                    rows={2}
                    value={data.boxes[editIdx].answer ?? ""}
                    placeholder="Để trống nếu hộp này không có đáp án…"
                    onChange={(e) => {
                      const v = e.target.value;
                      updateBox(editIdx, { answer: v === "" ? undefined : v });
                    }}
                  />
                </label>

                <label>
                  Số giây đếm ngược
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={data.boxes[editIdx].secs}
                    onChange={(e) =>
                      updateBox(editIdx, {
                        secs: Math.max(5, Math.min(300, Number(e.target.value) || DEFAULT_SECS)),
                      })
                    }
                  />
                </label>

                <p className="mg-note">
                  Lưu tự động ngay khi gõ — không cần nút Lưu.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // play
  return (
    <div className="mg" ref={rootRef}>
      <PetalRain count={22} subtle />
      <div className="mg-top">
        <span className="mg-mark">
          <RoseSvg size={20} c="#ff2d6f" d="#a80d3c" />
          20/10 · 12A6
        </span>
        <button className="mg-btn" onClick={() => setStage("cover")}>
          Về bìa
        </button>
        <button className="mg-btn" onClick={() => setStage("edit")}>
          Soạn
        </button>
        <span className="mg-count">
          {openedCount}/{BOX_COUNT} hộp đã mở
        </span>
        <div className="mg-top-spacer" />
        {soundBtn}
        <button className="mg-btn" onClick={toggleFullscreen}>
          Toàn màn hình
        </button>
        <button className="mg-btn" onClick={start}>
          Chơi lại
        </button>
        <button className="mg-btn" onClick={() => setHelpOpen(true)}>
          Hướng dẫn
        </button>
      </div>

      <div className="mg-stage">
        <div className="mg-spinbar">
          <button
            className="mg-spin"
            onClick={spin}
            disabled={picking || landingRef.current || curIdx !== null || picked !== null || allDone}
          >
            <span className="mg-spin-rose">
              <RoseSvg size={32} c="#ff2d6f" d="#a80d3c" />
            </span>
            {allDone
              ? "ĐÃ MỞ HẾT 50 HỘP"
              : picking
                ? "ĐANG QUAY…"
                : picked !== null
                  ? `ĐÃ TRÚNG HỘP #${picked + 1}`
                  : "QUAY HỘP QUÀ"}
            <span className="mg-spin-rose">
              <RoseSvg size={32} c="#ffd166" d="#d98a0b" />
            </span>
          </button>
          <p className="mg-spin-sub">
            {allDone
              ? "Chơi lại để mở 50 hộp mới nhé!"
              : picked !== null
                ? "↓↓↓ Hộp vừa trúng đang phát sáng ở dưới — bấm vào nó để mở quà! ↓↓↓"
                : "Bấm hoặc nhấn Space để quay ngẫu nhiên 1 hộp bí ẩn"}
          </p>
        </div>

        <div className="mg-grid">
          {data.boxes.map((b, i) => {
            const isOpen = opened[i];
            const isHi = highlight === i && !isOpen;
            const isPicked = picked === i && !isOpen;
            return (
              <button
                key={b.id}
                ref={(el) => {
                  cellRefs.current[i] = el;
                }}
                className={`mg-cell ${isOpen ? "is-open" : ""} ${isHi ? "is-hi" : ""} ${isPicked ? "is-picked" : ""}`}
                disabled={isOpen}
                onClick={() => {
                  if (picking || landingRef.current) return;
                  if (picked !== null && picked !== i) return;
                  openBox(i);
                }}
                title={isOpen ? "Đã mở" : isPicked ? "Trúng rồi — bấm để mở!" : `Hộp #${i + 1}`}
              >
                <GiftBox index={i} size={150} />
                <span className="mg-cell-no">{i + 1}</span>
                {isPicked && (
                  <span className="mg-pick-call">
                    <HeartSvg size={15} color="#fff" /> TRÚNG NÀY — BẤM ĐỂ MỞ
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {picking && <SpinCurtain />}

      {curBox && curIdx !== null && (
        <div className="mg-modal" onClick={closeModal}>
          <div
            className={`mg-panel ${expired ? "is-expired" : ""} ${curBox.video ? "has-video" : ""} is-${curBox.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mg-panel-rose is-l">
              <RoseSvg size={56} c="#ff2d6f" d="#a80d3c" />
            </span>
            <span className="mg-panel-rose is-r">
              <RoseSvg size={56} c="#ffd166" d="#d98a0b" />
            </span>
            <span className="mg-badge" style={{ ["--c" as string]: TYPE_META[curBox.type].color }}>
              <i className="mg-badge-dot" aria-hidden="true" />
              {TYPE_META[curBox.type].label} · Hộp {curIdx + 1}
            </span>
            {curBox.icon && (
              <div className="mg-rebus">
                <RebusIcon icon={curBox.icon} size={80} />
              </div>
            )}

            {curBox.video && !videoEnded && (
              <div className="mg-video-wrap">
                <video
                  key={curBox.id}
                  className="mg-video"
                  src={curBox.video}
                  controls
                  autoPlay
                  playsInline
                  onEnded={endVideo}
                  onError={endVideo}
                />
                <p className="mg-video-wait">
                  Video xong thì đồng hồ đếm ngược sẽ tự chạy
                  <br />
                  <button className="mg-btn mg-skip" onClick={endVideo}>
                    Bỏ qua video → đếm giờ
                  </button>
                </p>
              </div>
            )}

            {curBox.type !== "gift" && videoEnded && !expired && (
              <div className={`mg-timer ${timeLeft !== null && timeLeft <= 10 ? "is-urgent" : ""}`}>
                <span className="mg-timer-num">{timeLeft === null ? "—" : formatTime(timeLeft)}</span>
                <span className="mg-timer-bar">
                  <i style={{ transform: `scaleX(${timeLeft !== null && curBox.secs ? timeLeft / curBox.secs : 1})` }} />
                </span>
              </div>
            )}

            {curBox.title.trim() && <h2 className="mg-panel-title">{curBox.title}</h2>}
            {curBox.prompt?.trim() &&
              curBox.prompt.trim().toLowerCase() !== curBox.title.trim().toLowerCase() && (
                <p className="mg-prompt">{curBox.prompt}</p>
              )}

            <p className="mg-kind-hint" style={{ ["--c" as string]: TYPE_META[curBox.type].color }}>
              {TYPE_META[curBox.type].hint}
            </p>

            {expired && <p className="mg-expired">HẾT GIỜ!</p>}

            {answerShown && curBox.answer && (
              <div className="mg-answer">
                <span className="mg-answer-tag">ĐÁP ÁN</span>
                <p>{curBox.answer}</p>
              </div>
            )}

            <div className="mg-panel-actions">
              {curBox.answer && !answerShown && (
                <button className="mg-btn mg-reveal" onClick={() => setAnswerShown(true)}>
                  HIỆN ĐÁP ÁN
                </button>
              )}
              <button className="mg-btn mg-primary" onClick={closeModal}>
                {expired
                  ? "Đóng hộp"
                  : curBox.type === "gift"
                    ? "Nhận quà →"
                    : curBox.type === "dare"
                      ? "Đã làm xong →"
                      : "Trả lời xong →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {celebrate && <Burst />}
      {helpOpen && <Help onClose={() => setHelpOpen(false)} />}
    </div>
  );
}

function Help({ onClose }: { onClose: () => void }) {
  return (
    <div className="mg-modal" onClick={onClose}>
      <div className="mg-panel mg-help" onClick={(e) => e.stopPropagation()}>
        <h3>
          <FlowerSvg size={26} color="#ff4d6d" /> THẬT HAY THÁCH 20/10 — CÁCH CHƠI
        </h3>
        <ol>
          <li>
            <b>Bước 1:</b> bấm <b>BẮT ĐẦU CHƠI</b> ở bìa, rồi <kbd>F</kbd> để chiếu toàn màn hình lên TV/máy chiếu.
          </li>
          <li>
            <b>Bước 2:</b> bấm nút lớn <b>QUAY HỘP QUÀ</b> (hoặc nhấn <kbd>Space</kbd>). Màn hình hiện hiệu ứng
            tim/lấp lánh/hộp quà bay, dải sáng chạy qua các hộp rồi dừng trên <b>1 hộp bí ẩn ngẫu nhiên</b>.
          </li>
          <li>
            <b>Bước 3:</b> màn hình <b>tự cuộn tới hộp vừa trúng</b>, hộp đó <b>phát sáng và nhấp nháy</b> lên — cả lớp
            nhìn thấy rõ. Bây giờ mới <b>bấm vào hộp đó</b> để mở.
          </li>
          <li>
            <b>Bước 4:</b> hộp mở ra chứa 1 trong 3 kiểu — <b>THẬT</b> (trả lời thật thà), <b>THÁCH</b> (phải làm ngay
            tại chỗ, thường kèm <b>video</b>) hoặc <b>QUÀ</b> (quà may mắn 20/10).
          </li>
          <li>
            <b>Bước 5:</b> nếu hộp có <b>video</b>, xem hết video (hoặc bấm <b>Bỏ qua video</b>) thì{" "}
            <b>đồng hồ đếm ngược mới bắt đầu</b>. Hết giờ sẽ hiện chữ <b>HẾT GIỜ!</b>
          </li>
          <li>
            <b>Bước 6:</b> giáo viên xác nhận bên ngoài xong, bấm <b>HIỆN ĐÁP ÁN</b> để cả lớp thấy đáp án (chỉ hiện
            với hộp có điền đáp án).
          </li>
          <li>
            <b>Bước 7:</b> bấm <b>Trả lời xong / Đã làm xong / Nhận quà / Đóng hộp</b> để đóng hộp.
          </li>
          <li>
            <b>Hộp đã mở</b> sẽ mờ đi và không mở lại được. Mở lần lượt đến khi hết <b>50 hộp</b>.
          </li>
          <li>
            <b>Soạn video:</b> vào <b>Soạn nội dung</b> → mục <b>Nhập video câu hỏi từ folder</b> — chọn folder, nhập
            câu hỏi + đáp án từng video, bấm <b>PHÂN BỐ NGẪU NHIÊN</b> để hệ thống gán vào hộp quà bất kỳ (chỉ chạy
            ở bản local).
          </li>
          <li>
            <b>Âm thanh:</b> nút <b>ÂM THANH</b> ở thanh trên cùng chuyển 3 mức — <b>TẮT</b> ·{" "}
            <b>HIỆU ỨNG</b> · <b>HIỆU ỨNG + NHẠC NỀN</b>.
          </li>
          <li>
            <b>Mẹo:</b> <kbd>Space</kbd> quay/mở · <kbd>F</kbd> toàn màn hình · <kbd>H</kbd> hướng dẫn ·{" "}
            <kbd>Esc</kbd> đóng thẻ.
          </li>
        </ol>
        <button className="mg-btn mg-primary" onClick={onClose}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
