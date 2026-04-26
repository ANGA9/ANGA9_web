"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Mail, Phone, ShieldCheck, Store, Download } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Tab = "email" | "phone";
type Step = "input" | "otp";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SellerLoginPage() {
  const [tab, setTab] = useState<Tab>("email");
  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseBrowserClient();

  /* ─── Email submit ─── */
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({ email: trimmed });
      if (otpErr) throw otpErr;
      setStep("otp");
    } catch (err: any) {
      console.error("Email OTP error:", err);
      if (err.message?.includes("rate limit")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  /* ─── OTP verify ─── */
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      if (tab === "email") {
        const { error: verifyErr } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code,
          type: "email",
        });
        if (verifyErr) throw verifyErr;
      } else {
        const { error: verifyErr } = await supabase.auth.verifyOtp({
          phone: `+91${phone.replace(/\s/g, "")}`,
          token: code,
          type: "sms",
        });
        if (verifyErr) throw verifyErr;
      }

      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setError("Authentication failed. Please try again.");
        return;
      }

      // Call backend to verify and get user + seller profile info
      const res = await fetch(`${API_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Verification failed");
      }

      const { user, sellerProfile } = await res.json();

      // Determine redirect based on role & onboarding status
      if (user.role === "seller" && sellerProfile?.onboarding_complete) {
        // Completed onboarding → dashboard
        window.location.href = "/seller/dashboard";
      } else if (user.role === "seller" && !sellerProfile?.onboarding_complete) {
        // Incomplete onboarding → continue onboarding
        window.location.href = "/seller/onboarding";
      } else {
        // Customer or new user → upgrade to seller role, then onboarding
        try {
          await fetch(`${API_URL}/api/auth/role`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ userId: user.id, role: "seller" }),
          });
        } catch {
          // Role upgrade failed — still redirect to onboarding, backend will handle
          console.warn("Role upgrade request failed, proceeding to onboarding");
        }
        window.location.href = "/seller/onboarding";
      }
    } catch (err: any) {
      console.error("OTP verify error:", err);
      if (err.message?.includes("expired")) {
        setError("OTP has expired. Please request a new one.");
      } else {
        setError(err.message || "The OTP you entered is incorrect. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  /* ─── OTP input helpers ─── */
  function handleOtpChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length > 1) {
        const next = [...otp];
        let maxIndex = index;
        digits.forEach((d, i) => {
          if (index + i < 6) {
            next[index + i] = d;
            maxIndex = index + i;
          }
        });
        setOtp(next);
        const parent = e.target.parentElement;
        const targetInput = parent?.children[maxIndex] as HTMLInputElement;
        targetInput?.focus();
        return;
      }
      value = value.slice(-1);
    }
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      const parent = e.target.parentElement;
      const nextInput = parent?.children[index + 1] as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const parent = (e.currentTarget as HTMLElement).parentElement;
      const prevInput = parent?.children[index - 1] as HTMLInputElement;
      prevInput?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      const parent = (e.currentTarget as HTMLElement).parentElement;
      const nextInput = parent?.children[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      const parent = (e.currentTarget as HTMLElement).parentElement;
      const prevInput = parent?.children[index - 1] as HTMLInputElement;
      prevInput?.focus();
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    setStep("input");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  }

  /* ─── Logo ─── */
  const logo = (
    <a href="/" className="shrink-0">
      <Image src="/anga9-logo.png" alt="ANGA9" width={100} height={34} priority style={{ objectFit: "contain" }} />
    </a>
  );

  /* ─── Spinner ─── */
  const spinner = (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  /* ─── Tabs ─── */
  const tabs = (
    <div className="flex border-b border-[#E8EEF4] mb-6">
      <button
        type="button"
        onClick={() => switchTab("email")}
        className={`flex items-center gap-2 px-4 py-3 text-sm md:text-base font-semibold transition-all border-b-2 ${
          tab === "email"
            ? "border-[#1A6FD4] text-[#1A6FD4]"
            : "border-transparent text-[#9CA3AF] hover:text-[#4B5563]"
        }`}
      >
        <Mail className="w-4 h-4" />
        Email
      </button>
      <button
        type="button"
        onClick={() => switchTab("phone")}
        className={`flex items-center gap-2 px-4 py-3 text-sm md:text-base font-semibold transition-all border-b-2 ${
          tab === "phone"
            ? "border-[#1A6FD4] text-[#1A6FD4]"
            : "border-transparent text-[#9CA3AF] hover:text-[#4B5563]"
        }`}
      >
        <Phone className="w-4 h-4" />
        Phone
      </button>
    </div>
  );

  /* ─── Email input form ─── */
  const emailForm = (
    <form onSubmit={handleEmailSubmit} className="space-y-5">
      <div>
        <label className="block text-sm md:text-base font-medium text-[#4B5563] mb-2">
          Email Address
        </label>
        <div className="flex items-center rounded-xl border border-[#D0E3F7] bg-[#F8FBFF] focus-within:border-[#1A6FD4] focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
          <span className="flex items-center pl-4 pr-2">
            <Mail className="w-4 h-4 text-[#9CA3AF]" />
          </span>
          <div className="w-px h-6 bg-[#D0E3F7]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            placeholder="Enter your email address"
            className="flex-1 text-sm outline-none bg-transparent py-3.5 px-3 text-[#1A1A2E] placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5">
          <p className="text-sm md:text-base text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-[#1A6FD4] hover:bg-[#155bb5]"
      >
        {loading ? (
          <span className="flex items-center gap-2">{spinner} Sending OTP...</span>
        ) : (
          "Request OTP"
        )}
      </button>

      <p className="text-[11.5px] leading-relaxed text-[#9CA3AF] text-center pt-1">
        By continuing, you agree to ANGA9&apos;s{" "}
        <a href="#" className="text-[#1A6FD4] hover:underline">Terms of Use</a> and{" "}
        <a href="#" className="text-[#1A6FD4] hover:underline">Privacy Policy</a>.
      </p>
    </form>
  );

  /* ─── Phone input form (disabled — coming soon) ─── */
  const phoneForm = (
    <div className="space-y-5">
      <div>
        <label className="block text-sm md:text-base font-medium text-[#4B5563] mb-2">
          Mobile Number
        </label>
        <div className="flex items-center rounded-xl border border-[#E8EEF4] bg-[#F3F4F6] overflow-hidden opacity-60">
          <span className="flex items-center text-sm font-semibold text-[#9CA3AF] pl-4 pr-2 select-none">
            +91
          </span>
          <div className="w-px h-6 bg-[#E8EEF4]" />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
            maxLength={14}
            disabled
            placeholder="Enter your phone number"
            className="flex-1 text-sm outline-none bg-transparent py-3.5 px-3 text-[#9CA3AF] placeholder:text-[#9CA3AF] cursor-not-allowed"
          />
        </div>
      </div>

      <div className="rounded-lg bg-[#EAF2FF] border border-[#D0E3F7] px-3.5 py-3">
        <p className="text-sm md:text-base text-[#4B5563] text-center">
          <Phone className="w-4 h-4 inline-block mr-1.5 text-[#1A6FD4] -mt-0.5" />
          Phone login will be available soon. Please use email for now.
        </p>
      </div>

      <button
        disabled
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white shadow-sm bg-[#9CA3AF] cursor-not-allowed"
      >
        Coming Soon
      </button>
    </div>
  );

  /* ─── OTP Form ─── */
  const otpForm = (
    <form onSubmit={handleVerify} className="space-y-5">
      <button
        type="button"
        onClick={() => { setStep("input"); setOtp(["", "", "", "", "", ""]); setError(""); }}
        className="flex items-center gap-1.5 text-sm md:text-base font-medium text-[#1A6FD4] hover:text-[#155bb5] transition-colors mb-1"
      >
        <ArrowLeft className="w-4 h-4" />
        {tab === "email" ? "Change email" : "Change number"}
      </button>

      <div className="flex items-center gap-2 rounded-lg bg-[#EAF2FF] px-3.5 py-2.5">
        {tab === "email" ? (
          <Mail className="w-4 h-4 text-[#1A6FD4]" />
        ) : (
          <Phone className="w-4 h-4 text-[#1A6FD4]" />
        )}
        <p className="text-sm md:text-base text-[#4B5563]">
          OTP sent to{" "}
          <span className="font-semibold text-[#1A1A2E]">
            {tab === "email" ? email : `+91 ${phone}`}
          </span>
        </p>
      </div>

      <div className="flex justify-center gap-3 py-2">
        {otp.map((d, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={d}
            onChange={(e) => handleOtpChange(i, e)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            autoFocus={i === 0}
            className="h-12 w-11 rounded-lg border border-[#D0E3F7] bg-[#F8FBFF] focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 text-center text-xl font-bold text-[#1A1A2E] outline-none transition-all"
          />
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5">
          <p className="text-sm md:text-base text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-[#1A6FD4] hover:bg-[#155bb5]"
      >
        {loading ? (
          <span className="flex items-center gap-2">{spinner} Verifying...</span>
        ) : (
          <>
            <ShieldCheck className="w-4.5 h-4.5" />
            Verify &amp; Login
          </>
        )}
      </button>
    </form>
  );

  /* ─── Form content switcher ─── */
  const formContent = step === "otp" ? otpForm : (tab === "email" ? emailForm : phoneForm);

  /* ─── Heading text ─── */
  const heading = step === "otp" ? "Verify OTP" : "Welcome, Seller";
  const subheading = step === "otp"
    ? "Enter the verification code we sent"
    : "Sign in to manage your store";
  const desktopHeading = step === "otp" ? "Verify OTP" : "Seller Portal";
  const desktopSubheading = step === "otp"
    ? "Enter the verification code we sent"
    : "Sign in with your email to manage your wholesale business";

  /* ─── MOBILE VIEW (<md) ─── */
  const mobileView = (
    <div className="flex flex-col min-h-screen md:hidden bg-gradient-to-b from-[#EAF2FF] to-[#F8FBFF]">
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-b border-[#E8EEF4] px-4 py-3">
        <a href="/seller/sell-on-anga9" className="transition-opacity hover:opacity-70">
          <ArrowLeft className="w-5 h-5 text-[#1A1A2E]" />
        </a>
        {logo}
      </div>

      <div className="flex-1 flex flex-col px-4 pt-8 pb-6">
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(26,111,212,0.08)] p-6">
          <div className="mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-1">{heading}</h2>
            <p className="text-sm md:text-base text-[#4B5563]">{subheading}</p>
          </div>
          {step === "input" && tabs}
          {formContent}
        </div>
      </div>
    </div>
  );

  /* ─── DESKTOP VIEW (md+) ─── */
  const desktopView = (
    <div className="hidden md:flex flex-col min-h-screen bg-gradient-to-br from-[#EAF2FF] via-[#F0F6FF] to-[#F8FBFF]">
      <div className="w-full bg-white border-b border-[#E8EEF4]">
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1280, padding: "0 32px", height: 56 }}>
          {logo}
          <div className="flex items-center gap-6">
            <a
              href="/seller/sell-on-anga9"
              className="flex items-center gap-2 font-medium text-[#4B5563] hover:text-[#1A6FD4] transition-colors"
              style={{ fontSize: '16px' }}
            >
              <Store style={{ width: 18, height: 18, color: "#1A6FD4" }} />
              Sell on ANGA9
            </a>
            <a
              href="#"
              className="flex items-center gap-2 font-medium text-[#4B5563] hover:text-[#1A6FD4] transition-colors"
              style={{ fontSize: '16px' }}
            >
              <Download style={{ width: 18, height: 18, color: "#1A6FD4" }} />
              Download App
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-[1000px]">
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(26,111,212,0.10)] overflow-hidden flex min-h-[560px]">
            {/* Left panel — Seller hero */}
            <div className="relative w-[500px] shrink-0 bg-gradient-to-br from-[#1A6FD4] to-[#4338CA]">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/20" />
                <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-white/10" />
                <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-white/15" />
              </div>
              <div className="relative z-10 flex flex-col justify-center h-full p-10">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                    <Store className="w-4 h-4 text-white" />
                    <span className="text-sm md:text-base font-semibold text-white">Seller Portal</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                    Manage your wholesale business on ANGA9
                  </h2>
                  <p className="text-base text-white/80 leading-relaxed max-w-[350px]">
                    List products, track orders, and grow your revenue with India&apos;s fastest growing B2B marketplace.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "0% Commission", desc: "Keep all your profits" },
                    { label: "7-Day Payments", desc: "Fast & reliable payouts" },
                    { label: "Pan-India Reach", desc: "19,000+ serviceable pincodes" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-semibold text-white">{item.label}</p>
                        <p className="text-xs md:text-sm text-white/60">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel — Login form */}
            <div className="flex-1 flex flex-col justify-center px-12 py-10">
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-2">{desktopHeading}</h1>
                <p className="text-base text-[#4B5563] leading-relaxed">{desktopSubheading}</p>
              </div>
              {step === "input" && tabs}
              {formContent}
            </div>
          </div>
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
