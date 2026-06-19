"use client";

import { useEffect, useState } from "react";
import { qaApi, type QaQuestion } from "@/lib/qaApi";
import { useAuth } from "@/lib/AuthContext";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { Loader2, HelpCircle, ThumbsUp, UserCircle, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductQA({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<QaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newQuestion, setNewQuestion] = useState("");
  const [submittingQ, setSubmittingQ] = useState(false);
  
  const [answeringFor, setAnsweringFor] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState("");
  const [submittingA, setSubmittingA] = useState(false);

  const { user } = useAuth();
  const { open: openLoginSheet } = useLoginSheet();

  useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const fetchQuestions = async () => {
    try {
      const data = await qaApi.getQuestions(productId);
      setQuestions(data.questions || []);
    } catch {
      // toast.error("Failed to load Q&A");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginSheet();
      return;
    }
    if (!newQuestion.trim()) return;

    setSubmittingQ(true);
    try {
      await qaApi.askQuestion(productId, newQuestion);
      toast.success("Question submitted. It will appear after moderation.");
      setNewQuestion("");
    } catch {
      toast.error("Failed to submit question");
    } finally {
      setSubmittingQ(false);
    }
  };

  const handleAnswer = async (e: React.FormEvent, questionId: string) => {
    e.preventDefault();
    if (!user) {
      openLoginSheet();
      return;
    }
    if (!newAnswer.trim()) return;

    setSubmittingA(true);
    try {
      await qaApi.answerQuestion(questionId, newAnswer);
      toast.success("Answer submitted. It will appear after moderation.");
      setAnsweringFor(null);
      setNewAnswer("");
    } catch {
      toast.error("Failed to submit answer");
    } finally {
      setSubmittingA(false);
    }
  };

  const handleHelpful = async (answerId: string) => {
    if (!user) {
      openLoginSheet();
      return;
    }
    try {
      await qaApi.markHelpful(answerId);
      // Optimistically update
      setQuestions(prev => prev.map(q => ({
        ...q,
        answers: q.answers?.map(a => 
          a.id === answerId ? { ...a, helpful_votes: a.helpful_votes + 1 } : a
        )
      })));
      toast.success("Marked as helpful");
    } catch {
      toast.error("Failed to mark as helpful");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border p-6 md:p-8" style={{ borderColor: t.border }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-[#1A6FD4]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Customer Questions & Answers</h2>
      </div>

      <div className="mb-10 bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
        <h3 className="text-[15px] font-bold text-gray-900 mb-3">Have a question about this product?</h3>
        <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Type your question here..."
            className="flex-1 h-12 px-4 rounded-xl border border-gray-200 focus:border-[#1A6FD4] focus:ring-1 focus:ring-[#1A6FD4] outline-none text-[15px]"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            disabled={submittingQ}
          />
          <button
            type="submit"
            disabled={submittingQ || !newQuestion.trim()}
            className="h-12 px-6 rounded-xl font-bold text-white shadow-sm active:scale-95 transition-all disabled:opacity-50"
            style={{ background: t.bluePrimary }}
          >
            {submittingQ ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Ask Question"}
          </button>
        </form>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-[15px]">No questions have been asked yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-8 divide-y divide-gray-100">
          {questions.map((q) => (
            <div key={q.id} className="pt-6 first:pt-0">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <UserCircle className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1">
                    <span className="font-bold text-[15px] text-gray-900">{q.users?.full_name || "Customer"}</span>
                    <span className="text-xs text-gray-500">{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[15px] text-gray-800 font-medium leading-relaxed mb-4">
                    <span className="font-bold text-gray-400 mr-2">Q:</span>
                    {q.question_text}
                  </p>

                  <div className="space-y-4 ml-2 sm:ml-6 border-l-2 border-gray-100 pl-4">
                    {q.answers && q.answers.length > 0 ? (
                      q.answers.map((a) => (
                        <div key={a.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1.5">
                            <span className="font-bold text-[14px] text-gray-900 flex items-center gap-1.5">
                              {a.users?.full_name || "Customer"}
                              {a.is_seller && (
                                <span className="bg-[#1A6FD4]/10 text-[#1A6FD4] text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Seller</span>
                              )}
                            </span>
                            <span className="text-xs text-gray-500">{new Date(a.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[14px] text-gray-700 leading-relaxed mb-3">
                            <span className="font-bold text-[#1A6FD4] mr-2">A:</span>
                            {a.answer_text}
                          </p>
                          <button
                            onClick={() => handleHelpful(a.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1A6FD4] transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Helpful ({a.helpful_votes})
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[14px] text-gray-500 italic">No answers yet.</p>
                    )}
                  </div>

                  <div className="mt-4 ml-2 sm:ml-6">
                    {answeringFor === q.id ? (
                      <form onSubmit={(e) => handleAnswer(e, q.id)} className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                        <textarea
                          placeholder="Write your answer..."
                          className="w-full min-h-[80px] p-3 rounded-xl border border-gray-200 focus:border-[#1A6FD4] focus:ring-1 focus:ring-[#1A6FD4] outline-none text-[14px] resize-y"
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          disabled={submittingA}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setAnsweringFor(null)}
                            className="px-4 py-2 text-[13px] font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingA || !newAnswer.trim()}
                            className="px-5 py-2 text-[13px] font-bold text-white rounded-lg shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: t.bluePrimary }}
                          >
                            {submittingA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Submit Answer
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          if (!user) openLoginSheet();
                          else { setAnsweringFor(q.id); setNewAnswer(""); }
                        }}
                        className="text-[13px] font-bold text-[#1A6FD4] hover:underline"
                      >
                        Answer this question
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
