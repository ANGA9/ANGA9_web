import { Lock } from "lucide-react";
import type { TicketMessage } from "@/lib/supportApi";
import { timeAgo } from "@/lib/supportApi";
import AttachmentList from "./AttachmentList";

interface Props {
  messages: TicketMessage[];
  currentUserId?: string | null;
  isAdminView?: boolean;
}

export default function TicketThread({ messages, currentUserId, isAdminView = false }: Props) {
  return (
    <div className="space-y-4">
      {messages.map((m) => {
        const isMine = currentUserId && m.author_id === currentUserId;
        const isSystem = m.author_role === "system";
        const isAdmin = m.author_role === "admin";
        
        const isRightSide = isAdminView ? isAdmin : isMine;

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
            className={`flex flex-col ${isRightSide ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] shadow-sm ${
                m.is_internal
                  ? "border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
                  : isRightSide
                  ? "bg-[#1A6FD4] text-white"
                  : isAdmin
                  ? "bg-[#F3E8FF] text-[#1A1A2E]"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              {m.is_internal && (
                <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-80">
                  <Lock className="h-3 w-3" /> Internal note
                </div>
              )}
              <div className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</div>
              <AttachmentList attachments={m.attachments} />
            </div>
            <div className="mt-1 text-[11px] font-medium text-gray-400">
              <span className="capitalize">{m.author_role.replace(/_/g, " ")}</span>
              {" · "}
              {timeAgo(m.created_at)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
