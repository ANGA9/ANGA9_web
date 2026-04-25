"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import { useAuth } from "@/lib/AuthContext";
import toast from "react-hot-toast";

type Tab = "email" | "phone";
type Step = "input" | "otp" | "success";

export default function LoginSheet() {
  const { isOpen, close } = useLoginSheet();
  const { user } = useAuth();

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<Tab>("email");
  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseBrowserClient();

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
      toast.success("Login successful! Welcome to ANGA9", { icon: "🎉" });
      const timer = setTimeout(() => {
        handleClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOpen, step]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      close();
      setTab("email");
      setStep("input");
      setEmail("");
      setPhone("");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setLoading(false);
    }, 300);
  }

  function switchTab(t: Tab) {
    setTab(t);
    setStep("input");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  }

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
      toast.success("OTP sent to your email!", { icon: "📧" });
    } catch (err: any) {
      console.error("Email OTP error:", err);
      if (err.message?.includes("rate limit")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to send OTP.");
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
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "email",
      });
      if (verifyErr) throw verifyErr;
      // Auth state change will trigger the success effect above
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
        style={{ background: `rgba(0,0,0,${visible ? 0.4 : 0})` }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white rounded-t-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out"
        style={{
          maxHeight: "65vh",
          transform: visible ? "translateY(0)" : "translateY(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-6 pb-8 pt-2 overflow-y-auto" style={{ maxHeight: "calc(65vh - 24px)" }}>

          {/* ── Success State ── */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center animate-[scaleIn_0.3s_ease-out]">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-lg md:text-xl font-semibold text-[#1A1A2E] mt-4">Login Successful!</p>
              <p className="text-sm md:text-base text-[#4B5563] mt-1">Welcome to ANGA9</p>
            </div>
          )}

          {/* ── Input Step ── */}
          {step === "input" && (
            <>
              <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-[#1A1A2E]">Login or Sign Up</h2>
                <p className="text-sm md:text-base text-[#4B5563] mt-1">Enter your email or phone to continue</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#E8EEF4] mb-4">
                <button
                  type="button"
                  onClick={() => switchTab("email")}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm md:text-base font-semibold transition-all border-b-2 ${
                    tab === "email"
                      ? "border-[#1A6FD4] text-[#1A6FD4]"
                      : "border-transparent text-[#9CA3AF] hover:text-[#4B5563]"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("phone")}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm md:text-base font-semibold transition-all border-b-2 ${
                    tab === "phone"
                      ? "border-[#1A6FD4] text-[#1A6FD4]"
                      : "border-transparent text-[#9CA3AF] hover:text-[#4B5563]"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  Phone
                </button>
              </div>

              {/* Email form */}
              {tab === "email" && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                      placeholder="Enter your email"
                      className="flex-1 text-sm outline-none bg-transparent py-3.5 px-3 text-[#1A1A2E] placeholder:text-[#9CA3AF]"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                      <p className="text-xs md:text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm md:text-base font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 bg-[#1A6FD4] hover:bg-[#155bb5]"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">{spinner} Sending...</span>
                    ) : (
                      "Request OTP"
                    )}
                  </button>

                  <p className="text-xs md:text-sm text-[#9CA3AF] text-center leading-relaxed">
                    By continuing, you agree to ANGA9&apos;s{" "}
                    <a href="#" className="text-[#1A6FD4]">Terms</a> &{" "}
                    <a href="#" className="text-[#1A6FD4]">Privacy Policy</a>
                  </p>
                </form>
              )}

              {/* Phone form (disabled) */}
              {tab === "phone" && (
                <div className="space-y-4">
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
                      placeholder="Enter phone number"
                      className="flex-1 text-sm outline-none bg-transparent py-3.5 px-3 text-[#9CA3AF] placeholder:text-[#9CA3AF] cursor-not-allowed"
                    />
                  </div>

                  <div className="rounded-lg bg-[#EAF2FF] border border-[#D0E3F7] px-3 py-2.5">
                    <p className="text-xs md:text-sm text-[#4B5563] text-center">
                      Phone login will be available soon. Please use email for now.
                    </p>
                  </div>

                  <button
                    disabled
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm md:text-base font-semibold text-white bg-[#9CA3AF] cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── OTP Step ── */}
          {step === "otp" && (
            <>
              <button
                type="button"
                onClick={() => { setStep("input"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="flex items-center gap-1.5 text-sm md:text-base font-medium text-[#1A6FD4] mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Change email
              </button>

              <div className="flex items-center gap-2 rounded-lg bg-[#EAF2FF] px-3 py-2 mb-5">
                <Mail className="w-4 h-4 text-[#1A6FD4]" />
                <p className="text-sm md:text-base text-[#4B5563]">
                  OTP sent to <span className="font-semibold text-[#1A1A2E]">{email}</span>
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
                    <p className="text-xs md:text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm md:text-base font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 bg-[#1A6FD4] hover:bg-[#155bb5]"
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
