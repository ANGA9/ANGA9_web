"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, ArrowLeft, Shield, ChevronRight } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

const STATIC_PHONE = "9876543210";
const STATIC_OTP = "1234";

export default function CustomerLoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (phone.replace(/\s/g, "").length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setStep("otp");
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 3) {
      const el = document.getElementById(`otp-${index + 1}`);
      el?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const el = document.getElementById(`otp-${index - 1}`);
      el?.focus();
    }
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }
    if (phone.replace(/\s/g, "") === STATIC_PHONE && code === STATIC_OTP) {
      document.cookie = "portal=customer; path=/; max-age=86400";
      document.cookie = "customer_phone=" + phone.replace(/\s/g, "") + "; path=/; max-age=86400";
      window.location.href = "/";
    } else {
      setError("Invalid OTP. Use phone 9876543210 and OTP 1234");
    }
  }

  /* ─── shared form content ─── */
  const phoneForm = (
    <form onSubmit={handlePhoneSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: t.textPrimary }}>
          Mobile Number
        </label>
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 items-center rounded-lg border px-3 text-sm font-medium shrink-0"
            style={{ borderColor: t.borderSearch, color: t.textPrimary, background: t.bgBlueTint }}
          >
            +91
          </span>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Enter mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
            maxLength={14}
            autoFocus
            className="h-12 w-full rounded-lg border px-4 text-sm outline-none transition-colors focus:ring-2"
            style={{ borderColor: t.borderSearch, color: t.textPrimary, background: t.bgCard }}
          />
        </div>
      </div>
      {error && <p className="text-sm" style={{ color: "#DC2626" }}>{error}</p>}
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:translate-y-px"
        style={{ background: t.bluePrimary }}
      >
        Send OTP
        <ChevronRight style={{ width: 16, height: 16 }} />
      </button>
      <p className="text-center text-xs leading-relaxed" style={{ color: t.textMuted }}>
        By continuing, you agree to ANGA&apos;s Terms of Use and Privacy Policy
      </p>
    </form>
  );

  const otpForm = (
    <form onSubmit={handleVerify} className="space-y-5">
      <button
        type="button"
        onClick={() => { setStep("phone"); setOtp(["", "", "", ""]); setError(""); }}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
        style={{ color: t.bluePrimary }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        Change number
      </button>
      <p className="text-sm" style={{ color: t.textSecondary }}>
        Enter the 4-digit code sent to <strong style={{ color: t.textPrimary }}>+91 {phone}</strong>
      </p>
      <div className="flex justify-center gap-3">
        {otp.map((d, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            autoFocus={i === 0}
            className="h-14 w-14 rounded-lg border text-center text-xl font-bold outline-none transition-colors focus:ring-2"
            style={{ borderColor: d ? t.bluePrimary : t.borderSearch, color: t.textPrimary, background: t.bgCard }}
          />
        ))}
      </div>
      {error && <p className="text-sm text-center" style={{ color: "#DC2626" }}>{error}</p>}
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:translate-y-px"
        style={{ background: t.bluePrimary }}
      >
        <Shield style={{ width: 16, height: 16 }} />
        Verify &amp; Login
      </button>
      <button
        type="button"
        className="w-full text-center text-sm font-medium transition-colors hover:opacity-70"
        style={{ color: t.bluePrimary }}
      >
        Resend OTP
      </button>
    </form>
  );

  /* ─── MOBILE VIEW (<md) ─── */
  const mobileView = (
    <div className="flex flex-col min-h-screen md:hidden" style={{ background: t.bgPage }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 border-b"
        style={{ padding: "14px 16px", borderColor: t.border, background: t.bgCard }}
      >
        <a href="/" className="transition-opacity hover:opacity-70">
          <ArrowLeft style={{ width: 22, height: 22, color: t.textPrimary }} />
        </a>
        <span className="text-[16px] font-bold" style={{ color: t.textPrimary }}>Login / Sign Up</span>
      </div>

      {/* Illustration area */}
      <div
        className="flex flex-col items-center justify-center py-8"
        style={{ background: t.bgBlueTint }}
      >
        <Image
          src="/anga9-logo.png"
          alt="ANGA"
          width={140}
          height={48}
          priority
          style={{ objectFit: "contain" }}
        />
        <p className="mt-3 text-sm font-medium" style={{ color: t.bluePrimary }}>
          Shop Wholesale, Save Big
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: "24px 20px", flex: 1 }}>
        <h2
          className="mb-1 text-[18px] font-bold"
          style={{ color: t.textPrimary }}
        >
          {step === "phone" ? "Login or Register" : "Verify OTP"}
        </h2>
        <p className="mb-5 text-[13px]" style={{ color: t.textSecondary }}>
          {step === "phone"
            ? "Enter your mobile number to continue"
            : "We've sent a verification code"}
        </p>
        {step === "phone" ? phoneForm : otpForm}
      </div>

      {/* Footer */}
      <div className="text-center pb-6" style={{ color: t.textMuted, fontSize: 11 }}>
        Need help? Contact support
      </div>
    </div>
  );

  /* ─── DESKTOP VIEW (md+) ─── */
  const desktopView = (
    <div
      className="hidden md:flex min-h-screen items-center justify-center"
      style={{ background: "#F3F6FB" }}
    >
      <div
        className="flex overflow-hidden rounded-2xl shadow-lg"
        style={{ maxWidth: 860, width: "100%" }}
      >
        {/* Left panel — branding */}
        <div
          className="flex flex-col items-center justify-center p-10"
          style={{ width: "44%", background: t.bluePrimary }}
        >
          <Image
            src="/anga9-logo.png"
            alt="ANGA"
            width={180}
            height={62}
            priority
            style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
          <p className="mt-4 text-center text-white/90 text-sm leading-relaxed" style={{ maxWidth: 220 }}>
            India&apos;s Trusted Wholesale Marketplace. Login to access exclusive business deals.
          </p>
          <div className="mt-8 flex items-center gap-2.5 rounded-full px-5 py-2.5" style={{ background: "rgba(255,255,255,0.15)" }}>
            <Phone style={{ width: 16, height: 16, color: "#fff" }} />
            <span className="text-white text-xs font-medium">Quick &amp; Secure OTP Login</span>
          </div>
        </div>

        {/* Right panel — form */}
        <div
          className="flex flex-col justify-center p-10"
          style={{ width: "56%", background: t.bgCard }}
        >
          <h1
            className="text-[22px] font-bold mb-1"
            style={{ color: t.textPrimary }}
          >
            {step === "phone" ? "Login / Sign Up" : "Verify OTP"}
          </h1>
          <p className="mb-6 text-sm" style={{ color: t.textSecondary }}>
            {step === "phone"
              ? "Enter your mobile number to get started"
              : "Enter the code sent to your phone"}
          </p>
          {step === "phone" ? phoneForm : otpForm}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
}
