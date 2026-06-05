"use client";

import { useState } from "react";
import { ChevronRight, CreditCard, Landmark, Banknote, Smartphone, Wallet, Loader2 } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import type { PaymentMethod } from "@/lib/usePayment";

// ── Brand catalogue ─────────────────────────────────────────────
// No per-app UPI rows (GPay/PhonePe/Paytm): brand preselection via
// `apps` was removed (it broke desktop checkout), so those rows all
// opened the identical Razorpay UPI section — one button says it honestly.

const WALLET_BRANDS: { key: "phonepe" | "mobikwik" | "airtelmoney" | "olamoney"; label: string }[] = [
  { key: "phonepe",     label: "PhonePe Wallet" },
  { key: "mobikwik",    label: "Mobikwik" },
  { key: "airtelmoney", label: "Airtel Money" },
  { key: "olamoney",    label: "Ola Money" },
];

// ── Icon helpers ────────────────────────────────────────────────

function BrandIcon({ name, label, fallbackColor }: { name: string; label: string; fallbackColor: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-11 h-11 rounded-[14px] flex items-center justify-center overflow-hidden bg-white shadow-sm ring-1 ring-black/5 shrink-0">
      {!imgError ? (
        <img
          src={`/icons/payments/${name}.svg`}
          alt={label}
          className="w-6 h-6 object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center text-white text-[16px] font-black tracking-tight"
          style={{ background: `linear-gradient(135deg, ${fallbackColor}99, ${fallbackColor})` }}
        >
          {label.charAt(0)}
        </div>
      )}
    </div>
  );
}

// ── Row primitive ───────────────────────────────────────────────

interface RowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  failedNote?: string;
  trailing?: React.ReactNode;
}

function Row({ icon, title, subtitle, onClick, disabled, isLoading, failedNote, trailing }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-[#F8FAFC] active:scale-[0.985] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 hover:ring-2 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
      style={{ 
        boxShadow: failedNote ? "0 0 0 1px #FCA5A5, 0 2px 12px rgba(220,38,38,0.05)" : undefined,
        borderColor: "transparent",
        ...( !failedNote && { "--tw-ring-color": "#F1F5F9" } as any )
      }}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold tracking-tight text-gray-900 leading-none mb-1">
          {title}
        </p>
        {(failedNote || subtitle) && (
          <p
            className="text-[13px] font-medium leading-none"
            style={{ color: failedNote ? "#DC2626" : "#64748B" }}
          >
            {failedNote || subtitle}
          </p>
        )}
      </div>
      {trailing}
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all ring-1 ring-gray-100">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-[#4338CA] animate-spin" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        )}
      </div>
    </button>
  );
}

// ── Category header ─────────────────────────────────────────────

