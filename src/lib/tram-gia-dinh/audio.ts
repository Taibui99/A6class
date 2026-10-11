// WebAudio: hiệu ứng + nhạc nền synth (dự phòng offline). Không cần file ngoài.
let ctx: AudioContext | null = null;
let bgmGain: GainNode | null = null;

export function ac(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      bgmGain = ctx.createGain();
      bgmGain.gain.value = 0.05;
      bgmGain.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  when = 0,
  vol = 0.22,
) {
  try {
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t0 = c.currentTime + when;
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  } catch {
    /* bỏ qua */
  }
}

export const mf = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export const sFlip = () => tone(600, 0.1, "triangle", 0, 0.3);
export function sWrong() {
  tone(140, 0.5, "sawtooth", 0, 0.4);
  tone(104, 0.6, "sawtooth", 0.08, 0.4);
  tone(70, 0.7, "square", 0.1, 0.3);
}
export function sRight() {
  tone(880, 0.12, "sine", 0, 0.32);
  tone(1174, 0.12, "sine", 0.1, 0.32);
  tone(1568, 0.3, "sine", 0.2, 0.32);
  tone(2093, 0.4, "sine", 0.3, 0.15);
}
export function drum() {
  for (let k = 0; k < 10; k++)
    tone(180 + Math.random() * 120, 0.06, "square", k * 0.11, 0.28);
  tone(320, 0.35, "square", 1.15, 0.32);
}
export function winSong() {
  const seq: Array<[number, number, number]> = [
    [72, 0, 1],
    [76, 0.15, 1],
    [79, 0.3, 1],
    [84, 0.45, 2],
    [79, 0.9, 1],
    [84, 1.05, 1],
    [88, 1.2, 2.5],
    [84, 1.9, 0.5],
    [88, 2.05, 2.5],
  ];
  seq.forEach(([m, w, b]) => {
    tone(mf(m), b * 0.32, "triangle", w, 0.32);
    tone(mf(m - 12), b * 0.32, "sine", w, 0.18);
  });
}

const LEAD: Array<[number, number]> = [
  [72, 1], [76, 1], [79, 1], [76, 1], [81, 1], [79, 1], [76, 1], [74, 1],
  [72, 1], [76, 1], [79, 1], [81, 1], [79, 1], [76, 1], [74, 1], [72, 2],
];
const BASS: Array<[number, number]> = [
  [48, 2], [55, 2], [53, 2], [55, 2], [48, 2], [55, 2], [53, 2], [43, 2],
];
const BEAT = 0.24;
let bgmTimer: ReturnType<typeof setInterval> | null = null;
let bgmStep = 0;

export function synthStart(on: boolean) {
  if (bgmTimer || !on) return;
  const c = ac();
  if (!c || !bgmGain) return;
  bgmStep = 0;
  bgmTimer = setInterval(() => {
    if (!c || !bgmGain) return;
    try {
      const t0 = c.currentTime;
      const [lm, lb] = LEAD[bgmStep % LEAD.length];
      const [bm, bb] = BASS[Math.floor(bgmStep / 2) % BASS.length];
      const parts: Array<[number, OscillatorType, number, number]> = [
        [lm, "triangle", 0.05, lb],
        [bm, "square", 0.035, bb],
      ];
      parts.forEach(([mm, ty, v, b]) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = ty;
        o.frequency.value = mf(mm);
        g.gain.setValueAtTime(v, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + b * BEAT);
        o.connect(g);
        g.connect(bgmGain as GainNode);
        o.start(t0);
        o.stop(t0 + b * BEAT + 0.02);
      });
      bgmStep++;
    } catch {
      /* bỏ qua */
    }
  }, BEAT * 1000);
}

export function synthStop() {
  if (bgmTimer) clearInterval(bgmTimer);
  bgmTimer = null;
}

export function safePlay(
  el: HTMLAudioElement | null,
  onFail?: () => void,
) {
  if (!el) {
    onFail?.();
    return;
  }
  try {
    const p = el.play();
    if (p && typeof p.catch === "function") p.catch(() => onFail?.());
  } catch {
    onFail?.();
  }
}
