"use client";
import { useState } from "react";
import SellerHeader from "@/components/seller/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#F8FBFF]" style={{ fontFamily: "var(--font-gilroy)" }}>
      <SellerHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-[220px] min-h-[calc(100vh-56px)] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
