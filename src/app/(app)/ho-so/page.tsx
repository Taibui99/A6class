import { redirect } from "next/navigation";
import { GraduationCap, Mail, Trophy, Users } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current";
import { getDashboardSummary } from "@/lib/dashboard";
import { formatNumber, getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDashboardSummary(user.id);
  const isTeacher = user.role === "TEACHER";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
          Hồ sơ của tôi
        </h1>
      </header>

      {/* Thẻ hồ sơ */}
      <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-border">
        <div
          aria-hidden="true"
          className="h-20 bg-gradient-to-r from-primary to-primary-hover"
        />
        <div className="-mt-10 flex flex-col items-center px-6 pb-6 text-center">
          <Avatar data-size="lg" className="size-20 ring-4 ring-surface">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            ) : null}
            <AvatarFallback className="text-xl">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-3 text-lg font-bold text-text">{user.fullName}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <GraduationCap aria-hidden="true" className="size-4" />
            {isTeacher ? "Giáo viên" : "Học sinh"}
            {data?.className ? ` · ${data.className}` : ""}
          </p>
        </div>
      </div>

      {/* Thông tin */}
      <div className="rounded-xl bg-surface p-5 ring-1 ring-border">
        <ul className="divide-y divide-border">
          <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-hover text-text-muted">
              <Mail aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-text-muted">Email</p>
              <p className="truncate text-sm font-medium text-text">
                {user.email}
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-warning-light text-warning">
              <Trophy aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-text-muted">Điểm thi đua</p>
              <p className="text-sm font-medium text-text">
                {formatNumber(data?.totalPoints ?? 0)} điểm
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-success-light text-secondary">
              <Users aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-text-muted">Đội</p>
              <p className="text-sm font-medium text-text">
                {data?.team?.name ?? "Chưa tham gia"}
              </p>
            </div>
          </li>
        </ul>
      </div>

      <p className="px-2 text-center text-xs text-text-muted">
        Quản lý tên hiển thị, ảnh đại diện và mật khẩu sẽ có trong bản cập nhật
        tiếp theo.
      </p>
    </div>
  );
}