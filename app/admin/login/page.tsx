"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertCircle, ArrowRight, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { cdnUrl } from "@/lib/utils";

type Step = "email" | "otp";

export default function AdminLoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
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
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: "email",
      });
      if (verifyErr) throw verifyErr;

      const authUid = data.user?.id;
      if (!authUid) throw new Error("Authentication failed");

      const { data: dbUser, error: dbErr } = await supabase
        .from("users")
        .select("role, admin_level")
        .eq("auth_uid", authUid)
        .single();

      if (dbErr) {
        console.error("[admin-login] users lookup failed", dbErr);
        await supabase.auth.signOut();
        setError(`Lookup failed: ${dbErr.message}. Check that your users row exists and RLS allows self-read.`);
        setStep("email");
        setOtp("");
        setLoading(false);
        return;
      }

      const role = dbUser?.role;
      const isAdmin = role === "admin";
      if (!dbUser || !isAdmin) {
        console.warn("[admin-login] access denied — role was", role);
        await supabase.auth.signOut();
        setError(`Access denied. You do not have an admin role.`);
        setStep("email");
        setOtp("");
        setLoading(false);
        return;
      }

      const level = dbUser.admin_level || (role === "super_admin" ? "super_admin" : "admin");
      document.cookie = "portal=admin; path=/; max-age=86400";
      document.cookie = `admin_level=${level}; path=/; max-age=86400`;
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

  return (
    <div className="min-h-screen w-full flex bg-purple-50 font-sans">
      {/* Left side: Hero / Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-[#8B5CF6] text-white relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-purple-400 blur-3xl mix-blend-screen" />
          <div className="absolute bottom-[10%] -left-[20%] w-[80%] h-[80%] rounded-full bg-[#4C1D95] blur-3xl mix-blend-multiply" />
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <img src={cdnUrl("/anga9-logo.png")} alt="ANGA9" className="h-[28px] w-auto brightness-0 invert translate-y-[2px]" />
          <span className="text-[28px] font-black tracking-tight">Admin Portal</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-5xl font-black tracking-tight leading-[1.1] mb-6">
            Command<br />
            <span className="text-purple-200">& Control</span>
          </h1>
          <p className="text-purple-50 text-lg font-medium leading-relaxed mb-8">
            The secure gateway for managing platform operations, verifying sellers, and overseeing the marketplace.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-purple-200/80 text-sm font-semibold tracking-wider uppercase">
            Internal Secure Access Only
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h2>
            <p className="text-gray-500 mt-2 font-medium">
              Sign in to manage the ANGA9 ecosystem
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#8B5CF6]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-[15px] font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] transition-all shadow-sm"
                    placeholder="admin@anga9.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-[52px] bg-[#8B5CF6] text-white rounded-2xl text-[15px] font-bold shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:bg-[#7C3AED] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">
                  Secure OTP Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-center text-2xl tracking-[0.5em] font-black text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] transition-all shadow-sm"
                  placeholder="------"
                />
                <p className="text-center text-sm font-medium text-gray-500 mt-3">
                  Sent to <span className="text-gray-900 font-bold">{email}</span>
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-[52px] bg-[#8B5CF6] text-white rounded-2xl text-[15px] font-bold shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:bg-[#7C3AED] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Secure Login"}
                </button>
                
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setOtp(""); }}
                    disabled={loading}
                    className="flex-1 h-[48px] bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-2xl text-[14px] font-bold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading || !canResend}
                    className="flex-1 h-[48px] bg-transparent text-[#8B5CF6] hover:text-[#7C3AED] hover:bg-purple-50 rounded-2xl text-[14px] font-bold transition-colors disabled:opacity-50"
                  >
                    {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="pt-8 border-t border-gray-100 mt-8">
            <p className="text-center text-xs font-medium text-gray-400">
              Back to <a href="/" className="font-bold text-[#8B5CF6] hover:underline">Homepage</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
