"use client";
import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { Search, Filter, MessageSquare, Clock, ArrowRight, Loader2, User, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function TicketQueuePage() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Filters state
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [assignee, setAssignee] = useState(searchParams.get("filter") === "mine" ? "mine" : "all");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then((res: any) => {
      if (res.data?.user) setCurrentUserId(res.data.user.id);
    });
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [status, assignee]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      if (assignee !== "all") params.append("assignee_id", assignee);
      params.append("limit", "50");

      const res = await fetch(`${API_URL}/api/admin/support/tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      
      const json = await res.json();
      setTickets(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 flex flex-col h-[calc(100vh-72px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ticket Queue</h1>
          <p className="text-gray-500 mt-2 font-medium">
            {assignee === "mine" ? "Tickets assigned to you." : "All active and historical tickets."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subjects..."
              className="pl-10 pr-4 py-2 bg-white border border-teal-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 shadow-sm w-64"
            />
          </div>

          <div className="flex bg-white rounded-xl border border-teal-100 p-1 shadow-sm">
             <button
              onClick={() => setStatus("all")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                status === "all" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-teal-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatus("open")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                status === "open" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-teal-700"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatus("in_progress")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                status === "in_progress" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-teal-700"
              }`}
            >
              In Progress
            </button>
          </div>

          <div className="flex bg-white rounded-xl border border-teal-100 p-1 shadow-sm">
             <button
              onClick={() => setAssignee("all")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                assignee === "all" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-teal-700"
              }`}
            >
              Everyone
            </button>
            <button
              onClick={() => setAssignee("mine")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                assignee === "mine" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-teal-700"
              }`}
            >
              <User className="w-4 h-4" />
              Mine
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-teal-100 shadow-sm flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-teal-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-bold">Loading queue...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-teal-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500 font-medium">Adjust your filters or take a well-deserved break.</p>
          </div>
        ) : (
          <div className="overflow-y-auto no-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-teal-100">
                <tr>
                  <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Ticket</th>
                  <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Requester</th>
                  <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Assignee</th>
                  <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-teal-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/support/dashboard/tickets/${t.id}`}>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 group-hover:text-teal-900 transition-colors">
                        {t.subject}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">
                        #{t.id.slice(0, 8).toUpperCase()} • {t.category}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        t.status === 'open' ? 'bg-amber-100 text-amber-700' :
                        t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        t.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                       <span className={`text-xs font-bold uppercase tracking-wider ${
                        t.priority === 'urgent' ? 'text-red-600 flex items-center gap-1' :
                        t.priority === 'high' ? 'text-amber-600' :
                        'text-gray-500'
                      }`}>
                        {t.priority === 'urgent' && <AlertTriangle className="w-3 h-3" />}
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        {t.requester_role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {t.assignee_id ? (
                        <span className={`text-sm font-bold ${t.assignee_id === currentUserId ? 'text-teal-600' : 'text-gray-600'}`}>
                          {t.assignee_id === currentUserId ? 'You' : 'Assigned'}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors inline-block group-hover:translate-x-1" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
