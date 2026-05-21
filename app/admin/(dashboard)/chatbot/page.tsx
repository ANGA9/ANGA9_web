"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  Bot, 
  RefreshCw, 
  MessageSquare, 
  TrendingDown, 
  Wallet,
  Clock,
  ArrowRight,
  ShieldCheck,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface ReportSummary {
  totalSessions: number;
  escalatedSessions: number;
  deflectionRate: string;
  tokensIn: number;
  tokensOut: number;
  estimatedCostUsd: number;
}

interface ChatbotSession {
  id: string;
  user_role: string;
  surface: string;
  started_at: string;
  escalated_ticket_id: string | null;
  message_count: number;
}

export default function ChatbotObservatoryPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [sessions, setSessions] = useState<ChatbotSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, sessRes] = await Promise.all([
        api.get<ReportSummary>("/api/admin/chatbot/reports/summary"),
        api.get<{ data: ChatbotSession[] }>("/api/admin/chatbot/sessions?limit=20")
      ]);
      setSummary(sumRes);
      setSessions(sessRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      await api.post("/api/admin/chatbot/kb/reindex");
      alert("Reindexing completed successfully.");
    } catch (err) {
      alert("Failed to reindex KB.");
    } finally {
      setReindexing(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Chatbot Observatory</h1>
          <p className="text-[15px] text-gray-500 font-medium">Monitor AI sessions, safety guardrails, and token costs.</p>
        </div>
        <button 
          onClick={handleReindex}
          disabled={reindexing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={reindexing ? "animate-spin" : ""} />
          {reindexing ? "Reindexing KB..." : "Force Sync KB"}
        </button>
      </div>

      {/* ── Metrics Row ── */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-[0.15] transition-transform group-hover:scale-110 bg-blue-500" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-blue-50 text-blue-600 border-blue-200/30">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{summary.totalSessions.toLocaleString()}</p>
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3">Total Sessions</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-[0.15] transition-transform group-hover:scale-110 bg-[#22C55E]" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-green-50 text-[#22C55E] border-green-200/30">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[32px] font-bold text-[#22C55E] tracking-tight leading-none mb-1">{summary.deflectionRate}</p>
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3">Deflection Rate</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase bg-red-50 text-red-700">
                  {summary.escalatedSessions}
                </span>
                <span className="text-[12px] font-medium text-gray-500">escalated to human</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-[0.15] transition-transform group-hover:scale-110 bg-[#8B5CF6]" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-purple-50 text-[#8B5CF6] border-purple-200/30">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">${summary.estimatedCostUsd.toFixed(3)}</p>
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3">Estimated Cost</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase bg-green-50 text-green-700">
                  {((summary.tokensIn + summary.tokensOut) / 1000).toFixed(1)}k
                </span>
                <span className="text-[12px] font-medium text-gray-500">tokens processed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sessions Table ── */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#8B5CF6]" /> Recent Sessions
          </h3>
          <div className="flex items-center gap-2 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
             <ShieldCheck size={14} /> Phase 7 Safety Active
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Surface</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">User Role</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Messages</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-[14px] font-medium text-gray-900 whitespace-nowrap">
                        {new Date(session.started_at).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide capitalize ${
                      session.surface === 'customer' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {session.surface}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[14px] font-medium text-gray-600 capitalize">{session.user_role}</td>
                  <td className="py-4 px-6 text-[14px] font-medium text-gray-600">{session.message_count}</td>
                  <td className="py-4 px-6">
                    {session.escalated_ticket_id ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide text-amber-700 bg-amber-50 border-amber-200">
                        Escalated #{session.escalated_ticket_id}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide text-green-700 bg-green-50 border-green-200">
                        Deflected
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link 
                      href={`/admin/chatbot/${session.id}`}
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
                    >
                      View <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Bot className="w-10 h-10 text-gray-300" />
                      </div>
                      <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Sessions Found</h2>
                      <p className="text-[15px] text-gray-500 font-medium">Chatbot sessions will appear here once users start interacting.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
