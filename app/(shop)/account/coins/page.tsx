"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Coins as CoinsIcon,
  Info,
  Loader2,
  PackageOpen,
  RotateCcw,
  Gift,
  Users as UsersIcon,
  ShieldCheck,
  History,
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────

type Reason = "refund" | "first_order_bonus" | "referral" | "order_redeemed" | "admin_adjust";

interface LedgerEntry {
  id: string;
  delta: number;
  reason: Reason;
  order_id: string | null;
  refund_id: string | null;
  note: string | null;
  created_at: string;
}

interface BalanceResp {
  balance: number;
  value_inr: number;
}

interface HistoryResp {
  entries: LedgerEntry[];
  nextCursor: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────

function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function reasonMeta(entry: LedgerEntry) {
  switch (entry.reason) {
    case "refund":
      return { label: entry.order_id ? `Refund for order` : "Refund", icon: RotateCcw, color: "text-emerald-600", bg: "bg-emerald-50" };
    case "first_order_bonus":
      return { label: "First order bonus", icon: Gift, color: "text-amber-600", bg: "bg-amber-50" };
    case "referral":
      return { label: "Referral reward", icon: UsersIcon, color: "text-violet-600", bg: "bg-violet-50" };
    case "order_redeemed":
      return { label: "Used on order", icon: PackageOpen, color: "text-blue-600", bg: "bg-blue-50" };
    case "admin_adjust":
      return { label: entry.delta > 0 ? "Account credit" : "Account adjustment", icon: ShieldCheck, color: "text-gray-700", bg: "bg-gray-100" };
  }
}

// ── Page ───────────────────────────────────────────────────────────

export default function CustomerCoinsPage() {
  const { user, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      const resp = await api.get<BalanceResp>("/api/users/me/coins", { silent: true });
      setBalance(resp?.balance ?? 0);
    } catch {
      toast.error("Failed to load coin balance");
      setBalance(0);
    }
  }, []);

  const fetchPage = useCallback(async (before?: string) => {
    const params = new URLSearchParams();
    params.set("limit", "20");
    if (before) params.set("before", before);
    try {
      const resp = await api.get<HistoryResp>(`/api/users/me/coins/history?${params.toString()}`, { silent: true });
      return resp ?? { entries: [], nextCursor: null };
    } catch {
      toast.error("Failed to load coin history");
      return { entries: [], nextCursor: null };
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [, first] = await Promise.all([fetchBalance(), fetchPage()]);
      if (cancelled) return;
      setEntries(first.entries);
      setCursor(first.nextCursor);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, fetchBalance, fetchPage]);

  const handleLoadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    const next = await fetchPage(cursor);
    setEntries((prev) => [...prev, ...next.entries]);
    setCursor(next.nextCursor);
    setLoadingMore(false);
  };

  // ── Logged-out state ────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-5">
          <CoinsIcon className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-[22px] font-black text-gray-900">Sign in to see your coins</h1>
        <p className="text-[14px] text-gray-500 mt-2 font-medium">Earn coins on orders and refunds — 1 coin = ₹1, spend at checkout.</p>
        <Link href="/login" className="inline-flex items-center mt-6 px-8 py-3 rounded-xl font-bold text-white text-[15px] shadow-md hover:shadow-lg active:scale-95 transition-all bg-[#1A6FD4]">
          Log In
        </Link>
      </div>
    );
  }

  // ── Loading skeleton ────────────────────────────────────────────
  if (authLoading || (loading && balance === null)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white md:bg-transparent min-h-screen">
      {/* Mobile header */}
      <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40 md:hidden">
        <Link href="/account" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight">My Coins</h1>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            My Coins
          </h1>
          <span className="text-[18px] font-bold text-gray-400">
            Balance and history
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[15px] font-black text-[#1A6FD4] bg-[#F0F5FA] border border-[#1A6FD4]/20 px-5 py-2.5 rounded-full shadow-sm">
          <CoinsIcon className="w-5 h-5" />
          1 Coin = ₹1
        </div>
      </div>

      {/* ── Categories (How to earn & spend) ── */}
      <section className="mb-8 md:mb-10 mt-2 md:mt-0">
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-4">How to earn & spend</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
            <span className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: "#FEF3C7" }}>
              <Gift className="h-5 w-5 md:h-6 md:w-6" style={{ color: "#B45309" }} />
            </span>
            <div>
              <span className="block font-bold text-[15px] md:text-[16px] text-gray-900 leading-tight mb-0.5">Bonus on first order</span>
              <span className="block font-medium text-[13px] text-gray-500 leading-tight">Get coins as a welcome credit.</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
            <span className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: "#ECFDF5" }}>
              <RotateCcw className="h-5 w-5 md:h-6 md:w-6" style={{ color: "#059669" }} />
            </span>
            <div>
              <span className="block font-bold text-[15px] md:text-[16px] text-gray-900 leading-tight mb-0.5">Instant refunds</span>
              <span className="block font-medium text-[13px] text-gray-500 leading-tight">Get refunds as coins immediately.</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
            <span className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: "#EFF6FF" }}>
              <PackageOpen className="h-5 w-5 md:h-6 md:w-6" style={{ color: "#2563EB" }} />
            </span>
            <div>
              <span className="block font-bold text-[15px] md:text-[16px] text-gray-900 leading-tight mb-0.5">Spend at checkout</span>
              <span className="block font-medium text-[13px] text-gray-500 leading-tight">Apply coins to reduce your total.</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse md:flex-row gap-8 md:gap-10 mb-10 md:mb-12">
        {/* ── History (Left Column) ── */}
        <section className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-400">
              Transaction history
            </h2>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{entries.length} {entries.length === 1 ? "entry" : "entries"}</span>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-10 md:p-12 text-center flex flex-col items-center justify-center">
              <History className="w-10 h-10 text-gray-300 mb-4" />
              <div className="text-[16px] font-bold text-gray-900 mb-1">
                No coin activity yet
              </div>
              <div className="text-[14px] text-gray-500 font-medium">
                Your earnings and spends will show up here.
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <ul className="divide-y divide-gray-100">
                {entries.map((entry) => {
                  const meta = reasonMeta(entry);
                  const Icon = meta.icon;
                  const isCredit = entry.delta > 0;
                  return (
                    <li key={entry.id} className="flex items-center gap-4 px-5 py-4 md:px-6 md:py-5 hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${meta.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] md:text-[16px] font-bold text-gray-900 truncate leading-tight">
                          {meta.label}
                        </div>
                        <div className="text-[13px] font-medium text-gray-500 mt-1 truncate">
                          {formatDate(entry.created_at)}{entry.note ? ` · ${entry.note}` : ""}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`text-[15px] md:text-[16px] font-black ${isCredit ? "text-emerald-600" : "text-gray-900"}`}>
                          {isCredit ? "+" : "−"}{Math.abs(entry.delta)} coins
                        </div>
                        <div className="text-[12px] font-bold text-gray-400 mt-0.5">
                          {isCredit ? "+" : "−"}{formatINR(Math.abs(entry.delta))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {cursor && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[14px] font-bold text-gray-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                    Load older entries
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Balance Card (Right Sidebar) ── */}
        <section className="md:w-[340px] shrink-0 flex flex-col gap-3 md:gap-4">
          <h2 className="hidden md:block text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-0">
            Current Balance
          </h2>
          <div className="flex items-center gap-5 rounded-[24px] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden" style={{ background: "linear-gradient(to right bottom, #0f172a, #020617)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {/* Background glowing orbs */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none"></div>
            
            {/* Decorative watermark coin */}
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border border-white/5 flex items-center justify-center pointer-events-none shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] backdrop-blur-sm">
              <CoinsIcon className="w-16 h-16 text-white/5" />
            </div>

            {/* Icon Container */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shrink-0 relative z-10 backdrop-blur-md shadow-xl">
              <CoinsIcon className="h-7 w-7 md:h-8 md:w-8 text-[#F59E0B]" />
            </div>

            {/* Balance Info */}
            <div className="relative z-10 flex-1">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[28px] md:text-[32px] font-black tracking-tight drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 leading-none">
                  {balance ?? 0}
                </span>
                <span className="text-[15px] font-bold text-gray-400">coins</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[13px] font-bold leading-tight backdrop-blur-sm shadow-inner" style={{ color: "#FCD34D" }}>
                Value: {formatINR(balance ?? 0)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


