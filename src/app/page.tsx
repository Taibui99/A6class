import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  MessagesSquare,
  School,
  Sparkles,
  Trophy,
} from "lucide-react";

const rooms = [
  {
    icon: ClipboardList,
    tone: "bg-primary-light text-primary",
    title: "Nhiệm vụ",
    desc: "Việc của lớp được giao rõ ràng — ai nhận, ai làm, ai xong.",
  },
  {
    icon: Trophy,
    tone: "bg-warning-light text-warning",
    title: "Thi đua",
    desc: "Điểm số, bảng xếp hạng và thành tích của từng tổ, từng người.",
  },
  {
    icon: MessagesSquare,
    tone: "bg-success-light text-secondary",
    title: "Giao tiếp",
    desc: "Bảng tin, hỏi đáp và nhắn tin — nói chuyện thoải mái như ở lớp.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-extrabold text-white">
              A6
            </span>
            <span className="text-lg font-extrabold tracking-tight text-text">
              A6Class
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Vào lớp
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main id="main-content" className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
              <School aria-hidden className="size-3.5" />
              Lớp 11A6
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-5xl">
              Ngôi nhà số
              <br />
              của lớp 11A6
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              Nhiệm vụ, thi đua và những cuộc trò chuyện của cả lớp — gói gọn
              trong một nơi thân quen, mở ra mỗi ngày.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
              >
                Bắt đầu ngay
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-surface px-6 py-3 text-sm font-semibold text-text ring-1 ring-border transition-colors hover:bg-surface-hover"
              >
                Tôi đã có tài khoản
              </Link>
            </div>
          </div>
        </section>

        {/* Trong nhà có gì */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <h2 className="text-center text-xl font-extrabold tracking-tight text-text">
            Trong nhà có gì?
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            Ba góc nhỏ cho một năm học đầy hứng khởi.
          </p>
          <div className="mx-auto mt-8 max-w-xl divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border">
            {rooms.map((room) => (
              <div
                key={room.title}
                className="flex items-start gap-4 p-5 first:rounded-t-2xl last:rounded-b-2xl"
              >
                <span
                  aria-hidden
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${room.tone}`}
                >
                  <room.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-text">{room.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                    {room.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA cuối */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-warning/25 bg-warning-light p-8 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-white text-warning">
              <Sparkles aria-hidden className="size-6" />
            </span>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-text">
                Sẵn sàng về nhà?
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Tạo tài khoản trong 30 giây và bước vào ngôi nhà số của 11A6.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              Bắt đầu ngay
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-text-muted sm:px-6">
          A6Class © 2026 — Ngôi nhà số của Lớp 11A6
        </div>
      </footer>
    </div>
  );
}