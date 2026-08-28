import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-10 text-center",
        className
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-surface-hover text-text-muted">
        <Icon aria-hidden="true" className="size-6" />
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