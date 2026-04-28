"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertCircle, ArrowLeft, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Step = "email" | "otp";

export default function AdminLoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const supabase = getSupabaseBrowserClient();

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

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = email.trim().toLowerCase();
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
      if (err.message?.includes("rate limit")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!canResend || loading) return;
    setError("");
    setLoading(true);
    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (otpErr) throw otpErr;
      startResendTimer();
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
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
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "email",
      });
      if (verifyErr) throw verifyErr;

      const authUid = data.user?.id;
      if (!authUid) throw new Error("Authentication failed");

      const { data: dbUser, error: dbErr } = await supabase
        .from("users")
        .select("role")
        .eq("auth_uid", authUid)
        .single();

      if (dbErr || !dbUser || dbUser.role !== "admin") {
        await supabase.auth.signOut();
        setError("Access denied. This account does not have admin privileges.");
        setStep("email");
        setOtp(["", "", "", "", "", ""]);
        setLoading(false);
        return;
      }

      document.cookie = "portal=admin; path=/; max-age=86400";
      window.location.href = "/admin";
    } catch (err: any) {
      if (err.message?.includes("expired")) {
        setError("OTP has expired. Please request a new one.");
      } else if (err.message?.includes("Access denied")) {
        // already handled
      } else {
        setError("The OTP you entered is incorrect. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#EAF2FF] via-[#F0F6FF] to-[#F8FBFF] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A6FD4] text-white shadow-lg shadow-[#1A6FD4]/20">
            <Image src="/anga9-logo.png" alt="ANGA9" width={36} height={36} priority style={{ objectFit: "contain" }} />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">ANGA9</h1>
          <p className="mt-1 text-sm text-[#4B5563]">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-[#E8EEF4] bg-white p-8 shadow-[0_8px_40px_rgba(26,111,212,0.08)]">
          {step === "email" ? (
            <>
              <h2 className="mb-1 text-lg font-semibold text-[#1A1A2E]">Admin Sign In</h2>
              <p className="mb-6 text-sm text-[#4B5563]">Enter your admin email to receive a verification code</p>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3.5 py-3">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">Email address</label>
                  <div className="flex items-center rounded-lg border border-[#E8EEF4] bg-[#F8FBFF] focus-within:border-[#1A6FD4] focus-within:ring-2 focus-within:ring-[#1A6FD4]/10 transition-all overflow-hidden">
                    <span className="flex items-center pl-4 pr-2">
                      <Mail className="w-4 h-4 text-[#9CA3AF]" />
                    </span>
                    <input
                      type="email"
                      placeholder="admin@anga9.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="flex-1 h-11 text-sm outline-none bg-transparent px-2 text-[#1A1A2E] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-[#1A6FD4] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#155bb5] hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Sending OTP..." : "Request OTP"}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="flex items-center gap-1.5 text-sm font-medium text-[#1A6FD4] hover:text-[#155bb5] transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Change email
              </button>

              <h2 className="mb-1 text-lg font-semibold text-[#1A1A2E]">Verify OTP</h2>
              <p className="mb-4 text-sm text-[#4B5563]">Enter the verification code sent to <span className="font-semibold text-[#1A1A2E]">{email}</span></p>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3.5 py-3">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
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
                      className="h-12 w-11 rounded-lg border border-[#E8EEF4] bg-[#F8FBFF] focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 text-center text-xl font-bold text-[#1A1A2E] outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-[#1A6FD4] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#155bb5] hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <div className="text-center">
                  <p className="text-sm text-[#4B5563]">
                    Didn&apos;t receive the code?{" "}
                    {canResend ? (
                      <button type="button" onClick={handleResend} disabled={loading} className="font-bold text-[#1A6FD4] hover:underline disabled:opacity-50">
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
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[#4B5563]">
          Back to{" "}
          <a href="/" className="font-medium text-[#1A6FD4] hover:underline">Homepage</a>
        </p>
      </div>
    </div>
  );
}
