"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Package, Menu } from "lucide-react";

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
        height: "calc(56px + env(safe-area-inset-bottom, 0px))",
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
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            {/* Active pill indicator behind icon */}
            <div
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                width: 36,
                height: 28,
                backgroundColor: isActive ? "#EEF2FF" : "transparent",
              }}
            >
              <tab.icon
                fill="none"
                style={{
                  width: 20,
                  height: 20,
                  strokeWidth: isActive ? 2.4 : 1.8,
                  color: isActive ? "#4338CA" : "#374151",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.03em",
                color: isActive ? "#4338CA" : "#374151",
                marginTop: 2,
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
