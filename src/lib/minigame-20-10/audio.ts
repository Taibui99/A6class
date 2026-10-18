/* Âm thanh 20/10 — tổng hợp trực tiếp bằng Web Audio API (không cần file, không nặng). */

export type SoundMode = 0 | 1 | 2; /* 0 tắt · 1 hiệu ứng · 2 hiệu ứng + nhạc nền */

const MODE_KEY = "mg20_10_sound_mode_v2";

let mode: SoundMode | null = null;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let send: DelayNode | null = null;

function loadMode(): SoundMode {
  if (mode !== null) return mode;
  let m: SoundMode = 2;
  try {
    const raw = localStorage.getItem(MODE_KEY);
    if (raw === "0" || raw === "1" || raw === "2") m = Number(raw) as SoundMode;
  } catch {
    /* localStorage bị chặn → mặc định bật hiệu ứng */
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
      d.delayTime.value = 0.2;
      const fb = c.createGain();
      fb.gain.value = 0.32;
      const wet = c.createGain();
      wet.gain.value = 0.3;
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

/* Trình duyệt chặn âm thanh cho tới khi người dùng bấm/nhấn lần đầu. */
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
  /* AudioContext chưa chạy → bỏ qua nốt này (tránh dồn tiếng chờ thành một cục khi bấm). */
  if (c.state !== "running") return;
  const dur = Math.max(0.03, o.dur ?? 0.16);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "triangle";
  osc.frequency.setValueAtTime(Math.max(20, o.freq), t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
  const peak = Math.min(0.28, Math.max(0.005, o.gain ?? 0.08));
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
  step = 0.1,
  dur = 0.18,
  type: OscillatorType = "triangle",
  gain = 0.08,
  offset = 0,
  echo = 0.4,
) {
  freqs.forEach((f, i) => tone({ freq: f, dur, type, gain, delay: offset + i * step, echo }));
}

/* ---------- Hiệu ứng ---------- */
export function sfxClick() {
  tone({ freq: 760, dur: 0.05, type: "square", gain: 0.035 });
}
export function sfxStart() {
  notes([392, 523, 659, 784], 0.1, 0.22, "triangle", 0.1);
}
/* Tiếng "tích" của vòng quay — càng về sau càng trầm. */
export function sfxTickStep(p: number) {
  tone({ freq: p < 0.55 ? 640 : 820, dur: 0.04, type: "square", gain: 0.045 });
}
export function sfxLand() {
  notes([659, 880, 1175, 1568], 0.08, 0.16, "triangle", 0.1, 0, 0.5);
}
export function sfxOpen() {
  tone({ freq: 900, to: 240, dur: 0.18, type: "sine", gain: 0.11, echo: 0.3 });
}
export function sfxGift() {
  notes([523, 659, 784, 1046, 1319, 1568], 0.07, 0.2, "triangle", 0.09, 0.2, 0.45);
}
export function sfxSecond(urgent: boolean) {
  if (urgent) {
    tone({ freq: 1180, dur: 0.05, type: "square", gain: 0.07 });
    tone({ freq: 1560, dur: 0.05, type: "square", gain: 0.05, delay: 0.09 });
  } else {
    tone({ freq: 980, dur: 0.05, type: "sine", gain: 0.055 });
  }
}
export function sfxExpire() {
  tone({ freq: 340, to: 120, dur: 0.5, type: "sawtooth", gain: 0.1 });
  tone({ freq: 170, to: 90, dur: 0.6, type: "square", gain: 0.06, delay: 0.06 });
}
export function sfxReveal() {
  notes([523, 659, 784, 1046, 1319], 0.06, 0.24, "sine", 0.08, 0, 0.55);
}
export function sfxBlip() {
  notes([880, 1175], 0.06, 0.1, "sine", 0.06);
}

/* ---------- Nhạc nền: bài "20/10" tự soạn (C – Am – F – G, 112 BPM, 8 nhịp) ---------- */
const BPM = 112;
const STEP_DUR = 60 / BPM / 4; /* 1 nốt-16 ≈ 0.134s */
const STEPS = 16; /* 1 nhịp = 16 nốt-16 */
const BARS = 8;
const LOOKAHEAD = 0.15; /* lên lịch trước 150ms để nhịp không bị lệch */
const SCHED_TICK = 25;
const MAX_STEPS = BARS * STEPS;

const NF = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

type Mel = readonly [step: number, freq: number, dur: number];

/* Hợp âm theo nhịp: C – Am – F – G – C – Am – F – G */
const CHORDS: { root: number; tones: number[] }[] = [
  { root: 130.81, tones: [NF.C4, NF.E4, NF.G4] },
  { root: 110.0, tones: [220.0, NF.C4, NF.E4] },
  { root: 87.31, tones: [NF.F4, NF.A4, NF.C5] },
  { root: 98.0, tones: [NF.G4, NF.B4, NF.D5] },
  { root: 130.81, tones: [NF.C4, NF.E4, NF.G4] },
  { root: 110.0, tones: [220.0, NF.C4, NF.E4] },
  { root: 87.31, tones: [NF.F4, NF.A4, NF.C5] },
  { root: 98.0, tones: [NF.G4, NF.B4, NF.D5] },
];

/* Giai điệu — nửa đầu nhẹ nhàng, nửa sau lên cao cho rộn ràng. */
const MELODY: Mel[] = [
  [0, NF.E5, 4],
  [6, NF.C5, 2],
  [8, NF.G4, 2],
  [10, NF.C5, 4],
  [14, NF.D5, 2],
  [16, NF.C5, 4],
  [22, NF.A4, 2],
  [24, NF.E5, 4],
  [30, NF.C5, 2],
  [32, NF.A4, 4],
  [38, NF.C5, 2],
  [40, NF.F4, 2],
  [42, NF.A4, 4],
  [46, NF.C5, 2],
  [48, NF.B4, 4],
  [54, NF.D5, 2],
  [56, NF.G4, 2],
  [58, NF.B4, 4],
  [62, NF.D5, 2],
  [64, NF.G5, 4],
  [70, NF.E5, 2],
  [72, NF.C5, 4],
  [76, NF.E5, 2],
  [78, NF.G5, 2],
  [80, NF.E5, 6],
  [88, NF.C5, 4],
  [92, NF.A4, 4],
  [96, NF.C5, 4],
  [102, NF.D5, 2],
  [104, NF.F5, 4],
  [110, NF.C5, 2],
  [112, NF.D5, 4],
  [118, NF.B4, 2],
  [120, NF.G4, 4],
  [124, NF.D5, 2],
  [126, NF.B4, 2],
];

const MELODY_MAP = new Map<number, Mel[]>();
for (const m of MELODY) {
  const list = MELODY_MAP.get(m[0]);
  if (list) list.push(m);
  else MELODY_MAP.set(m[0], [m]);
}

const ARP = [0, 1, 2, 1, 0, 2, 1, 2];

let schedTimer: number | null = null;
let nextStepTime = 0;
let stepNo = 0;
let noiseBuf: AudioBuffer | null = null;

function kickAt(t0: number) {
  const s = ensure();
  if (!s || loadMode() === 0 || s.ctx.state !== "running") return;
  const { ctx: c, master: m } = s;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(130, t0);
  o.frequency.exponentialRampToValueAtTime(46, t0 + 0.11);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.13, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
  o.connect(g);
  g.connect(m);
  o.start(t0);
  o.stop(t0 + 0.2);
}

function shakerAt(t0: number, gain: number) {
  const s = ensure();
  if (!s || loadMode() === 0 || s.ctx.state !== "running") return;
  const { ctx: c, master: m } = s;
  if (!noiseBuf) {
    const len = Math.floor(c.sampleRate * 0.25);
    noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 5200;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.005, gain), t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
  src.connect(f);
  f.connect(g);
  g.connect(m);
  src.start(t0);
  src.stop(t0 + 0.14);
}

function scheduleStep(step: number, t0: number) {
  const bar = Math.floor(step / STEPS) % BARS;
  const s16 = step % STEPS;
  const ch = CHORDS[bar];

  if (s16 === 0 || s16 === 8) kickAt(t0);
  if (s16 % 2 === 0) shakerAt(t0, s16 % 4 === 0 ? 0.032 : 0.018);

  if (s16 === 0) {
    toneAt(t0, { freq: ch.root, dur: 0.36, type: "sine", gain: 0.12 });
    ch.tones.forEach((f) => toneAt(t0, { freq: f, dur: 1.9, type: "sine", gain: 0.026, echo: 0.4 }));
  }
  if (s16 === 8) toneAt(t0, { freq: ch.root, dur: 0.3, type: "sine", gain: 0.1 });

  toneAt(t0, { freq: ch.tones[ARP[s16 % 8]], dur: 0.2, type: "triangle", gain: 0.048, echo: 0.5 });

  const mel = MELODY_MAP.get(step);
  if (mel) {
    for (const [, f, d] of mel) {
      toneAt(t0, { freq: f, dur: d * STEP_DUR * 0.95, type: "sine", gain: 0.1, echo: 0.55 });
    }
  }
}

function scheduler() {
  const s = ensure();
  if (!s || loadMode() !== 2) {
    stopMusic();
    return;
  }
  const { ctx: c } = s;
  if (c.state === "running") {
    /* Nếu audio bị treo quá lâu → bắt lại từ bây giờ, tránh dồn tiếng. */
    if (nextStepTime < c.currentTime - 0.5) nextStepTime = c.currentTime + 0.05;
    let guard = 0;
    while (nextStepTime < c.currentTime + LOOKAHEAD && guard++ < 64) {
      scheduleStep(stepNo, nextStepTime);
      nextStepTime += STEP_DUR;
      stepNo = (stepNo + 1) % MAX_STEPS;
    }
  }
  schedTimer = window.setTimeout(scheduler, SCHED_TICK);
}

export function startMusic() {
  if (schedTimer !== null || loadMode() !== 2) return;
  const s = ensure();
  if (!s) return;
  nextStepTime = s.ctx.currentTime + 0.12;
  stepNo = 0;
  scheduler();
}

export function stopMusic() {
  if (schedTimer !== null) {
    window.clearTimeout(schedTimer);
    schedTimer = null;
  }
}

/* ---------- Điều khiển ---------- */
export function getSoundMode(): SoundMode {
  return loadMode();
}

export function setSoundMode(m: SoundMode) {
  mode = m;
  try {
    localStorage.setItem(MODE_KEY, String(m));
  } catch {
    /* hết dung lượng thì thôi */
  }
  if (m !== 2) stopMusic();
}

export function cycleSoundMode(): SoundMode {
  const next = ((loadMode() + 1) % 3) as SoundMode;
  setSoundMode(next);
  return next;
}

export function soundLabel(m: SoundMode): string {
  if (m === 0) return "ÂM THANH: TẮT";
  if (m === 1) return "ÂM THANH: HIỆU ỨNG";
  return "ÂM THANH: + NHẠC NỀN";
}
