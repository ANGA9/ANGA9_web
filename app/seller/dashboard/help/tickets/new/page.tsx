"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import {
  supportApi,
  SELLER_CATEGORIES,
  type TicketPriority,
} from "@/lib/supportApi";

function NewSellerTicketInner() {
  const router = useRouter();
  const search = useSearchParams();
  const initialCategory = search.get("category") || "Payouts";
  const payoutId = search.get("payoutId") || "";
  const productId = search.get("productId") || "";

  const [category, setCategory] = useState<string>(initialCategory);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        priority,
        related_payout_id: payoutId || undefined,
        related_product_id: productId || undefined,
        source: payoutId ? "payout_page" : productId ? "product_page" : "help_center",
      });
      router.push(`/seller/dashboard/help/tickets/${ticket.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
      setSubmitting(false);
    }
  }

  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white md:bg-transparent min-h-[calc(100vh-64px)] text-[#1A1A2E]">
      <Link href="/seller/dashboard/help" className="inline-flex items-center gap-1 text-[15px] font-bold text-[#1A6FD4] hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to seller support
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
        {/* Left Column: Form */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-[32px] font-medium text-gray-900 tracking-tight leading-tight">Raise a new ticket</h1>
            <p className="mt-2 text-[16px] text-gray-500 font-medium">
              Our support team is here to help you resolve any issues quickly.
            </p>
          </div>

          {(payoutId || productId) && (
            <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-4 text-[14px] text-[#1A6FD4] font-bold flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                {payoutId && <span>Linked to Payout <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">#{payoutId.slice(0, 8).toUpperCase()}</span></span>}
                {productId && <span>Linked to Product <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">#{productId.slice(0, 8).toUpperCase()}</span></span>}
              </div>
            </div>
          )}

          <form id="new-seller-ticket-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Category</label>
                <div className="relative group">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-[15px] font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-inner"
                  >
                    {SELLER_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <svg className="h-4 w-4 text-gray-400 group-focus-within:text-[#1A6FD4] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Payment delayed for last week"
                  maxLength={140}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-[15px] font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-inner placeholder:text-gray-400 placeholder:font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Detailed Description</label>
              <textarea
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Please describe your issue in detail. Include order IDs, dates, and any specific error messages you encountered..."
                required
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5 text-[15px] font-bold text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-inner placeholder:text-gray-400 placeholder:font-medium leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Priority Level</label>
              <div className="flex flex-wrap gap-3">
                {(["low", "normal", "high", "urgent"] as TicketPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`rounded-xl border px-5 py-2.5 text-[13px] font-black uppercase tracking-wider transition-all ${
                      priority === p
                        ? "border-[#1A6FD4] bg-[#1A6FD4] text-white shadow-md shadow-blue-500/20"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] font-medium text-gray-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Use &quot;Urgent&quot; only for critical business blockers.
              </p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[14px] font-bold text-red-600 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                {error}
              </div>
            )}

            {/* Mobile Actions */}
            <div className="lg:hidden flex flex-col gap-3 pt-6">
              <button
                type="submit"
                disabled={submitting || !subject.trim() || !body.trim()}
                className="h-14 w-full rounded-2xl bg-[#1A6FD4] text-[15px] font-black text-white transition-all shadow-lg shadow-blue-500/20 hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {submitting ? "SUBMITTING..." : "SUBMIT TICKET"}
              </button>
              <Link
                href="/seller/dashboard/help"
                className="h-14 w-full rounded-2xl bg-white border border-gray-200 text-gray-600 text-[15px] font-bold hover:bg-gray-50 flex items-center justify-center transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Actions & Info (Desktop) */}
        <div className="hidden lg:flex flex-col gap-6 w-[320px] pt-[120px]">
          <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm space-y-4">
            <button
              type="submit"
              form="new-seller-ticket-form"
              disabled={submitting || !subject.trim() || !body.trim()}
              className="h-14 w-full rounded-2xl bg-[#1A6FD4] text-[15px] font-black text-white transition-all shadow-lg shadow-blue-500/20 hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {submitting ? "SUBMITTING..." : "SUBMIT TICKET"}
            </button>
            <Link
              href="/seller/dashboard/help"
              className="h-12 w-full rounded-xl bg-gray-50 text-center text-[14px] font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>

          <div className="bg-[#F8FBFF] rounded-[32px] p-8 border border-[#E8EEF4]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-[16px] font-bold text-[#1A1A2E] mb-2">Need immediate help?</h3>
            <p className="text-[14px] text-gray-500 font-medium leading-relaxed">
              Our support team is available during business hours. Priority is given to urgent issues affecting your sales or payouts.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function NewSellerTicketPage() {
  return (
    <Suspense fallback={<main className="w-full mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">Loading…</main>}>
      <NewSellerTicketInner />
    </Suspense>
  );
}
