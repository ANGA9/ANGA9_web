"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BusinessProfileView from "@/components/account/BusinessProfileView";

export default function KycPage() {
  return (
    <main className="w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 bg-white md:bg-transparent min-h-screen">
      {/* Mobile header */}
      <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40 md:hidden -mx-4 -mt-6 mb-6">
        <Link href="/account" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-bold text-gray-900 leading-tight">Business Profile & GST</h1>
      </header>

      {/* Desktop header */}
      <div className="hidden md:flex items-center gap-4 mb-8">
        <Link 
          href="/account" 
          className="p-2.5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-all active:scale-95"
          title="Back to Account"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-[26px] lg:text-[30px] font-black text-gray-900 tracking-tight">
            Business Profile & GST Invoicing
          </h1>
          <p className="text-[14px] text-gray-500 font-medium mt-0.5">
            Manage your registered business entity to receive B2B tax invoices and claim 18% GST Input Tax Credit.
          </p>
        </div>
      </div>

      <BusinessProfileView />
    </main>
  );
}
