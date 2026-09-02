"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* ================================================================
   PARALLAX DEPTH CONFIG
   Each layer moves at depth × mouse offset
   ================================================================ */
const DEPTH = {
  sky: 0.05,
  mountains: 0.15,
  school: 0.25,
  trees: 0.2,
  robot: 0.4,
  objects: 0.5,
  foreground: 0.6,
} as const;

const PARALLAX_SCALE = 18;

/* ================================================================
   LAYER POSITION CONFIG (1376×768 baseline)
   Percentages of viewport, computed to match screen.png
   ================================================================ */
const LAYER_STYLE: Record<string, React.CSSProperties> = {
  sky: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "50% 35%",
  },
  mountains: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "50% 30%",
  },
  school: {
    position: "absolute",
    left: "1.5%",
    top: "14%",
    width: "23%",
    maxWidth: "320px",
  },
  trees: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "50% 35%",
  },
  robot: {
    position: "absolute",
    right: "10%",
    top: "8%",
    width: "22%",
    maxWidth: "310px",
  },
  objects: {
    position: "absolute",
    left: "8%",
    bottom: "2%",
    width: "62%",
    maxWidth: "860px",
  },
  foreground: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "50% 85%",
  },
};

/* ================================================================
   SceneLayer — single parallax-controlled layer
   ================================================================ */
function SceneLayer({
  depth,
  children,
  className,
  style,
}: {
  depth: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const offsetRef = useRef({ x: 0, y: 0 });
  const elRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const applyTransform = useCallback(() => {
    if (!elRef.current) return;
    const { x, y } = offsetRef.current;
    elRef.current.style.transform = `translate(${x * depth * PARALLAX_SCALE}px, ${y * depth * PARALLAX_SCALE}px)`;
  }, [depth]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      offsetRef.current = { x, y };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyTransform);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [applyTransform]);

  return (
    <div
      ref={elRef}
      className={cn("will-change-transform", className)}
      style={style}
    >
      {children}
    </div>
  );
}

/* ================================================================
   WelcomeScene — main component
   ================================================================ */
export function WelcomeScene({
  children,
  introComplete,
}: {
  children: React.ReactNode;
  introComplete: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#1e1208]">
      {/* Layer 0: Sky */}
      <SceneLayer depth={DEPTH.sky} className={cn("transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/welcome/sky.png"
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={LAYER_STYLE.sky}
          onLoad={() => setLoaded(true)}
        />
      </SceneLayer>

      {/* Layer 1: Mountains */}
      <SceneLayer depth={DEPTH.mountains} className={cn("transition-opacity duration-700 delay-200", loaded ? "opacity-100" : "opacity-0")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/welcome/mountains.png"
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={LAYER_STYLE.mountains}
        />
      </SceneLayer>

      {/* Layer 2: Trees */}
      <SceneLayer depth={DEPTH.trees} className={cn("transition-opacity duration-700 delay-400", loaded ? "opacity-100" : "opacity-0")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/welcome/trees.png"
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={LAYER_STYLE.trees}
        />
      </SceneLayer>

      {/* Layer 3: School */}
      <SceneLayer depth={DEPTH.school} className={cn("transition-all duration-700 delay-400", loaded ? "opacity-100" : "opacity-0 translate-y-4")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/welcome/school.png"
          alt=""
          draggable={false}
          className="w-full"
          style={LAYER_STYLE.school}
        />
      </SceneLayer>

      {/* Layer 4: Robot (FOCAL POINT) */}
      <SceneLayer depth={DEPTH.robot} className={cn("transition-all duration-[800ms] delay-[600ms]", loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5")}>
        <div
          className={introComplete ? "scene-idle-robot" : ""}
          style={LAYER_STYLE.robot}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/welcome/robot.png"
            alt="Robot A6Class"
            draggable={false}
            className="w-full"
          />
        </div>
      </SceneLayer>

      {/* Layer 5: Objects */}
      <SceneLayer depth={DEPTH.objects} className={cn("transition-opacity duration-600 delay-[800ms]", loaded ? "opacity-100" : "opacity-0")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/welcome/objects.png"
          alt=""
          draggable={false}
          className="w-full"
          style={LAYER_STYLE.objects}
        />
      </SceneLayer>

      {/* Layer 6: Foreground */}
      <SceneLayer depth={DEPTH.foreground} className={cn("transition-opacity duration-600 delay-[1000ms]", loaded ? "opacity-100" : "opacity-0")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/welcome/foreground.png"
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={LAYER_STYLE.foreground}
        />
      </SceneLayer>

      {/* Ambient effects */}
      {loaded && <AmbientEffects />}

      {/* UI overlay */}
      <div className="relative z-20 flex h-full flex-col items-center justify-end pb-[max(3rem,8vh)]">
        {children}
      </div>
    </div>
  );
}

/* ================================================================
   AmbientEffects — sun glow + floating particles
   ================================================================ */
function AmbientEffects() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      {/* Sun glow overlay */}
      <div
        className="ambient-glow absolute"
        style={{
          top: "5%",
          left: "45%",
          width: "35%",
          height: "45%",
          background:
            "radial-gradient(ellipse at center, rgba(255,230,120,0.18) 0%, rgba(255,200,80,0.06) 45%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="ambient-particle absolute rounded-full bg-amber-200/40"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            left: `${15 + i * 17}%`,
            top: `${20 + (i % 3) * 15}%`,
            animationDelay: `${i * 1.8}s`,
            animationDuration: `${8 + i * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
