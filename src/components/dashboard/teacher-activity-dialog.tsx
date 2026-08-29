"use client";

import { useState } from "react";
import {
  Bell,
  ClipboardCheck,
  FileText,
  Megaphone,
  Newspaper,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ActivityItem = {
  id: string;
  kind: "POINT" | "SUBMISSION" | "REPORT" | "ANNOUNCEMENT" | "POST";
  title: string;
  detail: string;
};

const kindMeta: Record<
  ActivityItem["kind"],
  { icon: LucideIcon; tone: string }
> = {
  POINT: { icon: Trophy, tone: "bg-warning-light text-warning" },
  SUBMISSION: { icon: ClipboardCheck, tone: "bg-success-light text-secondary" },
  REPORT: {
    icon: FileText,
    tone: "bg-surface-hover text-text-secondary ring-1 ring-border",
  },
  ANNOUNCEMENT: { icon: Megaphone, tone: "bg-primary-light text-primary" },
  POST: { icon: Newspaper, tone: "bg-primary-light text-primary" },
};

export function TeacherActivityDialog({
  activities,
}: {
  activities: ActivityItem[];
}) {
  const [open, setOpen] = useState(true);
  if (activities.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            aria-hidden
            className="flex size-10 items-center justify-center rounded-xl bg-primary-light text-primary"
          >
            <Bell className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-text">
              Hoạt động 24 giờ qua
            </DialogTitle>
            <DialogDescription className="mt-1">
              Những việc vừa báo cáo và diễn ra trong lớp. Nhấn vào một mục để
              xem chi tiết, hoặc X để vào trang chính.
            </DialogDescription>
          </div>
        </DialogHeader>

        <ul className="max-h-64 space-y-0.5 overflow-y-auto pr-1">
          {activities.map((a) => {
            const meta = kindMeta[a.kind];
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-hover"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg",
                      meta.tone
                    )}
                  >
                    <meta.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text">
                      {a.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-text-muted">
                      {a.detail}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Xem ngay</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}