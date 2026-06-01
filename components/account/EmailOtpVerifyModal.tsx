"use client";

/**
 * EmailOtpVerifyModal — confirms an email change initiated by
 * `supabase.auth.updateUser({ email })`.
 *
 * Supabase sends a 6-digit token to the *new* email (when "Secure email
 * change" is on in the Dashboard, it sends to both old and new — the user
 * still only needs to enter ONE code here; the other half of the flow happens
 * via the link in the old-address email). We call:
 *
 *   supabase.auth.verifyOtp({ email, token, type: 'email_change' })
 *
 * On success we call `onVerified()` so the parent can refresh AuthContext.
 */

import { useEffect, useRef, useState } from "react";
import { Mail, ShieldCheck, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import toast from "react-hot-toast";

interface Props {
  /** The new email address being verified (used in the verifyOtp call + UI copy) */
  email: string;
  open: boolean;
  onClose: () => void;
  /** Called after `verifyOtp` returns successfully. Parent should refresh user state. */
  onVerified: () => void;
}

export default function EmailOtpVerifyModal({ email, open, onClose, onVerified }: Props) {
  const supabase = getSupabaseBrowserClient();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Reset state every time the modal opens
  useEffect(() => {
    if (open) {
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setResendTimer(60);
      setCanResend(false);
      // Focus first input shortly after mount
      setTimeout(() => inputsRef.current[0]?.focus(), 80);
    }
  }, [open]);

  // Resend cooldown
  useEffect(() => {
    if (!open || canResend) return;
    const id = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, canResend]);

  function handleChange(index: number, value: string) {
    // Handle paste of full 6-digit code in any input
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length > 1) {
        const next = [...otp];
        let maxIdx = index;
        digits.forEach((d, i) => {
          if (index + i < 6) {
            next[index + i] = d;
            maxIdx = index + i;
          }
        });
        setOtp(next);
        inputsRef.current[Math.min(maxIdx + 1, 5)]?.focus();
        return;
      }
      value = value.slice(-1);
    }
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
      inputsRef.current[index + 1]?.select();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) inputsRef.current[index + 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
  }

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const { error: verr } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email_change",
      });
      if (verr) throw verr;
      toast.success("Email verified!");
      onVerified();
    } catch (err: any) {
      console.error("Email OTP verify error:", err);
      if (err.message?.toLowerCase().includes("expired")) {
        setError("Code has expired. Please request a new one.");
      } else {
        setError("Incorrect code. Please try again.");
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
      // Re-trigger by calling updateUser again with the same target email
      const { error: uerr } = await supabase.auth.updateUser({ email });
      if (uerr) throw uerr;
      toast.success("Code resent");
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#1A6FD4]" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-gray-900 tracking-tight">
                Verify your email
              </h2>
              <p className="text-[13px] text-gray-500 mt-0.5">
                We sent a 6-digit code to
              </p>
              <p className="text-[13px] font-bold text-[#1A6FD4] truncate max-w-[280px]">
                {email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors -mt-1 -mr-1"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* OTP body */}
        <form onSubmit={handleVerify} className="px-6 pb-6">
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                autoComplete="one-time-code"
                className="h-14 w-12 rounded-xl border border-[#D0E3F7] bg-[#F8FBFF] focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 text-center text-2xl font-bold text-[#1A1A2E] outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-[#1A6FD4] hover:bg-[#155bb5]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying…
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Verify Email
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the code?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="font-bold text-[#1A6FD4] hover:underline disabled:opacity-50"
                >
                  Resend
                </button>
              ) : (
                <span className="font-medium text-gray-400">
                  Resend in <span className="font-bold text-gray-600">{resendTimer}s</span>
                </span>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
