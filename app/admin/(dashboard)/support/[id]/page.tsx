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
  type TicketStatus,
  type TicketPriority,
  type Macro,
} from "@/lib/supportApi";
import { useAuth } from "@/lib/AuthContext";
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

  async function handleSend(body: string, opts: { isInternal: boolean }) {
    if (opts.isInternal) {
      await supportAdminApi.internalNote(id, body);
    } else {
      await supportApi.postMessage(id, { body });
    }
    await load();
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
    return <main className="mx-auto max-w-5xl px-4 py-6">Loading ticket…</main>;
  }
  if (error || !detail) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4]">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-6 text-center text-sm text-[#DC2626]">
          {error || "Ticket not found."}
        </div>
      </main>
    );
  }

  const { ticket, messages, events } = detail;
  const categories = ticket.requester_role === "seller" ? SELLER_CATEGORIES : CUSTOMER_CATEGORIES;
  const isMine = ticket.assignee_id === dbUser?.id;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:py-8 text-[#1A1A2E]">
      <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4]">
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </Link>

      <div className="mt-3 grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div>
          <header>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
              <span className="font-mono">{ticket.ticket_number}</span>
              <span>·</span>
              <span className="capitalize">{ticket.requester_role}</span>
              <span>·</span>
              <span>Created {timeAgo(ticket.created_at)}</span>
              {ticket.initiator_role === "admin" && (
                <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">
                  Admin-initiated
                </span>
              )}
              <span>·</span>
              <span>via {ticket.source}</span>
            </div>
            <h1 className="mt-1 text-xl md:text-2xl font-bold">{ticket.subject}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
              <SlaCountdown slaDueAt={ticket.sla_due_at} status={ticket.status} />
            </div>
          </header>

          <section className="mt-6">
            <TicketThread messages={messages} currentUserId={dbUser?.id} />
          </section>

          {ticket.status !== "closed" && (
            <section className="mt-6">
              <TicketReplyBox onSend={handleSend} allowInternal macros={macros} />
            </section>
          )}

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
                      <span>: {e.from_value} → {e.to_value}</span>
                    )}
                    <span className="text-[#9CA3AF]">· {timeAgo(e.created_at)} · by {e.actor_role}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Side panel */}
        <aside className="space-y-3">
          <div className="rounded-xl border border-[#E8EEF4] bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Requester</div>
            <div className="text-sm font-semibold capitalize">{ticket.requester_role}</div>
            <div className="text-xs font-mono text-[#4B5563] break-all">{ticket.requester_id}</div>
          </div>

          <div className="rounded-xl border border-[#E8EEF4] bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Assignee</div>
            {ticket.assignee_id ? (
              <>
                <div className="text-sm font-semibold">{isMine ? "You" : "Another admin"}</div>
                <div className="text-xs font-mono text-[#4B5563] break-all">{ticket.assignee_id}</div>
                <div className="mt-2 flex gap-2">
                  {!isMine && (
                    <button
                      onClick={handleAssignToMe}
                      className="rounded-md border border-[#E8EEF4] bg-white px-2 py-1 text-xs font-semibold text-[#1A6FD4] hover:bg-[#F8FBFF]"
                    >
                      Take over
                    </button>
                  )}
                  <button
                    onClick={() => handlePatch({ assignee_id: null })}
                    className="rounded-md border border-[#E8EEF4] bg-white px-2 py-1 text-xs font-semibold text-[#4B5563] hover:bg-[#F8FBFF]"
                  >
                    Unassign
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleAssignToMe}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1A6FD4] px-3 py-1.5 text-xs font-semibold text-white"
              >
                <UserPlus className="h-3 w-3" /> Assign to me
              </button>
            )}
          </div>

          <div className="rounded-xl border border-[#E8EEF4] bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Status</div>
            <div className="relative">
              <select
                value={ticket.status}
                onChange={(e) => handlePatch({ status: e.target.value as TicketStatus })}
                className="w-full appearance-none rounded-md border border-[#E8EEF4] bg-white px-3 py-2 pr-8 text-sm capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            </div>
          </div>

          <div className="rounded-xl border border-[#E8EEF4] bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Priority</div>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePatch({ priority: p })}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${
                    ticket.priority === p
                      ? "border-[#1A6FD4] bg-[#EAF2FF] text-[#1A6FD4]"
                      : "border-[#E8EEF4] text-[#4B5563] hover:bg-[#F8FBFF]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E8EEF4] bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Category</div>
            <select
              value={ticket.category}
              onChange={(e) => handlePatch({ category: e.target.value })}
              className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm"
            >
              {!categories.includes(ticket.category as never) && (
                <option value={ticket.category}>{ticket.category}</option>
              )}
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {(ticket.related_order_id || ticket.related_product_id || ticket.related_payout_id) && (
            <div className="rounded-xl border border-[#E8EEF4] bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Linked</div>
              <ul className="space-y-1 text-xs">
                {ticket.related_order_id && (
                  <li>
                    Order:{" "}
                    <Link href={`/admin/orders?id=${ticket.related_order_id}`} className="font-mono text-[#1A6FD4] hover:underline">
                      {ticket.related_order_id.slice(0, 8)}
                    </Link>
                  </li>
                )}
                {ticket.related_product_id && (
                  <li>
                    Product:{" "}
                    <Link href={`/admin/products?id=${ticket.related_product_id}`} className="font-mono text-[#1A6FD4] hover:underline">
                      {ticket.related_product_id.slice(0, 8)}
                    </Link>
                  </li>
                )}
                {ticket.related_payout_id && (
                  <li>
                    Payout:{" "}
                    <Link href={`/admin/payouts?id=${ticket.related_payout_id}`} className="font-mono text-[#1A6FD4] hover:underline">
                      {ticket.related_payout_id.slice(0, 8)}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {ticket.csat_score != null && (
            <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#92400E] mb-1">CSAT</div>
              <div className="text-lg font-bold text-[#92400E]">{ticket.csat_score} / 5</div>
              {ticket.csat_comment && (
                <div className="mt-1 text-xs text-[#92400E]">&ldquo;{ticket.csat_comment}&rdquo;</div>
              )}
            </div>
          )}

          {(ticket.status === "resolved" || ticket.status === "closed") && (
            <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#DC2626] mb-1">Danger zone</div>
              <p className="text-xs text-[#7F1D1D] mb-2">
                Permanently delete this ticket and its entire message history. This cannot be undone.
              </p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#DC2626] bg-white px-3 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2] disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? "Deleting…" : "Delete ticket"}
              </button>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
