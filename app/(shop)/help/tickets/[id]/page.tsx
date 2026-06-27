"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RotateCcw, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import {
  supportApi,
  timeAgo,
  type TicketDetail,
  type TicketMessage,
  type TicketStatus,
} from "@/lib/supportApi";
import { useAuth } from "@/lib/AuthContext";
import { useTicketSocket } from "@/lib/useTicketSocket";
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
  const [actionLoading, setActionLoading] = useState(false);

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

  useTicketSocket({
    ticketId: id,
    onMessage: (incoming: TicketMessage) => {
      setDetail((prev) => {
        if (!prev) return prev;
        if (prev.messages.some((m) => m.id === incoming.id)) return prev;
        return { ...prev, messages: [...prev.messages, incoming] };
      });
    },
  });

  async function handleSend(body: string, _opts?: { isInternal: boolean }) {
    await supportApi.postMessage(id, { body });
  }

  async function handleStatusChange(status: TicketStatus) {
    setActionLoading(true);
    try {
      await supportApi.changeStatus(id, status);
      await load();
    } finally {
      setActionLoading(false);
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
  const isResolved = ticket.status === "resolved";
  const isClosed = ticket.status === "closed";
  const isTerminal = isResolved || isClosed;
  const isActive = !isTerminal;

  // Check if closed ticket is within the 1-hour reopen window
  const closedWithinWindow = isClosed && ticket.closed_at
    ? (Date.now() - new Date(ticket.closed_at).getTime()) < 60 * 60 * 1000
    : false;

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
            
            {isActive && (
              <div className="pt-5 border-t border-gray-100">
                <SlaCountdown slaDueAt={ticket.sla_due_at} status={ticket.status} />
              </div>
            )}
          </header>

          {/* ══════════ Satisfaction Prompt (when resolved) ══════════ */}
          {isResolved && (
            <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-[15px] font-bold text-gray-900">Issue resolved</span>
              </div>
              <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
                Our team has marked this ticket as resolved. Was your issue addressed?
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handleStatusChange("closed")}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-[14px] font-bold text-white hover:bg-emerald-700 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
                >
                  <ThumbsUp className="h-4 w-4" /> Yes, I&apos;m satisfied
                </button>
                <button
                  onClick={() => handleStatusChange("reopened")}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-[14px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
                >
                  <ThumbsDown className="h-4 w-4" /> No, reopen chat
                </button>
              </div>
            </div>
          )}

          {/* ══════════ Closed State ══════════ */}
          {isClosed && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-[14px] font-bold text-gray-800 mb-1">Ticket closed</p>
              <p className="text-[12px] text-gray-500 mb-3">Thank you for reaching out to us.</p>
              {closedWithinWindow && (
                <button
                  onClick={() => handleStatusChange("reopened")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#EA580C] hover:underline transition-colors disabled:opacity-60"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Changed your mind? Reopen
                </button>
              )}
              {!closedWithinWindow && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                  <Clock className="h-3 w-3" /> Reopen window has expired
                </div>
              )}
            </div>
          )}

          {/* Activity Log (Sidebar) */}
          {events.length > 0 && (
            <div className="pt-5 border-t border-gray-100 hidden md:block">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-4">
                Activity Log
              </h3>
              <ul className="space-y-4 text-[13px] text-gray-500">
                {events.map((e) => (
                  <li key={e.id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-gray-700 block truncate">{e.event_type.replace(/_/g, " ")}</span>
                      {e.from_value && e.to_value && (
                        <span className="block mt-0.5 text-[12px]">
                          changed from <span className="font-semibold text-gray-900">{e.from_value}</span> to <span className="font-semibold text-gray-900">{e.to_value}</span>
                        </span>
                      )}
                      <div className="text-[12px] text-gray-400 mt-1">{timeAgo(e.created_at)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Main Column: Chat Thread & Reply */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Thread */}
          <section className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar">
            <TicketThread messages={messages} currentUserId={dbUser?.id} />
          </section>

          {/* Reply box — only shown for active tickets */}
          {isActive && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-2">
              <TicketReplyBox onSend={handleSend} />
            </section>
          )}

          {/* Activity Log (Mobile) */}
          {events.length > 0 && (
            <div className="mt-4 pt-6 border-t border-gray-100 md:hidden">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-4">
                Activity Log
              </h3>
              <ul className="space-y-4 text-[13px] text-gray-500">
                {events.map((e) => (
                  <li key={e.id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-gray-700 block truncate">{e.event_type.replace(/_/g, " ")}</span>
                      {e.from_value && e.to_value && (
                        <span className="block mt-0.5 text-[12px]">
                          changed from <span className="font-semibold text-gray-900">{e.from_value}</span> to <span className="font-semibold text-gray-900">{e.to_value}</span>
                        </span>
                      )}
                      <div className="text-[12px] text-gray-400 mt-1">{timeAgo(e.created_at)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
