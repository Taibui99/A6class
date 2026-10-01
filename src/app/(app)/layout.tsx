import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current";
import { Brand } from "@/components/layout/brand";
import { HomeTaskLink } from "@/components/layout/home-task-link";
import { UserMenu } from "@/components/layout/user-menu";
import { MobilePageTitle } from "@/components/layout/mobile-page-title";
import { AnimatedPage } from "@/components/layout/animated-page";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="bg-hello min-h-dvh">
      {/* Top bar duy nhất — không có danh sách tab điều hướng */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border bg-surface/95 px-4 backdrop-blur-md">
        <Brand size="sm" markClassName="vt-mascot-topbar" />
        <MobilePageTitle />
        <div className="flex shrink-0 items-center gap-1.5">
          <HomeTaskLink />
          <UserMenu user={user} variant="mobile" />
        </div>
      </header>

      <main className="min-h-dvh">
        <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <AnimatedPage>{children}</AnimatedPage>
        </div>
      </main>
    </div>
  );
}