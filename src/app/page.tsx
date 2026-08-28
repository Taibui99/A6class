import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">A6</span>
            </div>
            <span className="font-bold text-lg text-text">A6Class</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main id="main-content" className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text leading-tight tracking-tight">
              Ngôi nhà số
              <br />
              của lớp 11A6
            </h1>
            <p className="mt-4 text-lg text-text-secondary leading-relaxed">
              Quản lý lớp học, phân công nhiệm vụ, thi đua bứt phá, giao tiếp
              liền mạch — tất cả trong một nền tảng duy nhất.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
              >
                Bắt đầu ngay
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-text border border-border hover:bg-surface-hover rounded-lg transition-colors"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-xl font-bold text-text mb-8">
              Mọi thứ lớp bạn cần
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="p-5 rounded-lg border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center mb-3">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-text mb-1">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-text-muted">
          A6Class © 2026 — Lớp 11A6
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Quản lý nhiệm vụ",
    description:
      "Giao việc, theo dõi tiến độ, nộp bài, chấm điểm — tất cả theo thời gian thực.",
    icon: ClipboardIcon,
  },
  {
    title: "Thi đua lớp học",
    description:
      "Bảng xếp hạng cá nhân và theo đội, tích điểm, thành tích — khuyến khích cạnh tranh lành mạnh.",
    icon: TrophyIcon,
  },
  {
    title: "Bảng tin lớp",
    description:
      "Đăng bài, bình luận, phản ứng — nơi cả lớp cùng tương tác và chia sẻ.",
    icon: FeedIcon,
  },
  {
    title: "Hỏi đáp kiến thức",
    description:
      "Học sinh hỏi, bạn bè trả lời, cộng đồng cùng tiến bộ.",
    icon: QuestionIcon,
  },
  {
    title: "Nhắn tin trực tiếp",
    description:
      "Chat cá nhân, chat nhóm, gửi hình ảnh và tin nhắn thoại — giao tiếp liền mạch.",
    icon: ChatIcon,
  },
  {
    title: "Phân quyền rõ ràng",
    description:
      "Giáo viên, lớp trưởng, tổ trưởng — mỗi người một vai trò, một tầm nhìn.",
    icon: RoleIcon,
  },
];

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/>
    </svg>
  );
}

function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}

function FeedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>
    </svg>
  );
}

function QuestionIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <path d="M12 17h.01"/>
    </svg>
  );
}

function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  );
}

function RoleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
