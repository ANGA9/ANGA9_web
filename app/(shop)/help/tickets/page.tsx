"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Plus, Inbox } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { supportApi, timeAgo, type Ticket, type TicketStatus } from "@/lib/supportApi";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";
import TicketPriorityBadge from "@/components/support/TicketPriorityBadge";
import SlaCountdown from "@/components/support/SlaCountdown";

const TABS: { key: TicketStatus | "all"; label: string }[] = [
  { key: "all",          label: "All" },
  { key: "open",         label: "Open" },
  { key: "pending_user", label: "Needs reply" },
  { key: "in_progress",  label: "In progress" },
  { key: "resolved",     label: "Resolved" },
  { key: "closed",       label: "Closed" },
];

export default function MyTicketsPage() {
  const [tab, setTab] = useState<TicketStatus | "all">("all");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supportApi
      .listMyTickets({ status: tab, limit: 30 })
      .then((res) => { if (active) setTickets(res.data); })
      .catch(() => { if (active) setTickets([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tab]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 md:py-10" style={{ color: t.textPrimary }}>
      <Link href="/help" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4]">
        <ArrowLeft className="h-4 w-4" /> Back to Help Center
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold">
          <MessageSquare className="h-7 w-7" style={{ color: t.bluePrimary }} />
          My tickets
        </div>
        <Link
          href="/help/tickets/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#1A6FD4] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> New ticket
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5 border-b border-[#E8EEF4] pb-2">
        {TABS.map((tt) => (
          <button
            key={tt.key}
            onClick={() => setTab(tt.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === tt.key
                ? "bg-[#1A6FD4] text-white"
                : "text-[#4B5563] hover:bg-[#F8FBFF]"
            }`}
          >
            {tt.label}
          </button>
        ))}
      </div>

      <section className="mt-4">
        {loading ? (
          <div className="rounded-xl border border-[#E8EEF4] bg-white p-8 text-center text-sm text-[#9CA3AF]">
            Loading tickets…
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8EEF4] bg-white p-10 text-center">
            <Inbox className="mx-auto h-10 w-10 text-[#9CA3AF]" />
            <div className="mt-2 text-sm font-semibold">No tickets here</div>
            <div className="mt-1 text-xs text-[#4B5563]">
              {tab === "all"
                ? "You haven't raised any tickets yet."
                : "Nothing in this view right now."}
            </div>
            <Link
              href="/help/tickets/new"
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#1A6FD4] px-3 py-1.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Raise a ticket
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {tickets.map((tk) => (
              <li key={tk.id}>
                <Link
                  href={`/help/tickets/${tk.id}`}
                  className="block rounded-xl border border-[#E8EEF4] bg-white p-4 hover:bg-[#F8FBFF] transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                        <span className="font-mono">{tk.ticket_number}</span>
                        <span>·</span>
                        <span>{tk.category}</span>
                      </div>
                      <div className="mt-1 truncate text-sm md:text-base font-semibold">
                        {tk.subject}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <TicketPriorityBadge priority={tk.priority} />
                      <TicketStatusBadge status={tk.status} />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#4B5563]">
                    <span>Updated {timeAgo(tk.last_activity_at)}</span>
                    <SlaCountdown
                      slaDueAt={tk.sla_due_at}
                      status={tk.status}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
