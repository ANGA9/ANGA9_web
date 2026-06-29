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
} from "@/lib/supportApi";

export default function AdminMessageUserPage() {
  const router = useRouter();
  const [recipientRole, setRecipientRole] = useState<RequesterRole>("customer");
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>("Account");
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
        priority: "high",
      });
      router.push(`/admin/support/${ticket.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
      setSubmitting(false);
    }
  }

  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:py-10 min-h-screen text-[#1A1A2E]">
      <Link href="/admin/support" className="inline-flex items-center gap-1 text-[15px] font-bold text-[#1A6FD4] hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </Link>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-6 sm:px-8 sm:py-8 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-gray-900">Message a user</h1>
          <p className="mt-2 text-[15px] text-gray-500">
            Open a new ticket to reach a customer or seller. They&apos;ll see it in their support inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[15px] font-bold text-gray-900 mb-2">Recipient role</label>
            <div className="relative">
              <select
                value={recipientRole}
                onChange={(e) => {
                  const r = e.target.value as RequesterRole;
                  setRecipientRole(r);
                  setCategory(r === "seller" ? "Account" : "Account");
                }}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm"
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[15px] font-bold text-gray-900 mb-2">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Recipient user ID</label>
          <input
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            placeholder="users.id (UUID)"
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 font-mono text-[15px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject of the message"
            maxLength={140}
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Message</label>
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
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
                disabled={submitting || !recipientId.trim() || !subject.trim() || !body.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-white bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] disabled:hover:shadow-md hover:bg-gray-50"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1A6FD4] border-t-transparent" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {submitting ? "Sending…" : "Send message"}
              </button>
              <Link
                href="/admin/support"
                className="w-full rounded-xl bg-white px-4 py-3.5 text-center text-[15px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Mobile Buttons */}
          <div className="md:hidden flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            <Link
              href="/admin/support"
              className="w-full sm:w-auto rounded-xl bg-white px-6 py-3.5 text-center text-[15px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !recipientId.trim() || !subject.trim() || !body.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-[15px] font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-white bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] disabled:hover:shadow-md hover:bg-gray-50"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1A6FD4] border-t-transparent" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {submitting ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
