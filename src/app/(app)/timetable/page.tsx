import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current";
import { getMyClass } from "@/lib/classes/service";
import { getSlots } from "@/lib/timetable/service";
import { TimetableGrid } from "@/components/timetable/timetable-grid";

export const metadata = {
  title: "Thời khóa biểu · A6Class",
  description: "Lịch học các tiết trong tuần.",
};

export const dynamic = "force-dynamic";

export default async function TimetablePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const klass = await getMyClass();
  if (!klass) redirect("/class");

  const slots = await getSlots(klass.id);
  const canEdit = user.role === "TEACHER";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight text-text sm:text-2xl">
          Thời khóa biểu
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          {klass.name} · Lịch học T2–T7
          {canEdit ? ", bấm vào ô để sửa." : "."}
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-md sm:p-6">
        <TimetableGrid classId={klass.id} slots={slots} canEdit={canEdit} />
      </section>
    </div>
  );
}
