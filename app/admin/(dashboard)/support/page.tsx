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
  Filter,
  Loader2,
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
  { key: "in_progress",  label: "In Progress" },
  { key: "pending_user", label: "Awaiting User" },
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Support Inbox</h1>
          <p className="text-[15px] text-gray-500 font-medium">Manage customer and seller inquiries</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/support/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:shadow-md hover:bg-[#7C3AED] transition-all"
          >
            <Plus className="h-4 w-4" /> Message a user
          </Link>
          <Link
            href="/admin/support/macros"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Settings2 className="h-4 w-4 text-gray-500" /> Macros
          </Link>
          <Link
            href="/admin/support/articles"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <FileText className="h-4 w-4 text-gray-500" /> Articles
          </Link>
          <Link
            href="/admin/support/reports"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <BarChart3 className="h-4 w-4 text-gray-500" /> Reports
          </Link>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Filters */}
        <div className="w-full lg:w-[280px] shrink-0">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm sticky top-6">
            <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Filter className="w-4 h-4 text-[#8B5CF6]" /> Filters
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Subject or ticket #"
                    className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                <div className="flex flex-col gap-1">
                  {STATUS_TABS.map((tt) => (
                    <button
                      key={tt.key}
                      onClick={() => setStatus(tt.key)}
                      className={`text-left px-3 py-2 rounded-xl text-[13px] font-bold transition-all ${
                        status === tt.key
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {tt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority | "")}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all appearance-none"
                >
                  <option value="">Any Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Requester</label>
                <select
                  value={requesterRole}
                  onChange={(e) => setRequesterRole(e.target.value as RequesterRole | "")}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all appearance-none"
                >
                  <option value="">Customers & Sellers</option>
                  <option value="customer">Customers Only</option>
                  <option value="seller">Sellers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Assignee</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value as "" | "mine" | "unassigned")}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all appearance-none"
                >
                  <option value="">Anyone</option>
                  <option value="mine">Assigned to Me</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={slaBreached}
                      onChange={(e) => setSlaBreached(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-gray-300 bg-white peer-checked:bg-red-500 peer-checked:border-red-500 transition-colors" />
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5 group-hover:text-gray-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> SLA Breached Only
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center h-full justify-center min-h-[400px]">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Matching Tickets</h2>
              <p className="text-[15px] text-gray-500 font-medium">Try adjusting your filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((tk) => (
                <Link
                  key={tk.id}
                  href={`/admin/support/${tk.id}`}
                  className="block bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:border-[#8B5CF6]/40 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{tk.ticket_number}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          tk.requester_role === "seller" ? "bg-indigo-50 text-indigo-700" : "bg-green-50 text-green-700"
                        }`}>
                          {tk.requester_role}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
                        <span className="text-[12px] font-bold text-gray-500 hidden sm:block">{tk.category}</span>
                        {tk.assignee_id ? (
                          <span className="rounded-full bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 text-[10px] font-bold uppercase ml-1">
                            Assigned
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase ml-1">
                            Unassigned
                          </span>
                        )}
                      </div>
                      <h3 className="text-[18px] font-bold text-gray-900 group-hover:text-[#8B5CF6] transition-colors leading-tight mb-1 truncate">
                        {tk.subject}
                      </h3>
                      <p className="text-[13px] font-medium text-gray-500">
                        Updated {timeAgo(tk.last_activity_at)}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <TicketPriorityBadge priority={tk.priority} />
                        <TicketStatusBadge status={tk.status} />
                      </div>
                      <div className="flex items-center mt-auto">
                        <SlaCountdown slaDueAt={tk.sla_due_at} status={tk.status} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
