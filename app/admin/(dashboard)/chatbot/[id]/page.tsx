"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Bot, Wrench, ShieldAlert, Clock, Code, Copy, Check } from "lucide-react";

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
    return <div className="p-8 text-center text-gray-500">Loading transcript...</div>;
  }

  const { session, messages, toolCalls } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/admin/chatbot')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Session Transcript
          </h1>
          <div className="flex items-center gap-3 text-sm mt-1">
            <span className="text-gray-500 font-mono text-xs">{session.id}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500 capitalize">{session.surface} Portal</span>
            <span className="text-gray-300">•</span>
            {session.escalated_ticket_id ? (
              <span className="text-amber-600 font-medium bg-amber-50 px-2 rounded-md">Escalated #{session.escalated_ticket_id}</span>
            ) : (
              <span className="text-green-600 font-medium bg-green-50 px-2 rounded-md">Deflected</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Transcript Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-gray-400" /> Message Log
              </h3>
              <span className="text-xs font-medium text-gray-500">{messages.length} exchanges</span>
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
                        <span className="text-sm font-semibold text-gray-900 capitalize">{msg.role}</span>
                        <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</span>
                        {msg.latency_ms && <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1 rounded">{msg.latency_ms}ms</span>}
                      </div>
                    )}
                    
                    {msg.role === 'user' ? (
                       <div className="text-[15px] whitespace-pre-wrap">{msg.content}</div>
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
                              <span className="font-bold text-purple-700">⚙️ Call: {msg.tool_name}</span>
                              <button onClick={() => copyToClipboard(JSON.stringify(msg.tool_output, null, 2), msg.id)} className="text-gray-400 hover:text-gray-700">
                                {copied === msg.id ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <span className="text-gray-400 block mb-1">Input:</span>
                                <pre className="bg-white p-2 rounded border border-gray-200 overflow-x-auto text-[11px]">{JSON.stringify(msg.tool_input, null, 2)}</pre>
                              </div>
                              {msg.tool_output && (
                                <div>
                                  <span className="text-gray-400 block mb-1">Output:</span>
                                  <pre className="bg-white p-2 rounded border border-gray-200 overflow-x-auto text-[11px] max-h-40">{JSON.stringify(msg.tool_output, null, 2)}</pre>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert size={18} className="text-gray-400" /> Guardrail Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Total Tokens Used</span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-gray-900">
                    {messages.reduce((acc, m) => acc + (m.tokens_in || 0) + (m.tokens_out || 0), 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">/ 8,000 budget</span>
                </div>
              </div>
              <div className="h-px bg-gray-100 w-full" />
              <div>
                 <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Policy Citations</span>
                 {messages.some(m => m.content && m.content.includes('[Policy]')) ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded-md">
                      <Check size={14} /> Citations Present
                    </span>
                 ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
                      No explicitly marked citations
                    </span>
                 )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code size={18} className="text-gray-400" /> Tool Execution Trace
            </h3>
            {toolCalls.length === 0 ? (
              <p className="text-sm text-gray-500">No external tools executed in this session.</p>
            ) : (
              <div className="space-y-3">
                {toolCalls.map((tc, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold text-gray-900">{tc.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tc.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{tc.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-2 flex justify-between">
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

// Ensure MessageSquare is available since it wasn't imported at top
function MessageSquare(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
