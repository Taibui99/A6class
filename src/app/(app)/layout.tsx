import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current";
import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
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
    <div className="min-h-dvh">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-md lg:hidden">
        <Brand size="sm" />
        <MobilePageTitle />
        <UserMenu user={user} variant="mobile" />
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Brand />
        </div>
        <SidebarNav />
        <UserMenu user={user} />
      </aside>

      {/* Main content */}
      <main className="min-h-dvh pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-64">
        <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <AnimatedPage>{children}</AnimatedPage>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}