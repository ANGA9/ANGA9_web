"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export default function CustomerLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    document.cookie = "portal=customer; path=/; max-age=86400";
    window.location.href = "/customer";
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: t.bgPage }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1
            className="text-[28px] font-extrabold tracking-tight"
            style={{ color: t.textPrimary }}
          >
            ANGA
          </h1>
          <p className="mt-1 text-sm" style={{ color: t.textSecondary }}>
            Sign in to your business account
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl border p-8 shadow-sm"
          style={{ background: t.bgCard, borderColor: t.border }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: t.textPrimary }}
              >
                Email address
              </label>
              <input
                type="email"
                placeholder="you@business.com"
                defaultValue="rahul@metromart.in"
                className="h-11 w-full rounded-lg border px-4 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  borderColor: t.borderSearch,
                  color: t.textPrimary,
                  background: t.bgCard,
                }}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: t.textPrimary }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  defaultValue="buyer123"
                  className="h-11 w-full rounded-lg border px-4 pr-11 text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    borderColor: t.borderSearch,
                    color: t.textPrimary,
                    background: t.bgCard,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: t.textMuted }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-[10px] text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:translate-y-px"
              style={{ background: t.bluePrimary }}
            >
              Sign in to Shop
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: t.border }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3" style={{ background: t.bgCard, color: t.textMuted }}>
                or
              </span>
            </div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-3 rounded-[10px] border text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: t.border, color: t.textPrimary }}
          >
            {/* Google colored dots */}
            <span className="flex gap-[3px]">
              <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
              <span className="h-2 w-2 rounded-full bg-[#FBBC05]" />
              <span className="h-2 w-2 rounded-full bg-[#34A853]" />
              <span className="h-2 w-2 rounded-full bg-[#4285F4]" />
            </span>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm" style={{ color: t.textSecondary }}>
            New to ANGA?{" "}
            <button
              className="font-medium hover:underline"
              style={{ color: t.bluePrimary }}
            >
              Register your business &rarr;
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: t.textMuted }}>
          Back to{" "}
          <a href="/" className="font-medium hover:underline" style={{ color: t.textSecondary }}>
            Portal Selection
          </a>
        </p>
      </div>
    </div>
  );
}
