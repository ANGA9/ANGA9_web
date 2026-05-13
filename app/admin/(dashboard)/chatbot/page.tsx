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
  ExternalLink,
  ShieldCheck
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
    return <div className="p-8 text-center text-gray-500 flex items-center justify-center h-64"><RefreshCw className="animate-spin mr-2" /> Loading observatory...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="text-[#8B5CF6]" /> Chatbot Observatory
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor AI sessions, safety guardrails, and token costs.</p>
        </div>
        <button 
          onClick={handleReindex}
          disabled={reindexing}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={reindexing ? "animate-spin" : ""} />
          {reindexing ? "Reindexing KB..." : "Force Sync KB"}
        </button>
      </div>

      {/* Metrics Row */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Sessions</p>
              <h3 className="text-3xl font-black text-gray-900">{summary.totalSessions.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Deflection Rate</p>
              <h3 className="text-3xl font-black text-[#22C55E]">{summary.deflectionRate}</h3>
              <p className="text-xs text-gray-400 mt-1">{summary.escalatedSessions} escalated to human</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#22C55E] flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Estimated Cost</p>
              <h3 className="text-3xl font-black text-purple-600">${summary.estimatedCostUsd.toFixed(3)}</h3>
              <p className="text-xs text-gray-400 mt-1">{((summary.tokensIn + summary.tokensOut) / 1000).toFixed(1)}k tokens processed</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Sessions</h3>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
             <ShieldCheck size={14} className="text-green-600" /> Phase 7 Safety Active
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[13px] text-gray-500 border-b border-gray-100">
                <th className="font-medium py-3 px-6">Date</th>
                <th className="font-medium py-3 px-6">Surface</th>
                <th className="font-medium py-3 px-6">User Role</th>
                <th className="font-medium py-3 px-6">Messages</th>
                <th className="font-medium py-3 px-6">Status</th>
                <th className="font-medium py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-gray-900 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      {new Date(session.started_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      session.surface === 'customer' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {session.surface}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600 capitalize">{session.user_role}</td>
                  <td className="py-4 px-6 text-gray-600">{session.message_count}</td>
                  <td className="py-4 px-6">
                    {session.escalated_ticket_id ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md">
                        Escalated #{session.escalated_ticket_id}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-md">
                        Deflected
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link 
                      href={`/admin/chatbot/${session.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
                    >
                      View <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No sessions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
