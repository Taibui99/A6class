import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current";
import { getClassTasks } from "@/lib/tasks/service";
import { TaskManager } from "@/components/task/task-manager";

export const metadata: Metadata = {
  title: "Nhiệm vụ theo tổ · Lớp 12A6",
  description: "Quản lý kế hoạch, giao việc theo tổ, theo dõi tiến độ nộp bài và cộng điểm thi đua lớp 12A6.",
};

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await getCurrentUser();
  const tasks = await getClassTasks();

  return (
    <main id="main-content" className="mx-auto w-full max-w-[1300px] px-3 py-5 sm:px-5">
      <TaskManager
        tasks={tasks}
        userRole={user?.role}
        userName={user?.fullName}
      />
    </main>
  );
}
