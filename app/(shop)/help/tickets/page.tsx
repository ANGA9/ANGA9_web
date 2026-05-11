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
    <main className="w-full mx-auto max-w-4xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white min-h-screen" style={{ color: t.textPrimary }}>
      <Link href="/help" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1A6FD4] hover:underline mb-2">
        <ArrowLeft className="h-4 w-4" /> Back to Help Center
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <MessageSquare className="h-5 w-5 text-[#1A6FD4]" />
          </div>
          <h1 className="text-[24px] md:text-[28px] font-bold text-gray-900 tracking-tight">
            My tickets
          </h1>
        </div>
        <Link
          href="/help/tickets/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1A6FD4] px-5 py-2.5 text-[14px] font-bold text-white transition-all shadow-sm hover:shadow-md hover:bg-[#155bb5] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> New ticket
        </Link>
      </div>

      <div className="mt-6 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto no-scrollbar pb-2">
        <div className="flex w-max gap-2 border-b border-gray-100 pb-3">
          {TABS.map((tt) => (
            <button
              key={tt.key}
              onClick={() => setTab(tt.key)}
              className={`rounded-full px-5 py-2 text-[14px] font-bold transition-all active:scale-[0.98] ${
                tab === tt.key
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tt.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50/50 py-16 text-[15px] font-medium text-gray-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A6FD4] border-t-transparent mb-4" />
            Loading tickets…
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
              <Inbox className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">No tickets here</h3>
            <p className="text-[14px] font-medium text-gray-500 mb-6 max-w-sm">
              {tab === "all"
                ? "You haven't raised any tickets yet. If you need help, feel free to reach out!"
                : "Nothing in this view right now."}
            </p>
            <Link
              href="/help/tickets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-6 py-2.5 text-[14px] font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] shadow-sm"
            >
              <Plus className="h-4 w-4" /> Raise a ticket
            </Link>
          </div>
        ) : (
          <ul className="space-y-3 md:space-y-4">
            {tickets.map((tk) => (
              <li key={tk.id}>
                <Link
                  href={`/help/tickets/${tk.id}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-[#1A6FD4]/40 hover:shadow-md transition-all active:scale-[0.99] group cursor-pointer"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        <span>{tk.ticket_number}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-gray-500">{tk.category}</span>
                      </div>
                      <h3 className="truncate text-[16px] md:text-[18px] font-bold text-gray-900 group-hover:text-[#1A6FD4] transition-colors leading-tight">
                        {tk.subject}
                      </h3>
                    </div>
                    <div className="flex flex-wrap shrink-0 items-center gap-2">
                      <TicketPriorityBadge priority={tk.priority} />
                      <TicketStatusBadge status={tk.status} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                    <span className="text-[13px] font-medium text-gray-400">Updated {timeAgo(tk.last_activity_at)}</span>
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
