import { Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import type { TicketAttachment } from "@/lib/supportApi";

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({ attachments }: { attachments: TicketAttachment[] }) {
  if (!attachments?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((a) => {
        const Icon = a.mime_type.startsWith("image/")
          ? ImageIcon
          : a.mime_type.startsWith("text/") || a.mime_type === "application/pdf"
          ? FileText
          : Paperclip;
        return (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-[#E8EEF4] bg-white px-3 py-1.5 text-xs text-[#1A1A2E] hover:bg-[#F8FBFF]"
          >
            <Icon className="h-4 w-4 text-[#9CA3AF]" />
            <span className="font-medium">{a.filename}</span>
            <span className="text-[#9CA3AF]">{humanSize(a.size_bytes)}</span>
          </a>
        );
      })}
    </div>
  );
}
