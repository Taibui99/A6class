import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current";
import { getOnboardingState } from "@/lib/onboarding/service";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata = {
  title: "Hoàn tất hồ sơ · A6Class",
  description: "Học sinh mới ghi rõ họ tên và tổ trước khi vào lớp.",
};

export const dynamic = "force-dynamic";

/**
 * Nằm NGOÀI nhóm (app) nên gate trong (app)/layout không đá vòng lặp ở đây.
 * Vào đây mà không cần khai gì nữa thì về dashboard luôn.
 */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "TEACHER") redirect("/dashboard");

  const state = await getOnboardingState(user.id);
  if (!state.needed) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-md sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">
          Chào mừng đến với lớp
        </p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-text sm:text-2xl">
          Khai hồ sơ một chút nhé
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Ghi rõ họ tên và tổ để thầy/cô nhận ra em. Làm một lần duy nhất.
        </p>
        <div className="mt-5">
          <OnboardingForm
            fullName={state.fullName}
            membership={state.membership}
            classes={state.classes}
          />
        </div>
      </div>
    </main>
  );
}
