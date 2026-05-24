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
        <p className="text-[14px] text-gray-500 mt-2">Earn coins on orders and refunds — 1 coin = ₹1, spend at checkout.</p>
        <Link href="/login" className="inline-flex items-center mt-6 px-8 py-3 rounded-xl font-bold text-white text-[15px] shadow-md hover:shadow-lg active:scale-95 transition-all" style={{ background: t.bluePrimary }}>
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
    <div className="w-full pb-24 md:pb-12">
      {/* Mobile header */}
      <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40 md:hidden">
        <Link href="/account" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight">My Coins</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 md:pt-10">
        {/* Desktop back-link */}
        <Link href="/account" className="hidden md:inline-flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Account
        </Link>

        {/* Balance card */}
        <div
          className="rounded-3xl p-6 sm:p-8 shadow-lg overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" }}
        >
          {/* Decorative coin */}
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
            <CoinsIcon className="w-16 h-16 text-white/30" />
          </div>

          <div className="relative">
            <p className="text-[12px] sm:text-[13px] font-bold uppercase tracking-widest text-white/80">Your Coins</p>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-[44px] sm:text-[52px] font-black text-white leading-none">{balance ?? 0}</span>
              <span className="text-[16px] sm:text-[18px] font-bold text-white/90">coins</span>
            </div>
            <p className="text-[16px] sm:text-[18px] font-bold text-white mt-1">= {formatINR(balance ?? 0)}</p>

            <div className="inline-flex items-center gap-1.5 mt-5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
              <Info className="w-3.5 h-3.5 text-white" />
              <span className="text-[12px] sm:text-[13px] font-bold text-white">1 Coin = ₹1</span>
            </div>
          </div>
        </div>

        {/* How you earn / use them — short blurb */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoTile icon={Gift} title="Bonus on first order" body="Get coins as a welcome credit." color="amber" />
          <InfoTile icon={RotateCcw} title="Instant refunds" body="Get refunds as coins, ready immediately." color="emerald" />
          <InfoTile icon={PackageOpen} title="Spend at checkout" body="Apply coins to reduce your total." color="blue" />
        </div>

        {/* History */}
        <div className="mt-8 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="text-[16px] sm:text-[17px] font-black text-gray-900">History</h2>
          </div>
          <span className="text-[12px] font-medium text-gray-500">{entries.length} {entries.length === 1 ? "entry" : "entries"}</span>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: t.border }}>
          {entries.length === 0 ? (
            <div className="text-center py-14 px-6">
              <CoinsIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-gray-900">No coin activity yet</p>
              <p className="text-[12px] font-medium text-gray-500 mt-1">Your earnings and spends will show up here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {entries.map((entry) => {
                const meta = reasonMeta(entry);
                const Icon = meta.icon;
                const isCredit = entry.delta > 0;
                return (
                  <li key={entry.id} className="flex items-center gap-4 px-4 sm:px-5 py-3.5">
                    <div className={`w-10 h-10 rounded-full ${meta.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-gray-900 truncate">{meta.label}</p>
                      <p className="text-[12px] font-medium text-gray-500">{formatDate(entry.created_at)}{entry.note ? ` · ${entry.note}` : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[14px] font-black ${isCredit ? "text-emerald-600" : "text-gray-900"}`}>
                        {isCredit ? "+" : "−"}{Math.abs(entry.delta)} coins
                      </p>
                      <p className="text-[11px] font-bold text-gray-400">
                        {isCredit ? "+" : "−"}{formatINR(Math.abs(entry.delta))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {cursor && (
            <div className="px-4 sm:px-5 py-4 border-t border-gray-100">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-[13px] font-bold text-gray-700 transition-colors disabled:cursor-not-allowed"
              >
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Load more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  title,
  body,
  color,
}: {
  icon: typeof CoinsIcon;
  title: string;
  body: string;
  color: "amber" | "emerald" | "blue";
}) {
  const palette = {
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
  }[color];

  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: t.border }}>
      <div className={`w-9 h-9 rounded-full ${palette.bg} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${palette.text}`} />
      </div>
      <p className="text-[13px] font-black text-gray-900 leading-tight">{title}</p>
      <p className="text-[12px] font-medium text-gray-500 mt-1 leading-snug">{body}</p>
    </div>
  );
}
