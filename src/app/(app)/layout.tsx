import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current";
import { getOnboardingState } from "@/lib/onboarding/service";
import { Brand } from "@/components/layout/brand";
import { UserMenu } from "@/components/layout/user-menu";
import { AnimatedPage } from "@/components/layout/animated-page";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isTeacher = user.role === "TEACHER";

  // Học sinh mới (đặc biệt là đăng nhập Google lần đầu) phải ghi rõ họ tên
  // và tổ trước khi vào app. Giáo viên bỏ qua.
  if (!isTeacher) {
    const { needed } = await getOnboardingState(user.id);
    if (needed) redirect("/onboarding");
  }

  return (
    <div className="bg-hello min-h-dvh md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      {/* Sidebar navy — chỉ desktop. Logo "A6" ăn theo currentColor nên
          bọc text-white để hiện trắng trên nền navy. */}
      <aside
        className="sticky top-0 hidden h-dvh flex-col gap-5 overflow-y-auto p-4 text-white md:flex"
        style={{
          backgroundImage: "linear-gradient(180deg,#0d2540 0%,#0a182e 100%)",
        }}
      >
        <div className="px-1 pt-1 text-white">
          <Brand size="sm" />
        </div>

        <SidebarNav isTeacher={isTeacher} />

        <div className="mt-auto overflow-hidden rounded-2xl bg-surface shadow-lg">
          <UserMenu user={user} variant="desktop" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Top bar gọn cho điện thoại (desktop đã có sidebar) */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface px-4 md:hidden">
          <Brand size="sm" />
          <div className="flex shrink-0 items-center gap-2">
            <UserMenu user={user} variant="mobile" />
          </div>
        </header>

        {/* Main content: padding đáy = chiều cao bottom nav + safe-area —
            nội dung cuối KHÔNG bị thanh điều hướng che. */}
        <main className="flex-1 pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-8">
          <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 lg:px-8">
            <AnimatedPage>{children}</AnimatedPage>
          </div>
        </main>

        {/* Bottom navigation bar cho điện thoại */}
        <BottomNav />
      </div>
    </div>
  );
}
