"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    document.cookie = "portal=admin; path=/; max-age=86400";
    window.location.href = "/admin";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-anga-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111111] text-white font-bold text-2xl">
            A
          </div>
          <h1 className="text-2xl font-bold text-anga-text tracking-tight">
            ANGA
          </h1>
          <p className="mt-1 text-sm text-anga-text-secondary">
            Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-anga-border bg-white p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-anga-text">
            Admin Sign In
          </h2>
          <p className="mb-6 text-sm text-anga-text-secondary">
            Access the marketplace admin dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-anga-text">
                Email address
              </label>
              <input
                type="email"
                placeholder="admin@anga.in"
                defaultValue="admin@anga.in"
                className="h-11 w-full rounded-lg border border-anga-border bg-anga-bg px-4 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-anga-text">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  defaultValue="admin123"
                  className="h-11 w-full rounded-lg border border-anga-border bg-anga-bg px-4 pr-11 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 transition-colors"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-anga-text-secondary">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-anga-border accent-[#111111]"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm font-medium text-[#111111] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#111111] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#333333] active:translate-y-px"
            >
              Sign in as Admin
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-anga-text-secondary">
          Back to{" "}
          <a href="/" className="font-medium text-[#111111] hover:underline">
            Portal Selection
          </a>
        </p>
      </div>
    </div>
  );
}
