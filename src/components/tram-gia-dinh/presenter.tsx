"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { Slide } from "@/lib/tram-gia-dinh/quiz";
import {
  ac,
  drum,
  sFlip,
  sRight,
  safePlay,
  sWrong,
  synthStart,
  synthStop,
  tone,
  winSong,
} from "@/lib/tram-gia-dinh/audio";
import {
  answersSpeech,
  getVoices,
  pickVoice,
  questionSpeech,
  slideSpeech,
  speak,
  ttsStop,
  verdictSpeech,
} from "@/lib/tram-gia-dinh/speech";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const TRACKS = [
  {
    n: "🎪 Nhạc Gameshow",
    u: "https://upload.wikimedia.org/wikipedia/commons/1/14/Happy_Happy_Game_Show_%28ISRC_USUAN1600006%29.mp3",
  },
  {
    n: "🐵 Vui nhộn",
    u: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Monkeys_Spinning_Monkeys_%28ISRC_USUAN1400011%29.mp3",
  },
  {
    n: "🐝 Tươi sáng",
    u: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Happy_Bee_%28ISRC_USUAN1300014%29.mp3",
  },
];
const WIN_URL =
  "https://upload.wikimedia.org/wikipedia/commons/1/13/Kevin_MacLeod_-_Winner_Winner.ogg";
const LETTERS = ["A", "B", "C", "D"];
const FLOATS = ["⚛️", "🧲", "💡", "🔬", "🌡️", "🪐"];
const LADDER = [
  100000, 200000, 300000, 500000, 1000000,
  2000000, 3000000, 5000000, 10000000, 20000000,
  30000000, 50000000, 70000000, 100000000, 150000000,
];
const SAFE_MILESTONES = [4, 9, 14]; // mốc an toàn (0-based): 1tr · 10tr · 150tr
function money(n: number): string {
  return n.toLocaleString("vi-VN") + "đ";
}

interface Burst { id: number; e: string; left: string; top: string }

function load<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function store(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* bỏ qua */
  }
}

