"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import {
  supportAdminApi,
  CUSTOMER_CATEGORIES,
  SELLER_CATEGORIES,
  type RequesterRole,
  type TicketPriority,
} from "@/lib/supportApi";

export default function AdminMessageUserPage() {
  const router = useRouter();
  const [recipientRole, setRecipientRole] = useState<RequesterRole>("customer");
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>("Account");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = recipientRole === "seller" ? SELLER_CATEGORIES : CUSTOMER_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientId.trim() || !subject.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await supportAdminApi.createAdminTicket({
        recipient_id: recipientId.trim(),
        recipient_role: recipientRole,
        subject: subject.trim(),
        body: body.trim(),
        category,
        priority,
      });
      router.push(`/admin/support/${ticket.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 md:py-8 text-[#1A1A2E]">
      <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4]">
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </Link>

      <h1 className="mt-3 text-2xl md:text-3xl font-bold">Message a user</h1>
      <p className="mt-1 text-sm text-[#4B5563]">
        Open a new ticket to reach a customer or seller. They&apos;ll see it in their support inbox.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Recipient role</label>
            <select
              value={recipientRole}
              onChange={(e) => {
                const r = e.target.value as RequesterRole;
                setRecipientRole(r);
                setCategory(r === "seller" ? "Account" : "Account");
              }}
              className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm"
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Recipient user ID</label>
          <input
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            placeholder="users.id (UUID)"
            required
            className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 font-mono text-xs outline-none focus:border-[#1A6FD4]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject of the message"
            maxLength={140}
            required
            className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm outline-none focus:border-[#1A6FD4]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Message</label>
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
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
        </div>

        {error && (
          <div className="rounded-md border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link
            href="/admin/support"
            className="rounded-md border border-[#E8EEF4] bg-white px-4 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#F8FBFF]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !recipientId.trim() || !subject.trim() || !body.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1A6FD4] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>
    </main>
  );
}
