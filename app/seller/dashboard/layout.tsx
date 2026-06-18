"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SellerHeader from "@/components/seller/SellerHeader";
import SellerSidebar from "@/components/seller/SellerSidebar";
import ChatWidget from "@/components/chatbot/ChatWidget";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/seller/dashboard";

  return (
    <div className="min-h-screen bg-[#F8FBFF]" style={{ fontFamily: "var(--font-gilroy)" }}>
      <SellerHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-[260px] min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      {isHomepage && <ChatWidget surface="seller" />}
    </div>
  );
}
