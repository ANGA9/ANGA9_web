"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, Phone, ShieldCheck, Store, Download } from "lucide-react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function CustomerLoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Initialize recaptcha once on mount
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          setError("reCAPTCHA expired. Please try again.");
        },
      });
      window.recaptchaVerifier.render();
    }
    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanPhone = phone.replace(/\s/g, "");
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const phoneNumber = `+91${cleanPhone}`;
      const appVerifier = window.recaptchaVerifier!;

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
    } catch (err: any) {
      console.error("Phone auth error:", err);
      if (err.code === "auth/invalid-app-credential") {
        setError(
          "reCAPTCHA verification failed. Please try refreshing the page. " +
          "If testing locally, add a test phone number in Firebase Console."
        );
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (err.code === "auth/captcha-check-failed") {
        setError("reCAPTCHA check failed. Please refresh and try again.");
      } else {
        setError(err.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
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
      if (!confirmationResult) throw new Error("No pending OTP check.");
      await confirmationResult.confirm(code);
      window.location.href = "/";
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-verification-code") {
        setError("The OTP you entered is incorrect. Please try again.");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  /* ─── Logo (matches homepage size) ─── */
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

  /* ─── Phone Form ─── */
  const phoneForm = (
    <form onSubmit={handlePhoneSubmit} className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-[#4B5563] mb-2">
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
            placeholder="Enter your phone number"
            className="flex-1 text-sm outline-none bg-transparent py-3.5 px-3 text-[#1A1A2E] placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5">
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-[#1A6FD4] hover:bg-[#155bb5]"
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

  /* ─── OTP Form ─── */
  const otpForm = (
    <form onSubmit={handleVerify} className="space-y-5">
      <button
        type="button"
        onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
        className="flex items-center gap-1.5 text-[13px] font-medium text-[#1A6FD4] hover:text-[#155bb5] transition-colors mb-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Change number
      </button>

      <div className="flex items-center gap-2 rounded-lg bg-[#EAF2FF] px-3.5 py-2.5">
        <Phone className="w-4 h-4 text-[#1A6FD4]" />
        <p className="text-[13px] text-[#4B5563]">
          OTP sent to <span className="font-semibold text-[#1A1A2E]">+91 {phone}</span>
        </p>
      </div>

      <div className="flex justify-center gap-3 py-2">
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
            className="h-12 w-11 rounded-lg border border-[#D0E3F7] bg-[#F8FBFF] focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 text-center text-xl font-bold text-[#1A1A2E] outline-none transition-all"
          />
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5">
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-[#1A6FD4] hover:bg-[#155bb5]"
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
    </form>
  );

  /* ─── MOBILE VIEW (<md) ─── */
  const mobileView = (
    <div className="flex flex-col min-h-screen md:hidden bg-gradient-to-b from-[#EAF2FF] to-[#F8FBFF]">
      {/* Top bar */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-b border-[#E8EEF4] px-4 py-3">
        <a href="/" className="transition-opacity hover:opacity-70">
          <ArrowLeft className="w-5 h-5 text-[#1A1A2E]" />
        </a>
        {logo}
      </div>

      {/* Form card */}
      <div className="flex-1 flex flex-col px-4 pt-8 pb-6">
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(26,111,212,0.08)] p-6">
          <div className="mb-6">
            <h2 className="text-[22px] font-bold text-[#1A1A2E] mb-1">
              {step === "phone" ? "Welcome" : "Verify OTP"}
            </h2>
            <p className="text-[14px] text-[#4B5563]">
              {step === "phone"
                ? "Sign in to access your account"
                : "Enter the verification code we sent"
              }
            </p>
          </div>
          {step === "phone" ? phoneForm : otpForm}
        </div>
      </div>
    </div>
  );

  /* ─── DESKTOP VIEW (md+) — split panel ─── */
  const desktopView = (
    <div className="hidden md:flex flex-col min-h-screen bg-gradient-to-br from-[#EAF2FF] via-[#F0F6FF] to-[#F8FBFF]">

      {/* Minimal top bar */}
      <div className="w-full bg-white border-b border-[#E8EEF4]">
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1280, padding: "0 32px", height: 56 }}>
          {logo}
          <div className="flex items-center gap-6">
            <a
              href="/seller/login"
              className="flex items-center gap-2 font-medium text-[#4B5563] hover:text-[#1A6FD4] transition-colors"
              style={{ fontSize: 15 }}
            >
              <Store style={{ width: 18, height: 18, color: "#1A6FD4" }} />
              Become a Seller
            </a>
            <a
              href="#"
              className="flex items-center gap-2 font-medium text-[#4B5563] hover:text-[#1A6FD4] transition-colors"
              style={{ fontSize: 15 }}
            >
              <Download style={{ width: 18, height: 18, color: "#1A6FD4" }} />
              Download App
            </a>
          </div>
        </div>
      </div>

      {/* Centered split card */}
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-[1000px]">
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(26,111,212,0.10)] overflow-hidden flex min-h-[560px]">

            {/* Left panel — hero image + text overlay */}
            <div className="relative w-[500px] shrink-0">
              <Image
                src="/login-hero.png"
                alt="Shopping illustration"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h2 className="text-[24px] font-bold text-white leading-tight mb-2">
                  Shop from India&apos;s finest sellers
                </h2>
                <p className="text-[14px] text-white/80 leading-relaxed">
                  Get access to your Orders, Wishlist and Recommendations
                </p>
              </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col justify-center px-12 py-10">
              <div className="mb-8">
                <h1 className="text-[28px] font-bold text-[#1A1A2E] mb-2">
                  {step === "phone" ? "Welcome back" : "Verify OTP"}
                </h1>
                <p className="text-[15px] text-[#4B5563] leading-relaxed">
                  {step === "phone"
                    ? "Enter your mobile number to continue"
                    : "Enter the verification code we sent"
                  }
                </p>
              </div>
              {step === "phone" ? phoneForm : otpForm}
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
      {mobileView}
      {desktopView}
    </>
  );
}
