"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import {
  supportApi,
  CUSTOMER_CATEGORIES,
} from "@/lib/supportApi";

function NewTicketInner() {
  const router = useRouter();
  const search = useSearchParams();
  const orderId = search.get("orderId") || "";
  const initialCategory = search.get("category") || "Order issue";

  const [category, setCategory] = useState<string>(initialCategory);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId && !subject) {
      setSubject(`Issue with order ${orderId.slice(0, 8)}`);
    }
  }, [orderId, subject]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await supportApi.createTicket({
        subject: subject.trim(),
        initial_message: body.trim(),
        category,
        priority: "high",
        related_order_id: orderId || undefined,
        source: orderId ? "order_page" : "help_center",
      });
      router.push(`/help/tickets/${ticket.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
      setSubmitting(false);
    }
  }

  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:py-10 min-h-screen" style={{ color: t.textPrimary }}>
      <Link href="/help" className="inline-flex items-center gap-1 text-[15px] font-bold text-[#1A6FD4] hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Help Center
      </Link>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-6 sm:px-8 sm:py-8 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-gray-900">Raise a new ticket</h1>
          <p className="mt-2 text-[15px] text-gray-500">
            Tell us what&apos;s wrong and we&apos;ll get back to you quickly.
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {orderId && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[14px] text-[#1A6FD4] font-medium flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Linked to order <span className="font-mono font-bold">{orderId.slice(0, 8)}</span>
            </div>
          )}

          <form id="new-ticket-form" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm"
                    >
                      {CUSTOMER_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">Subject</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of the issue"
                    maxLength={140}
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">Describe the issue</label>
                  <textarea
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Share as many details as you can — order number, what went wrong, when it happened…"
                    required
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] font-medium text-red-600 flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                  </div>
                )}
              </div>

              {/* Desktop Buttons */}
              <div className="hidden md:flex flex-col gap-3 min-w-[260px] border-l border-gray-100 pl-6 md:pl-8">
                <button
                  type="submit"
                  form="new-ticket-form"
                  disabled={submitting || !subject.trim() || !body.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] disabled:hover:shadow-md bg-white hover:bg-gray-50"
                >
                  {submitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1A6FD4] border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {submitting ? "Submitting…" : "Submit ticket"}
                </button>
                <Link
                  href="/help"
                  className="w-full rounded-xl bg-white px-4 py-3.5 text-center text-[15px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </Link>
              </div>
            </div>

            {/* Mobile Buttons */}
            <div className="md:hidden flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
              <Link
                href="/help"
                className="w-full sm:w-auto rounded-xl bg-white px-6 py-3.5 text-center text-[15px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                form="new-ticket-form"
                disabled={submitting || !subject.trim() || !body.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-[15px] font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] disabled:hover:shadow-md bg-white hover:bg-gray-50"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1A6FD4] border-t-transparent" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {submitting ? "Submitting…" : "Submit ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={<main className="w-full mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">Loading…</main>}>
      <NewTicketInner />
    </Suspense>
  );
}
