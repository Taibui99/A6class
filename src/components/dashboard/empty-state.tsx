import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Mascot } from "@/components/mascot";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  mascot = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  mascot?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-10 text-center",
        className
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-full bg-surface-hover",
          mascot ? "size-16" : "size-12 text-text-muted"
        )}
      >
        {mascot ? (
          <Mascot size={56} />
        ) : (
          <Icon aria-hidden="true" className="size-6" />
        )}
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-text-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}