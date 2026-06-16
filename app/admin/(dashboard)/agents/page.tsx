"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { HeadphonesIcon, CheckCircle2, Clock, XCircle, AlertTriangle, Loader2 } from "lucide-react";

interface AgentStatus {
  id: string;
  name: string;
  email: string;
  role: string;
  agent_status: string;
  effective_online: boolean;
  processing_count: number;
  solved_count: number;
  has_active_while_offline: boolean;
}

export default function LiveAgentsPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const res = await api.get<{ data: AgentStatus[], queue_count: number }>("/api/admin/support/agents", { silent: true });
      if (res?.data) {
        setAgents(res.data);
      }
      if (typeof res?.queue_count === 'number') {
        setQueueCount(res.queue_count);
      }
    } catch (err) {
      console.error("Failed to fetch live agents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 12000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = agents.filter(a => a.effective_online).length;
  const totalProcessing = agents.reduce((sum, a) => sum + a.processing_count, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HeadphonesIcon className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              Support Monitor
            </span>
          </div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            Live Agents
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Real-time support team monitoring and queue status.
          </p>
        </div>

        {/* Minimal Stats Row */}
        {!loading && (
          <div className="flex items-center gap-6 px-5 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Online</span>
              <div className="flex items-center gap-1.5 text-[15px] font-bold text-gray-900">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {onlineCount} <span className="text-gray-400 font-medium">/ {agents.length}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Processing</span>
              <div className="text-[15px] font-bold text-gray-900">
                {totalProcessing}
              </div>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Queue</span>
              <div className={`flex items-center gap-1.5 text-[15px] font-bold ${queueCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                {queueCount > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                {queueCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agents List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Agent
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  Processing
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  Solved
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && agents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#8B5CF6]" />
                    <p className="text-[14px] text-gray-500 font-medium">Loading agents...</p>
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <HeadphonesIcon className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-[15px] font-bold text-gray-900 mb-1">No support agents found</p>
                    <p className="text-[13px] text-gray-500">Wait for agents to be added to the team.</p>
                  </td>
                </tr>
              ) : (
                agents.map(agent => (
                  <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-gray-900">{agent.name}</span>
                        <span className="text-[13px] text-gray-500">{agent.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {agent.effective_online ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 w-max">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[12px] font-bold">Online</span>
                          </div>
                        ) : agent.agent_status === 'break' ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-100 w-max">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[12px] font-bold">On Break</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-200 w-max">
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="text-[12px] font-bold">Offline</span>
                          </div>
                        )}
                        {agent.has_active_while_offline && (
                          <span className="text-[12px] font-bold text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-100" title="Offline but has active tickets!">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Warning
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] h-7 rounded-md text-[13px] font-bold ${agent.processing_count > 0 ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-gray-400'}`}>
                          {agent.processing_count}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] h-7 rounded-md text-[13px] font-bold text-gray-600">
                          {agent.solved_count}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
