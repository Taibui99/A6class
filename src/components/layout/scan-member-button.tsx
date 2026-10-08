"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QrCode, X } from "lucide-react";

export function ScanMemberButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="vt-btn-gold hidden h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold sm:inline-flex"
      >
        <QrCode aria-hidden className="size-3.5" />
        Quét thành viên
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scan-member-title"
        >
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#0B1220]/90"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] p-6 text-white shadow-lg">
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="vt-scan-line top-0" />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="scan-member-title" className="vt-led vt-led-neon text-lg font-bold">
                  Quét thành viên
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  Đưa mã QR của học sinh vào khung bên dưới.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>

            <div className="mt-5 grid aspect-square place-items-center rounded-xl border border-dashed border-white/20 bg-black/30">
              <QrCode aria-hidden className="size-16 text-white/15" />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/members?scan=1");
                }}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-white/10 text-xs font-bold text-white transition hover:bg-white/20"
              >
                Mở danh bạ thành viên
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-white/5 text-xs font-bold text-white/70 ring-1 ring-white/15 transition hover:bg-white/10"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}