"use client";

import { useBrand } from "@/lib/BrandContext";
import { useAuth } from "@/lib/AuthContext";
import { Store, Plus, Info, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import CreateBrandModal from "@/components/seller/CreateBrandModal";

export default function BrandManagementPage() {
  const { brands, activeBrandId, setActiveBrandId, refreshBrands } = useBrand();
  const { dbUser } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // If a brand is missing its store name, fallback to full name or generic text
  const getBrandName = (brand: typeof brands[0]) => 
    brand.seller_profiles?.store_name || brand.full_name || "Unnamed Brand";

  async function handleBrandCreated(newBrandId: string) {
    setShowCreateModal(false);
    await refreshBrands();
    setActiveBrandId(newBrandId);
  }

  return (
    <main className="w-full mx-auto max-w-6xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Brand Management</h1>
          <p className="text-[15px] text-gray-500 font-medium">Manage your parent account and all child brands from one place.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] bg-[#1A6FD4] text-white hover:bg-[#1559B3]"
        >
          <Plus className="w-5 h-5" /> Add New Brand
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: Brand List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-[#1A6FD4]" /> Your Brands
            </h2>
            
            <div className="space-y-4">
              {brands.map((brand) => {
                const isActive = brand.id === activeBrandId;
                const isParent = brand.id === dbUser?.id;
                
                return (
                  <div 
                    key={brand.id}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                      isActive 
                        ? "border-[#1A6FD4] bg-[#F8FBFF] shadow-sm shadow-[#1A6FD4]/10" 
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                        isActive ? "bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Store className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[16px] font-bold text-gray-900">{getBrandName(brand)}</h3>
                          {isActive && (
                            <span className="flex items-center gap-1 text-[14px] font-bold text-[#1A6FD4] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[14px] font-bold px-2.5 py-0.5 rounded-md border ${
                            isParent 
                              ? "bg-blue-50 text-[#1A6FD4] border-blue-200" 
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}>
                            {isParent ? "Parent Account" : "Child Brand"}
                          </span>
                          <span className="text-[14px] text-gray-500 font-medium">ID: {brand.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                    
                    {!isActive && (
                      <button
                        onClick={() => setActiveBrandId(brand.id)}
                        className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-[14px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[#1A6FD4] hover:border-[#1A6FD4]/30 transition-all shadow-sm"
                      >
                        Switch to Brand
                      </button>
                    )}
                  </div>
                );
              })}
              
              {brands.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                  <p className="text-gray-500 font-medium">No brands found. Try refreshing.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column: Guidelines */}
        <div className="space-y-6">
          <div className="bg-[#F8FBFF] rounded-3xl border border-blue-100 p-6 sm:p-8">
            <h3 className="text-[16px] font-bold text-[#1A6FD4] mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" /> How Multi-Brand Works
            </h3>
            
            <ul className="space-y-4 text-[14px] text-gray-600 font-medium leading-relaxed">
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] shrink-0" />
                <p><strong className="text-gray-900">Isolated Data:</strong> Each brand acts as an entirely separate store. Products, orders, and payouts are completely isolated.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] shrink-0" />
                <p><strong className="text-gray-900">Seamless Switching:</strong> Use the dropdown in the header or the list on this page to instantly switch contexts without logging out.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] shrink-0" />
                <p><strong className="text-gray-900">Centralized Login:</strong> You only ever need one email and password. All your child brands inherit the authentication of your parent account.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] shrink-0" />
                <p><strong className="text-gray-900">Notifications:</strong> All email and SMS alerts for your child brands will be automatically routed to your parent account's contact details.</p>
              </li>
            </ul>
          </div>
        </div>
        
      </div>
      
      {showCreateModal && (
        <CreateBrandModal 
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleBrandCreated}
        />
      )}
    </main>
  );
}
