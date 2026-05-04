"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Menu, LogOut } from "lucide-react";
import NotificationBell from "@/components/shared/NotificationBell";
import { cdnUrl } from "@/lib/utils";

export default function SellerHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 h-14 bg-white border-b border-[#E8EEF4] flex items-center px-4 sm:px-6">
      <button className="lg:hidden mr-3 text-[#4B5563]" onClick={onMenuToggle}>
        <Menu className="w-5 h-5" />
      </button>
      <Link href="/" className="shrink-0">
        <Image src={cdnUrl("/anga9-logo.png")} alt="ANGA9" width={90} height={30} priority style={{ objectFit: "contain" }} />
      </Link>
      <span className="ml-2 text-xs md:text-sm font-bold text-[#1A6FD4] bg-[#EAF2FF] px-2 py-0.5 rounded hidden sm:inline">Seller</span>
      <div className="flex-1" />
      <div className="mr-4">
        <NotificationBell portalType="seller" />
      </div>
      <span className="text-sm md:text-base text-[#4B5563] mr-4 hidden sm:inline">{user?.email}</span>
      <button onClick={logout} className="flex items-center gap-1.5 text-sm md:text-base font-medium text-[#9CA3AF] hover:text-[#EF4444] transition-colors">
        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
