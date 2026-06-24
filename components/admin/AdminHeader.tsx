"use client";
import Image from "next/image";
import Link from "next/link";
import { Menu, LogOut, Bell, User } from "lucide-react";
import { cdnUrl } from "@/lib/utils";

type AdminLevel = "super_admin" | "admin";

interface AdminHeaderProps {
  onMenuToggle: () => void;
  pendingReviewsCount?: number;
  pendingSellersCount?: number;
  onLogout: () => void;
  adminLevel?: AdminLevel;
}

export default function AdminHeader({
  onMenuToggle,
  pendingReviewsCount = 0,
  pendingSellersCount = 0,
  onLogout,
  adminLevel = "super_admin",
}: AdminHeaderProps) {
  const isSuperAdmin = adminLevel === "super_admin";
  const accentColor = isSuperAdmin ? "#8B5CF6" : "#16A34A";
  // Total badge across pending sellers + pending product reviews.
  // Sellers take routing priority — onboarding approvals are higher-stakes
  // than product moderation, and the count tooltip clarifies the breakdown.
  const totalPending = pendingSellersCount + pendingReviewsCount;
  const bellHref = pendingSellersCount > 0 ? "/admin/pending-sellers" : "/admin/reviews";
  const bellTitle =
    pendingSellersCount > 0 && pendingReviewsCount > 0
      ? `${pendingSellersCount} sellers · ${pendingReviewsCount} products awaiting review`
      : pendingSellersCount > 0
        ? `${pendingSellersCount} seller${pendingSellersCount === 1 ? "" : "s"} awaiting review`
        : pendingReviewsCount > 0
          ? `${pendingReviewsCount} product${pendingReviewsCount === 1 ? "" : "s"} awaiting review`
          : "No pending items";
  return (
    <header className="sticky top-0 z-50 h-[72px] bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-4 sm:px-6 transition-all">
      <button className="lg:hidden mr-4 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors" onClick={onMenuToggle}>
        <Menu className="w-5 h-5" />
      </button>

      <Link href="/admin" className="shrink-0 flex items-center gap-3 group">
        <div className="relative h-7 w-[100px] sm:h-8 sm:w-[120px] transition-transform group-hover:scale-105">
          <Image src={cdnUrl("/anga9-logo.png")} alt="ANGA9" fill priority style={{ objectFit: "contain", objectPosition: "left" }} />
        </div>
      </Link>

      <span
        className="ml-4 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest hidden md:inline-flex shadow-sm"
        style={{ color: accentColor, backgroundColor: `${accentColor}1A`, borderWidth: 1, borderColor: `${accentColor}33` }}
      >
        {isSuperAdmin ? "Super Admin Portal" : "Admin Portal"}
      </span>

      <div className="flex-1" />

      <div className="flex items-center gap-3 sm:gap-5">
        <div className={`relative text-gray-500 transition-colors`} style={{ ['--hover-accent' as string]: accentColor }}>
          <Link
            href={bellHref}
            className="flex items-center justify-center relative w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            title={bellTitle}
          >
            <Bell className="h-5 w-5" />
            {totalPending > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ring-2 ring-white bg-[#EF4444] text-white">
                {totalPending > 9 ? "9+" : totalPending}
              </span>
            )}
          </Link>
        </div>

        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        <div 
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-default"
          title="Admin Profile"
        >
          <User className="w-4 h-4 font-bold" />
        </div>

        <button 
          onClick={onLogout} 
          title="Logout"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
