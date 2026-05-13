"use client";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, UserCircle, Settings, Bell, X, IndianRupee, Wallet, BarChart3, LifeBuoy, AlertTriangle, Megaphone } from "lucide-react";
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
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-14 left-0 z-50 h-[calc(100vh-56px)] w-[220px] bg-white border-r border-[#E8EEF4] flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close */}
        <button className="lg:hidden absolute top-3 right-3 text-[#9CA3AF]" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <SellerLink
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm md:text-base font-medium transition-colors ${
                  active
                    ? "bg-[#EAF2FF] text-[#1A6FD4]"
                    : "text-[#4B5563] hover:bg-[#F8FBFF] hover:text-[#1A1A2E]"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] ${active ? "text-[#1A6FD4]" : "text-[#9CA3AF]"}`} />
                {item.label}
              </SellerLink>
            );
          })}
        </nav>
        <div className="px-3 pb-4">
          <div className="text-xs md:text-sm text-[#9CA3AF] text-center">ANGA9 Seller Portal</div>
        </div>
      </aside>
    </>
  );
}
