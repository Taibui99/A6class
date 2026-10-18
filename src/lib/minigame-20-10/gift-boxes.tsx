/* 50 hộp quà SVG — mỗi hộp một kiểu riêng, vẽ tay bằng path/rect/ellipse.
   Không dùng icon/emoji. Đặc trưng mỗi hộp suy ra CỐ ĐỊNH từ chỉ số
   (deterministic) để SSR/CSR giống nhau, tránh hydration mismatch. */

type Pal = {
  base: string;
  dark: string;
  light: string;
  ribbon: string;
  bow: string;
};

const PALETTES: Pal[] = [
  { base: "#ff4d6d", dark: "#c8223f", light: "#ff97ab", ribbon: "#ffd166", bow: "#ffe08a" },
  { base: "#e63946", dark: "#ab2431", light: "#ff7381", ribbon: "#f1faee", bow: "#ffffff" },
  { base: "#ff6fb5", dark: "#cf3f8c", light: "#ffa6d4", ribbon: "#ffe066", bow: "#fff0a3" },
  { base: "#d81b8c", dark: "#a01268", light: "#ff5fb0", ribbon: "#ffd166", bow: "#ffe8a3" },
  { base: "#ffb703", dark: "#cf8f00", light: "#ffd45c", ribbon: "#fb8500", bow: "#ffcc4d" },
  { base: "#ff9f1c", dark: "#d97706", light: "#ffc46b", ribbon: "#e71d36", bow: "#ff7a8a" },
  { base: "#a259ff", dark: "#7c3aed", light: "#c79dff", ribbon: "#ffd166", bow: "#ffe8a3" },
  { base: "#b388ff", dark: "#8c6ddb", light: "#d1b3ff", ribbon: "#64dfdf", bow: "#a3f0f0" },
  { base: "#06d6a0", dark: "#059b80", light: "#5cead0", ribbon: "#ffd166", bow: "#ffe8a3" },
  { base: "#3a86ff", dark: "#2563eb", light: "#7cb0ff", ribbon: "#ffbe0b", bow: "#ffdd57" },
  { base: "#55efc4", dark: "#20bf9a", light: "#8ff5da", ribbon: "#ff9f1c", bow: "#ffbf69" },
  { base: "#ffe66d", dark: "#e0bd00", light: "#fff2a3", ribbon: "#ff6fb5", bow: "#ffb3d1" },
  { base: "#ff6b6b", dark: "#e04a4a", light: "#ff9e9e", ribbon: "#4ecdc4", bow: "#8ceee6" },
  { base: "#ff8fab", dark: "#e0618a", light: "#ffc2d1", ribbon: "#a5f8d3", bow: "#c8fcec" },
  { base: "#f72585", dark: "#c01a68", light: "#ff6fb5", ribbon: "#ffd166", bow: "#ffe8a3" },
  { base: "#48cae4", dark: "#2196b8", light: "#80e4f5", ribbon: "#ff5d8f", bow: "#ff9dbb" },
];

type ShapeDef = {
  front: { x: number; y: number; w: number; h: number };
  lid: { x: number; y: number; w: number; h: number };
};

/* 6 kiểu hộp — luôn KHỚP với thứ tự SHAPES bên dưới. */
const SHAPES: ShapeDef[] = [
  { front: { x: 45, y: 100, w: 110, h: 96 }, lid: { x: 33, y: 74, w: 134, h: 28 } }, // cube
  { front: { x: 56, y: 74, w: 88, h: 122 }, lid: { x: 45, y: 48, w: 110, h: 28 } }, // tall
  { front: { x: 30, y: 116, w: 140, h: 78 }, lid: { x: 20, y: 90, w: 160, h: 28 } }, // wide
  { front: { x: 52, y: 96, w: 96, h: 98 }, lid: { x: 44, y: 70, w: 112, h: 28 } }, // three-quarter
  { front: { x: 56, y: 96, w: 88, h: 100 }, lid: { x: 44, y: 70, w: 112, h: 30 } }, // cylinder
  { front: { x: 44, y: 92, w: 112, h: 104 }, lid: { x: 34, y: 66, w: 132, h: 28 } }, // hexagon
];

/* Đảm bảo 50 hộp KHÁC NHAU tuyệt đối:
   shape≡(i mod6), lid≡2i mod5, ribbon≡3i mod5, bow≡4i mod5, pattern≡7i mod8.
   i≡j đồng thời 5 điều kiện ⇒ (i−j) chia hết lcm(6,5,8)=120 ⇒ i=j với i,j<50. */
