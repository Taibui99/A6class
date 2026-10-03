import type { Metadata } from "next";

import {
  ClassInfoForm,
  CreateClassForm,
} from "@/components/class/class-forms";
import { RosterImport } from "@/components/class/roster-import";
import { RosterTable } from "@/components/class/roster-table";
import { TeamManager } from "@/components/class/team-manager";
import { getCurrentUser } from "@/lib/auth/current";
import * as service from "@/lib/classes/service";

export const metadata: Metadata = {
  title: "Dữ liệu lớp · A6Class",
  description: "Giáo viên tự nhập lớp, danh sách học sinh và các tổ.",
};

export const dynamic = "force-dynamic";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface p-5 ring-1 ring-border sm:p-6">
      <h2 className="text-base font-bold text-text">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function ClassPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-12">
        <p className="rounded-2xl bg-surface p-6 text-sm text-text ring-1 ring-border">
          Chưa đăng nhập.
        </p>
      </main>
    );
  }

  if (user.role !== "TEACHER") {
    return (
      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="rounded-2xl bg-surface p-6 ring-1 ring-border">
          <h1 className="text-lg font-bold text-text">
            Trang này dành cho giáo viên
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Danh sách lớp và các tổ do giáo viên phụ trách quản lý. Bạn có thể xem
            tổ của mình ở trang thi đua.
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

  const klass = await service.getMyClass();

  if (!klass) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">Dữ liệu lớp</h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Bạn chưa có lớp nào. Tạo lớp trước, rồi nhập danh sách học sinh.
          </p>
        </div>
        <div className="rounded-2xl bg-surface p-5 ring-1 ring-border sm:p-6">
          <CreateClassForm />
        </div>
      </main>
    );
  }

  const roster = await service.getClassRoster(klass.id);

  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text">Dữ liệu lớp</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          {klass.name} · {klass.schoolYear} ·{" "}
          {roster?.memberships.length ?? 0} học sinh
        </p>
      </header>

      <div className="space-y-5">
        <Section
          title="Thông tin lớp"
          description="Tên lớp và năm học hiện trên đầu các trang."
        >
          <ClassInfoForm
            klass={{
              id: klass.id,
              name: klass.name,
              schoolYear: klass.schoolYear,
              school: klass.school,
            }}
          />
        </Section>

        <Section
          title="Nhập danh sách học sinh"
          description="Dán từ Excel hoặc Google Sheets. Nhập lại nhiều lần được — học sinh trùng email sẽ được cập nhật chứ không tạo bản sao."
        >
          <RosterImport classId={klass.id} />
        </Section>

        <Section
          title="Các tổ"
          description="Tổ dùng để chấm điểm và xếp hạng thi đua."
        >
          <TeamManager
            classId={klass.id}
            teams={roster?.teams ?? []}
          />
        </Section>

        <Section
          title="Học sinh trong lớp"
          description="Sửa tên, đổi tổ hoặc đổi chức vụ cho từng người."
        >
          <RosterTable
            students={roster?.memberships ?? []}
            teams={(roster?.teams ?? []).map((t) => ({ id: t.id, name: t.name }))}
          />
        </Section>
      </div>
    </main>
  );
}
