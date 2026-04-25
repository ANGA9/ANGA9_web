"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, UserCircle, Settings, Bell, X } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/seller/dashboard/products", icon: Package },
  { label: "Orders", href: "/seller/dashboard/orders", icon: ShoppingCart },
  { label: "Notifications", href: "/seller/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/seller/dashboard/profile", icon: UserCircle },
  { label: "Settings", href: "/seller/dashboard/settings", icon: Settings },
];

export default function SellerSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/seller/dashboard" ? pathname === href : pathname.startsWith(href);

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
              <Link
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
              </Link>
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
