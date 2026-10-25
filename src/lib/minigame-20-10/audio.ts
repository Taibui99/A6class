/* Âm thanh Minigame 12A6 — tổng hợp hiệu ứng âm thanh sống động (SFX) bằng Web Audio API. */

export type SoundMode = 0 | 1; /* 0: Tắt âm thanh · 1: Bật hiệu ứng */

const MODE_KEY = "mg_sound_mode_v3";

let mode: SoundMode | null = null;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let send: DelayNode | null = null;

function loadMode(): SoundMode {
  if (mode !== null) return mode;
  let m: SoundMode = 1; /* Mặc định bật hiệu ứng âm thanh (không phát nhạc nền chói tai) */
  try {
    const raw = localStorage.getItem(MODE_KEY);
    if (raw === "0" || raw === "1") m = Number(raw) as SoundMode;
  } catch {
    /* localStorage bị chặn */
  }
  mode = m;
  return m;
}

function ensure(): { ctx: AudioContext; master: GainNode; send: DelayNode } | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      const c = new AC();
      const m = c.createGain();
      m.gain.value = 0.85;
      m.connect(c.destination);
      const d = c.createDelay(1);
      d.delayTime.value = 0.18;
      const fb = c.createGain();
      fb.gain.value = 0.25;
      const wet = c.createGain();
      wet.gain.value = 0.25;
      d.connect(fb);
      fb.connect(d);
      d.connect(wet);
      wet.connect(m);
      ctx = c;
      master = m;
      send = d;
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  if (ctx && master && send) return { ctx, master, send };
  return null;
}

export function unlockAudio() {
  ensure();
}

type ToneOpts = {
  freq: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  to?: number;
  echo?: number;
};

function toneAt(t0: number, o: ToneOpts) {
  const s = ensure();
  if (!s || loadMode() === 0) return;
  const { ctx: c, master: m, send: d } = s;
  if (c.state !== "running") return;
  const dur = Math.max(0.03, o.dur ?? 0.16);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(Math.max(20, o.freq), t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
  const peak = Math.min(0.25, Math.max(0.005, o.gain ?? 0.08));
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(0.02, dur * 0.25));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(m);
  if (o.echo) {
    const eg = c.createGain();
    eg.gain.value = Math.min(1, o.echo);
    g.connect(eg);
    eg.connect(d);
  }
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function tone(o: ToneOpts) {
  const s = ensure();
  if (!s || loadMode() === 0) return;
  toneAt(s.ctx.currentTime + Math.max(0, o.delay ?? 0), o);
}

function notes(
  freqs: number[],
  step = 0.08,
  dur = 0.18,
  type: OscillatorType = "sine",
  gain = 0.08,
  offset = 0,
  echo = 0.35,
) {
  freqs.forEach((f, i) => tone({ freq: f, dur, type, gain, delay: offset + i * step, echo }));
}

/* ---------- HIỆU ỨNG ÂM THANH SỐNG ĐỘNG (SFX) ---------- */

/* Tiếng click nút bấm êm dịu */
export function sfxClick() {
  tone({ freq: 880, dur: 0.03, type: "sine", gain: 0.025 });
}

/* Tiếng khai mạc khi bấm Bắt đầu */
export function sfxStart() {
  notes([261.63, 329.63, 392.0, 523.25], 0.09, 0.24, "sine", 0.09, 0, 0.35);
}

/* Tiếng quay túi mù hồi hộp */
export function sfxTickStep(p: number) {
  const f = p < 0.6 ? 560 : 750;
  tone({ freq: f, dur: 0.035, type: "sine", gain: 0.04 });
}

/* Tiếng chuông trúng thưởng khi chọn được túi mù */
export function sfxLand() {
  notes([523.25, 659.25, 783.99, 1046.5], 0.07, 0.2, "sine", 0.09, 0, 0.4);
}

/* Tiếng xé túi mù / mở thẻ */
export function sfxOpen() {
  notes([659.25, 783.99, 1046.5, 1318.5], 0.05, 0.22, "sine", 0.08, 0, 0.35);
}

/* Tiếng hộp quà / bảo bối lấp lánh */
export function sfxGift() {
  notes([523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98], 0.06, 0.2, "sine", 0.08, 0.1, 0.45);
}

/* Tiếng đếm ngược đồng hồ */
export function sfxSecond(urgent: boolean) {
  if (urgent) {
    tone({ freq: 1046.5, dur: 0.04, type: "sine", gain: 0.06 });
  } else {
    tone({ freq: 783.99, dur: 0.04, type: "sine", gain: 0.04 });
  }
}

/* Tiếng còi hết giờ nhẹ nhàng */
export function sfxExpire() {
  tone({ freq: 300, to: 160, dur: 0.35, type: "triangle", gain: 0.07 });
}

/* Tiếng tạch tạch của vòng quay chọn người */
export function sfxWheelTick() {
  tone({ freq: 800 + Math.random() * 200, dur: 0.02, type: "triangle", gain: 0.04 });
}

/* Tiếng kèn chúc mừng khi vòng quay chọn trúng người */
export function sfxFanfare() {
  notes([523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98], 0.08, 0.28, "sine", 0.1, 0, 0.5);
}

/* Tiếng mở màn đáp án */
export function sfxReveal() {
  notes([440, 554.37, 659.25, 880, 1108.73], 0.05, 0.22, "sine", 0.07, 0, 0.45);
}

export function sfxBlip() {
  notes([880, 1175], 0.05, 0.1, "sine", 0.05);
}

/* Không còn nhạc nền synthesizer chói tai */
export function startMusic() {
  /* No-op: Đã tắt nhạc nền synthesizer giả lập */
}

export function stopMusic() {
  /* No-op */
}

/* ---------- ĐIỀU KHIỂN ÂM THANH ---------- */
export function getSoundMode(): SoundMode {
  return loadMode();
}

export function setSoundMode(m: SoundMode) {
  mode = m;
  try {
    localStorage.setItem(MODE_KEY, String(m));
  } catch {
    /* bỏ qua */
  }
}

export function cycleSoundMode(): SoundMode {
  const next = (loadMode() === 1 ? 0 : 1) as SoundMode;
  setSoundMode(next);
  return next;
}

export function soundLabel(m: SoundMode): string {
  if (m === 0) return "🔇 ÂM THANH: TẮT";
  return "🔊 ÂM THANH: BẬT";
}
