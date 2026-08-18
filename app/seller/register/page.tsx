"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Mail, Phone, ShieldCheck, Store, Smartphone } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { normalizeIndianPhone } from "@/lib/phone";
import { cdnUrl } from "@/lib/utils";
import WatercolorBg from "@/components/seller/WatercolorBg";

type Tab = "email" | "phone";
type Step = "input" | "otp";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SellerRegisterPage() {
  const [tab, setTab] = useState<Tab>("phone");
  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

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
      startResendTimer(60);
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

  /* ─── Phone submit ─── */
  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({ phone: normalized });
      if (otpErr) throw otpErr;
      setStep("otp");
      startResendTimer(30);
    } catch (err: any) {
      console.error("Phone OTP error:", err);
      if (err.message?.includes("rate limit")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function startResendTimer(seconds = 60) {
    setResendTimer(seconds);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    if (!canResend || loading) return;
    setError("");
    setLoading(true);
    try {
      const { error: otpErr } = tab === "email"
        ? await supabase.auth.signInWithOtp({ email: email.trim() })
        : await supabase.auth.signInWithOtp({ phone: normalizeIndianPhone(phone)! });
      if (otpErr) throw otpErr;
      startResendTimer(tab === "phone" ? 30 : 60);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
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
        const normalized = normalizeIndianPhone(phone);
        if (!normalized) {
          setError("Invalid phone number. Please go back and re-enter.");
          return;
        }
        const { error: verifyErr } = await supabase.auth.verifyOtp({
          phone: normalized,
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

      const secureAttr = window.location.protocol === "https:" ? "; secure" : "";
      document.cookie = `portal=seller; path=/; max-age=86400; samesite=lax${secureAttr}`;

      const hostname = window.location.hostname;
      const sellerHost = hostname.endsWith("anga9.com") ? "https://seller.anga9.com" : "";

      if (user.role === "seller" && sellerProfile?.onboarding_complete) {
        window.location.href = `${sellerHost}/dashboard`;
      } else if (user.role === "seller" && !sellerProfile?.onboarding_complete) {
        window.location.href = `${sellerHost}/onboarding`;
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
        window.location.href = `${sellerHost}/onboarding`;
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
    <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" onClick={() => window.location.href = "/seller"}>
      <Image src={cdnUrl("/anga9-logo.png")} alt="ANGA9" width={90} height={28} className="sm:w-[100px] sm:h-[32px]" priority unoptimized style={{ objectFit: "contain" }} />
      <span className="inline-block border-l-2 border-[#E8EEF4] pl-2 sm:pl-3 ml-0.5 sm:ml-1 text-[11px] sm:text-sm font-bold tracking-wide text-[#4B5563] uppercase">SELLER HUB</span>
    </div>
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
    </div>
  );

  /* ─── Email input form ─── */
  const emailForm = (
    <form onSubmit={handleEmailSubmit} className="space-y-5">
      <div>
        <label className="block text-sm md:text-base font-medium text-black mb-2">
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
            autoComplete="off"
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
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] hover:bg-gray-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">{spinner} Sending OTP...</span>
        ) : (
          "Request OTP"
        )}
      </button>

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={() => { window.location.href = "/seller/login"; }}
          className="text-sm text-[#1A6FD4] font-medium hover:underline flex items-center justify-center"
        >
          Already have an account? Login here
        </button>
      </div>

      <p className="text-[11.5px] leading-relaxed text-[#9CA3AF] text-center pt-1">
        By continuing, you agree to ANGA9&apos;s{" "}
        <a href="https://www.anga9.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#1A6FD4] hover:underline">Terms of Use</a> and{" "}
        <a href="https://www.anga9.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1A6FD4] hover:underline">Privacy Policy</a>.
      </p>
    </form>
  );

  /* ─── Phone input form ─── */
  const phoneForm = (
    <form onSubmit={handlePhoneSubmit} className="space-y-5">
      <div>
        <label className="block text-sm md:text-base font-medium text-black mb-2">
          Mobile Number
        </label>
        <div className="flex items-center rounded-xl border border-[#D0E3F7] bg-[#F8FBFF] focus-within:border-[#1A6FD4] focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
          <span className="flex items-center text-sm font-semibold text-[#4B5563] pl-4 pr-2 select-none">
            +91
          </span>
          <div className="w-px h-6 bg-[#D0E3F7]" />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
            maxLength={14}
            autoFocus
            autoComplete="off"
            placeholder="Enter your phone number"
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
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] hover:bg-gray-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">{spinner} Sending OTP...</span>
        ) : (
          "Request OTP"
        )}
      </button>

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={() => { window.location.href = "/seller/login"; }}
          className="text-sm text-[#1A6FD4] font-medium hover:underline flex items-center justify-center"
        >
          Already have an account? Login here
        </button>
      </div>

      <p className="text-[11.5px] leading-relaxed text-[#9CA3AF] text-center pt-1">
        By continuing, you agree to ANGA9&apos;s{" "}
        <a href="https://www.anga9.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#1A6FD4] hover:underline">Terms of Use</a> and{" "}
        <a href="https://www.anga9.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1A6FD4] hover:underline">Privacy Policy</a>.
      </p>
    </form>
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
            autoComplete="one-time-code"
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
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] hover:bg-gray-50"
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

      <div className="mt-4 text-center">
        <p className="text-sm text-[#4B5563]">
          Didn&apos;t receive the code?{" "}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="font-bold text-[#1A6FD4] hover:underline disabled:opacity-50"
            >
              Resend OTP
            </button>
          ) : (
            <span className="font-medium text-gray-400">
              Resend in <span className="font-bold text-gray-600">{resendTimer}s</span>
            </span>
          )}
        </p>
      </div>
    </form>
  );

  /* ─── Form content switcher ─── */
  const formContent = step === "otp" ? otpForm : (tab === "email" ? emailForm : phoneForm);

  /* ─── Heading text ─── */
  const heading = step === "otp" ? "Verify OTP" : "Create Seller Account";
  const subheading = step === "otp"
    ? "Enter the verification code we sent"
    : "Register to start selling on ANGA9";
  const desktopHeading = step === "otp" ? "Verify OTP" : "Create Seller Account";
  const desktopSubheading = step === "otp"
    ? "Enter the verification code we sent"
    : "Register with your email or phone to start your wholesale business";

  /* ─── MOBILE VIEW (<md) ─── */
  const mobileView = (
    <div className="flex flex-col min-h-screen md:hidden bg-gradient-to-b from-[#EAF2FF] to-[#F8FBFF] relative">
      <WatercolorBg />
      <div className="relative z-10 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-[#E8EEF4] px-3 py-3">
        <div className="flex items-center gap-2">
          <a href="/seller/sell-on-anga9" className="transition-opacity hover:opacity-70 shrink-0">
            <ArrowLeft className="w-5 h-5 text-[#1A1A2E]" />
          </a>
          {logo}
        </div>
        <a href="#" className="shrink-0 flex items-center justify-center gap-1.5 bg-white text-[#1A1A2E] border border-[#1A1A2E] rounded-md px-3 py-1.5 text-sm font-bold tracking-wide shadow-sm hover:bg-gray-50 transition-colors">
          <Smartphone className="w-4 h-4" />
          Get App
        </a>
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-4 pt-8 pb-6">
        <div className="bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_16px_40px_-10px_rgba(26,111,212,0.12)] border border-black p-6">
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
    <div className="hidden md:flex flex-col min-h-screen bg-gradient-to-br from-[#EAF2FF] via-[#F0F6FF] to-[#F8FBFF] relative">
      <WatercolorBg />
      <div className="relative z-10 w-full bg-white border-b border-[#E8EEF4]">
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1280, padding: "0 32px", height: 56 }}>
          {logo}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="flex items-center gap-2 font-medium text-[#4B5563] hover:text-[#1A6FD4] transition-colors"
              style={{ fontSize: '16px' }}
            >
              <Smartphone style={{ width: 18, height: 18, color: "#1A6FD4" }} />
              Download our App
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-[1000px]">
          <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-[0_20px_60px_-15px_rgba(26,111,212,0.15)] border border-black overflow-hidden flex min-h-[560px]">
            {/* Left panel — Seller hero */}
            <div className="relative w-[500px] shrink-0 bg-[#EAF2FF] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cdnUrl("/images/register_illustration.png")}
                  alt="Register for ANGA9 Seller Portal"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
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
