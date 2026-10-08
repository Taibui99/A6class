import { cn } from "@/lib/utils";

const sizes = {
  sm: "w-[124px]",
  md: "w-[164px]",
  lg: "w-[228px]",
} as const;

/**
 * Logo A6 Apex Delta: chữ A + số 6 vẽ bằng nét, dải gradient
 * #00F2FE → #4FACFE → #6B11FF, chữ "CLASS" màu primary xanh, chấm vàng gold.
 *
 * `id` cố định vì mọi bản sao đều vẽ cùng một gradient: trình duyệt lấy
 * định nghĩa đầu tiên, mà các bản sao giống hệt nhau nên không sai khác.
 */
export function Logo({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 280 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A6Class"
      className={cn("h-auto shrink-0", sizes[size], className)}
    >
      <defs>
        <linearGradient id="a6apexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <filter id="a6apexGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            floodColor="#06B6D4"
            floodOpacity="0.3"
          />
        </filter>
      </defs>

      <g filter="url(#a6apexGlow)">
        <path
          d="M 18,62 L 38,16 L 58,62 H 44 L 38,48 H 28"
          stroke="url(#a6apexGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 58,62 C 68,62 72,52 70,42 C 67,32 54,32 46,40 C 40,46 42,58 52,60 C 60,61 66,54 64,44"
          stroke="url(#a6apexGrad)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* "A6" để trắng thay vì #0F172A của bản gốc: navy gần như đen,
          gần như vô hình trên nền tối. Màu viết thẳng hex để logo không
          phụ thuộc token ngoài — dùng được cả ngoài app (favicon, email). */}
      <text
        x="96"
        y="48"
        fontFamily="'Be Vietnam Pro', 'Inter', sans-serif"
        fontWeight="900"
        fontSize="30"
        fill="#0B1220"
        letterSpacing="-1"
      >
        A6
        <tspan fill="#2563EB">CLASS</tspan>
      </text>
      <circle cx="242" cy="42" r="4" fill="#FFB800" />
    </svg>
  );
}