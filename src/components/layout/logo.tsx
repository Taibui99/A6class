import { cn } from "@/lib/utils";

const NAME = "A6Class";
const SUB = "12A6";

const sizes = {
  sm: {
    tile: "rounded-xl px-2.5 py-1.5",
    name: "text-[11px]",
    sub: "mt-0.5 text-[8px] tracking-[0.28em]",
  },
  md: {
    tile: "rounded-2xl px-3.5 py-2.5",
    name: "text-base",
    sub: "mt-1 text-[9px] tracking-[0.32em]",
  },
  lg: {
    tile: "rounded-[1.7rem] px-6 py-4",
    name: "text-3xl sm:text-4xl",
    sub: "mt-1.5 text-xs sm:text-sm tracking-[0.34em]",
  },
} as const;

export function Logo({
  size = "md",
  animate = false,
  className,
}: {
  size?: keyof typeof sizes;
  animate?: boolean;
  className?: string;
}) {
  const s = sizes[size];

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center bg-gradient-to-b from-primary to-primary-hover text-center",
        s.tile,
        "shadow-lg shadow-primary/25",
        className
      )}
    >
      <span
        aria-label="A6Class 12A6"
        role={animate ? "img" : undefined}
        className={cn("leading-none text-white", s.name, "font-extrabold tracking-tight")}
      >
        {NAME.split("").map((ch, i) => (
          <span
            key={i}
            className={cn(animate && "logo-letter inline-block")}
            style={animate ? { animationDelay: `${i * 90}ms` } : undefined}
          >
            {ch}
          </span>
        ))}
      </span>
      <span
        className={cn(
          "font-bold text-amber-300",
          s.sub,
          "leading-none",
          animate && "logo-sub inline-block"
        )}
      >
        {SUB}
      </span>
    </div>
  );
}