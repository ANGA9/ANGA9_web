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
  AlertTriangle,
  Megaphone,
  ShieldCheck,
  Bot
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Ad Campaigns", href: "/admin/ads", icon: Megaphone },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Disputes", href: "/admin/orders/disputes", icon: AlertTriangle },
  { label: "Sellers", href: "/admin/sellers", icon: Store },
  { label: "Product Reviews", href: "/admin/reviews", icon: ClipboardCheck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Payouts", href: "/admin/payouts", icon: Wallet },
  { label: "Support", href: "/admin/support", icon: LifeBuoy },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Chatbot", href: "/admin/chatbot", icon: Bot },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    
    // Check if current pathname starts with this href
    if (!pathname.startsWith(href)) return false;

    // Check if there's a more specific (longer) match in the NAV list
    const hasMoreSpecificMatch = NAV.some(
      (item) => item.href !== href && item.href.length > href.length && pathname.startsWith(item.href)
    );

    return !hasMoreSpecificMatch;
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
          <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-3">System Control</div>
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[14px] font-bold transition-all ${
                  active
                    ? "bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] transition-transform group-hover:scale-110 ${active ? "text-white" : "text-gray-400 group-hover:text-[#8B5CF6]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-gray-100 bg-gray-50/50 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900">ANGA9 Core</span>
              <span className="text-[11px] font-medium text-gray-500">v2.1.0 Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
