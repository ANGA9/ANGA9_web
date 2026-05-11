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

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm outline-none focus:border-[#1A6FD4]"
          >
            {CUSTOMER_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of the issue"
            maxLength={140}
            required
            className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm outline-none focus:border-[#1A6FD4]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Describe the issue</label>
          <textarea
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share as many details as you can — order number, what went wrong, when it happened…"
            required
            className="w-full resize-none rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm outline-none focus:border-[#1A6FD4]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Priority</label>
          <div className="flex flex-wrap gap-2">
            {(["low", "normal", "high", "urgent"] as TicketPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium capitalize ${
                  priority === p
                    ? "border-[#1A6FD4] bg-[#EAF2FF] text-[#1A6FD4]"
                    : "border-[#E8EEF4] text-[#4B5563] hover:bg-[#F8FBFF]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="mt-1 text-xs text-[#9CA3AF]">
            Use &quot;urgent&quot; only for issues blocking you right now.
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link
            href="/help"
            className="rounded-md border border-[#E8EEF4] bg-white px-4 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#F8FBFF]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !subject.trim() || !body.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1A6FD4] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
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
