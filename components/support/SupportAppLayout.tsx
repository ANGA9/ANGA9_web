"use client";
import { useState } from "react";
import SupportHeader from "@/components/support/SupportHeader";
import SupportSidebar from "@/components/support/SupportSidebar";
import { usePathname } from "next/navigation";

export default function SupportAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // If we are on the login page, don't show the header and sidebar
  if (pathname === "/support/login") {
    return <>{children}</>;
  }

  return (
    <>
      <SupportHeader onMenuClick={() => setSidebarOpen(true)} />
      <SupportSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 w-full lg:pl-[260px] pt-[72px] min-h-screen">
        {children}
      </main>
    </>
  );
}
