import { GraduationCap } from "lucide-react";

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
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-lg font-extrabold tracking-tight text-white shadow-sm">
            A6
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-text">
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
          A6Class · Ngôi nhà số của lớp 11A6
        </p>
      </footer>
    </div>
  );
}