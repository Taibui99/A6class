import { CircleHelp } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function QuestionPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
          Hỏi đáp
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Đặt câu hỏi bài tập, ai biết thì trả lời, lớp cùng giúp nhau tiến bộ.
        </p>
      </header>

      <EmptyState
        icon={CircleHelp}
        mascot
        title="Chưa có câu hỏi nào"
        description="Khi ai đó đặt câu hỏi, nội dung và câu trả lời sẽ được hiển thị tại đây."
      />
    </div>
  );
}