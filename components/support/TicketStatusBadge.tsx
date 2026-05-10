import { type TicketStatus, statusLabel } from "@/lib/supportApi";

const STYLES: Record<TicketStatus, { bg: string; fg: string }> = {
  open:         { bg: "#EAF2FF", fg: "#1A6FD4" },
  pending_user: { bg: "#FEF3C7", fg: "#B45309" },
  in_progress:  { bg: "#EDE9FE", fg: "#7C3AED" },
  resolved:     { bg: "#DCFCE7", fg: "#16A34A" },
  closed:       { bg: "#F1F5F9", fg: "#475569" },
  reopened:     { bg: "#FFEDD5", fg: "#C2410C" },
};

export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const s = STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {statusLabel(status)}
    </span>
  );
}
