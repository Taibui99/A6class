import { GraduationCap } from "lucide-react";

import { Mascot } from "@/components/mascot";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg px-4 py-8 sm:py-12">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-7 text-center">
          <div className="vt-mascot mx-auto w-fit">
            <Mascot size={64} />
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-text">
            {title}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
        </div>
        {children}
        {footer && <div className="mt-6">{footer}</div>}
      </main>

      <footer className="mx-auto w-full max-w-sm">
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-text-muted">
          <GraduationCap aria-hidden="true" className="size-3.5" />
          A6Class · Ngôi nhà số của lớp 12A6
        </p>
      </footer>
    </div>
  );
}