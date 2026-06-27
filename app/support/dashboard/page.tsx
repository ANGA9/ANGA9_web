import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getStats(token: string) {
  try {
    const res = await fetch(`${API_URL}/api/admin/support/tickets?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json;
  } catch (e) {
    return null;
  }
}

async function getLeaderboard(token: string) {
  try {
    const res = await fetch(`${API_URL}/api/support/leaderboard?period=7d`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return data || [];
  } catch (e) {
    return [];
  }
}

export default async function SupportDashboardPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;

  const stats = await getStats(session.access_token);
  const tickets = stats?.data || [];
  const leaderboard = await getLeaderboard(session.access_token);

  const openCount = tickets.filter((t: any) => t.status === "open").length;
  const inProgressCount = tickets.filter((t: any) => t.status === "in_progress").length;
  const myTickets = tickets.filter((t: any) => t.assignee_id === session.user.id).length;
  
  // This is a naive client-side check just for the dashboard overview. 
  // Real SLA breaches are calculated by the SLA service cron.
  const slaBreached = tickets.filter((t: any) => t.is_sla_breached).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Agent Dashboard</h1>
        <p className="text-gray-500 mt-2 font-medium">
          Welcome back. Here's what's happening in the queue today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24 text-teal-600 -mt-8 -mr-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Open Tickets</p>
            <p className="text-4xl font-black text-gray-900">{openCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowRight className="w-24 h-24 text-blue-600 -mt-8 -mr-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">In Progress</p>
            <p className="text-4xl font-black text-gray-900">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-24 h-24 text-green-600 -mt-8 -mr-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Assigned to Me</p>
            <p className="text-4xl font-black text-gray-900">{myTickets}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-24 h-24 text-red-600 -mt-8 -mr-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">SLA Breached</p>
            <p className="text-4xl font-black text-red-600">{slaBreached}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-teal-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Tickets</h2>
            <Link href="/support/dashboard/tickets" className="text-sm font-bold text-teal-600 hover:text-teal-700">
              View All Queue &rarr;
            </Link>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.slice(0, 5).map((t: any) => (
                  <Link key={t.id} href={`/support/dashboard/tickets/${t.id}`} className="block group">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 group-hover:border-teal-200 group-hover:bg-teal-50/30 transition-all">
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-teal-900 transition-colors">{t.subject}</p>
                        <p className="text-sm text-gray-500 mt-1 flex gap-2 items-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            t.status === 'open' ? 'bg-amber-100 text-amber-700' :
                            t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            t.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                          <span>•</span>
                          <span className={t.priority === 'urgent' ? 'text-red-600 font-bold' : ''}>
                            {t.priority.toUpperCase()}
                          </span>
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <CheckCircle2 className="w-12 h-12 text-teal-200 mx-auto mb-4" />
                <p className="font-bold">Inbox Zero!</p>
                <p className="text-sm mt-1">No active tickets right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