function features(i: number) {
  return {
    shape: i % 6,
    lid: (i * 2) % 5,
    ribbon: (i * 3) % 5,
    bow: (i * 4) % 5,
    pattern: (i * 7) % 8,
    pal: PALETTES[(i * 13) % PALETTES.length],
    tilt: ((i % 5) - 2) * 1.4,
  };
}

function Star({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      fill={fill}
      d="M10 0l2.9 6.1 6.6.9-4.8 4.7 1.2 6.7L10 15.4 4.1 18.4l1.2-6.7L.5 7l6.6-.9z"
    />
  );
}

function Heart({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      fill={fill}
      d="M10 18C4 12.5 0 8.8 0 5.5 0 2.5 2.3 0 5.2 0 7 0 8.9 1 10 2.7 11.1 1 13 0 14.8 0 17.7 0 20 2.5 20 5.5c0 3.3-4 7-10 12.5z"
    />
  );
}

/* Hoa văn vẽ trong vùng front, đã clip. */
function Pattern({ kind, w, h, pal }: { kind: number; w: number; h: number; pal: Pal }) {
  if (kind === 0) return null;
  const els: React.ReactNode[] = [];
  if (kind === 1) {
    for (let y = 8; y < h; y += 20)
      for (let x = 8; x < w; x += 20)
        els.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill={pal.light} opacity={0.85} />);
  } else if (kind === 2) {
    for (let x = -h; x < w + h; x += 18)
      els.push(
        <line key={x} x1={x} y1={0} x2={x + h} y2={h} stroke={pal.light} strokeWidth={7} opacity={0.6} />
      );
  } else if (kind === 3) {
    for (let y = 10; y < h; y += 26)
      for (let x = 10; x < w; x += 26)
        els.push(<Star key={`${x}-${y}`} x={x} y={y} s={0.7} fill={pal.light} />);
  } else if (kind === 4) {
    for (let y = 12; y < h; y += 24)
      for (let x = 12; x < w; x += 24)
        els.push(
          <g key={`${x}-${y}`} stroke={pal.light} strokeWidth={3} strokeLinecap="round" opacity={0.9}>
            <line x1={x - 7} y1={y} x2={x + 7} y2={y} />
            <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
            <line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} />
            <line x1={x - 5} y1={y + 5} x2={x + 5} y2={y - 5} />
          </g>
        );
  } else if (kind === 5) {
    for (let y = 8; y < h; y += 24)
      for (let x = 8; x < w; x += 24)
        els.push(<Heart key={`${x}-${y}`} x={x} y={y} s={0.7} fill={pal.light} />);
  } else if (kind === 6) {
    const cols = [pal.light, pal.ribbon, "#ffffff", pal.bow];
    for (let y = 8; y < h; y += 18)
      for (let x = 8; x < w; x += 18) {
        const k = (x + y) % 4;
        els.push(
          k % 2 === 0 ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={7} height={7} rx={2} fill={cols[k]} transform={`rotate(${(x * y) % 60} ${x} ${y})`} />
          ) : (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill={cols[k]} />
          )
        );
      }
  } else {
    for (let y = 6; y < h; y += 16)
      for (let x = 0; x < w; x += 16)
        els.push(
          <path key={`${x}-${y}`} d={`M${x} ${y + 8}l8 -8 8 8`} stroke={pal.light} strokeWidth={3} fill="none" opacity={0.75} />
        );
  }
  return <g>{els}</g>;
}

function Ribbon({ kind, f, pal }: { kind: number; f: ShapeDef["front"]; pal: Pal }) {
  const cx = f.x + f.w / 2;
  const cy = f.y + f.h / 2;
  const bands: React.ReactNode[] = [];
  if (kind === 0 || kind === 1 || kind === 3 || kind === 4)
    bands.push(<rect key="v" x={cx - 11} y={f.y} width={22} height={f.h} fill={pal.ribbon} />);
  if (kind === 1 || kind === 3)
    bands.push(<rect key="h" x={f.x} y={cy - 11} width={f.w} height={22} fill={pal.ribbon} />);
  if (kind === 2)
    bands.push(
      <rect key="d" x={f.x} y={cy - 11} width={f.w} height={22} fill={pal.ribbon} transform={`rotate(-24 ${cx} ${cy})`} />
    );
  if (kind === 4)
    bands.push(<rect key="h2" x={f.x} y={cy - 34} width={f.w} height={14} fill={pal.ribbon} opacity={0.85} />);
  return <g>{bands}</g>;
}

