"use client";

import { useEffect, useState } from "react";

function split(ms: number) {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="vt-led vt-led-neon text-3xl font-bold tabular-nums sm:text-4xl">
        {pad(value)}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
        {label}
      </span>
    </div>
  );
}

/**
 * Đồng hồ đếm ngược tới một sự kiện trong DB.
 *
 * Mốc đếm là `endsAt` do giáo viên đặt trong giao diện quản trị, không
 * hardcode trong code. Ban đầu render sẽ khớp 0 để server và client không
 * lệch nhau (React sẽ cảnh báo nếu render server khác lần đầu client).
 * Từ đó mới chạy đồng hồ trên máy người dùng.
 *
 * `onDone` chỉ bắn một lần khi đạt 0 — dùng cho chuỗi "đã kết thúc" thay
 * vì để con số đứng yên ở 00.
 */
export function LEDCountdown({
  endsAt,
  title,
  onDone,
}: {
  endsAt: string;
  title: string;
  onDone?: () => void;
}) {
  const target = new Date(endsAt).getTime();
  const valid = !Number.isNaN(target);
  const [now, setNow] = useState(() => target);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (Number.isNaN(target)) return;

    // Đặt trong closure của effect: mỗi lần đổi sự kiện là một lần chạy mới,
    // nên cờ "đã báo xong" không bị dính sang sự kiện kế tiếp.
    let doneReported = false;

    const tick = () => {
      const current = Date.now();
      const done = current >= target;
      setNow(current);
      setFinished(done);

      if (done && !doneReported) {
        doneReported = true;
        onDone?.();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (!valid) return null;

  const left = split(target - now);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-surface-2 px-5 py-4 text-center"
      role="timer"
      aria-live="off"
    >
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
        {finished ? "Đã kết thúc" : `Còn lại · ${title}`}
      </p>
      <div className="flex items-start justify-center gap-3 sm:gap-5">
        <Cell value={left.days} label="Ngày" />
        <span aria-hidden className="vt-led vt-led-neon pt-1 text-2xl opacity-40">
          :
        </span>
        <Cell value={left.hours} label="Giờ" />
        <span aria-hidden className="vt-led vt-led-neon pt-1 text-2xl opacity-40">
          :
        </span>
        <Cell value={left.minutes} label="Phút" />
        <span aria-hidden className="vt-led vt-led-neon pt-1 text-2xl opacity-40">
          :
        </span>
        <Cell value={left.seconds} label="Giây" />
      </div>
    </div>
  );
}