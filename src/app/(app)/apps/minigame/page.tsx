import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CloudCheck,
  Dices,
  Edit3,
  ExternalLink,
  Flame,
  HelpCircle,
  Monitor,
  Play,
  RotateCw,
  Sparkles,
  Trophy,
  UsersRound,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kho Minigame 12A6 — Trung Tâm Trò Chơi Lớp Học",
  description:
    "Tổng hợp các minigame đố vui, suy luận logic và vòng quay may mắn dành cho tập thể lớp 12A6. Tự động đồng bộ câu hỏi lên máy chủ đám mây.",
};

export default function MinigameHubPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* ── Top Bar & Breadcrumb ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/apps"
          className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary transition hover:text-text"
        >
          <ArrowLeft className="size-4" />
          Quay lại Kho công cụ
        </Link>

        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
          <CloudCheck className="size-4" />
          Cloud Sync: Tự động lưu & đồng bộ Server
        </span>
      </div>

      {/* ── Hero Banner ────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-surface to-surface-2 p-6 shadow-xl sm:p-10">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 size-72 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-500 ring-1 ring-amber-500/30">
              <Sparkles className="size-3.5" />
              A6 LEGENDS · GAME HUB
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-400">
              <Monitor className="size-3.5" />
              Chuẩn Fullscreen 16:9 Máy Chiếu
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-text sm:text-4xl">
            Kho Minigame & Vòng Quay 12A6 🎮
          </h1>

          <p className="max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
            Tổng hợp các trò chơi đố vui, suy luận logic đỉnh cao, kiểm tra kiến thức và vòng quay chọn người ngẫu nhiên được thiết kế riêng cho tập thể lớp 12A6. Bạn có thể tự chỉnh sửa câu hỏi trên máy tính cá nhân — <b>hệ thống sẽ tự động lưu lên Cloud Server</b> để máy chiếu lớp học nhận ngay lập tức!
          </p>
        </div>
      </section>

      {/* ── Game Cards Grid ────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-text sm:text-xl">
            Danh sách trò chơi đang hoạt động
          </h2>
          <span className="text-xs font-bold text-text-muted">
            Mở trên máy chiếu là chơi ngay
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── GAME 1: 100 TÚI MÙ & VÒNG QUAY 12A6 ──────────────── */}
          <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-surface p-6 shadow-lg transition hover:-translate-y-1 hover:border-amber-500/70 hover:shadow-amber-500/10 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-3xl shadow-md shadow-amber-500/30">
                    🎁
                  </span>
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-amber-500">
                      <Flame className="size-3.5" /> Hot nhất lớp 12A6
                    </span>
                    <h3 className="text-xl font-black text-text sm:text-2xl">
                      100 Túi Mù May Mắn & Vòng Quay
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-text-secondary">
                100 chiếc túi mù ngẫu nhiên: <b>23 câu Suy luận logic đỉnh cao</b>, <b>23 câu Toán & Lí 12 giữa kì 1</b>, <b>18 câu đố mẹo xàm hài hước</b>, 9 câu thơ dân gian, thẻ bảo bối may mắn, hình phạt hít đất và <b>Vòng quay chọn 36 bạn học sinh</b>!
              </p>

              {/* Badges / Features */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-bold">
                <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-amber-400">
                  🎁 100 Túi mù độc bản
                </span>
                <span className="rounded-lg bg-rose-500/15 px-2.5 py-1 text-rose-400">
                  🧠 23 Câu suy luận logic
                </span>
                <span className="rounded-lg bg-sky-500/15 px-2.5 py-1 text-sky-400">
                  🎡 Vòng quay 36 bạn 12A6
                </span>
                <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-emerald-400">
                  ☁️ Tự động lưu Server
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <Link
                href="/minigame-20-10"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-5 text-sm font-black text-slate-950 shadow-md shadow-amber-500/25 transition hover:brightness-110"
              >
                <Play className="size-4 fill-current" />
                Vào chơi ngay 🚀
              </Link>
              <Link
                href="/minigame-20-10?tab=edit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-sm font-bold text-text transition hover:bg-surface-hover"
                title="Chỉnh sửa câu hỏi, đáp án và thời gian đếm ngược"
              >
                <Edit3 className="size-4" />
                Sửa câu hỏi ✏️
              </Link>
              <Link
                href="/minigame-20-10?wheel=1"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-sm font-bold text-text transition hover:bg-surface-hover"
                title="Mở riêng Vòng quay chọn người ngẫu nhiên"
              >
                <RotateCw className="size-4" />
                Vòng quay 🎡
              </Link>
            </div>
          </article>

          {/* ── GAME 2: NHANH NHƯ CHỚP ⚡ VẬT LÍ 12 ──────────────── */}
          <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-lg transition hover:-translate-y-1 hover:border-sky-500/60 hover:shadow-sky-500/10 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-3xl shadow-md shadow-sky-500/30">
                    ⚡
                  </span>
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-sky-400">
                      <Zap className="size-3.5" /> Kiểm tra bài cũ Gameshow
                    </span>
                    <h3 className="text-xl font-black text-text sm:text-2xl">
                      Nhanh Như Chớp ⚡ Vật Lí 12
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-text-secondary">
                Game kiểm tra bài cũ Vật lí 12 theo format Gameshow truyền hình: trắc nghiệm & điền khuyết, các tổ/đội bấm chuông giành quyền trả lời tính điểm thi đua, đồng hồ 20s khẩn cấp, các quyền trợ giúp 50:50, hỏi cả lớp và gợi ý.
              </p>

              {/* Badges / Features */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-bold">
                <span className="rounded-lg bg-sky-500/15 px-2.5 py-1 text-sky-400">
                  👥 Đấu tổ & đội
                </span>
                <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-emerald-400">
                  ⏱️ Đồng hồ 20s khẩn cấp
                </span>
                <span className="rounded-lg bg-violet-500/15 px-2.5 py-1 text-violet-400">
                  ✂️ Trợ giúp 50:50 & Gợi ý
                </span>
                <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-amber-400">
                  🏆 Tính điểm thi đua
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <Link
                href="/nhanh-nhu-chop"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-black text-slate-950 shadow-md shadow-sky-500/25 transition hover:bg-sky-400"
              >
                <Zap className="size-4 fill-current" />
                Vào chơi ngay ⚡
              </Link>
              <Link
                href="/apps/tram-gia-dinh"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-sm font-bold text-text transition hover:bg-surface-hover"
                title="Soạn câu hỏi & quản lý ngân hàng đề"
              >
                <Edit3 className="size-4" />
                Soạn slide đề
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* ── TOOL: VÒNG QUAY CHỌN BẠN ĐỘC LẬP ───────────────────── */}
      <section className="overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-500/20 text-3xl shadow-inner">
              🎡
            </span>
            <div className="space-y-1">
              <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-violet-400">
                Tiện ích lớp học
              </span>
              <h3 className="text-lg font-black text-text sm:text-xl">
                Vòng Quay Chọn Bạn 12A6 (Bốc thăm ngẫu nhiên)
              </h3>
              <p className="max-w-2xl text-sm text-text-secondary">
                Vòng quay âm thanh sôi động với danh sách 36 bạn học sinh 12A6. Phù hợp khi cần chọn người lên bảng kiểm tra bài cũ, làm việc nhóm hoặc bốc thăm may mắn nhận quà.
              </p>
            </div>
          </div>
          <Link
            href="/minigame-20-10?wheel=1"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 text-sm font-bold text-violet-300 transition hover:bg-violet-500/20"
          >
            <RotateCw className="size-4" />
            Mở Vòng Quay 🎡
          </Link>
        </div>
      </section>

      {/* ── Guide / Tips Section ──────────────────────────────── */}
      <section className="space-y-4 rounded-3xl border border-border bg-surface-2/60 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-amber-500">
          <HelpCircle className="size-4" />
          Mẹo hữu ích cho Giáo viên & Quản trò máy chiếu
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 rounded-2xl border border-border bg-surface p-4">
            <span className="text-xl">📺</span>
            <h4 className="text-sm font-bold text-text">Chiếu Fullscreen 16:9</h4>
            <p className="text-xs leading-relaxed text-text-secondary">
              Bấm nút <b>Toàn màn hình</b> hoặc nhấn phím <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[11px]">F11</kbd> trên bàn phím máy tính để chữ phóng to vừa khít máy chiếu, không bị vướng viền trình duyệt.
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-border bg-surface p-4">
            <span className="text-xl">☁️</span>
            <h4 className="text-sm font-bold text-text">Tự động đồng bộ Server</h4>
            <p className="text-xs leading-relaxed text-text-secondary">
              Mọi chỉnh sửa câu hỏi hay danh sách tên trong vòng quay đều tự động lưu lên máy chủ. Bạn sửa ở nhà, lên lớp mở máy chiếu là có ngay mà không cần chuyển file!
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-border bg-surface p-4">
            <span className="text-xl">⏱️</span>
            <h4 className="text-sm font-bold text-text">Tự động dừng khi mở đáp án</h4>
            <p className="text-xs leading-relaxed text-text-secondary">
              Khi học sinh trả lời xong, quản trò bấm <b>HIỆN ĐÁP ÁN</b> thì đồng hồ đếm ngược sẽ tự động đóng băng số giây còn lại để cả lớp cùng theo dõi lời giải.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
