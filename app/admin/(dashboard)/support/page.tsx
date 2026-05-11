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
    <main className="mx-auto max-w-7xl px-4 py-6 md:py-8 text-[#1A1A2E]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold">
          <LifeBuoy className="h-7 w-7 text-[#1A6FD4]" />
          Support inbox
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/support/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1A6FD4] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> Message a user
          </Link>
          <Link
            href="/admin/support/macros"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#F8FBFF]"
          >
            <Settings2 className="h-4 w-4" /> Macros
          </Link>
          <Link
            href="/admin/support/articles"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#F8FBFF]"
          >
            <FileText className="h-4 w-4" /> Articles
          </Link>
          <Link
            href="/admin/support/reports"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#F8FBFF]"
          >
            <BarChart3 className="h-4 w-4" /> Reports
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-[#E8EEF4] pb-3">
        {STATUS_TABS.map((tt) => (
          <button
            key={tt.key}
            onClick={() => setStatus(tt.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              status === tt.key ? "bg-[#1A6FD4] text-white" : "text-[#4B5563] hover:bg-[#F8FBFF]"
            }`}
          >
            {tt.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="relative col-span-2 md:col-span-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subject or ticket #"
            className="w-full rounded-md border border-[#E8EEF4] bg-white pl-8 pr-3 py-2 text-sm outline-none focus:border-[#1A6FD4]"
          />
        </div>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority | "")}
          className="rounded-md border border-[#E8EEF4] bg-white px-2 py-2 text-sm"
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
          className="rounded-md border border-[#E8EEF4] bg-white px-2 py-2 text-sm"
        >
          <option value="">Customers & sellers</option>
          <option value="customer">Customers only</option>
          <option value="seller">Sellers only</option>
        </select>
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value as "" | "mine" | "unassigned")}
          className="rounded-md border border-[#E8EEF4] bg-white px-2 py-2 text-sm"
        >
          <option value="">Anyone</option>
          <option value="mine">Mine</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      <div className="mt-2">
        <label className="inline-flex items-center gap-2 text-sm text-[#4B5563]">
          <input
            type="checkbox"
            checked={slaBreached}
            onChange={(e) => setSlaBreached(e.target.checked)}
            className="h-4 w-4 accent-[#DC2626]"
          />
          <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
          SLA breached only
        </label>
      </div>

      {/* List */}
      <section className="mt-4">
        {loading ? (
          <div className="rounded-xl border border-[#E8EEF4] bg-white p-8 text-center text-sm text-[#9CA3AF]">
            Loading tickets…
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8EEF4] bg-white p-10 text-center">
            <Inbox className="mx-auto h-10 w-10 text-[#9CA3AF]" />
            <div className="mt-2 text-sm font-semibold">No matching tickets</div>
          </div>
        ) : (
          <ul className="divide-y divide-[#E8EEF4] rounded-xl border border-[#E8EEF4] bg-white">
            {tickets.map((tk) => (
              <li key={tk.id}>
                <Link
                  href={`/admin/support/${tk.id}`}
                  className="block px-4 py-3 hover:bg-[#F8FBFF]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
                        <span className="font-mono">{tk.ticket_number}</span>
                        <span>·</span>
                        <span className="capitalize">{tk.requester_role}</span>
                        <span>·</span>
                        <span>{tk.category}</span>
                        {tk.assignee_id ? (
                          <span className="rounded-full bg-[#DBEAFE] px-2 py-0.5 text-[10px] font-semibold text-[#1A6FD4]">
                            Assigned
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#B45309]">
                            Unassigned
                          </span>
                        )}
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
