"use client";

import { useEffect, useState } from "react";
import { qaApi } from "@/lib/qaApi";
import { Loader2, MessageSquare, Check, X as XIcon, EyeOff, Reply } from "lucide-react";
import { toast } from "react-hot-toast";

interface QaItem {
  type: "questions" | "answers";
  id: string;
  product_id?: string;
  question_id?: string;
  user_id: string;
  text: string;
  status: "pending" | "approved" | "rejected" | "hidden";
  created_at: string;
  users?: { full_name: string; email: string };
  products?: { name: string };
}

export default function AdminQaPage() {
  const [items, setItems] = useState<QaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyItem, setReplyItem] = useState<QaItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await qaApi.adminGetQa();
      // The backend returns a mixed array of questions and answers
      // We map them to a unified QaItem interface
      const mapped: QaItem[] = data.data.map(item => {
        const isQ = !item.question_id;
        return {
          type: isQ ? "questions" : "answers",
          id: item.id,
          product_id: item.product_id,
          question_id: item.question_id,
          user_id: item.user_id || item.asker_id || item.author_id,
          text: item.body,
          status: item.status,
          created_at: item.created_at,
          users: item.users,
          products: item.products,
        };
      });
      setItems(mapped);
    } catch {
      toast.error("Failed to load Q&A items");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (item: QaItem, newStatus: "approved" | "rejected" | "hidden") => {
    try {
      await qaApi.adminModerateQa(item.type, item.id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      setItems(prev => prev.map(i => (i.id === item.id && i.type === item.type) ? { ...i, status: newStatus } : i));
    } catch {
      toast.error(`Failed to update status`);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyItem || !replyText.trim()) return;
    setReplying(true);
    try {
      // Admins answer via the same endpoint as customers, but backend identifies role if needed
      await qaApi.answerQuestion(replyItem.id, replyText);
      toast.success("Answer posted successfully");
      setReplyModalOpen(false);
      setReplyText("");
      setReplyItem(null);
      // Refresh to show the new answer in the list
      fetchItems();
    } catch {
      toast.error("Failed to post answer");
    } finally {
      setReplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase">Approved</span>;
      case "rejected":
        return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase">Rejected</span>;
      case "hidden":
        return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase">Hidden</span>;
      case "pending":
      default:
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase">Pending</span>;
    }
  };

  return (
    <>
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Q&A Moderation</h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Review, approve, or reject customer questions and answers.
          </p>
        </div>
      </div>
      {/* ── Content ── */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Q&A items</h2>
          <p className="text-[15px] text-gray-500 font-medium">
            There are no questions or answers to moderate right now.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[33%]">Content</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(() => {
                  const qs = items.filter(i => i.type === "questions");
                  const as = items.filter(i => i.type === "answers");
                  const groupedItems: QaItem[] = [];
                  qs.forEach(q => {
                    groupedItems.push(q);
                    groupedItems.push(...as.filter(a => a.question_id === q.id));
                  });
                  as.filter(a => !qs.some(q => q.id === a.question_id)).forEach(a => groupedItems.push(a));
                  
                  return groupedItems.map((item) => {
                    const isChildAnswer = item.type === "answers" && item.question_id && qs.some(q => q.id === item.question_id);
                    return (
                      <tr key={`${item.type}-${item.id}`} className={`transition-colors group ${isChildAnswer ? "bg-gray-50/40 hover:bg-gray-100/50" : "hover:bg-gray-50/50"}`}>
                        <td className={`px-6 py-4 ${isChildAnswer ? "pl-12 border-l-2 border-l-purple-300" : ""}`}>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                        item.type === "questions" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-purple-50 text-purple-700 border-purple-100"
                      }`}>
                        {item.type === "questions" ? "question" : "answer"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 truncate max-w-[150px]">
                        {item.users?.full_name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {item.users?.email || item.user_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800 line-clamp-2" title={item.text}>
                        {item.text}
                      </p>
                      {item.products?.name && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-[250px]">
                          Product: {item.products.name}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== "approved" && (
                          <button
                            onClick={() => handleAction(item, "approved")}
                            className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== "rejected" && (
                          <button
                            onClick={() => handleAction(item, "rejected")}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== "hidden" && (
                          <button
                            onClick={() => handleAction(item, "hidden")}
                            className="p-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Hide"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}

                        {item.type === "questions" && (
                          <button
                            onClick={() => {
                              setReplyItem(item);
                              setReplyText("");
                              setReplyModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Reply / Answer"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

      {/* Reply Modal */}
      {replyModalOpen && replyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Answer Question</h3>
              <button 
                onClick={() => setReplyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-blue-900 mb-1">Question from {replyItem.users?.full_name || "Unknown"}</p>
                <p className="text-sm text-blue-800 line-clamp-3">{replyItem.text}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Answer</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/20 outline-none transition-all resize-none text-[15px]"
                  rows={5}
                  placeholder="Type your answer here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setReplyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={!replyText.trim() || replying}
                className="px-5 py-2.5 rounded-xl font-bold bg-[#1A6FD4] text-white hover:bg-[#155ab0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Post Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
