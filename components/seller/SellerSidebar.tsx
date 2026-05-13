"use client";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, UserCircle, Settings, Bell, X, IndianRupee, Wallet, BarChart3, LifeBuoy, AlertTriangle, Megaphone, Store } from "lucide-react";
import SellerLink from "@/components/seller/SellerLink";
import { useSellerSubdomain, sellerHref } from "@/lib/sellerHref";

const NAV = [
  { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/seller/dashboard/products", icon: Package },
  { label: "Ad Campaigns", href: "/seller/dashboard/ads", icon: Megaphone },
  { label: "Orders", href: "/seller/dashboard/orders", icon: ShoppingCart },
  { label: "Disputes", href: "/seller/dashboard/disputes", icon: AlertTriangle },
  { label: "Inventory", href: "/seller/dashboard/inventory", icon: BarChart3 },
  { label: "Earnings", href: "/seller/dashboard/earnings", icon: IndianRupee },
  { label: "Payouts", href: "/seller/dashboard/payouts", icon: Wallet },
  { label: "Notifications", href: "/seller/dashboard/notifications", icon: Bell },
  { label: "Help & Support", href: "/seller/dashboard/help", icon: LifeBuoy },
  { label: "Profile", href: "/seller/dashboard/profile", icon: UserCircle },
  { label: "Storefront", href: "/seller/dashboard/storefront", icon: Store },
  { label: "Settings", href: "/seller/dashboard/settings", icon: Settings },
];

export default function SellerSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const onSub = useSellerSubdomain();
  
  const isActive = (href: string) => {
    const target = sellerHref(href, onSub);
    return target === "/dashboard" || target === "/seller/dashboard"
      ? pathname === target
      : pathname.startsWith(target);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-opacity" onClick={onClose} />
      )}
      
      <aside
        className={`fixed top-[72px] left-0 z-50 h-[calc(100vh-72px)] w-[260px] bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close button */}
        <button className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-1.5">
          <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-3">Main Menu</div>
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <SellerLink
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[14px] font-bold transition-all ${
                  active
                    ? "bg-[#1A6FD4] text-white shadow-md shadow-[#1A6FD4]/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] transition-transform group-hover:scale-110 ${active ? "text-white" : "text-gray-400 group-hover:text-[#1A6FD4]"}`} />
                {item.label}
              </SellerLink>
            );
          })}
        </nav>
        
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1A2E] to-[#4B5563] text-white flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900">ANGA9 Hub</span>
              <span className="text-[11px] font-medium text-gray-500">v2.1.0 Beta</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
