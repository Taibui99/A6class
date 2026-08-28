import { MessagesSquare } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
          Nhắn tin
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Trao đổi riêng hoặc theo đội, kèm tin nhắn thoại.
        </p>
      </header>

      <EmptyState
        icon={MessagesSquare}
        title="Chưa có hội thoại nào"
        description="Khi có tin nhắn từ bạn bè hoặc từ nhóm, các hội thoại sẽ hiện ra tại đây."
      />
    </div>
  );
}