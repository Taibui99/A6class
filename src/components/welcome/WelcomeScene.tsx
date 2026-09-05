"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { isReducedMotion } from "@/lib/transition-nav";

const LAYERS = [
  { id: "sun", src: "/assets/welcome/sun.png", style: { left: "43.95%", top: "4.79%", width: "20.12%", height: "16.21%", zIndex: 2 }, animation: "sunrise" },
  { id: "hillFarRight", src: "/assets/welcome/hill-far-right.png", style: { left: "51.95%", top: "12.01%", width: "47.33%", height: "17.29%", zIndex: 3 } },
  { id: "hillFarLeft", src: "/assets/welcome/hill-far-left.png", style: { left: "1.17%", top: "20.02%", width: "46.68%", height: "9.57%", zIndex: 3 } },
  { id: "school", src: "/assets/welcome/school.png", style: { left: "4.30%", top: "30.18%", width: "23.50%", height: "31.45%", zIndex: 4, filter: "drop-shadow(0 4px 6px rgba(90,40,20,.15))" } },
  { id: "treesRight", src: "/assets/welcome/trees-bush-right.png", style: { left: "73.83%", top: "30.37%", width: "24.80%", height: "34.77%", zIndex: 4 }, sway: true },
  { id: "treeSmall1", src: "/assets/welcome/tree-small-1.png", style: { left: "30.08%", top: "34.08%", width: "10.94%", height: "19.53%", zIndex: 4 }, sway: true },
  { id: "treeSmall2", src: "/assets/welcome/tree-small-2.png", style: { left: "41.41%", top: "36.04%", width: "8.40%", height: "16.99%", zIndex: 4 }, sway: true },
  { id: "hillNearPath", src: "/assets/welcome/hill-near-path.png", style: { left: "1.76%", top: "58.50%", width: "49.02%", height: "11.91%", zIndex: 6 } },
  { id: "hillNearPlain", src: "/assets/welcome/hill-near-plain.png", style: { left: "0.98%", top: "78.03%", width: "98.24%", height: "19.73%", zIndex: 9 } },
] as const;

const PROPS = [
  { id: "book", src: "/assets/welcome/book.png", style: { left: "15.04%", top: "69.43%", width: "16.80%", height: "15.62%", zIndex: 7 }, delay: 2.7 },
  { id: "globe", src: "/assets/welcome/globe.png", style: { left: "34.51%", top: "67.48%", width: "7.88%", height: "14.26%", zIndex: 7 }, delay: 2.9 },
  { id: "rocket", src: "/assets/welcome/rocket.png", style: { left: "72.66%", top: "67.48%", width: "8.40%", height: "10.16%", zIndex: 7 }, delay: 3.2 },
  { id: "star", src: "/assets/welcome/star.png", style: { left: "83.27%", top: "66.60%", width: "6.18%", height: "8.50%", zIndex: 7 }, delay: 3.1, twinkle: true },
  { id: "bell", src: "/assets/welcome/bell.png", style: { left: "88.35%", top: "67.09%", width: "8.33%", height: "17.48%", zIndex: 7 }, delay: 3.3, bellSwing: true },
] as const;

interface WelcomeSceneProps {
  onReady?: () => void;
  parallaxEnabled?: boolean;
  children?: React.ReactNode;
}

