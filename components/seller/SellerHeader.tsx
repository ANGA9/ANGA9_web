"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useBrand } from "@/lib/BrandContext";
import { Menu, LogOut, User, Plus } from "lucide-react";
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

      <span className="ml-4 text-[11px] font-black text-[#1A6FD4] bg-[#1A6FD4]/10 border border-[#1A6FD4]/20 px-2.5 py-1 rounded-full uppercase tracking-widest hidden md:inline-flex shadow-sm">
        Seller Portal
      </span>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-1.5">
          {brands.length > 0 && (
            <select
              value={activeBrandId || ''}
              onChange={(e) => setActiveBrandId(e.target.value)}
              className="text-[13px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none hover:border-gray-300 transition-colors max-w-[150px] sm:max-w-[200px] truncate"
            >
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.seller_profiles?.store_name || b.full_name || 'Unnamed Brand'}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowCreateBrand(true)}
            title="Add a new brand"
            className="flex items-center gap-1 h-[34px] px-2.5 rounded-lg bg-[#1A6FD4]/10 text-[#1A6FD4] border border-[#1A6FD4]/20 text-[13px] font-bold hover:bg-[#1A6FD4]/15 transition-colors"
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
