import type { Metadata } from "next";

import CompetitionArena from "@/components/competition/competition-arena";
import { loadCompetition } from "@/lib/competition/query";

export const metadata: Metadata = {
  title: "Thi đua hàng tuần · Lớp 12A6",
  description: "Bảng theo dõi thi đua hàng tuần của lớp 12A6, nhập điểm theo tổ và xem xếp hạng.",
};

export default async function CompetitionPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const viewPeriodId = sp.period && /^[a-z0-9]+$/i.test(sp.period) ? sp.period : undefined;

  let data: Awaited<ReturnType<typeof loadCompetition>>;
  try {
    data = await loadCompetition(viewPeriodId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Không tải được dữ liệu thi đua.";
    return (
      <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="rounded-2xl bg-surface p-6 ring-1 ring-border">
          <h1 className="text-lg font-bold text-text">Chưa có dữ liệu thi đua</h1>
          <p className="mt-2 text-sm text-muted">{message}</p>
          <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-muted">
            <li>
              Tạo lớp <b className="text-text">12A6 · 2026-2027</b>, 4 tổ và 36 thành viên.
            </li>
            <li>
              Nạp 22 tiêu chí chấm điểm theo đúng file Excel.
            </li>
            <li>Mở lại trang này.</li>
          </ol>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-canvas p-3 text-xs text-muted">
            npx tsx scripts/seed-competition.ts
          </pre>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-5">
      <CompetitionArena data={data} viewPeriodId={viewPeriodId ?? null} />
    </main>
  );
}