function Bow({ kind, cx, y, pal }: { kind: number; cx: number; y: number; pal: Pal }) {
  if (kind === 0)
    return (
      <g transform={`translate(${cx} ${y})`}>
        <ellipse cx={-26} cy={0} rx={26} ry={17} fill={pal.bow} transform="rotate(-18)" />
        <ellipse cx={26} cy={0} rx={26} ry={17} fill={pal.bow} transform="rotate(18)" />
        <circle cx={0} cy={2} r={11} fill={pal.ribbon} />
      </g>
    );
  if (kind === 1)
    return (
      <g transform={`translate(${cx} ${y})`} fill="none" stroke={pal.bow} strokeWidth={9} strokeLinecap="round">
        <path d="M0 4C-24 -22 -54 -14 -44 8 -36 26 -12 20 0 4z" />
        <path d="M0 4C24 -22 54 -14 44 8 36 26 12 20 0 4z" />
        <circle cx={0} cy={6} r={7} fill={pal.ribbon} stroke="none" />
      </g>
    );
  if (kind === 2)
    return (
      <g transform={`translate(${cx} ${y})`}>
        {[0, 72, 144, 216, 288].map((d) => (
          <ellipse key={d} cx={0} cy={-17} rx={13} ry={20} fill={pal.bow} transform={`rotate(${d})`} />
        ))}
        <circle cx={0} cy={0} r={10} fill={pal.ribbon} />
      </g>
    );
  if (kind === 3)
    return (
      <g transform={`translate(${cx} ${y})`}>
        <path d="M0 0C-18 -26 -46 -20 -40 2 -34 22 -12 16 0 0z" fill={pal.bow} />
        <path d="M0 0C18 -26 46 -20 40 2 34 22 12 16 0 0z" fill={pal.bow} />
        <path d="M-6 6l-14 34 20 -12z" fill={pal.ribbon} />
        <path d="M6 6l14 34 -20 -12z" fill={pal.ribbon} />
        <circle cx={0} cy={4} r={9} fill={pal.ribbon} />
      </g>
    );
  return (
    <g transform={`translate(${cx} ${y})`}>
      <ellipse cx={-24} cy={6} rx={24} ry={15} fill={pal.ribbon} transform="rotate(-14)" />
      <ellipse cx={24} cy={6} rx={24} ry={15} fill={pal.ribbon} transform="rotate(14)" />
      <ellipse cx={-15} cy={-10} rx={17} ry={12} fill={pal.bow} transform="rotate(-22)" />
      <ellipse cx={15} cy={-10} rx={17} ry={12} fill={pal.bow} transform="rotate(22)" />
      <circle cx={0} cy={0} r={10} fill={pal.base} />
    </g>
  );
}

/* Hình dáng mặt trước — dùng CẢ cho fill lẫn clip để hoa văn không tràn mép. */
function frontGeom(shape: number, fill: string, key?: string): React.ReactNode {
  const common = { key, fill } as const;
  if (shape === 0) return <rect x={45} y={100} width={110} height={96} rx={4} {...common} />;
  if (shape === 1) return <rect x={56} y={74} width={88} height={122} rx={4} {...common} />;
  if (shape === 2) return <rect x={30} y={116} width={140} height={78} rx={5} {...common} />;
  if (shape === 3) return <path d="M52 96h96v98H52z" {...common} />;
  if (shape === 4) return <path d="M56 96h88v62a44 44 0 0 1-88 0z" {...common} />;
  return <path d="M100 92l56 26v40l-56 26-56-26v-40z" {...common} />;
}

function Body({ shape, pal, fill }: { shape: number; pal: Pal; fill: string }) {
  return (
    <g>
      {frontGeom(shape, fill)}
      {shape === 0 && <rect x={45} y={100} width={26} height={96} fill="#000" opacity={0.08} />}
      {shape === 1 && <rect x={56} y={74} width={22} height={122} fill="#000" opacity={0.08} />}
      {shape === 2 && <rect x={30} y={116} width={30} height={78} fill="#000" opacity={0.08} />}
      {shape === 3 && (
        <>
          <path d="M148 96l16-16v98l-16 16z" fill={pal.dark} />
          <path d="M52 96l16-16h96l-16 16z" fill={pal.light} />
          <path d="M52 96h96v98H52z" fill="#000" opacity={0.04} />
        </>
      )}
      {shape === 4 && <ellipse cx={100} cy={158} rx={44} ry={6} fill="#000" opacity={0.12} />}
      {shape === 5 && (
        <>
          <path d="M44 118l56 26v40l-56-26z" fill="#000" opacity={0.1} />
          <path d="M156 118l-56 26v40l56-26z" fill="#fff" opacity={0.12} />
        </>
      )}
    </g>
  );
}

