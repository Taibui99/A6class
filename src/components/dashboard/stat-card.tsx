import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "secondary";

const toneStyles: Record<Tone, { icon: string; dot: string }> = {
  primary: { icon: "bg-primary-light text-primary", dot: "bg-primary" },
  accent: { icon: "bg-warning-light text-warning", dot: "bg-warning" },
  secondary: { icon: "bg-success-light text-secondary", dot: "bg-secondary" },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "primary",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  tone?: Tone;
  className?: string;
}) {
  const style = toneStyles[tone];

  return (
    <div className={cn("relative rounded-xl bg-surface p-4 ring-1 ring-border", className)}>
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1 rounded-t-xl", style.dot)} />
      <div className="flex items-center gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", style.icon)}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">{label}</p>
          <p className="truncate text-xl font-bold tracking-tight text-text">
            {value}
          </p>
          {sub && <p className="truncate text-xs text-text-secondary">{sub}</p>}
        </div>
      </div>
    </div>
  );
}