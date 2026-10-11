import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current";
import { getMyClass } from "@/lib/classes/service";
import { getAttendanceRoster, getDayRecords, todayISO } from "@/lib/attendance/service";
import { AttendanceBoard } from "@/components/attendance/attendance-board";

export const metadata = {
  title: "Điểm danh · A6Class",
  description: "Điểm danh học sinh theo ngày.",
};

export const dynamic = "force-dynamic";

function validDate(v: string | undefined): string {
  if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return todayISO();
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const klass = await getMyClass();
  if (!klass) redirect("/class");

  if (user.role !== "TEACHER") {
    return (
      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="text-xl font-extrabold tracking-tight text-text sm:text-2xl">
            Điểm danh
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Sổ điểm danh do giáo viên quản lý. Em xem điểm thi đua của mình ở
            trang Thi đua nhé.
          </p>
          <a
            href="/competition"
            className="mt-4 inline-flex h-9 items-center rounded-xl bg-primary/10 px-3.5 text-xs font-bold text-primary ring-1 ring-primary/30"
          >
            Về trang thi đua
          </a>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const date = validDate(params?.date);
  const [roster, records] = await Promise.all([
    getAttendanceRoster(klass.id),
    getDayRecords(klass.id, date),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight text-text sm:text-2xl">
          Điểm danh
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          {klass.name} · Mặc định cả lớp có mặt, chỉ cần đánh dấu bạn vắng hoặc
          có phép.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-md sm:p-6">
        <AttendanceBoard
          classId={klass.id}
          date={date}
          students={roster}
          records={records}
        />
      </section>
    </div>
  );
}
