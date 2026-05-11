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

  async function handleSend(body: string, _opts?: { isInternal: boolean }) {
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
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white min-h-screen" style={{ color: t.textPrimary }}>
      <Link href="/help/tickets" className="inline-flex items-center gap-1 text-[15px] font-bold text-[#1A6FD4] hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to my tickets
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mt-2 md:mt-4">
        {/* Left Sidebar: Ticket Info & Actions */}
        <div className="md:w-[300px] shrink-0 md:sticky md:top-28 h-max space-y-6">
          <header>
            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                <span>{ticket.ticket_number}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="text-gray-500">{ticket.category}</span>
              </div>
              <div className="text-[13px] font-medium text-gray-400">
                Created {timeAgo(ticket.created_at)}
              </div>
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-4">
              {ticket.subject}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
            
            <div className="pt-5 border-t border-gray-100">
              <SlaCountdown slaDueAt={ticket.sla_due_at} status={ticket.status} />
            </div>
          </header>

          {/* Status actions */}
          <div className="flex flex-col gap-3 pt-5 border-t border-gray-100">
            {canResolve && (
              <button
                onClick={() => handleStatusChange("resolved")}
                className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-[#16A34A] bg-[#DCFCE7] px-4 py-3 text-[14px] font-bold text-[#16A34A] hover:bg-[#BBF7D0] transition-colors shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" /> Mark as resolved
              </button>
            )}
            {canReopen && (
              <button
                onClick={() => handleStatusChange("reopened")}
                className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-[#EA580C] bg-[#FFEDD5] px-4 py-3 text-[14px] font-bold text-[#EA580C] hover:bg-[#FED7AA] transition-colors shadow-sm"
              >
                <RotateCcw className="h-4 w-4" /> Reopen ticket
              </button>
            )}
            {canClose && (
              <button
                onClick={() => handleStatusChange("closed")}
                className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
              >
                Close ticket
              </button>
            )}
          </div>
        </div>

        {/* Right Main Column: Chat Thread & Reply */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Thread */}
          <section className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm min-h-[300px]">
            <TicketThread messages={messages} currentUserId={dbUser?.id} />
          </section>

          {/* CSAT */}
          {showCsat && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="text-[15px] font-bold text-amber-900 mb-1">How was the support you received?</div>
              <div className="text-[13px] text-amber-700 mb-4">We'd love to hear your feedback on how we resolved this issue.</div>
              
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setScore(n)}
                    className="p-1.5 transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Rate ${n} stars`}
                  >
                    <Star
                      className="h-8 w-8 transition-colors"
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
                className="w-full resize-none rounded-xl border border-amber-200 bg-white px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all shadow-sm placeholder:text-gray-400"
              />
              <button
                onClick={handleRate}
                disabled={!score || csatSubmitting}
                className="mt-4 rounded-xl bg-amber-500 px-6 py-2.5 text-[14px] font-bold text-white shadow-sm hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                {csatSubmitting ? "Submitting…" : "Submit rating"}
              </button>
            </section>
          )}

          {ticket.csat_score != null && (
            <section className="rounded-2xl border border-green-200 bg-green-50 p-5 text-[14px] text-green-800 flex items-center justify-between shadow-sm">
              <div className="font-bold">Thanks for your feedback!</div>
              <div className="flex items-center gap-1">
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
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-2">
              <TicketReplyBox onSend={handleSend} />
            </section>
          )}
        </div>
      </div>

      {/* Activity */}
      {events.length > 0 && (
        <section className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-100">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-4">
            Activity Log
          </h3>
          <ul className="space-y-3 text-[13px] text-gray-500">
            {events.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-gray-700">{e.event_type.replace(/_/g, " ")}</span>
                  {e.from_value && e.to_value && (
                    <span className="ml-1">
                      changed from <span className="font-semibold text-gray-900">{e.from_value}</span> to <span className="font-semibold text-gray-900">{e.to_value}</span>
                    </span>
                  )}
                  <div className="text-[12px] text-gray-400 mt-0.5">{timeAgo(e.created_at)}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
