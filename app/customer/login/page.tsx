"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function CustomerLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    document.cookie = "portal=customer; path=/; max-age=86400";
    window.location.href = "/customer";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2C2825] text-white font-bold text-2xl">
            A
          </div>
          <h1 className="text-2xl font-bold text-[#1C1917] tracking-tight">
            ANGA
          </h1>
          <p className="mt-1 text-sm text-[#78716C]">
            B2B Wholesale Marketplace
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-[#1C1917]">
            Welcome to ANGA
          </h2>
          <p className="mb-6 text-sm text-[#78716C]">
            Sign in to browse wholesale products
          </p>

          {/* Google Sign-In (UI only) */}
          <button
            type="button"
            className="mb-4 flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#C8C1B5] bg-transparent text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#F2EFE9]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E0D8]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#A8A09A]">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1C1917]">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@business.com"
                defaultValue="buyer@metro.in"
                className="h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#F2EFE9] px-4 text-sm text-[#1C1917] placeholder:text-[#A8A09A] focus:border-[#C4873A] focus:outline-none focus:ring-2 focus:ring-[#C4873A]/20 transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1C1917]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  defaultValue="buyer123"
                  className="h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#F2EFE9] px-4 pr-11 text-sm text-[#1C1917] placeholder:text-[#A8A09A] focus:border-[#C4873A] focus:outline-none focus:ring-2 focus:ring-[#C4873A]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A09A] hover:text-[#1C1917] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#78716C]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-[#E5E0D8] accent-[#C4873A]"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm font-medium text-[#44403C] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#2C2825] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#44403C] active:translate-y-px"
            >
              Sign in to Shop
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#A8A09A]">
            New to ANGA?{" "}
            <button className="font-medium text-[#44403C] hover:underline">
              Register your business
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#A8A09A]">
          Back to{" "}
          <a href="/" className="font-medium text-[#44403C] hover:underline">
            Portal Selection
          </a>
        </p>
      </div>
    </div>
  );
}
