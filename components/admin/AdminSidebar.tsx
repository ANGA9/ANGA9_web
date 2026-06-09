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
  Bot,
  UserCheck,
  Ticket,
  Tags,
} from "lucide-react";

type AdminLevel = "super_admin" | "admin";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Key the sidebar uses to attach a numeric badge to this row. */
  badgeKey?: "pendingSellers" | "pendingReviews";
  /** If true, only visible to super_admin */
  superOnly?: boolean;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Ad Campaigns", href: "/admin/ads", icon: Megaphone, superOnly: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Disputes", href: "/admin/orders/disputes", icon: AlertTriangle },
  { label: "Sellers", href: "/admin/sellers", icon: Store },
  { label: "Pending Sellers", href: "/admin/pending-sellers", icon: UserCheck, badgeKey: "pendingSellers" },
  { label: "Product Reviews", href: "/admin/reviews", icon: ClipboardCheck, badgeKey: "pendingReviews" },
  { label: "Users", href: "/admin/users", icon: Users, superOnly: true },
  { label: "Payouts", href: "/admin/payouts", icon: Wallet, superOnly: true },
  { label: "Support", href: "/admin/support", icon: LifeBuoy },
  { label: "Reports", href: "/admin/reports", icon: BarChart3, superOnly: true },
  { label: "Chatbot", href: "/admin/chatbot", icon: Bot, superOnly: true },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket, superOnly: true },
  { label: "Categories", href: "/admin/categories", icon: Tags, superOnly: true },
  { label: "Settings", href: "/admin/settings", icon: Settings, superOnly: true },
];

/** Accent colors per admin level */
const ACCENT = {
  super_admin: { bg: "bg-[#8B5CF6]", shadow: "shadow-[#8B5CF6]/20", text: "text-[#8B5CF6]", hoverText: "group-hover:text-[#8B5CF6]" },
  admin:       { bg: "bg-[#16A34A]", shadow: "shadow-[#16A34A]/20", text: "text-[#16A34A]", hoverText: "group-hover:text-[#16A34A]" },
};

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  pendingSellersCount?: number;
  pendingReviewsCount?: number;
  adminLevel?: AdminLevel;
}

export default function AdminSidebar({
  open,
  onClose,
  pendingSellersCount = 0,
  pendingReviewsCount = 0,
  adminLevel = "super_admin",
}: AdminSidebarProps) {
  const pathname = usePathname();
  const accent = ACCENT[adminLevel];

  // Filter out super-only items for normal admins
  const visibleNav = adminLevel === "super_admin"
    ? NAV
    : NAV.filter((item) => !item.superOnly);
  
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
          {visibleNav.map((item) => {
            const active = isActive(item.href);
            const badgeCount =
              item.badgeKey === "pendingSellers"
                ? pendingSellersCount
                : item.badgeKey === "pendingReviews"
                  ? pendingReviewsCount
                  : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[14px] font-bold transition-all ${
                  active
                    ? `${accent.bg} text-white shadow-md ${accent.shadow}`
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] transition-transform group-hover:scale-110 ${active ? "text-white" : `text-gray-400 ${accent.hoverText}`}`} />
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                      active
                        ? "bg-white/25 text-white"
                        : "bg-[#EF4444] text-white"
                    }`}
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-gray-100 bg-gray-50/50 mt-auto">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${adminLevel === "super_admin" ? "from-gray-900 to-gray-700" : "from-green-800 to-green-600"} text-white flex items-center justify-center shadow-sm`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900">ANGA9 Core</span>
              <span className="text-[11px] font-medium text-gray-500">
                {adminLevel === "super_admin" ? "v2.1.0 Super Admin" : "v2.1.0 Admin"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
