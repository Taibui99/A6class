import { Skeleton } from "@/components/ui/skeleton";

/**
 * Màn chờ khi chuyển trang trong app (server component đang tải dữ liệu).
 * Cùng ngôn ngữ boot với bản prototype: panel navy + mark A6 vàng +
 * thanh shimmer + skeleton nội dung phía dưới.
 */
export default function AppLoading() {
  return (
    <div className="animate-fade-in space-y-6" aria-busy="true" aria-label="Đang tải">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-[#0d2540] px-6 py-10 text-center text-white shadow-xl">
        <svg
          viewBox="6 4 78 70"
          width="56"
          height="56"
          aria-hidden="true"
          className="entry-bob motion-reduce:animate-none"
        >
          <defs>
            <linearGradient
              id="appLoadApex"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFD964" />
              <stop offset="55%" stopColor="#FFC531" />
              <stop offset="100%" stopColor="#F5A800" />
            </linearGradient>
          </defs>
          <path
            d="M 18,62 L 38,16 L 58,62 H 44 L 38,48 H 28"
            stroke="url(#appLoadApex)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 58,62 C 68,62 72,52 70,42 C 67,32 54,32 46,40 C 40,46 42,58 52,60 C 60,61 66,54 64,44"
            stroke="url(#appLoadApex)"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <p className="text-sm font-bold">Đang tải dữ liệu lớp…</p>
        <div
          role="status"
          aria-label="Tiến trình tải"
          className="h-1.5 w-52 overflow-hidden rounded-full bg-white/15"
        >
          <span className="entry-progress block h-full w-1/3 rounded-full bg-[#38bdf8] motion-reduce:animate-none" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
    </div>
  );
}
