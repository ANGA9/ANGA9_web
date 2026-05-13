"use client";
import { useState } from "react";
import SellerHeader from "@/components/seller/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";
import ChatWidget from "@/components/chatbot/ChatWidget";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#F8FBFF]" style={{ fontFamily: "var(--font-gilroy)" }}>
      <SellerHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-[260px] min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <ChatWidget surface="seller" />
    </div>
  );
}