function CategoryHeader({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mt-6 mb-3 first:mt-0">
      <h3 className="text-[16px] font-bold" style={{ color: t.textPrimary }}>
        {children}
      </h3>
      {hint && (
        <p className="text-[12px] mt-0.5" style={{ color: t.textMuted }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Main picker ─────────────────────────────────────────────────

export interface PaymentMethodPickerProps {
  /** Called when the user taps a method. The hook handles the rest. */
  onSelect: (method: PaymentMethod) => void;
  /** True while a payment is in-flight — disable all options to prevent double-fire. */
  disabled?: boolean;
  /** Order total, used in the COD row's subtext. */
  total: number;
  /** If the last attempt failed, dim its row with a "Try another method" note. */
  lastFailed?: { method: PaymentMethod; reason: string } | null;
}

function methodMatches(a: PaymentMethod, b: PaymentMethod): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "upi" && b.kind === "upi") return a.brand === b.brand;
  if (a.kind === "wallet" && b.kind === "wallet") return a.brand === b.brand;
  return true;
}

export function PaymentMethodPicker({ onSelect, disabled, total, lastFailed }: PaymentMethodPickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const failedNoteFor = (m: PaymentMethod): string | undefined => {
    if (lastFailed && methodMatches(lastFailed.method, m)) {
      return "Last attempt failed. Try another method?";
    }
    return undefined;
  };

  const handleSelect = (method: PaymentMethod, id: string) => {
    setSelectedId(id);
    onSelect(method);
  };

  return (
    <div className="rounded-xl border p-5 bg-white shadow-sm" style={{ borderColor: t.border }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[18px] font-bold" style={{ color: t.textPrimary }}>
          Choose Payment Method
        </h2>
      </div>

      {/* ── Recommended (UPI) ─────────────────────────────── */}
      <CategoryHeader hint="Fast, free, and secure">Recommended</CategoryHeader>
      <Row
        icon={
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-blue-50 shrink-0 ring-1 ring-blue-100">
            <Smartphone className="w-5 h-5 text-blue-600" />
          </div>
        }
        title="Pay via UPI"
        subtitle="GPay, PhonePe, Paytm, BHIM & more"
        disabled={disabled}
        isLoading={disabled && selectedId === "upi"}
        failedNote={failedNoteFor({ kind: "upi" })}
        onClick={() => handleSelect({ kind: "upi" }, "upi")}
      />

      {/* ── Cards ─────────────────────────────────────────── */}
      <CategoryHeader>Cards</CategoryHeader>
      <Row
        icon={
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-purple-50 shrink-0 ring-1 ring-purple-100">
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
        }
        title="Add credit or debit card"
        subtitle="Visa, MasterCard, Rupay"
        disabled={disabled}
        isLoading={disabled && selectedId === "card"}
        failedNote={failedNoteFor({ kind: "card" })}
        onClick={() => handleSelect({ kind: "card" }, "card")}
      />

      {/* ── Wallets ───────────────────────────────────────── */}
      <CategoryHeader>Wallets</CategoryHeader>
      <Row
        icon={
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-fuchsia-50 shrink-0 ring-1 ring-fuchsia-100">
            <Wallet className="w-5 h-5 text-fuchsia-600" />
          </div>
        }
        title="Pay via Wallets"
        subtitle="PhonePe, Mobikwik, Airtel Money & more"
        disabled={disabled}
        isLoading={disabled && selectedId === "wallet"}
        failedNote={failedNoteFor({ kind: "wallet" })}
        onClick={() => handleSelect({ kind: "wallet" }, "wallet")}
      />

      {/* ── Netbanking ────────────────────────────────────── */}
      <CategoryHeader>Netbanking</CategoryHeader>
      <Row
        icon={
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-emerald-50 shrink-0 ring-1 ring-emerald-100">
            <Landmark className="w-5 h-5 text-emerald-600" />
          </div>
        }
        title="Pay via Netbanking"
        subtitle="All major Indian banks"
        disabled={disabled}
        isLoading={disabled && selectedId === "netbanking"}
        failedNote={failedNoteFor({ kind: "netbanking" })}
        onClick={() => handleSelect({ kind: "netbanking" }, "netbanking")}
      />

      {/* ── Cash on Delivery ──────────────────────────────── */}
      <CategoryHeader>Pay on Delivery</CategoryHeader>
      <Row
        icon={
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-amber-50 shrink-0 ring-1 ring-amber-100">
            <Banknote className="w-5 h-5 text-amber-600" />
          </div>
        }
        title="Cash on Delivery"
        subtitle={`Pay ₹${total.toLocaleString("en-IN")} when delivered`}
        disabled={disabled}
        isLoading={disabled && selectedId === "cod"}
        failedNote={failedNoteFor({ kind: "cod" })}
        onClick={() => handleSelect({ kind: "cod" }, "cod")}
      />

      {/* ── Trust footer ──────────────────────────────────── */}
      <p className="text-[11px] mt-5 pt-4 border-t text-center" style={{ borderColor: t.border, color: t.textMuted }}>
        Payments are secured by Razorpay. UPI, cards, and wallets use 256-bit encryption.
      </p>
    </div>
  );
}