export default function WelcomeScene({ onReady, parallaxEnabled = true, children }: WelcomeSceneProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const reducedMotion = isReducedMotion();

  useEffect(() => {
    setMounted(true);
    onReady?.();
  }, [onReady]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!parallaxEnabled || reducedMotion || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = ((e.clientX - cx) / (rect.width / 2)) * 8;
      const dy = ((e.clientY - cy) / (rect.height / 2)) * 4;
      stageRef.current.style.setProperty("--px", `${dx}px`);
      stageRef.current.style.setProperty("--py", `${dy}px`);
    },
    [parallaxEnabled, reducedMotion],
  );

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "3/2", borderRadius: 22, boxShadow: "0 20px 50px rgba(60,40,30,.18)" }}
    >
      <div
        ref={stageRef}
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          background: "linear-gradient(180deg,#F6C6A8 0%,#F8D3B9 26%,#FBE0C9 46%,#FDECDD 66%,#FEF6ED 84%,#FFFBF6 100%)",
          ["--px" as string]: "0px",
          ["--py" as string]: "0px",
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Dawn overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 5, background: "linear-gradient(180deg,rgba(40,30,40,.55),rgba(40,30,40,.15) 55%,rgba(40,30,40,0) 100%)" }}
          animate={mounted && !reducedMotion ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 2, delay: 0.1, ease: "easeOut" }}
        />

        {/* Static layers */}
        {LAYERS.map((layer) => (
          <Layer key={layer.id} {...layer} mounted={mounted} reducedMotion={reducedMotion} />
        ))}

        {/* Robot shadow */}
        <motion.div
          className="absolute"
          style={{
            left: "52%", bottom: "19%", width: "15%", aspectRatio: "5/1", borderRadius: "50%",
            background: "rgba(30,45,20,.22)", filter: "blur(3px)", zIndex: 7,
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={mounted && !reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          transition={{ duration: 1, delay: 2.2, ease: "easeOut" }}
        />

        {/* Robot */}
        <motion.div
          id="robotWrap"
          className="absolute"
          style={{ left: "50%", top: "33.50%", width: "20.25%", height: "40.23%", zIndex: 8 }}
          initial={{ opacity: 0, x: "-60%", y: "10%", scale: 0.85 }}
          animate={mounted && !reducedMotion ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 2.15, ease: [0.22, 0.9, 0.3, 1.15] }}
        >
          <motion.div
            className="w-full h-full"
            animate={mounted && !reducedMotion ? { y: [0, "-1.5%", 0], rotate: [0, -1.2, 0] } : {}}
            transition={{ duration: 3.3, repeat: Infinity, delay: 3.2, ease: "easeInOut" }}
          >
            <motion.div
              className="w-full h-full"
              animate={mounted && !reducedMotion ? { rotate: [0, -4, 2, 0, -4, 2, 0, -4, 2, 0] } : {}}
              transition={{ duration: 1.65, delay: 3.1, times: [0, 0.35, 0.65, 1, 0.35, 0.65, 1, 0.35, 0.65, 1] }}
              style={{ transformOrigin: "70% 55%", position: "relative", width: "100%", height: "100%" }}
            >
              <img src="/assets/welcome/robot.png" alt="Robot A6Class" className="w-full h-full" draggable={false} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Props */}
        {PROPS.map((prop) => (
          <Prop key={prop.id} {...prop} mounted={mounted} reducedMotion={reducedMotion} />
        ))}

        {/* Children (logo, CTA, bubble) */}
        {children}
      </div>
    </div>
  );
}

function Layer({ id, src, style, mounted, reducedMotion, sway, animation }: {
  id: string; src: string; style: React.CSSProperties; mounted: boolean; reducedMotion: boolean;
  sway?: boolean; animation?: string;
}) {
  const initial = animation === "sunrise"
    ? { opacity: 0, y: "60%" }
    : {};
  const animate = mounted && !reducedMotion
    ? animation === "sunrise"
      ? { opacity: 1, y: 0 }
      : {}
    : animation === "sunrise"
      ? { opacity: 1, y: 0 }
      : {};

  return (
    <motion.div
      id={id}
      className="absolute"
      style={{ ...style, transformOrigin: "50% 92%" }}
      initial={initial}
      animate={animate}
      transition={animation === "sunrise" ? { duration: 2.1, delay: 0.15, ease: [0.2, 0.7, 0.3, 1] } : undefined}
    >
      <motion.img
        src={src}
        alt=""
        className="w-full h-full block"
        draggable={false}
        style={sway ? { transformOrigin: "50% 92%" } : undefined}
        animate={sway && mounted && !reducedMotion ? { rotate: [-1, 1, -1] } : {}}
        transition={sway ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
      />
    </motion.div>
  );
}

function Prop({ id, src, style, delay, mounted, reducedMotion, twinkle, bellSwing }: {
  id: string; src: string; style: React.CSSProperties; delay: number; mounted: boolean; reducedMotion: boolean;
  twinkle?: boolean; bellSwing?: boolean;
}) {
  return (
    <motion.div
      id={id}
      className="absolute"
      style={style}
      initial={{ opacity: 0, y: 10, scale: 0.85 }}
      animate={mounted && !reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <motion.img
        src={src}
        alt=""
        className="w-full h-full block"
        draggable={false}
        style={bellSwing ? { transformOrigin: "50% 8%" } : undefined}
        animate={
          twinkle && mounted && !reducedMotion
            ? { scale: [1, 1.1, 1], rotate: [0, 6, 0] }
            : bellSwing && mounted && !reducedMotion
              ? { rotate: [0, 7, 0] }
              : {}
        }
        transition={
          twinkle
            ? { duration: 2.6, repeat: Infinity, delay: 3.8, ease: "easeInOut" }
            : bellSwing
              ? { duration: 3, repeat: Infinity, delay: 3.9, ease: "easeInOut" }
              : undefined
        }
      />
    </motion.div>
  );
}
