"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const ADMIN_EMAIL = "info@anga9.com";
const ADMIN_PASSWORD = "anga9@098";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    // Validate credentials
    if (trimmedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Invalid email or password. Please check your credentials.");
      setLoading(false);
      return;
    }

    // Set admin portal cookie and redirect
    document.cookie = "portal=admin; path=/; max-age=86400";
    window.location.href = "/admin";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#EAF2FF] via-[#F0F6FF] to-[#F8FBFF] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A6FD4] text-white shadow-lg shadow-[#1A6FD4]/20">
            <Image src="/anga9-logo.png" alt="ANGA9" width={36} height={36} priority style={{ objectFit: "contain" }} />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">
            ANGA9
          </h1>
          <p className="mt-1 text-sm text-[#4B5563]">
            Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-[#E8EEF4] bg-white p-8 shadow-[0_8px_40px_rgba(26,111,212,0.08)]">
          <h2 className="mb-1 text-lg font-semibold text-[#1A1A2E]">
            Admin Sign In
          </h2>
          <p className="mb-6 text-sm text-[#4B5563]">
            Access the marketplace admin dashboard
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3.5 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm md:text-base text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">
                Email address
              </label>
              <input
                type="email"
                placeholder="admin@anga9.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="h-11 w-full rounded-lg border border-[#E8EEF4] bg-[#F8FBFF] px-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-[#E8EEF4] bg-[#F8FBFF] px-4 pr-11 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-[#4B5563]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-[#E8EEF4] accent-[#1A6FD4]"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-[#1A6FD4] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#155bb5] hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Signing in..." : "Sign in as Admin"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#4B5563]">
          Back to{" "}
          <a href="/" className="font-medium text-[#1A6FD4] hover:underline">
            Homepage
          </a>
        </p>
      </div>
    </div>
  );
}
