"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  LifeBuoy,
  Wallet,
  Box,
  ShieldCheck,
  Tag,
  MessageSquare,
  FileText,
  Plus,
} from "lucide-react";
import { supportApi, type Article } from "@/lib/supportApi";

const TOP_CATEGORIES = [
  { label: "Payouts",       icon: Wallet,       bg: "#ECFDF5", fg: "#059669", category: "Payouts" },
  { label: "Listings",      icon: Tag,          bg: "#FEF3C7", fg: "#B45309", category: "Listing rejected" },
  { label: "KYC",           icon: ShieldCheck,  bg: "#EDE9FE", fg: "#7C3AED", category: "KYC" },
  { label: "Inventory",     icon: Box,          bg: "#FFEDD5", fg: "#C2410C", category: "Inventory issue" },
];

export default function SellerHelpPage() {
  const [q, setQ] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supportApi
      .listArticles({ audience: "seller", q: q || undefined, limit: 8 })
      .then((res) => { if (active) setArticles(res.data); })
      .catch(() => { if (active) setArticles([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [q]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:py-10 text-[#1A1A2E]">
      <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold">
        <LifeBuoy className="h-7 w-7 text-[#1A6FD4]" />
        Seller support
      </div>
      <p className="mt-1 text-sm md:text-base text-[#4B5563]">
        Find answers, raise tickets, and view admin messages — usually answered within hours.
      </p>

      <div className="mt-5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search seller help articles…"
          className="w-full rounded-xl border border-[#D0E3F7] bg-white pl-10 pr-4 py-3 text-sm md:text-base outline-none focus:border-[#1A6FD4]"
        />
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Browse by topic</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOP_CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={`/seller/dashboard/help/tickets/new?category=${encodeURIComponent(c.category)}`}
              className="flex items-center gap-3 rounded-xl border border-[#E8EEF4] bg-white p-4 hover:bg-[#F8FBFF] transition-colors"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: c.bg }}>
                <c.icon className="h-5 w-5" style={{ color: c.fg }} />
              </span>
              <span className="font-semibold text-sm md:text-base">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 grid md:grid-cols-2 gap-3">
        <Link
          href="/seller/dashboard/help/tickets/new"
          className="flex items-center justify-between rounded-xl bg-[#1A6FD4] px-5 py-4 text-white hover:opacity-95"
        >
          <div>
            <div className="text-base md:text-lg font-bold">Raise a new ticket</div>
            <div className="text-xs md:text-sm opacity-90">Reach the seller-support team.</div>
          </div>
          <Plus className="h-6 w-6" />
        </Link>
        <Link
          href="/seller/dashboard/help/tickets"
          className="flex items-center justify-between rounded-xl border border-[#E8EEF4] bg-white px-5 py-4 hover:bg-[#F8FBFF]"
        >
          <div>
            <div className="text-base md:text-lg font-bold">My tickets</div>
            <div className="text-xs md:text-sm text-[#4B5563]">View ongoing conversations & admin messages.</div>
          </div>
          <MessageSquare className="h-6 w-6 text-[#1A6FD4]" />
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
          {q ? "Search results" : "Popular articles"}
        </h2>
        {loading ? (
          <div className="text-sm text-[#9CA3AF]">Loading…</div>
        ) : articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8EEF4] bg-white p-6 text-center text-sm text-[#4B5563]">
            {q ? "No articles match your search." : "No articles yet — but you can still raise a ticket above."}
          </div>
        ) : (
          <ul className="divide-y divide-[#E8EEF4] rounded-xl border border-[#E8EEF4] bg-white">
            {articles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/seller/dashboard/help/articles/${a.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FBFF]"
                >
                  <FileText className="h-5 w-5 text-[#9CA3AF]" />
                  <div className="flex-1">
                    <div className="text-sm md:text-base font-semibold">{a.title}</div>
                    {a.category && (
                      <div className="text-xs text-[#9CA3AF]">{a.category}</div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