export default function Presenter({ quiz, onTogglePresent }: { quiz: Slide[]; onTogglePresent: () => void }) {
  const [idx, setIdx] = useState(-1);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [ds, setDs] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerOn, setTimerOn] = useState(false);
  const [teams, setTeams] = useState<string[]>(() =>
    load("tram_show_teams", ["Đội Cam", "Đội Xanh"]),
  );
  const [scores, setScores] = useState<number[]>(() => load("tram_show_scores", [0, 0]));
  const [scorePop, setScorePop] = useState<{ k: number; pts: number; id: number } | null>(null);
  const popTimer = useRef<number | null>(null);
  const [denom, setDenom] = useState(100);
  const [zoomLv, setZoomLv] = useState<number>(() => load("tram_zoom", 1));
  const autoFRef = useRef(1);
  const [bgmOn, setBgmOn] = useState(() => load<string>("tram_bgm", "1") !== "0");
  const [trackIdx, setTrackIdx] = useState<number>(() => load("tram_track", 0));
  const [bgmVol, setBgmVol] = useState<number>(() => load("tram_vol", 0.45));
  const [voiceName, setVoiceName] = useState(() => load("tram_voice", ""));
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => getVoices());
  const [ttsRate, setTtsRate] = useState<number>(() => load("tram_rate", 1));
  const [autoReadQ, setAutoReadQ] = useState(
    () => load<string>("tram_autoread", "1") !== "0",
  );
  const [autoAnn, setAutoAnn] = useState(() => load<string>("tram_autoann", "1") !== "0");
  const [sessTotal, setSessTotal] = useState(20 * 60);
  const [sessLeft, setSessLeft] = useState<number | null>(null);
  const [sessOn, setSessOn] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [winOpen, setWinOpen] = useState(false);
  const [confirmResetScores, setConfirmResetScores] = useState(false);
  const [newsHtml, setNewsHtml] = useState("Bấm ▶ BẮT ĐẦU để chơi! Mỗi câu đúng leo 1 mốc 🪜");
  const [newsHot, setNewsHot] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [hiddenOpts, setHiddenOpts] = useState<number[]>([]);
  const [lfFifty, setLfFifty] = useState(false);
  const [lfHint, setLfHint] = useState(false);
  const [lfPoll, setLfPoll] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [pollLeft, setPollLeft] = useState<number | null>(null);

  const bgmRef = useRef<HTMLAudioElement>(null);
  const winRef = useRef<HTMLAudioElement>(null);
  const ttsFresh = useRef(false);
  const burstId = useRef(0);
  const zoomRef = useRef(zoomLv);
  useEffect(() => {
    zoomRef.current = zoomLv;
    quizRef.current = quiz;
    sessTotalRef.current = sessTotal;
  });
  const quizRef = useRef(quiz);
  const timeRef = useRef<number | null>(null);
  const sessRef = useRef<number | null>(null);

  const news = useCallback((html: string, hot?: boolean) => {
    setNewsHtml(html);
    setNewsHot(!!hot);
  }, []);

  const burst = useCallback((big?: boolean) => {
    const c = big ? 42 : 16;
    const items: Burst[] = [];
    for (let k = 0; k < c; k++) {
      burstId.current += 1;
      items.push({
        id: burstId.current,
        e: ["🎉", "⭐", "👏", "💛", "🌟", "🎊"][k % 6],
        left: `${8 + Math.random() * 84}vw`,
        top: `${22 + Math.random() * 42}vh`,
      });
    }
    setBursts((b) => [...b, ...items]);
    const ids = new Set(items.map((x) => x.id));
    setTimeout(() => setBursts((b) => b.filter((x) => !ids.has(x.id))), 1200);
  }, []);

  const fitText = useCallback(() => {
    try {
      const main = document.getElementById("main");
      if (!main || main.classList.contains("hidden")) return;
      const over = (sel: string) => {
        const el = document.querySelector(sel);
        return (
          !!el &&
          (el as HTMLElement).scrollHeight >
            (el as HTMLElement).clientHeight + 3
        );
      };
      let f = 1;
      const apply = (v: number) =>
        document.documentElement.style.setProperty(
          "--u",
          String(zoomRef.current * v),
        );
      apply(1);
      let g = 0;
      while (g++ < 14) {
        const bad =
          Array.from(document.querySelectorAll("#opts .opt")).some(
            (o) =>
              (o as HTMLElement).scrollHeight >
              (o as HTMLElement).clientHeight + 3,
          ) ||
          over("#q") ||
          over("#info") ||
          over("#opts");
        if (!bad) break;
        f = Math.max(0.45, f - 0.06);
        apply(f);
      }
      autoFRef.current = f;
    } catch {
      /* bỏ qua */
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--u",
      String(zoomLv * autoFRef.current),
    );
  }, [zoomLv]);

  useEffect(() => {
    fitText();
    const t = setTimeout(fitText, 350);
    return () => clearTimeout(t);
  }, [idx, stage, quiz, fitText]);

  const [quizLen, setQuizLen] = useState(quiz.length);
  if (quizLen !== quiz.length) {
    setQuizLen(quiz.length);
    if (idx >= quiz.length) setIdx(quiz.length - 1);
    setImgOk(true);
  }

  useEffect(() => {
    try {
      const refreshVoices = () => setVoices(getVoices());
      if ("speechSynthesis" in window)
        speechSynthesis.onvoiceschanged = refreshVoices;
    } catch {
      /* bỏ qua */
    }
    const unlock = () => {
      try {
        ac();
      } catch {
        /* bỏ qua */
      }
      setUnlocked(true);
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);
    const onResize = () => fitText();
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      window.removeEventListener("resize", onResize);
    };
  }, [fitText]);

  const curVoice = () =>
    pickVoice(voiceName || (typeof window !== "undefined" ? (localStorage.getItem("tram_voice") ?? "") : ""));

  const readQ = useCallback(() => {
    const s = quizRef.current[idx];
    if (!s || !s.text) return;
    try {
      if (speechSynthesis.speaking) {
        ttsStop();
        return;
      }
    } catch {
      return;
    }
    speak(questionSpeech(s), curVoice(), ttsRate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, voiceName, ttsRate]);

  const readAnswers = useCallback(() => {
    const s = quizRef.current[idx];
    if (!s || !s.answers || !s.answers.length) return;
    try {
      if (speechSynthesis.speaking) {
        ttsStop();
        return;
      }
    } catch {
      return;
    }
    speak(answersSpeech(s), curVoice(), ttsRate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, voiceName, ttsRate]);

  function go(n: number) {
    const q = quizRef.current;
    setIdx(Math.max(-1, Math.min(q.length - 1, n)));
    setStage(0);
    setPicks([]);
    setDs({});
    setImgOk(true);
    setTimerOn(false);
    setTimeLeft(null);
    timeRef.current = null;
    setWinOpen(false);
    setHiddenOpts([]);
    setLfFifty(false);
    setLfHint(false);
    setLfPoll(false);
    setHintOpen(false);
    setPollLeft(null);
    ttsStop();
    ttsFresh.current = true;
  }

  function lock() {
    const q = quizRef.current;
    const s = q[idx];
    if (!s || s.type === "info" || stage !== 0) return;
    setStage(1);
    setTimerOn(false);
    drum();
  }

  function check() {
    const q = quizRef.current;
    const s = q[idx];
    if (!s || s.type === "info" || stage === 2) return;
    ttsStop();
    setStage(2);
    const n = s.answers.length;
    for (let k = 0; k < n; k++)
      setTimeout(() => tone(700 + k * 120, 0.09, "triangle", 0, 0.3), k * 200);
    const mine = { picks: [...picks], ds: { ...ds } };
    setTimeout(
      () => {
        if (s.type === "many") {
          const keys = Object.keys(mine.ds);
          const all =
            keys.length > 0 &&
            s.answers.every((a, k) => mine.ds[k] === a.correct);
          if (keys.length === 0) return;
          if (all) {
            sRight();
            burst();
          } else sWrong();
        } else if (s.type === "fill" || s.type === "guess") {
          sRight();
          burst();
        } else {
          const a = s.answers[mine.picks[0]];
          if (mine.picks.length === 0) return;
          if (a && a.correct) {
            sRight();
            burst();
          } else sWrong();
        }
        if (autoAnn) {
          const v = verdictSpeech(s);
          if (v) setTimeout(() => speak(v, curVoice(), ttsRate), 1200);
        }
      },
      n * 200 + 250,
    );
  }

  function smart() {
    const q = quizRef.current;
    if (idx < 0) {
      startShow();
      return;
    }
    const s = q[idx];
    if (!s) return;
    if (s.type === "info") {
      go(idx + 1);
      return;
    }
    if (stage < 2) check();
    else if (idx >= q.length - 1) showWin();
    else go(idx + 1);
  }

  function pickOne(k: number) {
    if (stage !== 0) return;
    setPicks((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
    sFlip();
  }
  function dsPick(e: ReactMouseEvent, k: number, v: boolean) {
    e.stopPropagation();
    if (stage !== 0) return;
    setDs((d) => ({ ...d, [k]: v }));
    sFlip();
  }

  function timer() {
    const q = quizRef.current;
    const s = q[idx];
    if (!s || s.type === "info") return;
    if (timerOn) {
      setTimerOn(false);
      return;
    }
    const total = s.type === "many" || s.type === "guess" ? 45 : 30;
    const start = timeRef.current === null || timeRef.current <= 0 ? total : timeRef.current;
    timeRef.current = start;
    setTimeLeft(start);
    setTimerOn(true);
  }
  function resetT() {
    setTimerOn(false);
    timeRef.current = null;
    setTimeLeft(null);
  }

  useEffect(() => {
    if (!timerOn) return;
    const id = setInterval(() => {
      const nv = Math.max(0, (timeRef.current ?? 0) - 1);
      timeRef.current = nv;
      setTimeLeft(nv);
      tone(nv <= 5 ? 990 : 660, 0.06, "square", 0, 0.25);
      if (nv <= 0) {
        clearInterval(id);
        setTimerOn(false);
        tone(440, 0.25, "square", 0, 0.3);
        tone(330, 0.45, "square", 0.2, 0.3);
        news("⏰ Hết giờ! Bấm <b>✅ CHẤM</b> để xem đáp án nhé!");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [timerOn, news]);

  const sessTotalRef = useRef(sessTotal);
  useEffect(() => {
    if (!sessOn) return;
    const id = setInterval(() => {
      const nv = Math.max(0, (sessRef.current ?? 0) - 1);
      sessRef.current = nv;
      setSessLeft(nv);
      if (nv <= 0) {
        clearInterval(id);
        setSessOn(false);
        tone(523, 0.3, "sine", 0, 0.3);
        tone(784, 0.5, "sine", 0.3, 0.3);
        news("⏰ HẾT GIỜ PHIÊN! Tổng kết và công bố thắng nhé! 🏆");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sessOn, news]);
  function sessSet(m: number) {
    setSessTotal(m * 60);
    setSessLeft(m * 60);
    sessRef.current = m * 60;
    setSessOn(false);
  }
  function sessStart() {
    setSessLeft(sessTotalRef.current);
    sessRef.current = sessTotalRef.current;
    setSessOn(true);
  }

  function addScore(k: number, d: number) {
    setScores((sc) => {
      const n = [...sc];
      n[k] = (n[k] || 0) + d * denom;
      store("tram_show_scores", n);
      return n;
    });
    // Popup xác nhận (cả khi bấm nút lẫn phím số): thay nội dung + chạy lại
    // animation bằng key, tự ẩn sau 1.4 giây.
    if (popTimer.current) window.clearTimeout(popTimer.current);
    setScorePop({ k, pts: d * denom, id: Date.now() });
    popTimer.current = window.setTimeout(() => setScorePop(null), 1400);
    sFlip();
  }
  function rename(k: number, v: string) {
    setTeams((t) => {
      const n = [...t];
      n[k] = v.trim() || `Đội ${k + 1}`;
      store("tram_show_teams", n);
      return n;
    });
  }
  function addTeam() {
    setTeams((t) => {
      if (t.length >= 6) return t;
      let n = 1;
      while (t.includes(`Đội ${n}`)) n++;
      const next = [...t, `Đội ${n}`];
      store("tram_show_teams", next);
      setScores((sc) => {
        const s = [...sc, 0];
        store("tram_show_scores", s);
        return s;
      });
      return next;
    });
  }
  function removeTeam(k: number) {
    setTeams((t) => {
      if (t.length <= 2) return t;
      const next = t.filter((_, i) => i !== k);
      store("tram_show_teams", next);
      setScores((sc) => {
        const s = sc.filter((_, i) => i !== k);
        store("tram_show_scores", s);
        return s;
      });
      return next;
    });
  }
  function resetScores() {
    const n = teams.map(() => 0);
    setScores(n);
    store("tram_show_scores", n);
  }
  function zoom(d: number) {
    setZoomLv((z) => {
      const nz = Math.min(1.6, Math.max(0.6, Math.round((z + d * 0.1) * 100) / 100));
      store("tram_zoom", nz);
      return nz;
    });
  }

  function bgmToggle() {
    setBgmOn((on) => {
      const nv = !on;
      store("tram_bgm", nv ? "1" : "0");
      if (nv) {
        ac();
      } else {
        try {
          bgmRef.current?.pause();
        } catch {
          /* bỏ qua */
        }
        synthStop();
      }
      return nv;
    });
  }
  function testSound() {
    try {
      ac();
    } catch {
      /* bỏ qua */
    }
    tone(880, 0.15, "square", 0, 0.4);
    tone(1174, 0.15, "square", 0.15, 0.4);
    tone(1568, 0.45, "square", 0.3, 0.4);
    news(
      "🔔 Nếu bạn NGHE THẤY tiếng này thì loa OK! Nhạc nền phát khi bấm BẮT ĐẦU.",
    );
  }

  useEffect(() => {
    const el = bgmRef.current;
    if (!el || !unlocked) return;
    if (!bgmOn) {
      el.pause();
      synthStop();
      return;
    }
    el.src = TRACKS[trackIdx].u;
    el.loop = true;
    safePlay(el, () => synthStart(true));
  }, [bgmOn, trackIdx, unlocked]);
  useEffect(() => {
    if (bgmRef.current) bgmRef.current.volume = bgmVol;
  }, [bgmVol]);

  function startShow() {
    ac();
    if (bgmOn && bgmRef.current) {
      const el = bgmRef.current;
      el.src = TRACKS[trackIdx].u;
      el.volume = bgmVol;
      safePlay(el, () => synthStart(true));
    }
    sFlip();
    sessStart();
    go(0);
  }
  useEffect(() => {
    if (!winOpen) return;
    const id = setInterval(() => burst(false), 1800);
    return () => clearInterval(id);
  }, [winOpen, burst]);

  useEffect(() => {
    if (idx < 0 || stage !== 0 || !autoReadQ) return;
    const s = quiz[idx];
    if (!s || s.type === "info") return;
    const my = idx;
    const t = setTimeout(() => {
      if (my === idx) speak(slideSpeech(s), curVoice(), ttsRate);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, stage, autoReadQ, quiz]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") smart();
      else if (e.key === "ArrowLeft") go(idx - 1);
      else if (e.key === " ") {
        e.preventDefault();
        smart();
      } else if (/^[1-6]$/.test(e.key)) {
        // Phím số 1–6: cộng điểm (mệnh giá hiện tại) cho đội tương ứng.
        // Chỉ khi đã chấm (stage 2) để khỏi bấm nhầm, giống nút + trên bảng.
        // (Dùng stage trực tiếp thay vì biến revealed vì rule compiler yêu cầu
        //  giá trị phải khai báo trước effect.)
        const k = Number(e.key) - 1;
        if (stage === 2 && k < teams.length) addScore(k, 1);
      } else if (e.key === "t" || e.key === "T") timer();
      else if (e.key === "r" || e.key === "R") resetT();
      else if (e.key === "m" || e.key === "M") bgmToggle();
      else if (e.key === "Escape") setGridOpen((v) => !v);
      else if (e.key === "w" || e.key === "W") showWin();
      else if (e.key === "+" || e.key === "=") zoom(1);
      else if (e.key === "-" || e.key === "_") zoom(-1);
      else if (e.key === "f" || e.key === "F") onTogglePresent();
      else if (e.key === "h" || e.key === "H") setHelpOpen((v) => !v);
      else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        try {
          if (speechSynthesis.speaking) ttsStop();
          else if (e.shiftKey) readAnswers();
          else readQ();
        } catch {
          /* bỏ qua */
        }
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  });

  const s = idx >= 0 ? quiz[idx] : null;
  const revealed = stage === 2;
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const winners = teams.filter((_, k) => (scores[k] || 0) === maxScore);
  // Số thứ tự câu hỏi (bỏ qua slide thông báo) → vị trí trên thang điểm.
  const qNo = idx < 0 ? -1 : quiz.slice(0, idx + 1).filter((x) => x.type !== "info").length - 1;
  const canFifty = !!s && s.type === "one" && stage === 0 && !lfFifty;

  function useFifty() {
    const sl = quizRef.current[idx];
    if (!sl || sl.type !== "one" || lfFifty || stage !== 0) return;
    const wrong = sl.answers
      .map((a, k) => (a.correct ? -1 : k))
      .filter((k) => k >= 0);
    const drop = wrong.sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenOpts(drop);
    setLfFifty(true);
    sFlip();
  }
  function usePoll() {
    if (lfPoll) return;
    setLfPoll(true);
    setPollLeft(20);
    sFlip();
  }
  function useHint() {
    const sl = quizRef.current[idx];
    if (!sl || lfHint || !sl.note) return;
    setLfHint(true);
    setHintOpen(true);
    sFlip();
  }

  useEffect(() => {
    if (pollLeft === null || pollLeft <= 0) return;
    const id = setInterval(() => setPollLeft((t) => (t === null ? null : t - 1)), 1000);
    return () => clearInterval(id);
  }, [pollLeft]);

  function renderOpts() {
    if (!s || s.type === "info") return null;
    if (s.type === "many") {
      return (s.answers || []).map((a, k) => {
        const mine = ds[k];
        if (stage === 2) {
          const ok = mine === a.correct;
          return (
            <div
              key={k}
              className={`opt dsrow pop ${mine === undefined ? "dim" : ok ? "ok" : "no"}`}
              style={{ animationDelay: `${k * 200}ms` }}
            >
              <span className="k">{LETTERS[k] || k + 1}</span>
              <span>{a.text}</span>
              <span className={`verdict ${a.correct ? "vt" : "vf"}`}>
                {a.correct ? "ĐÚNG" : "SAI"}
              </span>
              {mine === undefined ? (
                <span className="mine">chưa chọn</span>
              ) : ok ? (
                <span className="mine good">chọn đúng ✓</span>
              ) : (
                <span className="mine bad">chọn sai ✗</span>
              )}
            </div>
          );
        }
        return (
          <div key={k} className={`opt dsrow${stage === 1 ? " lock" : ""}`}>
            <span className="k">{LETTERS[k] || k + 1}</span>
            <span>{a.text}</span>
            <span className="dsbtns">
              <button
                className={`dsbtn dd${ds[k] === true ? " on" : ""}`}
                disabled={stage === 1}
                onClick={(e) => dsPick(e, k, true)}
              >
                ĐÚNG
              </button>
              <button
                className={`dsbtn ds${ds[k] === false ? " on" : ""}`}
                disabled={stage === 1}
                onClick={(e) => dsPick(e, k, false)}
              >
                SAI
              </button>
            </span>
          </div>
        );
      });
    }
    if (s.type === "fill") {
      const a0 = s.answers[0] || { text: "" };
      const parts = s.text.split("___");
      if (stage === 2) {
        return (
          <>
            <div className="opt pop ok" style={{ animationDelay: "150ms" }}>
              <span className="k">✏️</span>
              <span>
                {parts[0]} <b>{a0.text}</b> {parts.slice(1).join(" ")}
              </span>
              <span className="badge">✅</span>
            </div>
            {s.note && <div className="funote">💡 {s.note}</div>}
          </>
        );
      }
      return (
        <div className={`opt${stage === 1 ? " lock" : ""}`}>
          <span className="k">✏️</span>
          <span>
            {parts[0]}
            <span className="blank">&nbsp;?&nbsp;</span>
            {parts.slice(1).join(" ")}
          </span>
          <span className="badge">trả lời miệng</span>
        </div>
      );
    }
    if (s.type === "guess") {
      const a0 = s.answers[0] || { text: "" };
      return (
        <>
          {s.img && imgOk && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="gimg"
              src={s.img}
              alt="Hình gợi ý"
              onError={() => setImgOk(false)}
              onLoad={() => fitText()}
            />
          )}
          {stage === 2 && (
            <>
              <div className="opt pop ok" style={{ animationDelay: "200ms" }}>
                <span className="k">📜</span>
                <span>{a0.text}</span>
              </div>
              {s.note && <div className="funote">💡 {s.note}</div>}
            </>
          )}
        </>
      );
    }
    return (s.answers || []).map((a, k) => {
      if (stage === 2) {
        const chosen = picks.includes(k);
        return (
          <div
            key={k}
            className={`opt pop ${a.correct ? "ok" : chosen ? "no" : "dim"}`}
            style={{ animationDelay: `${k * 200}ms` }}
          >
            <span className="k">{LETTERS[k] || k + 1}</span>
            <span>{a.text}</span>
            <span className="badge">
              {a.correct ? "✅ ĐÚNG RỒI!" : chosen ? "✗ sai" : ""}
            </span>
          </div>
        );
      }
      return (
        <button
          key={k}
          className={`opt${picks.includes(k) ? " pick" : ""}${stage === 1 ? " lock" : ""}${
            s.type === "one" && hiddenOpts.includes(k) ? " gone" : ""
          }`}
          onClick={() => {
            if (s.type === "one" && hiddenOpts.includes(k)) return;
            pickOne(k);
          }}
          disabled={s.type === "one" && hiddenOpts.includes(k)}
        >
          <span className="k">{LETTERS[k] || k + 1}</span>
          <span>{a.text}</span>
        </button>
      );
    });
  }

  return (
    <>
      {FLOATS.map((e, k) => (
        <span
          key={k}
          className="float"
          style={{
            top: ["8%", "10%", "76%", "70%", "44%", "52%"][k],
            left: k % 2 === 0 ? `${2 + k}%` : undefined,
            right: k % 2 === 1 ? `${2 + k}%` : undefined,
            fontSize: 40 + (k % 3) * 7,
            animationDelay: `${k * 0.5}s`,
          }}
        >
          {e}
        </span>
      ))}
      <div id="bar" style={{ width: idx < 0 ? "0%" : `${((idx + 1) / quiz.length) * 100}%` }} />
      <div id="num">{idx < 0 ? `0 / ${quiz.length}` : `${idx + 1} / ${quiz.length}`}</div>
      {scorePop && teams[scorePop.k] && (
        <div key={scorePop.id} className="score-pop">
          +{scorePop.pts} · {teams[scorePop.k]}
        </div>
      )}
      <div id="stage">
        <div id="cover" className={idx >= 0 ? "hidden" : ""}>
          <h1>
            ⚛️ AI LÀ TRIỆU PHÚ <span>VẬT LÍ</span>
          </h1>
          <p>
            Kiểm tra bài cũ Vật lí 12 · chinh phục thang 15 mốc thưởng · cả lớp
            cùng chơi
          </p>
          <button className="go" onClick={startShow}>
            ▶ BẮT ĐẦU
          </button>
          <p style={{ fontSize: 15 }}>🔊 có nhạc nền · bấm để bật tiếng</p>
        </div>
        <div id="main" className={idx < 0 ? "hidden" : ""}>
          <div className="cols">
            <div className="side" id="sideL">
              <h4>⏱ Đếm giờ</h4>
              <div id="clock" className={timeLeft !== null && timeLeft <= 5 ? "low" : ""}>
                {timeLeft === null ? "--" : timeLeft <= 0 ? "HẾT!" : timeLeft}
              </div>
              <div id="tbar" className={timeLeft !== null && timeLeft <= 5 ? "low" : ""}>
                <i
                  id="tfill"
                  style={{
                    width: timeLeft === null ? "100%" : `${(timeLeft / (s?.type === "many" || s?.type === "guess" ? 45 : 30)) * 100}%`,
                  }}
                />
              </div>
              <div className="tbtns">
                <button onClick={timer}>⏱ Chạy/Dừng</button>
                <button onClick={resetT}>↺ Đặt lại</button>
              </div>
              <div style={{ marginTop: 10, borderTop: "2px dashed #23233A55", paddingTop: 8 }} className="present-hide">
                <h4>⏲ PHIÊN</h4>
                <div id="sess" className={sessLeft !== null && sessLeft <= 300 ? "low" : ""}>
                  {sessLeft === null
                    ? `${Math.floor(sessTotal / 60)}:${String(sessTotal % 60).padStart(2, "0")}`
                    : `${Math.floor(Math.max(0, sessLeft) / 60)}:${String(Math.max(0, sessLeft) % 60).padStart(2, "0")}`}
                </div>
                <div className="tbtns">
                  {[15, 20, 25].map((m) => (
                    <button key={m} onClick={() => sessSet(m)}>
                      {m}&apos;
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="center">
              {s && (
                <div className="tag">
                  {s.round}
                  {s.type === "many" ? (
                    <> · <b>mỗi ý chọn ĐÚNG hay SAI</b></>
                  ) : s.type === "one" ? (
                    <> · <b>chọn 1 đáp án</b></>
                  ) : s.type === "fill" ? (
                    <> · <b>✏️ điền từ còn thiếu</b></>
                  ) : s.type === "guess" ? (
                    <> · <b>🖼 nhìn hình đoán</b></>
                  ) : null}
                </div>
              )}
              {s && s.type !== "info" && (
                <div id="ttsbar">
                  <button className="fbtn" onClick={readQ} title="Đọc câu hỏi (D)">
                    🔊 Đọc câu hỏi
                  </button>
                  <button className="fbtn" onClick={readAnswers} title="Đọc đáp án (Shift+D)">
                    🔊 Đọc đáp án
                  </button>
                  <button className="fbtn" onClick={() => ttsStop()} title="Dừng đọc">
                    ⏹
                  </button>
                </div>
              )}
              {s && s.type !== "info" && <div id="q">{s.text}</div>}
              {s && s.type !== "info" && s.img && s.type !== "guess" && imgOk && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  id="qimg"
                  src={s.img}
                  alt="Ảnh minh họa câu hỏi"
                  onError={() => setImgOk(false)}
                  onLoad={() => fitText()}
                />
              )}
              {s && s.type === "info" && <div id="info">{s.text}</div>}
              {s && s.type !== "info" && (
                <div id="lifelines">
                  <button
                    className={`fbtn lf${canFifty ? "" : " off"}`}
                    disabled={!canFifty}
                    onClick={useFifty}
                    title="Loại 2 đáp án sai"
                  >
                    ✂️ 50:50
                  </button>
                  <button
                    className={`fbtn lf${lfPoll ? " off" : ""}`}
                    disabled={lfPoll}
                    onClick={usePoll}
                    title="Hỏi ý kiến cả lớp (20 giây)"
                  >
                    📣 Hỏi cả lớp
                  </button>
                  <button
                    className={`fbtn lf${!s.note || lfHint ? " off" : ""}`}
                    disabled={!s.note || lfHint}
                    onClick={useHint}
                    title="Xem gợi ý công thức"
                  >
                    💡 Gợi ý
                  </button>
                </div>
              )}
              {hintOpen && s && s.note && (
                <div className="funote" onClick={() => setHintOpen(false)}>
                  💡 {s.note}
                </div>
              )}
              <div id="opts">{renderOpts()}</div>
            </div>
            <div className="side" id="sideR">
              <div className="ladderWrap">
                <h4>💰 Thang điểm · 15 mốc</h4>
                <ol className="ladder">
                  {Array.from({ length: LADDER.length }, (_, k) => k)
                    .reverse()
                    .map((k) => (
                      <li
                        key={k}
                        className={`${k === qNo ? "cur" : ""}${
                          SAFE_MILESTONES.includes(k) ? " safe" : ""
                        }${k < qNo ? " done" : ""}`}
                      >
                        <span className="mn">{k + 1}</span>
                        <span className="mm">{money(LADDER[k])}</span>
                      </li>
                    ))}
                </ol>
              </div>
              <h4 className="present-hide">📢 Bảng tin</h4>
              <div id="news" className={`${newsHot ? "hot" : ""} present-hide`} dangerouslySetInnerHTML={{ __html: newsHtml }} />
              <div id="teams">
                {teams.map((n, k) => (
                  <div className="team" key={k}>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => rename(k, e.currentTarget.innerText)}
                    >
                      {n}
                    </span>
                    <span>{scores[k] || 0}</span>
                    {revealed && (
                      <button onClick={() => addScore(k, 1)}>+{denom}</button>
                    )}
                    {teams.length > 2 && (
                      <button
                        title={`Xóa ${n}`}
                        aria-label={`Xóa ${n}`}
                        onClick={() => removeTeam(k)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontWeight: 900,
                          opacity: 0.55,
                          padding: "2px 6px",
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {teams.length < 6 && (
                  <button
                    className="fbtn"
                    style={{ width: "100%", marginTop: 2, fontSize: 14 }}
                    onClick={addTeam}
                  >
                    + Thêm đội
                  </button>
                )}
                <button
                  className="fbtn"
                  style={{ width: "100%", marginTop: 6, fontSize: 14 }}
                  onClick={() => setConfirmResetScores(true)}
                >
                  ↺ Reset điểm
                </button>
              </div>
              <ConfirmDialog
                open={confirmResetScores}
                title="Reset điểm các đội?"
                message="Điểm mọi đội về 0. Không hoàn tác được."
                confirmLabel="Reset"
                danger
                onConfirm={() => {
                  setConfirmResetScores(false);
                  resetScores();
                }}
                onCancel={() => setConfirmResetScores(false)}
              />
              <label className="present-hide" style={{ fontSize: 13, fontWeight: 900 }}>
                Mệnh giá mỗi câu đúng:
              </label>
              <select
                id="denom"
                className="present-hide"
                value={denom}
                onChange={(e) => setDenom(parseInt(e.target.value, 10))}
              >
                {[50, 100, 150, 200].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 10, borderTop: "2px dashed #23233A55", paddingTop: 8 }} className="present-hide">
                <h4 style={{ margin: "0 0 6px", fontSize: 15, color: "#8a8aa3" }}>
                  🎵 NHẠC NỀN (ONLINE)
                </h4>
                <select
                  id="track"
                  value={trackIdx}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setTrackIdx(v);
                    store("tram_track", v);
                  }}
                >
                  {TRACKS.map((tr, k) => (
                    <option key={k} value={k}>
                      {tr.n}
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
                  <span>🔈</span>
                  <input
                    id="vol"
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(bgmVol * 100)}
                    style={{ flex: 1, accentColor: "#FF5D5D" }}
                    onChange={(e) => {
                      const v = Number(e.target.value) / 100;
                      setBgmVol(v);
                      store("tram_vol", v);
                    }}
                  />
                  <span>🔊</span>
                </div>
                <button className="fbtn" style={{ width: "100%", marginTop: 6, fontSize: 14 }} onClick={testSound}>
                  🔔 Thử loa
                </button>
                <div style={{ fontSize: 11, color: "#8a8aa3", marginTop: 4 }}>
                  Nhạc: Kevin MacLeod (CC-BY) · mất mạng tự dùng nhạc máy
                </div>
              </div>
              <div style={{ marginTop: 10, borderTop: "2px dashed #23233A55", paddingTop: 8 }} className="present-hide">
                <h4 style={{ margin: "0 0 6px", fontSize: 15, color: "#8a8aa3" }}>
                  🔊 GIỌNG ĐỌC
                </h4>
                <select
                  id="voice"
                  value={voiceName}
                  onChange={(e) => {
                    setVoiceName(e.target.value);
                    store("tram_voice", e.target.value);
                  }}
                >
                  <option value="">Tự chọn giọng Việt (nếu có)</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
                  <span style={{ fontSize: 13 }}>🐢</span>
                  <input
                    id="rate"
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    value={ttsRate}
                    style={{ flex: 1, accentColor: "#3D8BFF" }}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setTtsRate(v);
                      store("tram_rate", v);
                    }}
                  />
                  <span id="ratev" style={{ fontSize: 13, fontWeight: 900 }}>
                    {ttsRate.toFixed(2)}x
                  </span>
                </div>
                <label style={{ fontSize: 14, fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    id="autoq"
                    style={{ width: "auto", accentColor: "#00B96B" }}
                    checked={autoReadQ}
                    onChange={(e) => {
                      setAutoReadQ(e.target.checked);
                      store("tram_autoread", e.target.checked ? "1" : "0");
                    }}
                  />{" "}
                  Tự đọc khi sang câu mới
                </label>
                <br />
                <label style={{ fontSize: 14, fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    id="autoann"
                    style={{ width: "auto", accentColor: "#00B96B" }}
                    checked={autoAnn}
                    onChange={(e) => {
                      setAutoAnn(e.target.checked);
                      store("tram_autoann", e.target.checked ? "1" : "0");
                    }}
                  />{" "}
                  Đọc đáp án đúng khi chấm
                </label>
                <div style={{ fontSize: 11, color: "#8a8aa3", marginTop: 4 }}>
                  Chưa có giọng Việt? Vào Windows Settings &gt; Time &amp;
                  Language &gt; Speech để thêm.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="flow" className={idx < 0 ? "hidden" : ""}>
        <button className="fbtn" onClick={() => go(idx - 1)} title="Câu trước">
          ◀
        </button>
        <button
          className="fbtn"
          onClick={() =>
            setZoomLv((z) => {
              const nz = Math.min(1.6, Math.max(0.6, Math.round((z - 0.1) * 100) / 100));
              store("tram_zoom", nz);
              return nz;
            })
          }
          title="Chữ nhỏ lại"
        >
          A-
        </button>
        <button
          className="fbtn"
          onClick={() =>
            setZoomLv((z) => {
              const nz = Math.min(1.6, Math.max(0.6, Math.round((z + 0.1) * 100) / 100));
              store("tram_zoom", nz);
              return nz;
            })
          }
          title="Chữ to ra (xem xa)"
        >
          A+
        </button>
        <button
          className={`fbtn sun big${!s || s.type === "info" || stage !== 0 ? " off" : ""}`}
          id="bLock"
          onClick={lock}
          title="Chốt đáp án"
        >
          🔒 Chốt
        </button>
        <button
          className={`fbtn go big${!s || s.type === "info" || stage === 2 ? " off" : ""}`}
          id="bCheck"
          onClick={check}
          title="Chấm điểm (Space)"
        >
          ✅ Chấm
        </button>
        <button className="fbtn big" onClick={smart} title="Tiếp (→)">
          Tiếp ▶
        </button>
        <button
          className="fbtn sky"
          id="bBgm"
          onClick={bgmToggle}
          title="Nhạc nền (M)"
        >
          {bgmOn ? "🔊 Nhạc" : "🔇 Nhạc"}
        </button>
        <button className="fbtn" onClick={testSound} title="Kiểm tra loa">
          🔔
        </button>
        <button className="fbtn sky" onClick={onTogglePresent} title="Chế độ chiếu (F)">
          ⛶ Chiếu
        </button>
        <button className="fbtn sun" onClick={showWin} title="Công bố đội thắng (W)">
          🏆
        </button>
      </div>
      <div id="grid" className={gridOpen ? "" : "hidden"}>
        {quiz.map((q, k) => (
          <button key={k} className={k === idx ? "cur" : ""} onClick={() => { setGridOpen(false); go(k); }}>
            {k + 1}. {q.type === "info" ? "📢 " : ""}{q.text.slice(0, 42)}
          </button>
        ))}
      </div>
      <div id="help" className={helpOpen ? "" : "hidden"}>
        <div>
          <b>🎮 CHỌN → CHỐT → CHẤM</b>
          <br />
          1️⃣ Bấm chọn đáp án (câu Đúng/Sai: chọn ĐÚNG hay SAI từng ý)
          <br />
          2️⃣ Muốn gây cấn thì bấm <b>🔒 Chốt</b> (tùy chọn — bỏ qua vẫn chấm
          được)
          <br />
          3️⃣ Bấm <b>✅ Chấm</b> / Space — đáp án hiện từng cái + âm thanh +
          pháo giấy
          <br />→ tiếp · ← lùi · click chọn / nút ĐÚNG-SAI · Space chấm đáp án
          · T đồng hồ · M nhạc · S bảng điểm · Esc mục lục · F full màn hình ·
          H trợ giúp
          <br />→ <b>D</b> đọc câu hỏi · <b>Shift</b>+<b>D</b> đọc đáp án
          <br />
          🎵 Đổi bài nhạc + volume ở bảng tin bên phải · không nghe tiếng thì
          bấm <b>🔔 Thử loa</b>
          <br />✂️ 50:50 · 📣 Hỏi cả lớp · 💡 Gợi ý — mỗi câu dùng 1 lần
          <br />⏲ Phiên mặc định 20 phút — chọn 15&apos; / 20&apos; / 25&apos;
          ở bảng tin
          <br />
          <center>
            <button className="fbtn sun" onClick={() => setHelpOpen(false)}>
              Đóng
            </button>
          </center>
        </div>
      </div>
      <div id="win" className={winOpen ? "" : "hidden"}>
        <div className="cup">🏆</div>
        <h2 id="winT">
          🏆 {winners.join(" & ") || "Cả lớp"} CHIẾN THẮNG!
        </h2>
        <p id="winP">với {maxScore} điểm — xin chúc mừng!</p>
        <div>
          <button
            className="fbtn sun"
            onClick={() => {
              go(0);
            }}
          >
            ↺ Chơi lại
          </button>
          <button className="fbtn" onClick={hideWin}>
            Đóng
          </button>
        </div>
      </div>
      {pollLeft !== null && (
        <div id="poll">
          <div>
            <b>📣 HỎI Ý KIẾN CẢ LỚP</b>
            <p>Cả lớp giơ tay chọn đáp án mình cho là đúng nhé!</p>
            <div className="pollcount">{pollLeft <= 0 ? "HẾT!" : pollLeft}</div>
            <button className="fbtn sun" onClick={() => setPollLeft(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}
      {bursts.map((b) => (
        <div key={b.id} className="burst" style={{ left: b.left, top: b.top }}>
          {b.e}
        </div>
      ))}
      <audio ref={bgmRef} loop preload="auto" />
      <audio ref={winRef} preload="auto" />
    </>
  );

  function showWin() {
    setWinOpen(true);
    winSong();
    burst(true);
    try {
      bgmRef.current?.pause();
    } catch {
      /* bỏ qua */
    }
    synthStop();
    const el = winRef.current;
    if (el) {
      el.src = WIN_URL;
      el.volume = 0.9;
      safePlay(el, () => winSong());
    }
  }
  function hideWin() {
    setWinOpen(false);
    try {
      if (winRef.current) {
        winRef.current.pause();
        winRef.current.currentTime = 0;
      }
    } catch {
      /* bỏ qua */
    }
    if (bgmOn && bgmRef.current) safePlay(bgmRef.current);
  }
}
