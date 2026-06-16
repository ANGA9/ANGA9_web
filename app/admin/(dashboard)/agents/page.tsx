"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Users, Headset, CheckCircle2, Clock, XCircle, AlertTriangle, Activity } from "lucide-react";

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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
          <Headset className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Live Agents</h1>
          <p className="text-gray-500 font-medium text-[15px]">Real-time support team monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-emerald-600 mb-4">
            <Activity className="w-5 h-5" />
            <span className="font-bold">Agents Online</span>
          </div>
          <div className="text-4xl font-black text-gray-900">{onlineCount} <span className="text-xl text-gray-400 font-bold">/ {agents.length}</span></div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <Users className="w-5 h-5" />
            <span className="font-bold">Total Processing</span>
          </div>
          <div className="text-4xl font-black text-gray-900">{totalProcessing}</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <AlertTriangle className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3 text-amber-600 mb-4 relative z-10">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold">Unassigned Queue</span>
          </div>
          <div className="text-4xl font-black text-gray-900 relative z-10">{queueCount}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-black tracking-widest text-gray-400 uppercase">Agent</th>
                <th className="py-4 px-6 text-xs font-black tracking-widest text-gray-400 uppercase">Status</th>
                <th className="py-4 px-6 text-xs font-black tracking-widest text-gray-400 uppercase text-center">Processing</th>
                <th className="py-4 px-6 text-xs font-black tracking-widest text-gray-400 uppercase text-center">Solved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && agents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">Loading agents...</td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">No support agents found.</td>
                </tr>
              ) : (
                agents.map(agent => (
                  <tr key={agent.id} className={`hover:bg-gray-50/50 transition-colors ${agent.has_active_while_offline ? 'bg-red-50/30' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{agent.name}</span>
                        <span className="text-[13px] text-gray-500">{agent.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {agent.effective_online ? (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 w-max">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">Online</span>
                          </div>
                        ) : agent.agent_status === 'break' ? (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 w-max">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">Break</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200 w-max">
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">Offline</span>
                          </div>
                        )}
                        {agent.has_active_while_offline && (
                          <span className="ml-2 text-xs font-bold text-red-500 flex items-center gap-1" title="Agent is offline but has active tickets!">
                            <AlertTriangle className="w-3.5 h-3.5" /> Warning
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[2rem] h-8 rounded-lg font-bold ${agent.processing_count > 0 ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-gray-400'}`}>
                        {agent.processing_count}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] h-8 rounded-lg font-bold text-gray-600">
                        {agent.solved_count}
                      </span>
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
