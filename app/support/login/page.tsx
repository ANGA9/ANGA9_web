"use client";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, ShieldAlert, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SupportLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      // 1. Send OTP via Supabase Auth
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false }, // Only existing users can log in
      });

      if (authError) {
        if (authError.message.includes("Signups not allowed")) {
          throw new Error("This email is not registered. Access denied.");
        }
        throw authError;
      }

      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      // 1. Verify OTP with Supabase
      const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (verifyError || !sessionData.session) {
        throw new Error("Invalid or expired OTP. Please try again.");
      }

      const accessToken = sessionData.session.access_token;

      // 2. EXPLICIT VERIFY CALL — This triggers the team_allowlist reconciliation
      const res = await fetch(`${API_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to verify session with backend.");
      }

      const { user } = await res.json();

      // 3. Capability check post-reconciliation
      if (!user.is_support) {
        await supabase.auth.signOut().catch(() => {});
        throw new Error("Access denied. Your email is not authorized for support access.");
      }

      // 4. Success — proceed to dashboard
      window.location.href = "/support/dashboard";
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F0FDFA] font-sans">
      {/* Left side: Hero / Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-teal-600 text-white">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-teal-400 blur-3xl mix-blend-screen" />
          <div className="absolute bottom-[10%] -left-[20%] w-[80%] h-[80%] rounded-full bg-teal-800 blur-3xl mix-blend-multiply" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-teal-600 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight">ANGA9 Support</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-5xl font-black tracking-tight leading-[1.1] mb-6">
            Empower<br />
            <span className="text-teal-200">Our Customers</span>
          </h1>
          <p className="text-teal-50 text-lg font-medium leading-relaxed mb-8">
            The central hub for resolving issues, tracking SLAs, and delivering exceptional experiences.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-teal-200/80 text-sm font-semibold tracking-wider uppercase">
            Internal Secure Access Only
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 mt-2 font-medium">
              Sign in to access the Support Portal
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {step === "EMAIL" ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-teal-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-[15px] font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 transition-all shadow-sm"
                    placeholder="agent@anga9.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-[52px] rounded-2xl text-[15px] font-bold hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group bg-white border-2 border-teal-600 text-teal-600 hover:bg-gray-50"
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
            <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-center text-2xl tracking-[0.5em] font-black text-gray-900 focus:outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 transition-all shadow-sm"
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
                  className="w-full h-[52px] rounded-2xl text-[15px] font-bold hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center bg-white border-2 border-teal-600 text-teal-600 hover:bg-gray-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Secure Login"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep("EMAIL")}
                  disabled={loading}
                  className="w-full h-[48px] bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-2xl text-[14px] font-bold transition-colors"
                >
                  Back to Email
                </button>
              </div>
            </form>
          )}

          <div className="pt-8 border-t border-gray-100 mt-8">
            <p className="text-center text-xs font-medium text-gray-400">
              By logging in, you agree to ANGA9's Internal Data Privacy Policy. All actions are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
