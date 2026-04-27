"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Package, Menu } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const handleTabClick = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(5);
    }
  };

  const tabs = [
    { key: "home", label: "Home", icon: Home, href: "/" },
    { key: "orders", label: "Orders", icon: Package, href: "/orders" },
    { key: "account", label: "Account", icon: User, href: "/account" },
    { key: "menu", label: "Menu", icon: Menu, href: "/menu" },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-around border-t md:hidden"
      role="navigation"
      aria-label="Main navigation"
      style={{
        height: "calc(60px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "#FFFFFF",
        borderColor: "#F3F4F6",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(tab.href);

        return (
          <Link
            key={tab.key}
            href={tab.href}
            onClick={handleTabClick}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-90"
            style={{
              color: isActive ? "#1A6FD4" : "#9CA3AF",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            <tab.icon
              fill={isActive ? "currentColor" : "none"}
              style={{
                width: 24,
                height: 24,
                strokeWidth: isActive ? 2.5 : 2,
                transition: "all 0.2s ease",
                opacity: isActive ? 1 : 0.7,
              }}
            />
            <span
              className="mt-1"
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 900 : 600,
                letterSpacing: "0.02em",
                textTransform: 'uppercase',
                color: isActive ? "#1A6FD4" : "#6B7280",
                transition: "all 0.2s ease",
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
