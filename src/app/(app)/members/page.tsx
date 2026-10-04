import type { Metadata } from "next";

import { MembersDirectory } from "@/components/class/members-directory";
import { getMembersPageData } from "@/lib/members";
import { getMyClass } from "@/lib/classes/service";

export async function generateMetadata(): Promise<Metadata> {
  const klass = await getMyClass();
  const data = klass ? await getMembersPageData(klass.id) : null;

  if (!data || data.members.length === 0) {
    return {
      title: "Thành viên · A6Class",
      description: "Danh bạ thành viên và các tổ của lớp.",
    };
  }

  return {
    title: `Thành viên & ${data.teams.length} tổ · ${data.className}`,
    description: `Danh sách ${data.members.length} thành viên, ${data.officerCount} cán sự và ${data.teams.length} tổ thi đua của ${data.className}.`,
  };
}

export default async function MembersPage() {
  const klass = await getMyClass();

  if (!klass) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-[1300px] px-3 py-5 sm:px-5">
        <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-text-muted">
          Bạn chưa được thêm vào lớp nào.
        </p>
      </main>
    );
  }

  const data = await getMembersPageData(klass.id);

  return (
    <main id="main-content" className="mx-auto w-full max-w-[1300px] px-3 py-5 sm:px-5">
      <MembersDirectory data={data} />
    </main>
  );
}