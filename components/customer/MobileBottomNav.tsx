"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// --- Refined Minimalist Icons ---
const HomeIcon = ({ isActive, color }: { isActive: boolean; color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300">
    <path
      d="M12 3L4 9v11a1 1 0 0 0 1 1h4v-7h6v7h4a1 1 0 0 0 1-1V9L12 3z"
      fill={isActive ? color : "none"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const OrdersIcon = ({ isActive, color }: { isActive: boolean; color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300">
    <path
      d="M8 8V6a4 4 0 0 1 8 0v2"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="4"
      y="8"
      width="16"
      height="13"
      rx="2"
      fill={isActive ? color : "none"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const AccountIcon = ({ isActive, color }: { isActive: boolean; color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300">
    <circle
      cx="12"
      cy="7"
      r="4"
      fill={isActive ? color : "none"}
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"
      fill={isActive ? color : "none"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MenuIcon = ({ isActive, color }: { isActive: boolean; color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300">
    <rect x="4" y="4" width="6" height="6" rx="1.5" fill={isActive ? color : "none"} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" fill={isActive ? color : "none"} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" fill={isActive ? color : "none"} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" fill={isActive ? color : "none"} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
// ------------------------------

export default function MobileBottomNav() {
  const pathname = usePathname();

  const handleTabClick = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(5);
    }
  };

  const tabs = [
    { key: "home", label: "Home", Icon: HomeIcon, href: "/" },
    { key: "orders", label: "Orders", Icon: OrdersIcon, href: "/orders" },
    { key: "account", label: "Account", Icon: AccountIcon, href: "/account" },
    { key: "menu", label: "Menu", Icon: MenuIcon, href: "/menu" },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-around border-t md:hidden bg-white/90 backdrop-blur-lg"
      role="navigation"
      aria-label="Main navigation"
      style={{
        height: "calc(56px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        borderColor: "#F3F4F6",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.03)",
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(tab.href);

        const activeColor = "#4F46E5"; // Indigo 600
        const inactiveColor = "#6B7280"; // Gray 500

        return (
          <Link
            key={tab.key}
            href={tab.href}
            onClick={handleTabClick}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-[0.92]"
            style={{
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            <div
              className={`flex items-center justify-center transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}
              style={{
                width: 32,
                height: 32,
              }}
            >
              <tab.Icon
                isActive={isActive}
                color={isActive ? activeColor : inactiveColor}
              />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.01em",
                color: isActive ? activeColor : inactiveColor,
                marginTop: 0,
                transition: "all 0.3s ease",
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
