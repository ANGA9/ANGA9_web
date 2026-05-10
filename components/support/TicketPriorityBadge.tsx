import { type TicketPriority, priorityLabel } from "@/lib/supportApi";

const STYLES: Record<TicketPriority, { bg: string; fg: string }> = {
  low:    { bg: "#F1F5F9", fg: "#475569" },
  normal: { bg: "#EAF2FF", fg: "#1A6FD4" },
  high:   { bg: "#FFF7ED", fg: "#C2410C" },
  urgent: { bg: "#FEE2E2", fg: "#DC2626" },
};

export default function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const s = STYLES[priority];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {priorityLabel(priority)}
    </span>
  );
}
