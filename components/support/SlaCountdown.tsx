import { Clock, AlertTriangle } from "lucide-react";

export default function SlaCountdown({ slaDueAt, status }: { slaDueAt: string | null; status: string }) {
  if (!slaDueAt) return null;
  if (status === "resolved" || status === "closed") return null;

  const due = new Date(slaDueAt).getTime();
  const now = Date.now();
  const breached = now > due;
  const diff = Math.abs(due - now);
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const text = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: breached ? "#FEE2E2" : "#EAF2FF",
        color:           breached ? "#DC2626" : "#1A6FD4",
      }}
    >
      {breached ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {breached ? `SLA breached ${text} ago` : `SLA in ${text}`}
    </span>
  );
}
