"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  Plus,
  AlertTriangle,
  Inbox,
  Settings2,
  FileText,
  BarChart3,
} from "lucide-react";
import {
  supportAdminApi,
  timeAgo,
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  type RequesterRole,
} from "@/lib/supportApi";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";
import TicketPriorityBadge from "@/components/support/TicketPriorityBadge";
import SlaCountdown from "@/components/support/SlaCountdown";

type StatusTabKey = TicketStatus | "all" | "active";
const STATUS_TABS: { key: StatusTabKey; label: string }[] = [
  { key: "active",       label: "Active" },
  { key: "all",          label: "All" },
  { key: "open",         label: "Open" },
  { key: "in_progress",  label: "In progress" },
  { key: "pending_user", label: "Awaiting user" },
  { key: "resolved",     label: "Resolved" },
  { key: "closed",       label: "Closed" },
];

const ACTIVE_STATUSES: TicketStatus[] = ["open", "in_progress", "pending_user", "reopened"];

export default function AdminSupportInboxPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<StatusTabKey>("active");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [requesterRole, setRequesterRole] = useState<RequesterRole | "">("");
  const [slaBreached, setSlaBreached] = useState(false);
  const [assignee, setAssignee] = useState<"" | "mine" | "unassigned">("");
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    const backendStatus: TicketStatus | "all" = status === "active" ? "all" : status;
    supportAdminApi
      .listTickets({
        status: backendStatus,
        priority: priority || undefined,
        requester_role: requesterRole || undefined,
        sla_breached: slaBreached || undefined,
        assignee_id: assignee || undefined,
        q: q || undefined,
        limit: 50,
      })
      .then((res) => {
        if (!active) return;
        const filtered = status === "active"
          ? res.data.filter((tk) => ACTIVE_STATUSES.includes(tk.status))
          : res.data;
        setTickets(filtered);
      })
      .catch(() => { if (active) setTickets([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, priority, requesterRole, slaBreached, assignee, q]);

  return (
    <main className="w-full mx-auto max-w-7xl px-4 py-6 md:py-8 text-[#1A1A2E]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <LifeBuoy className="h-5 w-5 text-[#1A6FD4]" />
          </div>
          <h1 className="text-[24px] md:text-[28px] font-bold text-gray-900 tracking-tight">
            Support inbox
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/support/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1A6FD4] px-4 py-2.5 text-[14px] font-bold text-white transition-all shadow-sm hover:shadow-md hover:bg-[#155bb5] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> Message a user
          </Link>
          <Link
            href="/admin/support/macros"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] shadow-sm"
          >
            <Settings2 className="h-4 w-4 text-gray-500" /> Macros
          </Link>
          <Link
            href="/admin/support/articles"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] shadow-sm"
          >
            <FileText className="h-4 w-4 text-gray-500" /> Articles
          </Link>
          <Link
            href="/admin/support/reports"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] shadow-sm"
          >
            <BarChart3 className="h-4 w-4 text-gray-500" /> Reports
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto no-scrollbar pb-2">
        <div className="flex w-max gap-2 border-b border-gray-100 pb-3">
          {STATUS_TABS.map((tt) => (
            <button
              key={tt.key}
              onClick={() => setStatus(tt.key)}
              className={`rounded-full px-5 py-2 text-[14px] font-bold transition-all active:scale-[0.98] ${
                status === tt.key
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="relative col-span-2 md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subject or ticket #"
            className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-[14px] font-medium outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm"
          />
        </div>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority | "")}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm appearance-none"
        >
          <option value="">Any priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <select
          value={requesterRole}
          onChange={(e) => setRequesterRole(e.target.value as RequesterRole | "")}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm appearance-none"
        >
          <option value="">Customers & sellers</option>
          <option value="customer">Customers only</option>
          <option value="seller">Sellers only</option>
        </select>
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value as "" | "mine" | "unassigned")}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm appearance-none"
        >
          <option value="">Anyone</option>
          <option value="mine">Mine</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      <div className="mt-4 pl-1">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] font-medium text-gray-600">
          <input
            type="checkbox"
            checked={slaBreached}
            onChange={(e) => setSlaBreached(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600/20"
          />
          <AlertTriangle className="h-4 w-4 text-red-500" />
          SLA breached only
        </label>
      </div>

      {/* List */}
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
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">No matching tickets</h3>
            <p className="text-[14px] font-medium text-gray-500">Try adjusting your filters to find what you're looking for.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tickets.map((tk) => (
              <li key={tk.id}>
                <Link
                  href={`/admin/support/${tk.id}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-[#1A6FD4]/40 hover:shadow-md transition-all active:scale-[0.99] group cursor-pointer"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        <span>{tk.ticket_number}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[#1A6FD4] bg-blue-50 px-2 py-0.5 rounded-md">{tk.requester_role}</span>
                        <span className="hidden md:inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="hidden md:inline">{tk.category}</span>
                        {tk.assignee_id ? (
                          <span className="rounded-full bg-[#1A6FD4] px-2 py-0.5 text-[10px] font-bold text-white uppercase ml-1">
                            Assigned
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase ml-1">
                            Unassigned
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 truncate text-[16px] md:text-[18px] font-bold text-gray-900 group-hover:text-[#1A6FD4] transition-colors leading-tight">
                        {tk.subject}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <TicketPriorityBadge priority={tk.priority} />
                      <TicketStatusBadge status={tk.status} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                    <span className="text-[13px] font-medium text-gray-400">Updated {timeAgo(tk.last_activity_at)}</span>
                    <SlaCountdown slaDueAt={tk.sla_due_at} status={tk.status} />
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
