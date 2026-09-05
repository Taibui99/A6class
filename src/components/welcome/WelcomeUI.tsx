"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { isReducedMotion } from "@/lib/transition-nav";

interface WelcomeUIProps {
  onSignup?: () => void;
  onLogin?: () => void;
}

const LETTERS = [..."A6Class"];

export default function WelcomeUI({ onSignup, onLogin }: WelcomeUIProps) {
  const [mounted, setMounted] = useState(false);
  const reducedMotion = isReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Logo letter-bounce — z-index:11 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex gap-px"
        style={{ top: "3%", zIndex: 11 }}
      >
        {LETTERS.map((ch, i) => (
          <motion.span
            key={i}
            className="font-extrabold"
            style={{
              color: "#8C3B24",
              textShadow: "0 2px 0 rgba(255,255,255,.55)",
              fontSize: "clamp(18px,3.2vw,32px)",
              fontFamily: "'Be Vietnam Pro',sans-serif",
            }}
            initial={{ opacity: 0, y: -18 }}
            animate={mounted && !reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 + i * 0.06, ease: [0.34, 1.6, 0.5, 1] }}
          >
            {ch}
          </motion.span>
        ))}
      </div>

      {/* CTA buttons — z-index:12 */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col gap-2"
        style={{ bottom: "4%", width: "min(80%,360px)", zIndex: 12 }}
        initial={{ opacity: 0, y: 10 }}
        animate={mounted && !reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 4.6, ease: "easeOut" }}
      >
        <button
          onClick={onSignup}
          className="flex items-center justify-center gap-2 h-11 rounded-xl font-bold border-none cursor-pointer"
          style={{
            background: "linear-gradient(180deg,#3B82F6,#1E40AF)",
            color: "#fff",
            boxShadow: "0 5px 0 #16306E",
            fontSize: "clamp(12px,1.6vw,15px)",
            fontFamily: "'Be Vietnam Pro',sans-serif",
          }}
        >
          Đăng ký tham gia →
        </button>
        <button
          onClick={onLogin}
          className="flex items-center justify-center gap-2 h-11 rounded-xl font-bold cursor-pointer"
          style={{
            background: "#fff",
            color: "#16306E",
            border: "1px solid #E7E5E4",
            fontSize: "clamp(12px,1.6vw,15px)",
            fontFamily: "'Be Vietnam Pro',sans-serif",
          }}
        >
          Đã có tài khoản? Đăng nhập
        </button>
      </motion.div>
    </>
  );
}
