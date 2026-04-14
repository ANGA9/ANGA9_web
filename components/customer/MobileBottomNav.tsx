"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, ShoppingCart, Menu } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

const tabs = [
  { key: "home", label: "Home", icon: Home, href: "/" },
  { key: "account", label: "Account", icon: User, href: "/account" },
  { key: "cart", label: "Cart", icon: ShoppingCart, href: "/cart" },
  { key: "menu", label: "Menu", icon: Menu, href: "/menu" },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t md:hidden"
      style={{
        height: 60,
        background: t.bgCard,
        borderColor: t.border,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
      }}
    >
      {tabs.map((tab) => {
        // Evaluate active tab status
        // Home tab is exactly '/'
        // Other tabs match their path prefix
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(tab.href);

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
            style={{
              color: isActive ? t.bluePrimary : "#6B7280",
            }}
          >
            <tab.icon
              style={{
                width: 22,
                height: 22,
                strokeWidth: isActive ? 2.5 : 2,
              }}
            />
            <span
              className="mt-0.5"
              style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 600,
                letterSpacing: "0.01em",
                color: isActive ? t.bluePrimary : "#374151",
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
