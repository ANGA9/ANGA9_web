import { Lock } from "lucide-react";
import type { TicketMessage } from "@/lib/supportApi";
import { timeAgo } from "@/lib/supportApi";
import AttachmentList from "./AttachmentList";

interface Props {
  messages: TicketMessage[];
  currentUserId?: string | null;
}

export default function TicketThread({ messages, currentUserId }: Props) {
  return (
    <div className="space-y-4">
      {messages.map((m) => {
        const isMine = currentUserId && m.author_id === currentUserId;
        const isSystem = m.author_role === "system";
        const isAdmin = m.author_role === "admin";

        if (isSystem) {
          return (
            <div key={m.id} className="rounded-md border border-dashed border-[#E8EEF4] bg-[#F8FBFF] px-3 py-2 text-xs text-[#4B5563]">
              <div className="mb-1 font-semibold uppercase tracking-wide text-[#9CA3AF]">System</div>
              <pre className="whitespace-pre-wrap font-sans">{m.body}</pre>
            </div>
          );
        }

        return (
          <div
            key={m.id}
            className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                m.is_internal
                  ? "border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
                  : isMine
                  ? "bg-[#1A6FD4] text-white"
                  : isAdmin
                  ? "bg-[#F3E8FF] text-[#1A1A2E]"
                  : "bg-[#F8FBFF] text-[#1A1A2E] border border-[#E8EEF4]"
              }`}
            >
              {m.is_internal && (
                <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase">
                  <Lock className="h-3 w-3" /> Internal note (admin only)
                </div>
              )}
              <div className="whitespace-pre-wrap break-words">{m.body}</div>
              <AttachmentList attachments={m.attachments} />
            </div>
            <div className="mt-1 text-[11px] text-[#9CA3AF]">
              {m.author_role}
              {" · "}
              {timeAgo(m.created_at)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
