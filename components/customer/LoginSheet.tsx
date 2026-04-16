"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Phone, ShieldCheck, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import { useAuth } from "@/lib/AuthContext";

declare global {
  interface Window {
    recaptchaVerifierSheet?: RecaptchaVerifier;
  }
}

export default function LoginSheet() {
  const { isOpen, close } = useLoginSheet();
  const { user } = useAuth();

  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  // Slide-in animation
  useEffect(() => {
    if (isOpen) {
      // Small delay so the DOM renders at translateY(100%) first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Setup recaptcha when sheet opens
  useEffect(() => {
    if (!isOpen) return;
    if (!window.recaptchaVerifierSheet) {
      window.recaptchaVerifierSheet = new RecaptchaVerifier(auth, "recaptcha-container-sheet", {
        size: "invisible",
        callback: () => {},
      });
      window.recaptchaVerifierSheet.render();
    }
    return () => {
      if (window.recaptchaVerifierSheet) {
        try { window.recaptchaVerifierSheet.clear(); } catch {}
        window.recaptchaVerifierSheet = undefined;
      }
    };
  }, [isOpen]);

  // Detect successful login → show success, then close
  useEffect(() => {
    if (user && isOpen && step === "otp") {
      setStep("success");
      const timer = setTimeout(() => {
        handleClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, isOpen, step]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      close();
      // Reset state
      setStep("phone");
      setPhone("");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setLoading(false);
      setConfirmationResult(null);
    }, 300); // wait for slide-out animation
  }

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
      const appVerifier = window.recaptchaVerifierSheet!;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
    } catch (err: any) {
      console.error("Phone auth error:", err);
      if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (err.code === "auth/invalid-app-credential" || err.code === "auth/captcha-check-failed") {
        setError("Verification failed. Please try again.");
      } else {
        setError(err.message || "Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    // Handle paste of full OTP
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length > 1) {
        const next = [...otp];
        digits.forEach((d, i) => {
          if (index + i < 6) next[index + i] = d;
        });
        setOtp(next);
        const focusIdx = Math.min(index + digits.length, 5);
        document.getElementById(`sheet-otp-${focusIdx}`)?.focus();
        return;
      }
      value = value.slice(-1);
    }
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      const el = document.getElementById(`sheet-otp-${index + 1}`);
      if (el) {
        el.focus();
        (el as HTMLInputElement).select();
      }
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`sheet-otp-${index - 1}`)?.focus();
    }
    // Arrow key navigation
    if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`sheet-otp-${index + 1}`)?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`sheet-otp-${index - 1}`)?.focus();
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
      // Auth state change will trigger the success effect above
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Incorrect OTP. Please try again.");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return <div id="recaptcha-container-sheet" ref={recaptchaRef} />;

  const spinner = (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <>
      <div id="recaptcha-container-sheet" ref={recaptchaRef} />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 md:hidden transition-opacity duration-300"
        style={{ background: `rgba(0,0,0,${visible ? 0.4 : 0})` }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white rounded-t-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out"
        style={{
          maxHeight: "60vh",
          transform: visible ? "translateY(0)" : "translateY(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-6 pb-8 pt-2 overflow-y-auto" style={{ maxHeight: "calc(60vh - 24px)" }}>

          {/* ── Success State ── */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center animate-[scaleIn_0.3s_ease-out]">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <p className="text-[18px] font-semibold text-[#1A1A2E] mt-4">Login Successful!</p>
              <p className="text-[13px] text-[#4B5563] mt-1">Welcome to ANGA9</p>
            </div>
          )}

          {/* ── Phone Step ── */}
          {step === "phone" && (
            <>
              <div className="mb-5">
                <h2 className="text-[20px] font-bold text-[#1A1A2E]">Login or Sign Up</h2>
                <p className="text-[13px] text-[#4B5563] mt-1">Enter your mobile number to continue</p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
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
                    placeholder="Enter phone number"
                    className="flex-1 text-sm outline-none bg-transparent py-3.5 px-3 text-[#1A1A2E] placeholder:text-[#9CA3AF]"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                    <p className="text-[12px] text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 bg-[#1A6FD4] hover:bg-[#155bb5]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">{spinner} Sending...</span>
                  ) : (
                    "Request OTP"
                  )}
                </button>

                <p className="text-[11px] text-[#9CA3AF] text-center leading-relaxed">
                  By continuing, you agree to ANGA9&apos;s{" "}
                  <a href="#" className="text-[#1A6FD4]">Terms</a> &{" "}
                  <a href="#" className="text-[#1A6FD4]">Privacy Policy</a>
                </p>
              </form>
            </>
          )}

          {/* ── OTP Step ── */}
          {step === "otp" && (
            <>
              <button
                type="button"
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#1A6FD4] mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Change number
              </button>

              <div className="flex items-center gap-2 rounded-lg bg-[#EAF2FF] px-3 py-2 mb-5">
                <Phone className="w-4 h-4 text-[#1A6FD4]" />
                <p className="text-[13px] text-[#4B5563]">
                  OTP sent to <span className="font-semibold text-[#1A1A2E]">+91 {phone}</span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex justify-center gap-3">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`sheet-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onFocus={(e) => e.target.select()}
                      autoFocus={i === 0}
                      className="h-11 w-10 rounded-lg border border-[#D0E3F7] bg-[#F8FBFF] focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 text-center text-lg font-bold text-[#1A1A2E] outline-none transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                    <p className="text-[12px] text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 bg-[#1A6FD4] hover:bg-[#155bb5]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">{spinner} Verifying...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify & Login
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Success animation keyframes */}
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
