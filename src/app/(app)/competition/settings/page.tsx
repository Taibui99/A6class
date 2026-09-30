import type { Metadata } from "next";

import CriterionSettings from "@/components/competition/criterion-settings";
import { CRITERION_GROUPS } from "@/lib/competition/config";
import * as service from "@/lib/competition/service";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Cấu hình điểm thi đua · Lớp 12A6",
  description: "Giáo viên chỉnh mức điểm cộng/trừ cho từng tiêu chí thi đua.",
};

export const dynamic = "force-dynamic";

export default async function CompetitionSettingsPage() {
  const klass = await service.getClass();
  if (!klass) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-12">
        <p className="rounded-2xl bg-surface p-6 text-sm text-muted ring-1 ring-border">
          Chưa có lớp 12A6. Chạy <code>npx tsx scripts/seed-competition.ts</code> trước.
        </p>
      </main>
    );
  }

  let access;
  try {
    ({ access } = await service.getAccessForPeriod(null, klass.id));
  } catch (e) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-12">
        <p className="rounded-2xl bg-surface p-6 text-sm text-muted ring-1 ring-border">
          {e instanceof Error ? e.message : "Không tải được quyền."}
        </p>
      </main>
    );
  }

  if (!access.isTeacher) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="rounded-2xl bg-surface p-6 ring-1 ring-border">
          <h1 className="text-lg font-bold text-text">Chỉ giáo viên mới chỉnh được mức điểm</h1>
          <p className="mt-2 text-sm text-muted">
            Bạn có thể xem và nhập điểm ở trang thi đua, nhưng mức điểm của từng tiêu chí do giáo viên
            quyết định.
          </p>
          <a
            href="/competition"
            className="mt-4 inline-flex h-9 items-center rounded-xl bg-sky-500/15 px-3.5 text-xs font-bold text-sky-300 ring-1 ring-sky-500/30"
          >
            Về trang thi đua
          </a>
        </div>
      </main>
    );
  }

  const criteria = await prisma.criterion.findMany({
    where: { classId: klass.id },
    select: { id: true, key: true, label: true, kind: true, points: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });

  const byKey = new Map(criteria.map((c) => [c.key, c]));
  const groups = CRITERION_GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    kind: g.kind,
    input: g.input,
    criteria: g.criteria
      .map((d) => byKey.get(d.key))
      .filter((c): c is NonNullable<typeof c> => Boolean(c)),
  })).filter((g) => g.criteria.length > 0);

  return (
    <main id="main-content" className="mx-auto w-full max-w-[1000px] px-3 py-5 sm:px-5">
      <CriterionSettings classId={klass.id} groups={groups} />
    </main>
  );
}