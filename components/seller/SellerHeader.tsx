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
    <header className="sticky top-0 z-50 h-[72px] bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-4 sm:px-6 transition-all">
      <button className="lg:hidden mr-4 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors" onClick={onMenuToggle}>
        <Menu className="w-5 h-5" />
      </button>
      
      <Link href="/" className="shrink-0 flex items-center gap-3 group">
        <div className="relative h-7 w-[100px] sm:h-8 sm:w-[120px] transition-transform group-hover:scale-105">
          <Image src={cdnUrl("/anga9-logo.png")} alt="ANGA9" fill priority style={{ objectFit: "contain", objectPosition: "left" }} />
        </div>
      </Link>

      <span className="ml-4 text-[11px] font-black text-[#1A6FD4] bg-white border-2 border-[#1A6FD4] text-[#1A6FD4]/10 border border-[#1A6FD4]/20 px-2.5 py-1 rounded-full uppercase tracking-widest hidden md:inline-flex shadow-sm">
        Seller Portal
      </span>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2">
          {brands.length > 0 && (
            <div className="relative group/brand hidden sm:block">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Store className="w-4 h-4 text-[#1A6FD4]" />
              </div>
              <select
                value={activeBrandId || ''}
                onChange={(e) => setActiveBrandId(e.target.value)}
                className="appearance-none cursor-pointer pl-9 pr-8 py-2 bg-[#F8FBFF] border border-[#1A6FD4]/20 hover:border-[#1A6FD4]/50 hover:bg-[#F0F7FF] rounded-xl text-[14px] font-bold text-[#1A6FD4] outline-none transition-all shadow-sm max-w-[150px] sm:max-w-[220px] truncate"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id} className="text-gray-900 font-medium">
                    {b.seller_profiles?.store_name || b.full_name || 'Unnamed Brand'}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1A6FD4]/70"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowCreateBrand(true)}
            title="Add a new brand"
            className="flex items-center gap-1.5 bg-blue-50 text-[#1A6FD4] border border-blue-200 hover:bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] hover:text-white hover:border-[#1A6FD4] transition-all px-3 py-2 rounded-xl text-[13px] font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Brand</span>
          </button>
        </div>

        <div className="relative text-gray-500 hover:text-[#1A6FD4] transition-colors">
          <NotificationBell portalType="seller" />
        </div>
        
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />
        
        <Link 
          href="/seller/dashboard/profile"
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
          title="Profile"
        >
          <User className="w-4 h-4 font-bold" />
        </Link>

        <button 
          onClick={logout} 
          title="Logout"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
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
