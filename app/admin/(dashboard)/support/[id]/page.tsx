"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, ChevronDown, Trash2 } from "lucide-react";
import {
  supportApi,
  supportAdminApi,
  timeAgo,
  CUSTOMER_CATEGORIES,
  SELLER_CATEGORIES,
  type TicketDetail,
  type TicketMessage,
  type TicketStatus,
  type TicketPriority,
  type Macro,
} from "@/lib/supportApi";
import { useAuth } from "@/lib/AuthContext";
import { useTicketSocket } from "@/lib/useTicketSocket";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";
import TicketPriorityBadge from "@/components/support/TicketPriorityBadge";
import SlaCountdown from "@/components/support/SlaCountdown";
import TicketThread from "@/components/support/TicketThread";
import TicketReplyBox from "@/components/support/TicketReplyBox";

const STATUSES: TicketStatus[] = ["open", "pending_user", "in_progress", "resolved", "closed", "reopened"];
const PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];

export default function AdminTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { dbUser } = useAuth();

  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [macros, setMacros] = useState<Macro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    supportAdminApi.listMacros().then((r) => setMacros(r.data)).catch(() => setMacros([]));
  }, []);

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

  async function handleSend(body: string, opts: { isInternal: boolean }) {
    if (opts.isInternal) {
      await supportAdminApi.internalNote(id, body);
    } else {
      await supportApi.postMessage(id, { body });
    }
    // WS will push the persisted message; no full reload needed.
  }

  async function handlePatch(patch: Parameters<typeof supportAdminApi.patchTicket>[1]) {
    await supportAdminApi.patchTicket(id, patch);
    await load();
  }

  async function handleAssignToMe() {
    if (!dbUser?.id) return;
    await handlePatch({ assignee_id: dbUser.id });
  }

  async function handleDelete() {
    if (!detail) return;
    const ok = window.confirm(
      `Delete ticket ${detail.ticket.ticket_number}? This permanently removes the ticket and its entire message history. This cannot be undone.`,
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await supportAdminApi.deleteTicket(id);
      router.push("/admin/support");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete ticket");
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8">Loading ticket…</div>;
  }
  if (error || !detail) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Link href="/admin/support" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#8B5CF6] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Inbox
        </Link>
        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-[15px] font-bold text-red-600 shadow-sm">
          {error || "Ticket not found."}
        </div>
      </div>
    );
  }

  const { ticket, messages, events } = detail;
  const categories = ticket.requester_role === "seller" ? SELLER_CATEGORIES : CUSTOMER_CATEGORIES;
  const isMine = ticket.assignee_id === dbUser?.id;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-1.5 text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inbox
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column (Metadata) */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="sticky top-6 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                <span>{ticket.ticket_number}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{ticket.source}</span>
              </div>
              <h1 className="text-[22px] font-bold text-gray-900 leading-tight mb-4">
                {ticket.subject}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
              <div className="text-[13px] font-medium text-gray-500">
                Created {timeAgo(ticket.created_at)}
              </div>
              {ticket.initiator_role === "admin" && (
                <div className="mt-3 inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-[#8B5CF6] border border-purple-200 uppercase tracking-wider">
                  Admin-initiated
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Requester</div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <div className="text-[14px] font-bold capitalize text-gray-900">{ticket.requester_role}</div>
                  <div className="text-[12px] font-mono text-gray-500 break-all truncate">{ticket.requester_id}</div>
                </div>
              </div>

              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Assignee</div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  {ticket.assignee_id ? (
                    <>
                      <div className="text-[14px] font-bold text-gray-900">{isMine ? "You" : "Another Admin"}</div>
                      <div className="text-[12px] font-mono text-gray-500 break-all truncate">{ticket.assignee_id}</div>
                      <div className="mt-3 flex gap-2">
                        {!isMine && (
                          <button
                            onClick={handleAssignToMe}
                            className="flex-1 rounded-xl bg-white border border-[#8B5CF6] px-3 py-2 text-[13px] font-bold text-[#8B5CF6] hover:bg-purple-50 transition-colors shadow-sm"
                          >
                            Take Over
                          </button>
                        )}
                        <button
                          onClick={() => handlePatch({ assignee_id: null })}
                          className="flex-1 rounded-xl bg-white border border-gray-200 px-3 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                        >
                          Unassign
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={handleAssignToMe}
                      className="w-full inline-flex justify-center items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-[14px] font-bold text-white shadow-sm hover:bg-[#7C3AED] transition-all"
                    >
                      <UserPlus className="w-4 h-4" /> Assign to Me
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Status</div>
                <select
                  value={ticket.status}
                  onChange={(e) => handlePatch({ status: e.target.value as TicketStatus })}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all shadow-sm capitalize"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Category</div>
                <select
                  value={ticket.category}
                  onChange={(e) => handlePatch({ category: e.target.value })}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all shadow-sm"
                >
                  {!categories.includes(ticket.category as never) && (
                    <option value={ticket.category}>{ticket.category}</option>
                  )}
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Priority</div>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePatch({ priority: p })}
                      className={`rounded-xl border px-3 py-1.5 text-[12px] font-bold capitalize transition-colors ${
                        ticket.priority === p
                          ? "border-[#8B5CF6] bg-purple-50 text-[#8B5CF6]"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {(ticket.related_order_id || ticket.related_product_id || ticket.related_payout_id) && (
                <div className="pt-5 border-t border-gray-100">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Linked Items</div>
                  <ul className="space-y-2 text-[13px] font-medium">
                    {ticket.related_order_id && (
                      <li className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Order</span>
                        <Link href={`/admin/orders?id=${ticket.related_order_id}`} className="font-mono text-[#8B5CF6] hover:underline font-bold">
                          {ticket.related_order_id.slice(0, 8)}
                        </Link>
                      </li>
                    )}
                    {ticket.related_product_id && (
                      <li className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Product</span>
                        <Link href={`/admin/products?id=${ticket.related_product_id}`} className="font-mono text-[#8B5CF6] hover:underline font-bold">
                          {ticket.related_product_id.slice(0, 8)}
                        </Link>
                      </li>
                    )}
                    {ticket.related_payout_id && (
                      <li className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Payout</span>
                        <Link href={`/admin/payouts?id=${ticket.related_payout_id}`} className="font-mono text-[#8B5CF6] hover:underline font-bold">
                          {ticket.related_payout_id.slice(0, 8)}
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {ticket.csat_score != null && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-amber-900 mb-1">CSAT Feedback</div>
                  <div className="text-[24px] font-black text-amber-900">{ticket.csat_score} <span className="text-[16px] text-amber-700">/ 5</span></div>
                  {ticket.csat_comment && (
                    <div className="mt-2 text-[13px] font-medium text-amber-800 italic bg-white/50 p-2 rounded-lg">&ldquo;{ticket.csat_comment}&rdquo;</div>
                  )}
                </div>
              )}

              {(ticket.status === "resolved" || ticket.status === "closed") && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm mt-2">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-red-900 mb-1">Danger Zone</div>
                  <p className="text-[12px] text-red-700 mb-3 font-medium">
                    Permanently delete this ticket and its history. This cannot be undone.
                  </p>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full inline-flex justify-center items-center gap-1.5 rounded-xl border border-red-300 bg-white px-3 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? "Deleting…" : "Delete Ticket"}
                  </button>
                </div>
              )}
            </div>

            {/* Activity Log (Desktop) */}
            {events.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hidden lg:block">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Activity Log
                </h3>
                <ul className="space-y-4 text-[13px] text-gray-500">
                  {events.map((e) => (
                    <li key={e.id} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-700 block truncate capitalize">{e.event_type.replace(/_/g, " ")}</span>
                        {e.from_value && e.to_value && (
                          <span className="block mt-0.5 text-[12px]">
                            changed from <span className="font-semibold text-gray-900">{e.from_value}</span> to <span className="font-semibold text-gray-900">{e.to_value}</span>
                          </span>
                        )}
                        <div className="text-[12px] text-gray-400 mt-1">{timeAgo(e.created_at)} · by {e.actor_role}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Thread) */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <section className="bg-gray-50 rounded-3xl p-4 md:p-6 border border-gray-200 shadow-inner h-[400px] overflow-y-auto custom-scrollbar">
            <TicketThread messages={messages} currentUserId={dbUser?.id} isAdminView={true} />
          </section>

          {ticket.status !== "closed" && (
            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative">
              <TicketReplyBox onSend={handleSend} allowInternal macros={macros} />
            </section>
          )}

          {/* Activity Log (Mobile) */}
          {events.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm lg:hidden mt-2">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-4">
                Activity Log
              </h3>
              <ul className="space-y-4 text-[13px] text-gray-500">
                {events.map((e) => (
                  <li key={e.id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-gray-700 block truncate capitalize">{e.event_type.replace(/_/g, " ")}</span>
                      {e.from_value && e.to_value && (
                        <span className="block mt-0.5 text-[12px]">
                          changed from <span className="font-semibold text-gray-900">{e.from_value}</span> to <span className="font-semibold text-gray-900">{e.to_value}</span>
                        </span>
                      )}
                      <div className="text-[12px] text-gray-400 mt-1">{timeAgo(e.created_at)} · by {e.actor_role}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
