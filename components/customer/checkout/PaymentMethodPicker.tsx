"use client";

import { ChevronRight, CreditCard, Landmark, Banknote, Smartphone } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import type { PaymentMethod } from "@/lib/usePayment";

// ── Brand catalogue ─────────────────────────────────────────────
// Final list confirmed against the Razorpay dashboard:
//   - UPI: GPay, PhonePe, Paytm, BHIM, generic VPA collect
//   - Cards: Visa, MasterCard, Rupay (Amex/Diners excluded — not activated)
//   - Wallets: PhonePe, Mobikwik, Airtel Money, Ola Money
//                (Jio Money discontinued, Bajaj Pay not activated)
//   - Netbanking: all Indian banks
//   - COD: handled in code, not Razorpay
//
// Pay Later is intentionally absent — both Flexipay and Simpl have paused
// onboarding for new merchants, so there's nothing live to show.

const UPI_BRANDS: { key: "google_pay" | "phonepe" | "paytm"; label: string; sub: string }[] = [
  { key: "google_pay", label: "Google Pay", sub: "Pay via UPI" },
  { key: "phonepe",    label: "PhonePe",    sub: "Pay via UPI" },
  { key: "paytm",      label: "Paytm",      sub: "Pay via UPI" },
];

const WALLET_BRANDS: { key: "phonepe" | "mobikwik" | "airtelmoney" | "olamoney"; label: string }[] = [
  { key: "phonepe",     label: "PhonePe Wallet" },
  { key: "mobikwik",    label: "Mobikwik" },
  { key: "airtelmoney", label: "Airtel Money" },
  { key: "olamoney",    label: "Ola Money" },
];

// ── Icon helpers ────────────────────────────────────────────────
// Brand logos live under /public/icons/payments/<brand>.svg. Falling back to
// a colored circle with the brand initial keeps the picker usable even if
// the icons haven't been added to the build yet.

function BrandIcon({ name, fallbackColor }: { name: string; fallbackColor: string }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white border" style={{ borderColor: t.border }}>
      <img
        src={`/icons/payments/${name}.svg`}
        alt=""
        className="w-7 h-7 object-contain"
        onError={(e) => {
          // Fallback: colored circle with first letter
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent && !parent.querySelector(".brand-fallback")) {
            const span = document.createElement("span");
            span.className = "brand-fallback w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black";
            span.style.background = fallbackColor;
            span.textContent = name.charAt(0).toUpperCase();
            parent.appendChild(span);
          }
        }}
      />
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
  /** When set, this row will appear dimmed with a small note — used after a
   * payment with this method failed so the user knows to try another. */
  failedNote?: string;
  /** Optional trailing element (e.g. card brand badges, "ADD" pill). */
  trailing?: React.ReactNode;
}

function Row({ icon, title, subtitle, onClick, disabled, failedNote, trailing }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl border bg-white hover:bg-gray-50 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left shadow-sm"
      style={{ borderColor: failedNote ? "#FCA5A5" : t.border }}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold leading-tight" style={{ color: t.textPrimary }}>
          {title}
        </p>
        {(failedNote || subtitle) && (
          <p
            className="text-[12px] mt-0.5 leading-tight"
            style={{ color: failedNote ? "#DC2626" : t.textMuted }}
          >
            {failedNote || subtitle}
          </p>
        )}
      </div>
      {trailing}
      <ChevronRight className="w-4 h-4 shrink-0" style={{ color: t.textMuted }} />
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
  const failedNoteFor = (m: PaymentMethod): string | undefined => {
    if (lastFailed && methodMatches(lastFailed.method, m)) {
      return "Last attempt failed. Try another method?";
    }
    return undefined;
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
      <div className="space-y-2">
        {UPI_BRANDS.map((brand) => (
          <Row
            key={`upi-${brand.key}`}
            icon={<BrandIcon name={brand.key} fallbackColor="#1A6FD4" />}
            title={brand.label}
            subtitle={brand.sub}
            disabled={disabled}
            failedNote={failedNoteFor({ kind: "upi", brand: brand.key })}
            onClick={() => onSelect({ kind: "upi", brand: brand.key })}
          />
        ))}
        <Row
          icon={
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 border" style={{ borderColor: t.border }}>
              <Smartphone className="w-5 h-5" style={{ color: t.bluePrimary }} />
            </div>
          }
          title="Other UPI Apps / Enter VPA"
          subtitle="BHIM, Cred, or any UPI app"
          disabled={disabled}
          failedNote={failedNoteFor({ kind: "upi" })}
          onClick={() => onSelect({ kind: "upi" })}
        />
      </div>

      {/* ── Cards ─────────────────────────────────────────── */}
      <CategoryHeader>Cards</CategoryHeader>
      <Row
        icon={
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 border" style={{ borderColor: t.border }}>
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
        }
        title="Add credit or debit card"
        subtitle="Visa, MasterCard, Rupay"
        disabled={disabled}
        failedNote={failedNoteFor({ kind: "card" })}
        onClick={() => onSelect({ kind: "card" })}
      />

      {/* ── Wallets ───────────────────────────────────────── */}
      <CategoryHeader>Wallets</CategoryHeader>
      <div className="space-y-2">
        {WALLET_BRANDS.map((brand) => (
          <Row
            key={`wallet-${brand.key}`}
            icon={<BrandIcon name={`wallet-${brand.key}`} fallbackColor="#7C3AED" />}
            title={brand.label}
            disabled={disabled}
            failedNote={failedNoteFor({ kind: "wallet", brand: brand.key })}
            onClick={() => onSelect({ kind: "wallet", brand: brand.key })}
          />
        ))}
      </div>

      {/* ── Netbanking ────────────────────────────────────── */}
      <CategoryHeader>Netbanking</CategoryHeader>
      <Row
        icon={
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 border" style={{ borderColor: t.border }}>
            <Landmark className="w-5 h-5 text-emerald-600" />
          </div>
        }
        title="Pay via Netbanking"
        subtitle="All major Indian banks"
        disabled={disabled}
        failedNote={failedNoteFor({ kind: "netbanking" })}
        onClick={() => onSelect({ kind: "netbanking" })}
      />

      {/* ── Cash on Delivery ──────────────────────────────── */}
      <CategoryHeader>Pay on Delivery</CategoryHeader>
      <Row
        icon={
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 border" style={{ borderColor: t.border }}>
            <Banknote className="w-5 h-5 text-amber-600" />
          </div>
        }
        title="Cash on Delivery"
        subtitle={`Pay ₹${total.toLocaleString("en-IN")} when delivered`}
        disabled={disabled}
        failedNote={failedNoteFor({ kind: "cod" })}
        onClick={() => onSelect({ kind: "cod" })}
      />

      {/* ── Trust footer ──────────────────────────────────── */}
      <p className="text-[11px] mt-5 pt-4 border-t text-center" style={{ borderColor: t.border, color: t.textMuted }}>
        Payments are secured by Razorpay. UPI, cards, and wallets use 256-bit encryption.
      </p>
    </div>
  );
}
