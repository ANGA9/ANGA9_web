"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RotateCcw, Star } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import {
  supportApi,
  timeAgo,
  type TicketDetail,
  type TicketStatus,
} from "@/lib/supportApi";
import { useAuth } from "@/lib/AuthContext";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";
import TicketPriorityBadge from "@/components/support/TicketPriorityBadge";
import SlaCountdown from "@/components/support/SlaCountdown";
import TicketThread from "@/components/support/TicketThread";
import TicketReplyBox from "@/components/support/TicketReplyBox";

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { dbUser } = useAuth();

  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CSAT
  const [score, setScore] = useState<number>(0);
  const [csatComment, setCsatComment] = useState("");
  const [csatSubmitting, setCsatSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const d = await supportApi.getTicket(id);
      setDetail(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSend(body: string) {
    await supportApi.postMessage(id, { body });
    await load();
  }

  async function handleStatusChange(status: TicketStatus) {
    await supportApi.changeStatus(id, status);
    await load();
  }

  async function handleRate() {
    if (!score) return;
    setCsatSubmitting(true);
    try {
      await supportApi.rate(id, score, csatComment || undefined);
      await load();
    } finally {
      setCsatSubmitting(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-6">Loading ticket…</main>;
  }
  if (error || !detail) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/help/tickets" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4]">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-6 text-center text-sm text-[#DC2626]">
          {error || "Ticket not found."}
        </div>
      </main>
    );
  }

  const { ticket, messages, events } = detail;
  const canResolve = ticket.status !== "resolved" && ticket.status !== "closed";
  const canReopen  = ticket.status === "resolved" || ticket.status === "closed";
  const canClose   = ticket.status === "resolved";
  const showCsat   = ticket.status === "resolved" && ticket.csat_score == null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:py-10" style={{ color: t.textPrimary }}>
      <Link href="/help/tickets" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4]">
        <ArrowLeft className="h-4 w-4" /> Back to my tickets
      </Link>

      <header className="mt-3">
        <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
          <span className="font-mono">{ticket.ticket_number}</span>
          <span>·</span>
          <span>{ticket.category}</span>
          <span>·</span>
          <span>Created {timeAgo(ticket.created_at)}</span>
        </div>
        <h1 className="mt-1 text-xl md:text-2xl font-bold">{ticket.subject}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
          <SlaCountdown slaDueAt={ticket.sla_due_at} status={ticket.status} />
        </div>
      </header>

      {/* Status actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {canResolve && (
          <button
            onClick={() => handleStatusChange("resolved")}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#16A34A] bg-[#DCFCE7] px-3 py-1.5 text-sm font-semibold text-[#16A34A] hover:bg-[#BBF7D0]"
          >
            <CheckCircle2 className="h-4 w-4" /> Mark as resolved
          </button>
        )}
        {canReopen && (
          <button
            onClick={() => handleStatusChange("reopened")}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#EA580C] bg-[#FFEDD5] px-3 py-1.5 text-sm font-semibold text-[#EA580C] hover:bg-[#FED7AA]"
          >
            <RotateCcw className="h-4 w-4" /> Reopen
          </button>
        )}
        {canClose && (
          <button
            onClick={() => handleStatusChange("closed")}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E8EEF4] bg-white px-3 py-1.5 text-sm font-semibold text-[#4B5563] hover:bg-[#F8FBFF]"
          >
            Close ticket
          </button>
        )}
      </div>

      {/* Thread */}
      <section className="mt-6">
        <TicketThread messages={messages} currentUserId={dbUser?.id} />
      </section>

      {/* CSAT */}
      {showCsat && (
        <section className="mt-6 rounded-xl border border-[#E8EEF4] bg-white p-4">
          <div className="text-sm font-semibold">How was the support you received?</div>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setScore(n)}
                className="p-1"
                aria-label={`Rate ${n} stars`}
              >
                <Star
                  className="h-7 w-7"
                  fill={n <= score ? "#F59E0B" : "transparent"}
                  color={n <= score ? "#F59E0B" : "#D1D5DB"}
                />
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Tell us more (optional)"
            value={csatComment}
            onChange={(e) => setCsatComment(e.target.value)}
            className="mt-2 w-full resize-none rounded-md border border-[#E8EEF4] bg-[#F8FBFF] px-3 py-2 text-sm outline-none focus:border-[#1A6FD4] focus:bg-white"
          />
          <button
            onClick={handleRate}
            disabled={!score || csatSubmitting}
            className="mt-2 rounded-md bg-[#1A6FD4] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {csatSubmitting ? "Submitting…" : "Submit rating"}
          </button>
        </section>
      )}

      {ticket.csat_score != null && (
        <section className="mt-6 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm text-[#92400E]">
          <div className="font-semibold">Thanks for your feedback</div>
          <div className="mt-1 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className="h-4 w-4"
                fill={n <= (ticket.csat_score || 0) ? "#F59E0B" : "transparent"}
                color={n <= (ticket.csat_score || 0) ? "#F59E0B" : "#D1D5DB"}
              />
            ))}
          </div>
        </section>
      )}

      {/* Reply box */}
      {ticket.status !== "closed" && (
        <section className="mt-6">
          <TicketReplyBox onSend={handleSend} />
        </section>
      )}

      {/* Activity */}
      {events.length > 0 && (
        <section className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
            Activity
          </h3>
          <ul className="space-y-1 text-xs text-[#4B5563]">
            {events.map((e) => (
              <li key={e.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
                <span className="font-semibold">{e.event_type.replace(/_/g, " ")}</span>
                {e.from_value && e.to_value && (
                  <span>
                    : {e.from_value} → {e.to_value}
                  </span>
                )}
                <span className="text-[#9CA3AF]">· {timeAgo(e.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
