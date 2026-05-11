"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, LifeBuoy, Package, RefreshCcw, CreditCard, UserCircle, MessageSquare, FileText, Plus, ChevronRight } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { supportApi, type Article } from "@/lib/supportApi";

const TOP_CATEGORIES = [
  { label: "Orders",    icon: Package,     bg: "#FEF3C7", fg: "#B45309", category: "Order issue" },
  { label: "Returns",   icon: RefreshCcw,  bg: "#FFEDD5", fg: "#C2410C", category: "Refund/return" },
  { label: "Payments",  icon: CreditCard,  bg: "#ECFDF5", fg: "#059669", category: "Payment" },
  { label: "Account",   icon: UserCircle,  bg: "#EDE9FE", fg: "#7C3AED", category: "Account" },
];

export default function HelpCenterPage() {
  const [q, setQ] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supportApi
      .listArticles({ audience: "customer", q: q || undefined, limit: 8 })
      .then((res) => { if (active) setArticles(res.data); })
      .catch(() => { if (active) setArticles([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [q]);

  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white md:bg-transparent min-h-screen">
      {/* ── Desktop Header (Matches Cart Style) ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            Help &amp; Support
          </h1>
          <span className="text-[18px] font-bold text-gray-400">
            How can we assist you today?
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
          <LifeBuoy className="w-4 h-4 text-[#1A6FD4]" />
          Support Center
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative mb-8 md:mb-10 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1A6FD4] transition-colors" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for articles, topics, or FAQs..."
          className="w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 py-4 text-[15px] font-medium outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm"
        />
      </div>

      {/* ── Categories ── */}
      <section className="mb-8 md:mb-10">
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-4">Browse by topic</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {TOP_CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={`/help/tickets/new?category=${encodeURIComponent(c.category)}`}
              className="flex items-center gap-3 md:gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5 hover:shadow-md hover:border-[#1A6FD4]/30 transition-all group cursor-pointer"
            >
              <span className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl group-hover:scale-110 group-active:scale-95 transition-transform shrink-0" style={{ backgroundColor: c.bg }}>
                <c.icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: c.fg }} />
              </span>
              <span className="font-bold text-[15px] md:text-[16px] text-gray-900 group-hover:text-[#1A6FD4] transition-colors">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse md:flex-row gap-8 md:gap-10 mb-10 md:mb-12">
        {/* ── Articles (Left Column on Desktop, Bottom on Mobile) ── */}
        <section className="flex-1 min-w-0">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-4">
            {q ? "Search results" : "Popular articles"}
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-[15px] font-bold text-gray-400 animate-pulse flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 animate-spin" />
                Loading articles...
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-10 md:p-12 text-center flex flex-col items-center justify-center">
              <Search className="w-10 h-10 text-gray-300 mb-4" />
              <div className="text-[16px] font-bold text-gray-900 mb-1">
                {q ? "No articles match your search." : "No articles found."}
              </div>
              <div className="text-[14px] text-gray-500 font-medium">
                You can still raise a ticket to get help.
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <ul className="divide-y divide-gray-100">
                {articles.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/help/articles/${a.slug}`}
                      className="flex items-center gap-4 px-5 py-4 md:px-6 md:py-5 hover:bg-gray-50 active:bg-gray-100 transition-colors group cursor-pointer"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-[#1A6FD4] transition-colors text-gray-400">
                        <FileText className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] md:text-[16px] font-bold text-gray-900 truncate group-hover:text-[#1A6FD4] transition-colors leading-tight">
                          {a.title}
                        </div>
                        {a.category && (
                          <div className="text-[13px] font-medium text-gray-500 mt-1">
                            {a.category}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-gray-300 group-hover:text-[#1A6FD4] group-hover:translate-x-1 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ── CTAs (Right Sidebar on Desktop, Top on Mobile) ── */}
        <section className="md:w-[340px] shrink-0 flex flex-col gap-3 md:gap-4">
          <h2 className="hidden md:block text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-0">
            Need more help?
          </h2>
          <Link
            href="/help/tickets/new"
            className="flex items-center gap-4 rounded-2xl bg-[#1A6FD4] p-5 md:p-6 text-white hover:bg-[#155bb5] transition-all shadow-md hover:shadow-lg active:scale-[0.98] group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shrink-0">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[16px] md:text-[17px] font-bold tracking-tight mb-0.5">Raise a new ticket</div>
              <div className="text-[13px] text-blue-100 font-medium leading-tight">Get help directly from our team.</div>
            </div>
          </Link>
          <Link
            href="/help/tickets"
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 md:p-6 hover:shadow-md hover:border-[#1A6FD4]/30 transition-all active:scale-[0.98] group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
              <MessageSquare className="h-6 w-6 text-[#1A6FD4]" />
            </div>
            <div>
              <div className="text-[16px] md:text-[17px] font-bold text-gray-900 tracking-tight mb-0.5 group-hover:text-[#1A6FD4] transition-colors">My tickets</div>
              <div className="text-[13px] text-gray-500 font-medium leading-tight">View your existing tickets.</div>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
