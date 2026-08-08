"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import KycView from "@/components/account/KycView";

/**
 * Standalone KYC page.
 *
 * KycProgressCard links here from both the account dashboard and the mobile
 * menu. Without this route those links 404 — the KYC form was previously only
 * reachable through the in-page "KYC Verification" tab.
 */
export default function KycPage() {
  return (
    <main className="w-full mx-auto max-w-5xl px-0 md:px-8 pt-0 md:py-10 bg-white md:bg-transparent min-h-screen">
      {/* Mobile header */}
      <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40 md:hidden">
        <Link href="/account" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight">KYC Verification</h1>
      </header>

      <div className="px-4 sm:px-6 md:px-0 pt-6 md:pt-0 pb-24 lg:pb-12 max-w-3xl mx-auto md:mx-0">
        {/* Desktop header */}
        <div className="hidden md:flex items-center gap-4 mb-8">
          <Link href="/account" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </Link>
          <h1 className="text-[28px] font-black text-gray-900 tracking-tight">KYC Verification</h1>
        </div>

        <KycView />
      </div>
    </main>
  );
}
