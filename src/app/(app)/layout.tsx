import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current";
import { Brand } from "@/components/layout/brand";
import { UserMenu } from "@/components/layout/user-menu";
import { MobilePageTitle } from "@/components/layout/mobile-page-title";
import { AnimatedPage } from "@/components/layout/animated-page";
import { NavTabs } from "@/components/layout/nav-tabs";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ScanMemberButton } from "@/components/layout/scan-member-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isTeacher = user.role === "TEACHER";

  return (
    <div className="bg-hello min-h-dvh flex flex-col">
      {/* Top bar với logo + desktop nav tabs + user menu */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Brand size="sm" />
          <NavTabs isTeacher={isTeacher} />
        </div>

        <div className="md:hidden">
          <MobilePageTitle />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ScanMemberButton />
          <UserMenu user={user} variant="mobile" />
        </div>
      </header>

      {/* Main content với padding đáy cho mobile bottom bar */}
      <main className="flex-1 pb-20 md:pb-8">
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 lg:px-8">
          <AnimatedPage>{children}</AnimatedPage>
        </div>
      </main>

      {/* Bottom navigation bar cho điện thoại */}
      <BottomNav isTeacher={isTeacher} />
    </div>
  );
}