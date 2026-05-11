"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import {
  supportApi,
  CUSTOMER_CATEGORIES,
  type TicketPriority,
} from "@/lib/supportApi";

function NewTicketInner() {
  const router = useRouter();
  const search = useSearchParams();
  const orderId = search.get("orderId") || "";
  const initialCategory = search.get("category") || "Order issue";

  const [category, setCategory] = useState<string>(initialCategory);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("normal");
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
        priority,
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
    <main className="w-full mx-auto max-w-2xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white min-h-screen" style={{ color: t.textPrimary }}>
      <Link href="/help" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1A6FD4] hover:underline mb-2">
        <ArrowLeft className="h-4 w-4" /> Back to Help Center
      </Link>

      <h1 className="mt-3 text-2xl md:text-3xl font-bold">Raise a new ticket</h1>
      <p className="mt-1 text-sm text-[#4B5563]">
        Tell us what&apos;s wrong and we&apos;ll get back to you quickly.
      </p>

      {orderId && (
        <div className="mt-4 rounded-md border border-[#D0E3F7] bg-[#EAF2FF] px-3 py-2 text-xs text-[#1A6FD4]">
          Linked to order <span className="font-mono font-semibold">{orderId.slice(0, 8)}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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

        <div>
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Priority</label>
          <div className="flex flex-wrap gap-2.5">
            {(["low", "normal", "high", "urgent"] as TicketPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`rounded-xl border px-4 py-2 text-[14px] font-bold capitalize transition-all active:scale-[0.98] ${
                  priority === p
                    ? "border-[#1A6FD4] bg-blue-50 text-[#1A6FD4] shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[13px] font-medium text-gray-400">
            Use &quot;urgent&quot; only for issues blocking you right now.
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] font-medium text-red-600 flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
          <Link
            href="/help"
            className="w-full sm:w-auto rounded-xl bg-white px-6 py-3.5 text-center text-[15px] font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !subject.trim() || !body.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A6FD4] px-8 py-3.5 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-[#1A6FD4] disabled:hover:shadow-md"
          >
            {submitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {submitting ? "Submitting…" : "Submit ticket"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl px-4 py-6">Loading…</main>}>
      <NewTicketInner />
    </Suspense>
  );
}
