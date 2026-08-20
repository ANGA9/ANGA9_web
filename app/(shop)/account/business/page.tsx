"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BusinessProfileView from "@/components/account/BusinessProfileView";

export default function BusinessProfilePage() {
  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-6 md:px-8 pt-0 md:py-10 bg-white md:bg-transparent min-h-screen">
      {/* Mobile header */}
      <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40 md:hidden">
        <Link href="/account" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-bold text-gray-900 leading-tight">Business Profile & GST</h1>
      </header>

      <div className="pt-6 md:pt-0 pb-24 lg:pb-12 max-w-3xl mx-auto md:mx-0">
        {/* Desktop header */}
        <div className="hidden md:flex items-center gap-4 mb-8">
          <Link href="/account" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </Link>
          <div>
            <h1 className="text-[28px] font-black text-gray-900 tracking-tight">Business Profile</h1>
            <p className="text-[14px] text-gray-500 font-medium">Manage your registered business entity and 18% GST Invoicing details.</p>
          </div>
        </div>

        <BusinessProfileView />
      </div>
    </main>
  );
}