function Lid({ shape, pal }: { shape: number; pal: Pal }) {
  if (shape === 3)
    return (
      <g>
        <path d="M44 70l14-14h100l-14 14z" fill={pal.light} />
        <path d="M44 70h112v14H44z" fill={pal.dark} />
        <path d="M144 56l12-14v14l-12 14z" fill={pal.base} />
      </g>
    );
  if (shape === 4)
    return (
      <g>
        <rect x={44} y={70} width={112} height={26} rx={13} fill={pal.dark} />
        <ellipse cx={100} cy={70} rx={56} ry={14} fill={pal.light} />
      </g>
    );
  if (shape === 5)
    return (
      <g>
        <path d="M34 66l16-16h100l16 16z" fill={pal.light} />
        <path d="M34 66h132v20H34z" fill={pal.dark} />
      </g>
    );
  return (
    <g>
      <rect x={SHAPES[shape].lid.x} y={SHAPES[shape].lid.y} width={SHAPES[shape].lid.w} height={SHAPES[shape].lid.h} rx={4} fill={pal.dark} />
      <rect x={SHAPES[shape].lid.x + 4} y={SHAPES[shape].lid.y + 3} width={SHAPES[shape].lid.w - 8} height={9} rx={4} fill={pal.light} opacity={0.7} />
    </g>
  );
}

function LidRibbon({ shape, f, pal }: { shape: number; f: ShapeDef["front"]; pal: Pal }) {
  const cx = 100;
  const top = SHAPES[shape].lid.y;
  const bottom = top + SHAPES[shape].lid.h;
  if (shape === 4) return <rect x={cx - 11} y={top} width={22} height={bottom - top} fill={pal.ribbon} />;
  if (shape === 3 || shape === 5)
    return <rect x={cx - 11} y={top} width={22} height={bottom - top + 6} fill={pal.ribbon} />;
  return (
    <rect x={cx - 11} y={SHAPES[shape].lid.y} width={22} height={SHAPES[shape].lid.h + 4} fill={pal.ribbon} />
  );
}

export function GiftBox({ index, size = 180 }: { index: number; size?: number }) {
  const ft = features(index);
  const pal = ft.pal;
  const f = SHAPES[ft.shape];
  const clipId = `gbclip-${index}`;
  const gradId = `gbgrad-${ft.shape}-${index}`;
  const bowCx = 100;
  const bowY = SHAPES[ft.shape].lid.y + 4;

  return (
    <svg
      width={size}
      height={(size * 220) / 200}
      viewBox="0 0 200 220"
      role="img"
      aria-label={`Hộp quà số ${index + 1}`}
      className="gb-svg"
      style={{ transform: `rotate(${ft.tilt}deg)` }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={pal.light} />
          <stop offset="55%" stopColor={pal.base} />
          <stop offset="100%" stopColor={pal.dark} />
        </linearGradient>
        <clipPath id={clipId}>{frontGeom(ft.shape, "black")}</clipPath>
      </defs>

      <ellipse cx={100} cy={205} rx={62} ry={11} fill="#000" opacity={0.16} />

      <Body shape={ft.shape} pal={pal} fill={`url(#${gradId})`} />
      <g clipPath={`url(#${clipId})`}>
        <Pattern kind={ft.pattern} w={f.front.w} h={f.front.h} pal={pal} />
        <g transform={`translate(${f.front.x} ${f.front.y})`}>
          <Ribbon kind={ft.ribbon} f={{ ...f.front, x: 0, y: 0 }} pal={pal} />
        </g>
      </g>

      <Lid shape={ft.shape} pal={pal} />
      <LidRibbon shape={ft.shape} f={f.front} pal={pal} />
      <Bow kind={ft.bow} cx={bowCx} y={bowY} pal={pal} />

      <g transform="translate(150 176)">
        <circle r={17} fill="#ffffff" opacity={0.95} />
        <circle r={17} fill="none" stroke={pal.dark} strokeWidth={2} />
        <text x={0} y={6} textAnchor="middle" fontSize={17} fontWeight={800} fill={pal.dark} fontFamily="inherit">
          {index + 1}
        </text>
      </g>
    </svg>
  );
}

export const BOX_PALETTE_COUNT = PALETTES.length;
