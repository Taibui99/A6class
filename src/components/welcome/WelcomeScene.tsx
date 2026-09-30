"use client";

import { useEffect, useMemo, useState } from "react";
import { isReducedMotion } from "@/lib/transition-nav";

/**
 * Nền cảnh dùng nguyên `screen.png` (1376x768) — không di chuyển pixel nào có sẵn
 * nên khớp tuyệt đối với ảnh gốc. Mọi animation bên dưới đều là lớp cộng thêm
 * (glow, mây, tia sáng, bụi lơ lửng, chim bay) nên không làm hỏng bố cục.
 *
 * Khi có `scene.mp4`, chỉ cần thay thẻ <img> bên dưới bằng <video>.
 */
export default function WelcomeScene({ children }: { children?: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const reduced = isReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  // Bụi lơ lửng — vị trí ngẫu nhiên nhưng ổn định giữa các render.
  const motes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const seed = Math.sin(i * 12.9898) * 43758.5453;
        const rnd = seed - Math.floor(seed);
        return {
          left: 4 + rnd * 92,
          size: 2 + rnd * 3.5,
          delay: rnd * 9,
          duration: 11 + rnd * 12,
          drift: 14 + rnd * 40,
        };
      }),
    [],
  );

  const show = ready && !reduced;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "43 / 24",
        borderRadius: 22,
        boxShadow: "0 20px 50px rgba(60,40,30,.18)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* ── Nền: ảnh gốc, nguyên vẹn ─────────────────────────── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/welcome/scene.png"
          alt=""
          draggable={false}
          className="absolute inset-0 size-full select-none object-cover"
          style={{ animation: show ? "wl-breathe 14s ease-in-out infinite" : undefined }}
        />

        {/* ── Lớp cộng thêm: không làm lệch bố cục gốc ──────────── */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Quầng nắng quanh mặt trời */}
          <div
            className="absolute rounded-full"
            style={{
              left: "47%",
              top: "-6%",
              width: "30%",
              height: "52%",
              background:
                "radial-gradient(closest-side, rgba(255,225,150,.55), rgba(255,205,120,.22) 55%, transparent 78%)",
              mixBlendMode: "screen",
              animation: show ? "wl-sunpulse 6.5s ease-in-out infinite" : undefined,
            }}
          />

          {/* Tia nắng toả tròn quanh mặt trời */}
          <div
            className="absolute"
            style={{
              left: "54%",
              top: "4%",
              width: "0",
              height: "0",
              animation: show ? "wl-rays 26s linear infinite" : undefined,
            }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <span
                key={deg}
                className="absolute"
                style={{
                  left: "-46px",
                  top: "-330px",
                  width: "92px",
                  height: "330px",
                  transformOrigin: "50% 330px",
                  transform: `rotate(${deg}deg)`,
                  background:
                    "linear-gradient(to top, transparent, rgba(255,238,190,.16) 55%, transparent)",
                  clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
                }}
              />
            ))}
          </div>

          {/* Mây sáng trôi ngang */}
          {[
            { top: "9%", w: 26, dur: 96, delay: 0, op: 0.2 },
            { top: "19%", w: 19, dur: 132, delay: -40, op: 0.14 },
            { top: "30%", w: 23, dur: 114, delay: -72, op: 0.1 },
          ].map((c, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-2xl"
              style={{
                top: c.top,
                left: 0,
                width: `${c.w}%`,
                height: "11%",
                opacity: c.op,
                background:
                  "radial-gradient(closest-side, rgba(255,255,255,.95), transparent)",
                animation: show
                  ? `wl-drift ${c.dur}s linear ${c.delay}s infinite`
                  : undefined,
              }}
            />
          ))}

          {/* Bụi lơ lửng trong nắng */}
          {motes.map((m, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${m.left}%`,
                bottom: "8%",
                width: m.size,
                height: m.size,
                background: "rgba(255,246,214,.85)",
                boxShadow: "0 0 6px rgba(255,232,170,.8)",
                opacity: 0,
                animation: show
                  ? `wl-mote ${m.duration}s ease-in-out ${m.delay}s infinite`
                  : undefined,
                ["--drift" as string]: `${m.drift}px`,
              }}
            />
          ))}

          {/* Chim bay ngang bầu trời */}
          <svg
            className="absolute inset-0 size-full"
            viewBox="0 0 1376 768"
            preserveAspectRatio="none"
          >
            <g
              fill="none"
              stroke="rgba(90,70,60,.34)"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              {[
                { delay: 0, dur: 34, scale: 1, y: 150 },
                { delay: -17, dur: 34, scale: 0.75, y: 176 },
              ].map((b, i) => (
                <g key={i} transform={`translate(0 ${b.y}) scale(${b.scale})`}>
                  <path
                    d="M0 0 q7 -6 13 0 q6 -6 13 0"
                    style={{
                      animation: show
                        ? `wl-fly ${b.dur}s linear ${b.delay}s infinite`
                        : undefined,
                    }}
                  />
                </g>
              ))}
            </g>
          </svg>

          {/* Hạt film nhẹ cho cảm giác analog ấm */}
          <div
            className="absolute inset-0 opacity-[0.16] mix-blend-soft-light"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          />

          {/* Viền ấm dịu ở mép */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 42%, transparent 55%, rgba(120,74,40,.10) 100%)",
            }}
          />
        </div>

        {children}
      </div>
    </div>
  );
}