"use client";
import { useState, useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Loader2,
  Paperclip,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";

export default function TicketChatPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [agentTyping, setAgentTyping] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTicket();
    setupWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTicket = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/support/tickets/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch ticket");
      
      const { data } = await res.json();
      setTicket(data.ticket);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const ws = new WebSocket(`${WS_URL}/api/support/ws?token=${session.access_token}`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", ticketId: id }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "message" && data.ticketId === id) {
        setMessages((prev) => [...prev, data.message]);
        // Clear typing indicator when a message arrives
        setAgentTyping(null);
      } else if (data.type === "typing" && data.ticketId === id) {
        if (data.isTyping) {
          setAgentTyping(data.userId);
          // Auto-clear after 3s
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setAgentTyping(null), 3000);
        } else {
          setAgentTyping(null);
        }
      }
    };

    wsRef.current = ws;
  };

  const handleTyping = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    fetch(`${API_URL}/api/support/tickets/${id}/typing`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_typing: true }),
    }).catch(console.error);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/support/tickets/${id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: newMessage, is_internal: isInternal }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      setNewMessage("");
      setIsInternal(false);
      // Let WS handle adding the message to UI
    } catch (err) {
      console.error(err);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/support/tickets/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      setTicket({ ...ticket, status: newStatus });
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-teal-600 h-[calc(100vh-72px)]">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">Loading ticket context...</p>
      </div>
    );
  }

  if (!ticket) return <div className="p-8">Ticket not found.</div>;

  const isResolved = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-teal-100 p-6 shadow-sm z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => router.push("/support/dashboard/tickets")}
            className="mt-1 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              {ticket.subject}
              {ticket.priority === "urgent" && <AlertCircle className="w-5 h-5 text-red-500" />}
            </h1>
            <div className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-3">
              <span>#{ticket.id.slice(0, 8).toUpperCase()}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {ticket.requester_role.toUpperCase()}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {format(new Date(ticket.created_at), "MMM d, h:mm a")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-12 sm:pl-0">
          <select
            disabled={statusUpdating}
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-teal-600/20 ${
              ticket.status === 'open' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              ticket.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' :
              'bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 flex flex-col gap-6 relative">
        {messages.map((msg: any, idx: number) => {
          const isAgent = msg.author_role === "support" || msg.author_role === "admin";
          const isSystem = msg.author_role === "system";
          
          if (isSystem) {
            return (
              <div key={msg.id || idx} className="flex justify-center my-2">
                <div className="bg-gray-100 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {msg.body}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id || idx} className={`flex max-w-[85%] ${isAgent ? "self-end" : "self-start"}`}>
              {!isAgent && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-black text-xs mr-3 flex-shrink-0 mt-auto">
                  C
                </div>
              )}
              
              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider ${isAgent ? "justify-end text-teal-600/80" : "text-gray-500"}`}>
                  {isAgent ? "Support Agent" : "Customer"}
                  <span className="text-gray-400 font-medium lowercase tracking-normal">
                    {format(new Date(msg.created_at || new Date()), "h:mm a")}
                  </span>
                </div>
                
                <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm relative group ${
                  msg.is_internal
                    ? "bg-amber-50 border border-amber-200 text-amber-900 rounded-br-none"
                    : isAgent
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-white border border-gray-100 text-gray-900 rounded-bl-none"
                }`}>
                  {msg.is_internal && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">
                      <EyeOff className="w-3 h-3" /> Internal Note
                    </div>
                  )}
                  {msg.body}
                </div>
              </div>

              {isAgent && (
                <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white font-black text-xs ml-3 flex-shrink-0 mt-auto shadow-sm">
                  A
                </div>
              )}
            </div>
          );
        })}
        
        {agentTyping && (
          <div className="flex max-w-[85%] self-start items-end gap-3 mt-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                 <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                 <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
               </div>
            </div>
            <span className="text-xs font-bold text-gray-400">Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-teal-100 p-4 sm:p-6 z-10">
        {isResolved ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-gray-900 font-bold">This ticket is resolved.</p>
            <p className="text-sm text-gray-500 mt-1">Change status to Open to continue the conversation.</p>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex flex-col gap-3">
            <div className={`relative flex items-center bg-white border-2 rounded-2xl transition-all focus-within:ring-4 focus-within:ring-teal-600/10 ${
              isInternal ? "border-amber-300 focus-within:border-amber-500" : "border-gray-200 focus-within:border-teal-600"
            }`}>
              <button
                type="button"
                className="pl-4 pr-3 text-gray-400 hover:text-teal-600 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder={isInternal ? "Type an internal note (hidden from customer)..." : "Type your reply..."}
                className="flex-1 py-4 px-2 bg-transparent text-[15px] font-medium text-gray-900 focus:outline-none placeholder-gray-400"
              />

              <div className="pr-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInternal(!isInternal)}
                  className={`p-2 rounded-xl transition-all ${
                    isInternal ? "bg-amber-100 text-amber-700" : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title="Toggle Internal Note"
                >
                  <EyeOff className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                    !newMessage.trim() || sending
                      ? "bg-gray-100 text-gray-400"
                      : isInternal
                        ? "bg-amber-500 text-white shadow-md hover:bg-amber-600 hover:shadow-lg hover:-translate-y-0.5"
                        : "bg-teal-600 text-white shadow-md hover:bg-teal-500 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {isInternal && (
              <p className="text-xs font-bold text-amber-600 px-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> This message will only be visible to other agents.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
