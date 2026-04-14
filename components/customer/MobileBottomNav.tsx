"use client";

import { useState } from "react";
import { Home, User, ShoppingCart, Menu } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

const tabs = [
  { key: "home", label: "Home", icon: Home },
  { key: "account", label: "Account", icon: User },
  { key: "cart", label: "Cart", icon: ShoppingCart },
  { key: "menu", label: "Menu", icon: Menu },
] as const;

export default function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState<string>("home");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t md:hidden"
      style={{
        height: 60,
        background: t.bgCard,
        borderColor: t.border,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
            style={{
              color: isActive ? t.bluePrimary : t.textMuted,
            }}
          >
            <tab.icon
              style={{
                width: 22,
                height: 22,
                strokeWidth: isActive ? 2.5 : 1.8,
              }}
            />
            <span
              className="mt-0.5"
              style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.01em",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
