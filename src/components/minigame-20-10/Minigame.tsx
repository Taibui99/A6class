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
  recoverStoredData,
  shuffle,
  STORAGE_KEY,
  type BoxItem,
  type BoxType,
  type MinigameData,
} from "@/lib/minigame-20-10/data";
import { isVideoFile, titleFromFileName, uploadVideo } from "@/lib/minigame-20-10/upload";
import { RebusIcon } from "@/lib/minigame-20-10/rebus-icons";
import { GiftBox } from "@/lib/minigame-20-10/gift-boxes";
import { ROSTER } from "@/lib/competition/config";
import {
  cycleSoundMode,
  getSoundMode,
  sfxBlip,
  sfxClick,
  sfxExpire,
  sfxFanfare,
  sfxGift,
  sfxLand,
  sfxOpen,
  sfxReveal,
  sfxSecond,
  sfxStart,
  sfxTickStep,
  sfxWheelTick,
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

function StarSvg({ size = 26, color = "#ffd166" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 1.5l3.2 6.5 7.2 1-5.2 5.1 1.2 7.2-6.4-3.4-6.4 3.4 1.2-7.2-5.2-5.1 7.2-1z" />
    </svg>
  );
}

function SparkleSvg({ size = 26, color = "#ffd166" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 0l2.6 8.4L24 11l-9.4 2.6L12 24l-2.6-10.4L0 11l9.4-2.6z" />
    </svg>
  );
}

/* Icon Túi mù bí ẩn */
function BlindBagSvg({
  size = 48,
  color = "#a259ff",
  accent = "#ffd166",
}: {
  size?: number;
  color?: string;
  accent?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M20 20 L80 20 L85 86 L15 86 Z" fill={color} stroke={accent} strokeWidth="3.5" rx="6" />
      <path d="M15 20 L22 10 L29 20 L36 10 L43 20 L50 10 L57 20 L64 10 L71 20 L78 10 L85 20" stroke={accent} strokeWidth="3" fill={color} />
      <circle cx="50" cy="53" r="18" fill="#ffffff22" stroke={accent} strokeWidth="2" strokeDasharray="3 3" />
      <path d="M50 42 L53 49 L60 50 L55 55 L56 62 L50 58 L44 62 L45 55 L40 50 L47 49 Z" fill={accent} />
    </svg>
  );
}

/* Bảng màu túi mù rực rỡ */
const BAG_COLORS = [
  { c: "#a259ff", a: "#ffd166" },
  { c: "#06d6a0", a: "#ffffff" },
  { c: "#3a86ff", a: "#ffd166" },
  { c: "#ff9f1c", a: "#ffffff" },
  { c: "#ff5c8a", a: "#ffd166" },
  { c: "#64dfdf", a: "#ffffff" },
];

/* Mưa hạt lấp lánh & charm túi mù */
function CharmRain({ count = 26, subtle = false }: { count?: number; subtle?: boolean }) {
  const charms = Array.from({ length: count }, (_, i) => ({
    i,
    x: (i * 37 + 5) % 100,
    delay: -((i * 1.9) % 16),
    dur: 10 + ((i * 7) % 9),
    s: 0.6 + ((i * 5) % 12) / 16,
    rot: (i * 47) % 360,
    drift: ((i * 13) % 44) - 22,
    c: ["#ffd166", "#06d6a0", "#a259ff", "#3a86ff", "#ff5c8a", "#fff0a3"][i % 6],
    kind: i % 3,
  }));
  return (
    <div className={`mg-petals${subtle ? " is-subtle" : ""}`} aria-hidden="true">
      {charms.map((p) => (
        <span
          key={p.i}
          className="mg-petal"
          style={
            {
              left: `${p.x}%`,
              width: `${24 * p.s}px`,
              height: `${24 * p.s}px`,
              color: p.c,
              "--delay": `${p.delay}s`,
              "--dur": `${p.dur}s`,
              "--rot": `${p.rot}deg`,
              "--drift": `${p.drift}vw`,
            } as unknown as React.CSSProperties
          }
        >
          {p.kind === 0 ? (
            <StarSvg size={22} color={p.c} />
          ) : p.kind === 1 ? (
            <SparkleSvg size={22} color={p.c} />
          ) : (
            <svg viewBox="0 0 20 20" width="100%" height="100%" fill={p.c}>
              <polygon points="10,0 20,10 10,20 0,10" />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}

/* Rèm hiệu ứng trong lúc bốc túi mù */
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
            <BlindBagSvg size={42} color="#a259ff" accent="#ffd166" />
          ) : it.i % 3 === 1 ? (
            <SparkleSvg size={34} color={it.i % 2 ? "#ffd166" : "#06d6a0"} />
          ) : (
            <GiftBox index={(it.i * 7) % BOX_COUNT} size={64} />
          )}
        </span>
      ))}
      <span className="mg-curtain-label">
        <SparkleSvg size={30} color="#ffd166" />
        ĐANG BỐC TÚI MÙ…
        <SparkleSvg size={30} color="#06d6a0" />
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [wheelMode, setWheelMode] = useState<"next_answer" | "pick_gift" | "general">("general");
  const [isFullscreen, setIsFullscreen] = useState(false);
  /* 0 tắt · 1 bật hiệu ứng âm thanh (mặc định: 1) */
  const [snd, setSnd] = useState<SoundMode>(1);

  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const cellRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const landingRef = useRef(false);

  useEffect(() => {
    const handleFs = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFs);
    document.addEventListener("webkitfullscreenchange", handleFs);
    return () => {
      document.removeEventListener("fullscreenchange", handleFs);
      document.removeEventListener("webkitfullscreenchange", handleFs);
    };
  }, []);

  useEffect(() => {
    let d = emptyData();
    try {
      /* Ưu tiên: tự khôi phục dữ liệu người dùng đã nhập tay (quét toàn bộ key cũ). */
      const recovered = recoverStoredData();
      if (recovered) {
        d = recovered;
      } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as MinigameData;
          if (parsed && typeof parsed.title === "string" && Array.isArray(parsed.boxes) && parsed.boxes.length) {
            d = { ...parsed, boxes: parsed.boxes.slice(0, BOX_COUNT) };
          }
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

  /* Quản lý nhạc nền (nếu có) */
  useEffect(() => {
    if (snd === 1 && stage !== "edit" && curIdx === null && !helpOpen) startMusic();
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
    setCurrentPlayer(null);
  }

  function openBox(i: number) {
    const b = data.boxes[i];
    if (!b) return;
    sfxOpen();
    if (b.type === "gift" || b.type === "special") window.setTimeout(sfxGift, 220);
    setOpened((o) => o.map((v, idx) => (idx === i ? true : v)));
    setPicked(null);
    setHighlight(null);
    setCurIdx(i);
    /* Hộp có video → chờ video xong mới bắt đầu đếm; hộp Quà hoặc Đặc biệt thì không đếm. */
    const noTimer = b.type === "gift" || b.type === "special" || b.secs === 0;
    setVideoEnded(!b.video);
    setTimeLeft(!b.video && !noTimer ? b.secs : null);
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
    setCurrentPlayer(null);
  }

  /* Video kết thúc (hoặc bỏ qua) → mới bắt đầu đếm ngược. */
  function endVideo() {
    setVideoEnded(true);
    if (curBox && curBox.type !== "gift" && curBox.type !== "special" && curBox.secs > 0) {
      setTimeLeft(curBox.secs);
    }
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

  /* Xóa hết câu hỏi, đáp án và video trên 100 túi mù (đặt về mặc định). */
  function resetEverything() {
    if (
      !window.confirm(
        "Xóa HẾT câu hỏi, đáp án và video trên 100 túi mù? Thao tác này không hoàn tác được.",
      )
    ) {
      return;
    }
    persist({ ...data, boxes: defaultBoxes() });
    setPending([]);
    setImportMsg("Đã xóa hết nội dung 100 túi mù — về mặc định.");
    setEditIdx(null);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minigame_12a6_100tui_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed && Array.isArray(parsed.boxes) && parsed.boxes.length) {
          persist(parsed);
          setImportMsg("Đã nhập thành công 100 câu hỏi từ file JSON!");
        } else {
          setImportMsg("File JSON không đúng định dạng 100 túi.");
        }
      } catch {
        setImportMsg("Lỗi đọc file JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
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
    if (curIdx === null || expired || timeLeft === null || answerShown) return;
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }
    sfxSecond(timeLeft <= 10);
    const id = window.setTimeout(() => setTimeLeft((t) => (t === null ? null : t - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [curIdx, timeLeft, expired, answerShown]);

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
      <div className={`mg ${isFullscreen ? "is-fullscreen" : ""}`} ref={rootRef}>
        <CharmRain count={32} />
        <div className="mg-cover">
          <Confetti />
          <div className="mg-garland" aria-hidden="true">
            {Array.from({ length: 11 }).map((_, i) => {
              const p = BAG_COLORS[i % BAG_COLORS.length];
              return (
                <span key={i} style={{ ["--d" as string]: `${i * 0.32}s` }}>
                  {i % 2 === 0 ? (
                    <BlindBagSvg size={44 + (i % 3) * 10} color={p.c} accent={p.a} />
                  ) : (
                    <StarSvg size={36 + (i % 3) * 8} color={p.a} />
                  )}
                </span>
              );
            })}
          </div>
          <div className="mg-float" aria-hidden="true">
            {floatItems.map((i, k) => {
              const p = BAG_COLORS[k % BAG_COLORS.length];
              return (
                <span key={i} className="mg-float-box" style={{ ["--d" as string]: `${(i % 7) * 0.7}s` }}>
                  {k % 3 === 1 ? (
                    <BlindBagSvg size={66} color={p.c} accent={p.a} />
                  ) : (
                    <GiftBox index={i} size={70} />
                  )}
                </span>
              );
            })}
          </div>
          <div className="mg-ribbon">TRÒ CHƠI BỐC TÚI MÙ · LỚP 12A6</div>

          <div className="mg-hero">
            <span className="mg-hero-rose">
              <SparkleSvg size={54} color="#ffd166" />
            </span>
            <span className="mg-hero-num">12A6</span>
            <span className="mg-hero-rose">
              <SparkleSvg size={54} color="#06d6a0" />
            </span>
          </div>

          <p className="mg-eyebrow">
            <StarSvg size={18} color="#ffd166" />
            50 TÚI MÙ BÍ ẨN · XÉ LÀ TRÚNG · VUI BẤT NGỜ
            <StarSvg size={18} color="#06d6a0" />
          </p>

          <h1 className="mg-title">{data.title}</h1>
          <p className="mg-wish">{data.wish}</p>
          <div className="mg-actions">
            <button className="mg-btn mg-primary" onClick={start}>
              BẮT ĐẦU XÉ TÚI
            </button>
            <button
              className="mg-btn mg-picker-btn"
              onClick={() => {
                setWheelMode("general");
                setPickerOpen(true);
              }}
            >
              🎯 Quay chọn người
            </button>
            <button className="mg-btn" onClick={() => setStage("edit")}>
              Soạn nội dung
            </button>
            <button className="mg-btn" onClick={() => setHelpOpen(true)}>
              Hướng dẫn
            </button>
            {soundBtn}
          </div>
          <p className="mg-hint">Enter bắt đầu · Space bốc túi · F toàn màn hình · H hướng dẫn · Esc đóng thẻ</p>
        </div>
        {helpOpen && <Help onClose={() => setHelpOpen(false)} />}
        {pickerOpen && (
          <StudentPickerModal
            mode={wheelMode}
            onClose={() => setPickerOpen(false)}
            onPickDone={(name) => {
              setCurrentPlayer(name);
              setPickerOpen(false);
              start();
            }}
          />
        )}
      </div>
    );
  }

  if (stage === "edit") {
    return (
      <div className={`mg ${isFullscreen ? "is-fullscreen" : ""}`} ref={rootRef}>
        <div className="mg-top">
          <button className="mg-btn" onClick={() => setStage("cover")}>
            Về bìa
          </button>
          <button className="mg-btn mg-primary" onClick={start}>
            Chơi
          </button>
          {soundBtn}
          <button className="mg-btn" onClick={exportJson} title="Xuất file JSON để chuyển sang máy chiếu hoặc sao lưu">
            📥 Xuất JSON
          </button>
          <label className="mg-btn" title="Nhập file JSON đã lưu" style={{ cursor: "pointer" }}>
            📤 Nhập JSON
            <input type="file" accept=".json" onChange={handleImportJson} style={{ display: "none" }} />
          </label>
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
                          <option value="truth">Thật — câu hỏi / thú tội</option>
                          <option value="dare">Thách — thử thách làm ngay</option>
                          <option value="gift">Quà — may mắn không đếm giờ</option>
                          <option value="special">Đặc biệt — thẻ bảo bối / quyền lực</option>
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
                    PHÂN BỐ NGẪU NHIÊN VÀO 100 TÚI MÙ
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
            <h2>Nội dung 100 túi mù</h2>
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
                    <option value="truth">Thật — hỏi / thú tội</option>
                    <option value="dare">Thách — làm ngay (thường có video)</option>
                    <option value="gift">Quà — may mắn không đếm giờ</option>
                    <option value="special">Đặc biệt — thẻ bảo bối / quyền lực</option>
                  </select>
                </label>

                <label>
                  Thể loại / Môn học
                  <input
                    value={data.boxes[editIdx].category ?? ""}
                    placeholder="VD: 📐 TOÁN 12, 📖 NGỮ VĂN 12, ⚡ VẬT LÍ 12..."
                    onChange={(e) => updateBox(editIdx, { category: e.target.value.trim() || undefined })}
                  />
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
    <div className={`mg ${isFullscreen ? "is-fullscreen" : ""}`} ref={rootRef}>
      <CharmRain count={22} subtle />
      <div className="mg-top">
        <span className="mg-mark">
          <SparkleSvg size={18} color="#ffd166" />
          XÉ TÚI MÙ · 12A6
        </span>
        <button
          className="mg-btn mg-picker-btn"
          onClick={() => {
            setWheelMode("general");
            setPickerOpen(true);
          }}
        >
          🎯 QUAY CHỌN NGƯỜI
        </button>
        {currentPlayer && (
          <span className="mg-cur-player-badge">
            Lượt: <b>{currentPlayer}</b>
          </span>
        )}
        <button className="mg-btn" onClick={() => setStage("cover")}>
          Về bìa
        </button>
        <button className="mg-btn" onClick={() => setStage("edit")}>
          Soạn
        </button>
        <span className="mg-count">
          {openedCount}/{BOX_COUNT} túi mù đã xé
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
            className={`mg-spin ${picked !== null ? "is-ready-to-open" : ""}`}
            onClick={() => {
              if (picked !== null) {
                openBox(picked);
              } else {
                spin();
              }
            }}
            disabled={picking || landingRef.current || curIdx !== null || allDone}
          >
            <span className="mg-spin-rose">
              <BlindBagSvg size={32} color="#a259ff" accent="#ffd166" />
            </span>
            {allDone
              ? "ĐÃ XÉ HẾT 100 TÚI MÙ"
              : picking
                ? "ĐANG BỐC TÚI MÙ…"
                : picked !== null
                  ? `✂️ XÉ TÚI MÙ #${picked + 1} NGAY!`
                  : currentPlayer
                    ? `🎲 BỐC TÚI MÙ CHO ${currentPlayer.toUpperCase()}`
                    : "🎲 BỐC TÚI MÙ NGẪU NHIÊN"}
            <span className="mg-spin-rose">
              <SparkleSvg size={32} color="#ffd166" />
            </span>
          </button>
          <p className="mg-spin-sub">
            {allDone
              ? "Chơi lại để chuẩn bị 100 túi mù mới nhé!"
              : picked !== null
                ? "Bấm nút lớn ở trên hoặc click vào túi mù phát sáng bên dưới để xé túi!"
                : currentPlayer
                  ? `Đang đến lượt ${currentPlayer} — bấm nút hoặc nhấn Space để bốc túi mù!`
                  : "Bấm nút hoặc nhấn Space để bốc ngẫu nhiên 1 túi mù bí ẩn"}
          </p>
          <button
            type="button"
            className="mg-picker-link"
            onClick={() => {
              setWheelMode("general");
              setPickerOpen(true);
            }}
          >
            🎯 {currentPlayer ? `Đổi người khác? Bấm Vòng Quay Chọn Người (Hiện tại: ${currentPlayer})` : "Chưa biết gọi ai? Bấm Vòng Quay Chọn Người 12A6!"}
          </button>
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
                title={isOpen ? "Đã xé" : isPicked ? "Trúng rồi — bấm để xé!" : `Túi #${i + 1}`}
              >
                <GiftBox index={i} size={150} />
                <span className="mg-cell-no">{i + 1}</span>
                {isPicked && (
                  <span className="mg-pick-call">
                    <SparkleSvg size={15} color="#ffd166" /> TRÚNG NÀY — BẤM ĐỂ XÉ
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
              <BlindBagSvg size={52} color="#a259ff" accent="#ffd166" />
            </span>
            <span className="mg-panel-rose is-r">
              <SparkleSvg size={48} color="#06d6a0" />
            </span>
            <span className="mg-badge" style={{ ["--c" as string]: TYPE_META[curBox.type].color }}>
              <i className="mg-badge-dot" aria-hidden="true" />
              {TYPE_META[curBox.type].label} · Túi #{curIdx + 1}
            </span>
            {curBox.category && (
              <span className="mg-category-tag">{curBox.category}</span>
            )}
            {currentPlayer && (
              <p className="mg-modal-player">
                🎯 Lượt của: <b>{currentPlayer}</b>
              </p>
            )}
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

            {curBox.type !== "gift" && curBox.type !== "special" && curBox.secs > 0 && videoEnded && !expired && (
              <div
                className={`mg-timer ${timeLeft !== null && timeLeft <= 10 && !answerShown ? "is-urgent" : ""} ${
                  answerShown ? "is-stopped" : ""
                }`}
              >
                <span className="mg-timer-num">
                  {timeLeft === null ? "—" : formatTime(timeLeft)}
                  {answerShown && <span className="mg-timer-stopped-badge">✓ ĐÃ DỪNG</span>}
                </span>
                <span className="mg-timer-bar">
                  <i style={{ transform: `scaleX(${timeLeft !== null && curBox.secs ? timeLeft / curBox.secs : 1})` }} />
                </span>
              </div>
            )}

            {curBox.category === "🎡 VÒNG QUAY 12A6" ? (
              <div className="mg-wheel-box-view">
                <div className="mg-wheel-box-icon">🎡</div>
                <h2 className="mg-panel-title">{curBox.title}</h2>
                <p className="mg-prompt">
                  {curBox.prompt || "Chúc mừng bạn mở trúng Vòng Quay 12A6! Hãy chọn chế độ quay bên dưới:"}
                </p>
                <div className="mg-wheel-box-choices">
                  <button
                    type="button"
                    className="mg-wheel-choice-btn is-answer"
                    onClick={() => {
                      setWheelMode("next_answer");
                      setPickerOpen(true);
                    }}
                  >
                    <span className="mg-choice-icon">🎯</span>
                    <span className="mg-choice-text">
                      <b>QUAY BẠN TRẢ LỜI TIẾP THEO</b>
                      <small>Chọn ngẫu nhiên 1 bạn gánh câu hỏi tiếp theo</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="mg-wheel-choice-btn is-gift"
                    onClick={() => {
                      setWheelMode("pick_gift");
                      setPickerOpen(true);
                    }}
                  >
                    <span className="mg-choice-icon">🎁</span>
                    <span className="mg-choice-text">
                      <b>QUAY BẠN BỐC HỘP QUÀ TIẾP THEO</b>
                      <small>Chọn ngẫu nhiên 1 bạn lên bốc hộp quà may mắn</small>
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {curBox.type !== "truth" && curBox.title.trim() && (
                  <h2 className="mg-panel-title">{curBox.title}</h2>
                )}
                {curBox.type === "truth" ? (
                  <p
                    className={`mg-prompt ${
                      (curBox.prompt?.trim() || curBox.title).length > 130
                        ? "is-xl"
                        : (curBox.prompt?.trim() || curBox.title).length > 70
                          ? "is-long"
                          : ""
                    }`}
                  >
                    {curBox.prompt?.trim() || curBox.title}
                  </p>
                ) : (
                  curBox.prompt?.trim() &&
                  curBox.prompt.trim().toLowerCase() !== curBox.title.trim().toLowerCase() && (
                    <p
                      className={`mg-prompt ${
                        curBox.prompt.length > 130
                          ? "is-xl"
                          : curBox.prompt.length > 70
                            ? "is-long"
                            : ""
                      }`}
                    >
                      {curBox.prompt}
                    </p>
                  )
                )}
                <p className="mg-kind-hint" style={{ ["--c" as string]: TYPE_META[curBox.type].color }}>
                  {TYPE_META[curBox.type].hint}
                </p>
              </>
            )}

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
                  : curBox.category === "🎡 VÒNG QUAY 12A6"
                    ? "Đóng vòng quay →"
                    : curBox.type === "gift"
                      ? "Nhận quà →"
                      : curBox.type === "special"
                        ? "Kích hoạt hiệu ứng →"
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
      {pickerOpen && (
        <StudentPickerModal
          mode={wheelMode}
          onClose={() => setPickerOpen(false)}
          onPickDone={(name) => {
            setCurrentPlayer(name);
            setCurIdx(null);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Help({ onClose }: { onClose: () => void }) {
  return (
    <div className="mg-modal" onClick={onClose}>
      <div className="mg-panel mg-help" onClick={(e) => e.stopPropagation()}>
        <h3>
          <SparkleSvg size={26} color="#ffd166" /> TÚI MÙ ĐỐ VUI 12A6 — CÁCH CHƠI
        </h3>
        <ol>
          <li>
            <b>Bước 1:</b> bấm <b>BẮT ĐẦU XÉ TÚI</b> ở bìa, rồi nhấn <kbd>F</kbd> để chiếu toàn màn hình lên TV/máy chiếu.
          </li>
          <li>
            <b>Bước 2:</b> bấm nút lớn <b>🎲 BỐC TÚI MÙ NGẪU NHIÊN</b> (hoặc nhấn <kbd>Space</kbd>). Dải sáng chạy qua 100 chiếc túi mù rồi dừng trên <b>1 túi mù may mắn</b>. Hoặc bấm <b>🎯 QUAY CHỌN NGƯỜI</b> để chọn ngẫu nhiên một bạn trong lớp lên xé túi!
          </li>
          <li>
            <b>Bước 3:</b> màn hình <b>tự cuộn tới túi mù vừa trúng</b>, túi đó <b>phát sáng và nhấp nháy</b> — bạn có thể <b>bấm nút lớn '✂️ XÉ TÚI MÙ NGAY' ở trên</b> hoặc bấm thẳng vào túi đó (hoặc nhấn <kbd>Space</kbd> / <kbd>Enter</kbd>) để xé túi.
          </li>
          <li>
            <b>Bước 4:</b> túi mù mở ra chứa các câu hỏi đa dạng: <b>TOÁN - LÍ - VĂN - ANH 12 (giữa kì 1)</b>, <b>ĐỐ MẸO DÂN GIAN</b>, <b>ĐỐ MẸO XÀM XÀM BỰA</b>, <b>THỬ THÁCH & HÌNH PHẠT</b> hoặc <b>QUÀ MAY MẮN & BẢO BỐI</b> lấy quà liền tay!
          </li>
          <li>
            <b>Bước 5:</b> nếu túi có <b>video</b>, xem hết video (hoặc bấm <b>Bỏ qua video</b>) thì <b>đồng hồ đếm ngược mới bắt đầu</b>.
          </li>
          <li>
            <b>Hộp quà Vòng Quay & Trợ giúp:</b> Mở trúng <b>🎡 Vòng Quay May Mắn</b> sẽ kích hoạt 2 lựa chọn: <b>🎯 Quay ngẫu nhiên 1 bạn trả lời tiếp theo</b> hoặc <b>🎁 Quay ngẫu nhiên 1 bạn lên bốc hộp quà</b>. Các <b>Hộp quà Cô Chủ Nhiệm</b> và <b>Hộp quà Bạn bè</b> mang lại phần quà ăn vặt và đặc quyền cứu nguy trực tiếp từ Cô và đồng đội!
          </li>
          <li>
            <b>Bước 6:</b> quản trò / cả lớp xác nhận xong, bấm <b>HIỆN ĐÁP ÁN</b> để xem đáp án (với các câu đố vui).
          </li>
          <li>
            <b>Bước 7:</b> bấm <b>Đã xé xong túi này / Nhận quà / Kích hoạt bảo bối</b> để đóng túi.
          </li>
          <li>
            <b>Túi mù đã xé</b> sẽ mờ đi và không mở lại được. Mở lần lượt đến khi hết <b>100 túi mù</b>.
          </li>
          <li>
            <b>Mẹo:</b> <kbd>Space</kbd> bốc túi/xé túi · <kbd>F</kbd> toàn màn hình · <kbd>H</kbd> hướng dẫn · <kbd>Esc</kbd> đóng thẻ.
          </li>
        </ol>
        <button className="mg-btn mg-primary" onClick={onClose}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
}

const WHEEL_STORAGE_KEY = "mg_12a6_students_v1";
const WHEEL_COLORS = [
  "#ff007a",
  "#7928ca",
  "#0070f3",
  "#00dfd8",
  "#06d6a0",
  "#ffd166",
  "#ff9f1c",
  "#ff5c8a",
];

function getStoredStudents(): string[] {
  if (typeof window === "undefined") return ROSTER.map((r) => r.name);
  try {
    const raw = localStorage.getItem(WHEEL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* fallback */
  }
  return ROSTER.map((r) => r.name);
}

function wheelDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  return parts.slice(-2).join(" ");
}

function StudentPickerModal({
  mode = "general",
  onClose,
  onPickDone,
}: {
  mode?: "next_answer" | "pick_gift" | "general";
  onClose: () => void;
  onPickDone: (studentName: string) => void;
}) {
  const [students, setStudents] = useState<string[]>(getStoredStudents);
  const [tab, setTab] = useState<"wheel" | "roster">("wheel");
  const [rosterText, setRosterText] = useState(() => students.join("\n"));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const spinTimerRef = useRef<number | null>(null);
  const tickIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) window.clearTimeout(spinTimerRef.current);
      if (tickIntervalRef.current) window.clearInterval(tickIntervalRef.current);
    };
  }, []);

  const count = students.length;
  const step = 360 / Math.max(1, count);

  function spinWheel() {
    if (spinning || count === 0) return;
    setWinner(null);
    setSpinning(true);

    const winIdx = Math.floor(Math.random() * count);
    const winName = students[winIdx];

    // Góc tâm của phần tử trúng tính từ đỉnh 12 giờ
    const midAngle = (winIdx + 0.5) * step;

    // Tính độ xoay để midAngle kết thúc đúng ngay tại kim chỉ ở vị trí 12h (0 độ)
    const curMod = rotation % 360;
    let delta = (360 - ((midAngle + curMod) % 360)) % 360;
    if (delta < 0) delta += 360;

    const extraRounds = 5 * 360;
    const nextRotation = rotation + extraRounds + delta;
    setRotation(nextRotation);

    // Tiếng tạch tạch theo nhịp quay
    let tickCount = 0;
    const maxTicks = 26;
    const tickInterval = window.setInterval(() => {
      sfxWheelTick();
      tickCount++;
      if (tickCount >= maxTicks) {
        window.clearInterval(tickInterval);
      }
    }, 150);
    tickIntervalRef.current = tickInterval;

    // Kết thúc vòng quay và xướng tên
    spinTimerRef.current = window.setTimeout(() => {
      setSpinning(false);
      setWinner(winName);
      sfxFanfare();
    }, 4200);
  }

  function handleSaveRoster() {
    const list = rosterText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!list.length) {
      alert("Danh sách học sinh không được để trống!");
      return;
    }
    setStudents(list);
    try {
      localStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setTab("wheel");
    setWinner(null);
  }

  function handleResetDefault() {
    const defaults = ROSTER.map((r) => r.name);
    setStudents(defaults);
    setRosterText(defaults.join("\n"));
    try {
      localStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(defaults));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mg-modal" onClick={onClose}>
      <div className="mg-panel mg-wheel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mg-wheel-header">
          <h3>
            {mode === "next_answer"
              ? "🎯 VÒNG QUAY CHỌN BẠN TRẢ LỜI TIẾP THEO · 12A6"
              : mode === "pick_gift"
                ? "🎁 VÒNG QUAY CHỌN BẠN BỐC HỘP QUÀ TIẾP THEO · 12A6"
                : "🎯 VÒNG QUAY CHỌN NGƯỜI CHƠI · 12A6"}
          </h3>
          <div className="mg-wheel-tabs">
            <button
              type="button"
              className={`mg-btn ${tab === "wheel" ? "mg-primary" : ""}`}
              onClick={() => setTab("wheel")}
            >
              🎡 Vòng quay ({students.length})
            </button>
            <button
              type="button"
              className={`mg-btn ${tab === "roster" ? "mg-primary" : ""}`}
              onClick={() => {
                setRosterText(students.join("\n"));
                setTab("roster");
              }}
            >
              ✏️ Sửa danh sách học sinh
            </button>
          </div>
        </div>

        {tab === "wheel" ? (
          <div className="mg-wheel-body">
            <div className="mg-wheel-col mg-wheel-col-stage">
              <div className="mg-wheel-stage">
                <div className="mg-wheel-pointer" />
                <div
                  className="mg-wheel-disc"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning
                      ? "transform 4.2s cubic-bezier(0.15, 0.85, 0.25, 1)"
                      : "none",
                  }}
                >
                  <svg viewBox="0 0 300 300" width="100%" height="100%">
                    <circle cx="150" cy="150" r="148" fill="#121829" stroke="#7928ca" strokeWidth="4" />
                    {students.map((name, i) => {
                      const startAngle = (i * step * Math.PI) / 180;
                      const endAngle = ((i + 1) * step * Math.PI) / 180;
                      const R = 144;
                      const x1 = 150 + R * Math.sin(startAngle);
                      const y1 = 150 - R * Math.cos(startAngle);
                      const x2 = 150 + R * Math.sin(endAngle);
                      const y2 = 150 - R * Math.cos(endAngle);
                      const largeArc = step > 180 ? 1 : 0;
                      const pathData = `M 150 150 L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
                      const midAngle = (i + 0.5) * step;
                      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
                      const shortName = wheelDisplayName(name);
                      return (
                        <g key={`${name}-${i}`}>
                          <path d={pathData} fill={color} stroke="#0d111d" strokeWidth="1.5" />
                          <g transform={`rotate(${midAngle - 90}, 150, 150)`}>
                            <text
                              x="278"
                              y="153"
                              textAnchor="end"
                              fill="#ffffff"
                              fontSize={count > 30 ? "9px" : count > 20 ? "10.5px" : "12px"}
                              fontWeight="800"
                              style={{
                                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                                userSelect: "none",
                              }}
                            >
                              {shortName}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                    {/* Tâm vòng quay */}
                    <circle cx="150" cy="150" r="26" fill="#0d111d" stroke="#ffd166" strokeWidth="3" />
                    <circle cx="150" cy="150" r="12" fill="#ffd166" />
                    <text
                      x="150"
                      y="153"
                      textAnchor="middle"
                      fill="#0d111d"
                      fontSize="9px"
                      fontWeight="900"
                    >
                      12A6
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            <div className="mg-wheel-col mg-wheel-col-info">
              {winner ? (
                <div className="mg-winner-card">
                  <span className="mg-winner-sub">
                    {mode === "next_answer"
                      ? "🎯 ĐÃ CHỌN ĐƯỢC BẠN TRẢ LỜI CÂU HỎI TIẾP THEO"
                      : mode === "pick_gift"
                        ? "🎁 ĐÃ CHỌN ĐƯỢC BẠN LÊN BỐC HỘP QUÀ TIẾP THEO"
                        : "🎉 NGƯỜI CHƠI MAY MẮN TIẾP THEO"}
                  </span>
                  <div className="mg-winner-name">{winner}</div>
                  <p className="mg-winner-desc">
                    {mode === "next_answer"
                      ? `👉 Bạn ${winner} sẽ là người trả lời câu hỏi tiếp theo của lớp!`
                      : mode === "pick_gift"
                        ? `👉 Mời bạn ${winner} lên chọn và xé 1 túi mù may mắn tiếp theo!`
                        : `👉 Lượt chơi tiếp theo sẽ dành cho ${winner}!`}
                  </p>
                  <div className="mg-winner-actions">
                    {mode === "next_answer" ? (
                      <button
                        type="button"
                        className="mg-btn mg-primary"
                        onClick={() => onPickDone(winner)}
                      >
                        🎯 BỐC CÂU HỎI CHO {winner.toUpperCase()} NGAY
                      </button>
                    ) : mode === "pick_gift" ? (
                      <button
                        type="button"
                        className="mg-btn mg-primary"
                        onClick={() => onPickDone(winner)}
                      >
                        🎁 ĐỂ {winner.toUpperCase()} BỐC HỘP QUÀ NGAY
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="mg-btn mg-primary"
                          onClick={() => onPickDone(winner)}
                        >
                          🎯 Đặt {winner} trả lời tiếp theo
                        </button>
                        <button
                          type="button"
                          className="mg-btn"
                          onClick={() => onPickDone(winner)}
                        >
                          🎁 Đặt {winner} bốc hộp quà
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="mg-btn"
                      onClick={() => {
                        setWinner(null);
                        spinWheel();
                      }}
                    >
                      🎲 Quay lại
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mg-wheel-idle-card">
                  <div className="mg-idle-badge">
                    {mode === "next_answer"
                      ? "🎯 Chế độ: Chọn người trả lời câu hỏi"
                      : mode === "pick_gift"
                        ? "🎁 Chế độ: Chọn người bốc hộp quà"
                        : "🎡 Vòng quay chọn người ngẫu nhiên"}
                  </div>
                  <h4>Sẵn sàng tìm ra bạn may mắn!</h4>
                  <p>Bấm nút bên dưới để vòng quay chọn ngẫu nhiên 1 trong {students.length} bạn học sinh 12A6.</p>
                  <button
                    type="button"
                    className="mg-btn mg-primary mg-spin-wheel-btn"
                    disabled={spinning}
                    onClick={spinWheel}
                  >
                    {spinning ? "ĐANG QUAY..." : "🎲 BẤM ĐỂ QUAY CHỌN NGƯỜI"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mg-roster-area">
            <p className="mg-note">
              Mỗi bạn một dòng (hoặc cách nhau bằng dấu phẩy). Bạn có thể thêm bớt hoặc xóa bạn vắng mặt.
            </p>
            <textarea
              className="mg-roster-input"
              rows={12}
              value={rosterText}
              onChange={(e) => setRosterText(e.target.value)}
              placeholder="Nhập tên học sinh, mỗi người một dòng..."
            />
            <div className="mg-wheel-edit-actions">
              <button type="button" className="mg-btn mg-primary" onClick={handleSaveRoster}>
                💾 Lưu danh sách này ({rosterText.split(/[\n,]+/).filter(Boolean).length} bạn)
              </button>
              <button type="button" className="mg-btn" onClick={handleResetDefault}>
                🔄 Khôi phục 36 bạn 12A6 gốc
              </button>
              <button type="button" className="mg-btn" onClick={() => setTab("wheel")}>
                Hủy
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <button type="button" className="mg-btn" onClick={onClose}>
            Đóng vòng quay
          </button>
        </div>
      </div>
    </div>
  );
}
