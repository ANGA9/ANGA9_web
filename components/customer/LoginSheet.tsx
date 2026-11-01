"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Phone, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { normalizeIndianPhone } from "@/lib/phone";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import { useAuth } from "@/lib/AuthContext";
import toast from "react-hot-toast";

type Step = "input" | "otp" | "success";

export default function LoginSheet() {
  const { isOpen, close } = useLoginSheet();
  const { user } = useAuth();

  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const supabase = getSupabaseBrowserClient();

  // Auto-focus phone input and trigger mobile keyboard
  useEffect(() => {
    if (isOpen && step === "input") {
      const timer = setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step]);

  // Slide-in animation
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Detect successful login → show success, then close
  useEffect(() => {
    if (user && isOpen && step === "otp") {
      setStep("success");
      toast.success("Login successful! Welcome to ANGA9", {
        icon: <CheckCircle2 size={18} color="#059669" />,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOpen, step]);

  // Auto-close the success screen after 1.2s (+ 300ms animation = ~1.5s total)
  useEffect(() => {
    if (step === "success" && isOpen) {
      const timer = setTimeout(() => {
        handleClose();
      }, 1200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isOpen]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      close();
      setStep("input");
      setPhone("");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setLoading(false);
    }, 300);
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
      // Test numbers are registered server-side in Supabase (Auth → Providers → Phone)
      const { error: otpErr } = await supabase.auth.signInWithOtp({ phone: normalized });
      if (otpErr) throw otpErr;
      setStep("otp");
      startResendTimer(30);
      toast.success("OTP sent to your phone!", { icon: <Phone size={18} color="#1A6FD4" /> });
    } catch (err: any) {
      console.error("Phone OTP error:", err);
      if (err.message?.includes("rate limit")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  }

  function startResendTimer(seconds = 30) {
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
      const normalized = normalizeIndianPhone(phone);
      if (!normalized) return;
      const { error: otpErr } = await supabase.auth.signInWithOtp({ phone: normalized });
      if (otpErr) throw otpErr;
      startResendTimer(30);
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
    } catch (err: any) {
      console.error("OTP verify error:", err);
      if (err.message?.includes("expired")) {
        setError("OTP has expired. Please request a new one.");
      } else {
        setError("Incorrect OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  /* ─── OTP input helpers ─── */
  function handleOtpChange(index: number, value: string) {
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
    if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`sheet-otp-${index + 1}`)?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`sheet-otp-${index - 1}`)?.focus();
    }
  }

  if (!isOpen) return null;

  const spinner = (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 md:hidden transition-opacity duration-300"
        style={{ background: `rgba(0,0,0,${visible ? 0.45 : 0})` }}
        onClick={handleClose}
      />

      {/* Sheet anchored at bottom */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 md:hidden bg-white rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          paddingBottom: "max(2.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-6 pb-2 pt-2">
          {/* ── Success State ── */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center animate-[scaleIn_0.3s_ease-out]">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-lg font-bold text-[#111827] mt-3">Login Successful!</p>
              <p className="text-sm text-[#6B7280] mt-1">Welcome to ANGA9</p>
            </div>
          )}

          {/* ── Input Step (Phone Only, Compact B2B) ── */}
          {step === "input" && (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#111827] tracking-tight">Continue with</h2>
                  <img
                    src="/anga9-logo.png"
                    alt="anga9"
                    className="h-6 w-auto object-contain -mb-0.5"
                  />
                </div>
                <p className="text-[13px] text-[#6B7280] mt-1">
                  Enter your mobile number to access wholesale deals
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="flex items-center rounded-xl border border-[#D0E3F7] bg-[#F8FBFF] focus-within:border-[#1A6FD4] focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden h-[50px]">
                  <span className="flex items-center text-sm font-bold text-[#111827] pl-4 pr-2.5 select-none">
                    +91
                  </span>
                  <div className="w-px h-5 bg-[#D0E3F7]" />
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
                    maxLength={14}
                    autoFocus
                    placeholder="Enter 10-digit mobile number"
                    className="flex-1 text-[15px] font-medium outline-none bg-transparent py-3 px-3 text-[#111827] placeholder:text-[#9CA3AF] placeholder:font-normal"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, "").length < 10}
                  className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none bg-[#1A6FD4] text-white hover:bg-[#155bb5]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">{spinner} Sending OTP...</span>
                  ) : (
                    "Continue"
                  )}
                </button>

                <p className="text-[11.5px] text-[#9CA3AF] text-center leading-relaxed pt-2 pb-6 mb-2">
                  By continuing, you agree to our{" "}
                  <a
                    href="https://anga9.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1A6FD4] underline underline-offset-2 hover:text-[#155bb5]"
                  >
                    Terms of Service
                  </a>{" "}
                  &{" "}
                  <a
                    href="https://anga9.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1A6FD4] underline underline-offset-2 hover:text-[#155bb5]"
                  >
                    Privacy Policy
                  </a>
                </p>
              </form>
            </>
          )}

          {/* ── OTP Step ── */}
          {step === "otp" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setOtp(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A6FD4] mb-3"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change mobile number
              </button>

              <div className="flex items-center gap-2 rounded-xl bg-[#EFF6FF] px-3.5 py-2.5 mb-4 border border-[#DBEAFE]">
                <Phone className="w-4 h-4 text-[#1A6FD4] shrink-0" />
                <p className="text-xs text-[#374151]">
                  OTP sent to <span className="font-bold text-[#111827]">+91 {phone}</span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex justify-center gap-2">
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
                      className="w-11 h-12 rounded-xl border border-[#D0E3F7] bg-[#F8FBFF] focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 text-center text-lg font-bold text-[#111827] outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none bg-[#1A6FD4] text-white hover:bg-[#155bb5]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">{spinner} Verifying...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify & Continue
                    </>
                  )}
                </button>

                <div className="text-center pt-2 pb-6 mb-2">
                  <p className="text-xs text-[#6B7280]">
                    Didn&apos;t receive OTP?{" "}
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
                      <span className="font-medium text-[#9CA3AF]">
                        Resend in <span className="font-bold text-[#4B5563]">{resendTimer}s</span>
                      </span>
                    )}
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

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
