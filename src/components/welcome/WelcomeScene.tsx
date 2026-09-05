"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { isReducedMotion } from "@/lib/transition-nav";

interface WelcomeSceneProps {
  onReady?: () => void;
  children?: React.ReactNode;
}

export default function WelcomeScene({ onReady, children }: WelcomeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const reducedMotion = isReducedMotion();

  useEffect(() => {
    setMounted(true);
    onReady?.();
  }, [onReady]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = ((e.clientX - cx) / (rect.width / 2)) * 6;
      const dy = ((e.clientY - cy) / (rect.height / 2)) * 3;
      containerRef.current.style.setProperty("--px", `${dx}px`);
      containerRef.current.style.setProperty("--py", `${dy}px`);
    },
    [reducedMotion],
  );

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "3/2", borderRadius: 22, boxShadow: "0 20px 50px rgba(60,40,30,.18)" }}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          background: "linear-gradient(180deg,#F6C6A8 0%,#F8D3B9 26%,#FBE0C9 46%,#FDECDD 66%,#FEF6ED 84%,#FFFBF6 100%)",
          ["--px" as string]: "0px",
          ["--py" as string]: "0px",
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Scene background — single composed image, pixel-perfect */}
        <img
          src="/assets/welcome/scene.png"
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Robot — animatable overlay */}
        <motion.div
          className="absolute"
          style={{
            left: "50%", top: "33.50%", width: "20.25%", height: "40.23%", zIndex: 8,
          }}
          initial={{ opacity: 0, x: "-60%", y: "10%", scale: 0.85 }}
          animate={mounted && !reducedMotion
            ? { opacity: 1, x: 0, y: 0, scale: 1 }
            : { opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 2.15, ease: [0.22, 0.9, 0.3, 1.15] }}
        >
          {/* Idle bob */}
          <motion.div
            className="w-full h-full"
            animate={mounted && !reducedMotion
              ? { y: [0, "-1.5%", 0], rotate: [0, -1.2, 0] }
              : {}}
            transition={{ duration: 3.3, repeat: Infinity, delay: 3.2, ease: "easeInOut" }}
          >
            {/* Greet wiggle */}
            <motion.div
              className="w-full h-full"
              animate={mounted && !reducedMotion
                ? { rotate: [0, -4, 2, 0, -4, 2, 0, -4, 2, 0] }
                : {}}
              transition={{
                duration: 1.65, delay: 3.1,
                times: [0, 0.35, 0.65, 1, 0.35, 0.65, 1, 0.35, 0.65, 1],
              }}
              style={{ transformOrigin: "70% 55%", position: "relative", width: "100%", height: "100%" }}
            >
              <img
                src="/assets/welcome/robot.png"
                alt="Robot A6Class"
                className="w-full h-full"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </motion.div>

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

        {/* Children — logo, bubble, CTA */}
        {children}
      </div>
    </div>
  );
}
