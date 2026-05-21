"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Bot, Wrench, ShieldAlert, Clock, Code, Copy, Check, MessageSquare, Loader2 } from "lucide-react";

interface SessionDetail {
  session: {
    id: string;
    surface: string;
    user_role: string;
    started_at: string;
    escalated_ticket_id: string | null;
  };
  messages: any[];
  toolCalls: any[];
}

export default function SessionTranscriptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<SessionDetail>(`/api/admin/chatbot/sessions/${id}`);
      setData(res);
    } catch (err) {
      console.error(err);
      alert("Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopied(msgId);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  const { session, messages, toolCalls } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/chatbot')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Session Transcript</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[13px] font-medium text-gray-400 font-mono">{session.id}</span>
              <span className="text-gray-300">•</span>
              <span className="text-[13px] font-medium text-gray-500 capitalize">{session.surface} Portal</span>
              <span className="text-gray-300">•</span>
              {session.escalated_ticket_id ? (
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide text-amber-700 bg-amber-50 border-amber-200">Escalated #{session.escalated_ticket_id}</span>
              ) : (
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide text-green-700 bg-green-50 border-green-200">Deflected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Transcript Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare size={16} className="text-[#8B5CF6]" /> Message Log
              </h3>
              <span className="text-[12px] font-bold text-gray-500">{messages.length} exchanges</span>
            </div>
            
            <div className="p-6 space-y-6 max-h-[700px] overflow-y-auto bg-gray-50/30">
              {messages.map((msg, i) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0 mt-1">
                      {msg.role === 'tool' ? <Wrench size={16} className="text-[#8B5CF6]" /> : <Bot size={16} className="text-[#8B5CF6]" />}
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm' : ''}`}>
                    {msg.role !== 'user' && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[13px] font-bold text-gray-900 capitalize">{msg.role}</span>
                        <span className="text-[12px] font-medium text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</span>
                        {msg.latency_ms && <span className="text-[10px] font-bold text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{msg.latency_ms}ms</span>}
                      </div>
                    )}
                    
                    {msg.role === 'user' ? (
                       <div className="text-[14px] whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-[14px]">
                        {msg.content && (
                          <div className="p-4 whitespace-pre-wrap text-gray-800 border-b border-gray-100 last:border-0 leading-relaxed">
                            {msg.content}
                          </div>
                        )}
                        {msg.tool_name && (
                          <div className="p-4 bg-gray-50 font-mono text-xs text-gray-600">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-[#8B5CF6]">⚙️ Call: {msg.tool_name}</span>
                              <button onClick={() => copyToClipboard(JSON.stringify(msg.tool_output, null, 2), msg.id)} className="text-gray-400 hover:text-gray-700 transition-colors">
                                {copied === msg.id ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <span className="text-gray-400 block mb-1">Input:</span>
                                <pre className="bg-white p-2 rounded-lg border border-gray-200 overflow-x-auto text-[11px]">{JSON.stringify(msg.tool_input, null, 2)}</pre>
                              </div>
                              {msg.tool_output && (
                                <div>
                                  <span className="text-gray-400 block mb-1">Output:</span>
                                  <pre className="bg-white p-2 rounded-lg border border-gray-200 overflow-x-auto text-[11px] max-h-40">{JSON.stringify(msg.tool_output, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#8B5CF6]" /> Guardrail Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Total Tokens Used</span>
                <div className="flex items-end gap-2">
                  <span className="text-[28px] font-bold text-gray-900 tracking-tight leading-none">
                    {messages.reduce((acc: number, m: any) => acc + (m.tokens_in || 0) + (m.tokens_out || 0), 0).toLocaleString()}
                  </span>
                  <span className="text-[13px] font-medium text-gray-500 mb-0.5">/ 8,000 budget</span>
                </div>
              </div>
              <div className="h-px bg-gray-100 w-full" />
              <div>
                 <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Policy Citations</span>
                 {messages.some((m: any) => m.content && m.content.includes('[Policy]')) ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border text-green-700 bg-green-50 border-green-200">
                      <Check size={14} /> Citations Present
                    </span>
                 ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border text-gray-500 bg-gray-50 border-gray-200">
                      No explicitly marked citations
                    </span>
                 )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Code size={16} className="text-[#8B5CF6]" /> Tool Execution Trace
            </h3>
            {toolCalls.length === 0 ? (
              <p className="text-[14px] font-medium text-gray-500">No external tools executed in this session.</p>
            ) : (
              <div className="space-y-3">
                {toolCalls.map((tc: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[13px] font-bold text-gray-900">{tc.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${tc.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{tc.status}</span>
                    </div>
                    <div className="text-[12px] font-medium text-gray-500 font-mono mt-2 flex justify-between">
                      <span>{tc.duration_ms}ms execution</span>
                      <span>{new Date(tc.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
