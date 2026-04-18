"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SellerLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Stub auth: set cookie and redirect
    document.cookie = "portal=seller; path=/; max-age=86400";
    window.location.href = "/seller/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-seller-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A6FD4] text-white font-bold text-2xl">
            A
          </div>
          <h1 className="text-2xl font-bold text-anga-text tracking-tight">
            ANGA
          </h1>
          <p className="mt-1 text-sm text-anga-text-secondary">
            Seller Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-seller-border bg-white p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-anga-text">
            Welcome back
          </h2>
          <p className="mb-6 text-sm text-anga-text-secondary">
            Sign in to manage your store
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-anga-text">
                Email address
              </label>
              <input
                type="email"
                placeholder="seller@business.com"
                defaultValue="rajesh@electronics.in"
                className="h-11 w-full rounded-lg border border-seller-border bg-seller-bg px-4 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/20 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-anga-text">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  defaultValue="password123"
                  className="h-11 w-full rounded-lg border border-seller-border bg-seller-bg px-4 pr-11 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-anga-text-secondary hover:text-anga-text transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-anga-text-secondary">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-seller-border accent-[#1A6FD4]"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm font-medium text-[#1A6FD4] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#1A6FD4] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1560B8] active:translate-y-px"
            >
              Sign in as Seller
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-anga-text-secondary">
            Not a seller yet?{" "}
            <button className="font-medium text-[#1A6FD4] hover:underline">
              Register your business
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-anga-text-secondary">
          Back to{" "}
          <a href="/" className="font-medium text-[#1A6FD4] hover:underline">
            Portal Selection
          </a>
        </p>
      </div>
    </div>
  );
}
