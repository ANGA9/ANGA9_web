"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useBrand } from "@/lib/BrandContext";
import { Menu, LogOut, User, Plus, Store } from "lucide-react";
import NotificationBell from "@/components/shared/NotificationBell";
import CreateBrandModal from "@/components/seller/CreateBrandModal";
import { cdnUrl } from "@/lib/utils";

export default function SellerHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { logout } = useAuth();
  const { brands, activeBrandId, setActiveBrandId, refreshBrands } = useBrand();
  const [showCreateBrand, setShowCreateBrand] = useState(false);

  async function handleBrandCreated(newBrandId: string) {
    setShowCreateBrand(false);
    await refreshBrands();
    // Switch into the newly created brand (this reloads to re-fetch all data).
    setActiveBrandId(newBrandId);
  }

  return (
    <>
    <header className="sticky top-0 z-50 h-[72px] bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 transition-all">
      {/* ── Left Section: Menu (Mobile) + Logo ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          className="lg:hidden w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors" 
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <Link href="/" className="shrink-0 flex items-center gap-1.5 sm:gap-2 group transition-opacity hover:opacity-90">
          <div className="relative h-7 w-[85px] sm:h-8 sm:w-[105px] transition-transform group-hover:scale-105">
            <Image src={cdnUrl("/anga9-logo.png")} alt="ANGA9" fill priority style={{ objectFit: "contain", objectPosition: "left" }} />
          </div>
          <span className="inline-block border-l-2 border-[#E8EEF4] pl-2 sm:pl-3 ml-0.5 sm:ml-1 text-[12px] sm:text-[14px] font-bold text-[#4B5563] tracking-wide uppercase whitespace-nowrap">
            SELLER HUB
          </span>
        </Link>
      </div>
      
      {/* ── Right Section ── */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Brand Switcher (Visible on both Mobile and Desktop) */}
        {brands.length > 0 && (
          <div className="relative group/brand">
            <div className="absolute inset-y-0 left-2.5 sm:left-3 flex items-center pointer-events-none">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1A6FD4]" />
            </div>
            <select
              value={activeBrandId || ''}
              onChange={(e) => setActiveBrandId(e.target.value)}
              className="appearance-none cursor-pointer pl-7 pr-7 sm:pl-9 sm:pr-8 py-1.5 sm:py-2 bg-[#F8FBFF] border border-[#1A6FD4]/20 hover:border-[#1A6FD4]/50 hover:bg-[#F0F7FF] rounded-xl text-[13px] sm:text-[14px] font-bold text-[#1A6FD4] outline-none transition-all shadow-sm max-w-[135px] sm:max-w-[220px] truncate"
            >
              {brands.map(b => (
                <option key={b.id} value={b.id} className="text-gray-900 font-medium">
                  {b.seller_profiles?.store_name || b.full_name || 'Unnamed Brand'}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1A6FD4]/70"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        )}

        {/* Add Brand button (Desktop only) */}
        <button
          onClick={() => setShowCreateBrand(true)}
          title="Add a new brand"
          className="hidden sm:flex items-center gap-1.5 bg-[#1A6FD4] text-white hover:bg-[#1559B3] transition-all px-3.5 py-2 rounded-xl text-[14px] font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </button>

        {/* Notification Bell (Desktop only on top bar) */}
        <div className="hidden sm:flex relative text-gray-500 hover:text-[#1A6FD4] transition-colors items-center">
          <NotificationBell portalType="seller" />
        </div>
        
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />
        
        {/* Profile Avatar (Desktop only) */}
        <Link 
          href="/seller/dashboard/profile"
          className="hidden sm:flex w-9 h-9 rounded-xl bg-gray-100 text-gray-600 items-center justify-center hover:bg-gray-200 hover:text-[#1A6FD4] transition-colors"
          title="Seller Profile"
        >
          <User className="w-4 h-4 font-bold" />
        </Link>
      </div>
    </header>

    <CreateBrandModal
      open={showCreateBrand}
      onClose={() => setShowCreateBrand(false)}
      onCreated={handleBrandCreated}
    />
    </>
  );
}
