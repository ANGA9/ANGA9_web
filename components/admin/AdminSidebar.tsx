"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Users,
  ClipboardCheck,
  Wallet,
  BarChart3,
  Settings,
  LifeBuoy,
  X,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Sellers", href: "/admin/sellers", icon: Store },
  { label: "Product Reviews", href: "/admin/reviews", icon: ClipboardCheck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Payouts", href: "/admin/payouts", icon: Wallet },
  { label: "Support", href: "/admin/support", icon: LifeBuoy },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-14 left-0 z-40 h-[calc(100vh-56px)] w-[220px] bg-white border-r border-[#E8EEF4] flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close */}
        <button className="lg:hidden absolute top-3 right-3 text-[#9CA3AF]" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm md:text-base font-medium transition-colors ${
                  active
                    ? "bg-[#F3E8FF] text-[#8B5CF6]" // Admin uses a distinct purple highlight
                    : "text-[#4B5563] hover:bg-[#F8FBFF] hover:text-[#1A1A2E]"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] ${active ? "text-[#8B5CF6]" : "text-[#9CA3AF]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <div className="text-xs md:text-sm text-[#9CA3AF] text-center">ANGA9 Admin Portal</div>
        </div>
      </aside>
    </>
  );
}
