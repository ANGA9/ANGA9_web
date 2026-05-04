"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, Bell } from "lucide-react";
import { cdnUrl } from "@/lib/utils";

interface AdminHeaderProps {
  onMenuToggle: () => void;
  pendingReviewsCount?: number;
  onLogout: () => void;
}

export default function AdminHeader({ onMenuToggle, pendingReviewsCount = 0, onLogout }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-14 bg-white border-b border-[#E8EEF4] flex items-center px-4 sm:px-6">
      {/* Mobile Menu Toggle */}
      <button className="xl:hidden mr-3 text-[#4B5563]" onClick={onMenuToggle}>
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo */}
      <Link href="/admin" className="shrink-0 flex items-center">
        <Image src={cdnUrl("/anga9-logo.png")} alt="ANGA9" width={90} height={30} priority style={{ objectFit: "contain" }} />
      </Link>

      {/* Admin Tag */}
      <span className="ml-2 text-xs md:text-sm font-bold text-[#8B5CF6] bg-[#F3E8FF] px-2 py-0.5 rounded hidden sm:inline">
        Admin
      </span>

      <div className="flex-1" />

      {/* Notifications */}
      <div className="mr-4">
        <Link
          href="/admin/reviews"
          className="relative flex items-center justify-center text-[#4B5563] hover:text-[#1A6FD4] transition-colors"
        >
          <Bell className="h-5 w-5" />
          {pendingReviewsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
              {pendingReviewsCount > 9 ? "9+" : pendingReviewsCount}
            </span>
          )}
        </Link>
      </div>

      {/* User Info & Logout */}
      <span className="text-sm md:text-base text-[#4B5563] mr-4 hidden sm:inline">ANGA9 Admin</span>
      <button onClick={onLogout} className="flex items-center gap-1.5 text-sm md:text-base font-medium text-[#9CA3AF] hover:text-[#EF4444] transition-colors">
        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
