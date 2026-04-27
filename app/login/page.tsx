"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, ShieldCheck, Store, Download } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import toast from "react-hot-toast";

type Tab = "email" | "phone";
type Step = "input" | "otp";

export default function CustomerLoginPage() {
  const [tab, setTab] = useState<Tab>("email");
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
      startResendTimer();
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

  function startResendTimer() {
    setResendTimer(60);
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
      const { error: otpErr } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (otpErr) throw otpErr;
      startResendTimer();
      toast.success("OTP resent successfully!");
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
        const { error: verifyErr } = await supabase.auth.verifyOtp({
          phone: `+91${phone.replace(/\s/g, "")}`,
          token: code,
          type: "sms",
        });
        if (verifyErr) throw verifyErr;
      }
      window.location.href = "/";
    } catch (err: any) {
      console.error("OTP verify error:", err);
      if (err.message?.includes("expired")) {
        setError("OTP has expired. Please request a new one.");
      } else {
        setError("The OTP you entered is incorrect. Please try again.");
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
    <Link href="/" className="shrink-0">
      <Image src="/anga9-logo.png" alt="ANGA9" width={100} height={34} priority style={{ objectFit: "contain" }} />
    </Link>
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
        className={`flex items-center gap-2 px-4 py-3 text-sm md:text-base font-semibold transition-all border-b-2 relative ${
          tab === "phone"
            ? "border-[#1A6FD4] text-[#1A6FD4]"
            : "border-transparent text-[#9CA3AF] opacity-60"
        }`}
      >
        <Phone className="w-4 h-4" />
        Phone
        <span className="absolute -top-1 -right-1 bg-gray-100 text-[9px] font-black uppercase px-1 rounded border border-gray-200 text-gray-500">Soon</span>
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
        <Link href="#" className="text-[#1A6FD4] hover:underline">Terms of Use</Link> and{" "}
        <Link href="#" className="text-[#1A6FD4] hover:underline">Privacy Policy</Link>.
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
            className="h-14 w-12 rounded-xl border border-[#D0E3F7] bg-[#F8FBFF] focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 text-center text-2xl font-bold text-[#1A1A2E] outline-none transition-all shadow-sm"
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
            Verify & Login
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
  const heading = step === "otp" ? "Verify OTP" : "Welcome";
  const subheading = step === "otp"
    ? "Enter the verification code we sent"
    : "Sign in to access your account";
  const desktopHeading = step === "otp" ? "Verify OTP" : "Welcome back";
  const desktopSubheading = step === "otp"
    ? "Enter the verification code we sent"
    : "Sign in with your email or phone";

  /* ─── MOBILE VIEW (<md) ─── */
  const mobileView = (
    <div className="flex flex-col min-h-screen md:hidden bg-gradient-to-b from-[#EAF2FF] to-[#F8FBFF]">
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-b border-[#E8EEF4] px-4 py-3 sticky top-0 z-10">
        <Link href="/" className="transition-opacity hover:opacity-70">
          <ArrowLeft className="w-6 h-6 text-[#1A1A2E]" />
        </Link>
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
            <Link
              href="/seller/sell-on-anga9"
              className="flex items-center gap-2 font-bold text-[#4B5563] hover:text-[#1A6FD4] transition-colors"
              style={{ fontSize: '15px' }}
            >
              <Store style={{ width: 18, height: 18, color: "#1A6FD4" }} />
              Sell on ANGA9
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 font-bold text-[#4B5563] hover:text-[#1A6FD4] transition-colors"
              style={{ fontSize: '15px' }}
            >
              <Download style={{ width: 18, height: 18, color: "#1A6FD4" }} />
              Download App
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-[1000px]">
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(26,111,212,0.10)] overflow-hidden flex min-h-[560px]">
            <div className="relative flex-1 min-w-[400px]">
              <Image
                src="/login-hero.png"
                alt="Shopping illustration"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A6FD4]/80 via-[#1A6FD4]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                    Shop from India&apos;s finest sellers
                  </h2>
                  <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
                    Get access to your Orders, Wishlist and Recommendations
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center px-12 py-10">
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-2">{desktopHeading}</h1>
                <p className="text-base text-[#4B5563] leading-relaxed">{desktopSubheading}</p>
              </div>
              {step === "input" && tabs}
              {formContent}
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">100% Secure</span>
                </div>
                <div className="flex items-center gap-4 grayscale opacity-40">
                  <Image src="/visa.png" alt="Visa" width={32} height={10} className="object-contain" />
                  <Image src="/mastercard.png" alt="Mastercard" width={32} height={20} className="object-contain" />
                  <Image src="/upi.png" alt="UPI" width={32} height={10} className="object-contain" />
                </div>
              </div>
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
