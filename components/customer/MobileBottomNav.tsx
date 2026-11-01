"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// --- Chubby, Curved, Relaxed Modern Icons ---
const HomeIcon = ({ isActive, color }: { isActive: boolean; color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300">
    {isActive ? (
      <path
        d="M10.8 2.8c.7-.6 1.7-.6 2.4 0l7.6 6.4c.6.5 1 1.3 1 2.1 0 1.5-1.2 2.7-2.7 2.7h-.3v5.2c0 1.6-1.3 2.9-2.9 2.9H8.1c-1.6 0-2.9-1.3-2.9-2.9V14h-.3c-1.5 0-2.7-1.2-2.7-2.7 0-.8.4-1.6 1-2.1l7.6-6.4zM14.2 22.1v-6.9c0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2v6.9h4.4z"
        fill={color}
      />
    ) : (
      <>
        <path
          d="M3.2 10.8l7.5-7.3c.7-.7 1.9-.7 2.6 0l7.5 7.3c.6.5 1 1.2 1 2 0 1.3-1.1 2.4-2.4 2.4h-.6v4c0 1.6-1.3 2.9-2.9 2.9H8.1c-1.6 0-2.9-1.3-2.9-2.9v-4h-.6c-1.3 0-2.4-1.1-2.4-2.4 0-.8.4-1.5 1-2z"
          stroke={color}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.8 22.1v-6.6c0-1.2 1-2.2 2.2-2.2s2.2 1 2.2 2.2v6.6"
          stroke={color}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
);

const OrdersIcon = ({ isActive, color }: { isActive: boolean; color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300">
    <path
      d="M8.5 8V5.5c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5V8"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {isActive ? (
      <path
        d="M5.5 8h13c1.1 0 2 .9 1.9 2l-1 8.5c-.2 2-1.9 3.5-3.9 3.5H8.5c-2 0-3.7-1.5-3.9-3.5L3.6 10c-.1-1.1.8-2 1.9-2z"
        fill={color}
      />
    ) : (
      <path
        d="M5.5 8h13c1.1 0 2 .9 1.9 2l-1 8.5c-.2 2-1.9 3.5-3.9 3.5H8.5c-2 0-3.7-1.5-3.9-3.5L3.6 10c-.1-1.1.8-2 1.9-2z"
        stroke={color}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const AccountIcon = ({ isActive, color }: { isActive: boolean; color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300">
    {isActive ? (
      <>
        <circle cx="12" cy="6.7" r="4.2" fill={color} />
        <path
          d="M12 13.5c4.4 0 8.2 3 8.7 7.3.1.7-.5 1.3-1.2 1.3H4.5c-.7 0-1.3-.6-1.2-1.3.5-4.3 4.3-7.3 8.7-7.3z"
          fill={color}
        />
      </>
    ) : (
      <>
        <circle cx="12" cy="6.7" r="4.2" stroke={color} strokeWidth="2.1" />
        <path
          d="M4.5 21.5c0-4.4 3.4-8 7.5-8s7.5 3.6 7.5 8"
          stroke={color}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
);

const MenuIcon = ({ isActive, color }: { isActive: boolean; color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300">
    <rect x="3.5" y="3.5" width="7" height="7" rx="2.8" fill={isActive ? color : "none"} stroke={color} strokeWidth={isActive ? "0" : "2.1"} />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2.8" fill={isActive ? color : "none"} stroke={color} strokeWidth={isActive ? "0" : "2.1"} />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2.8" fill={isActive ? color : "none"} stroke={color} strokeWidth={isActive ? "0" : "2.1"} />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2.8" fill={isActive ? color : "none"} stroke={color} strokeWidth={isActive ? "0" : "2.1"} />
  </svg>
);// ------------------------------

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

        const activeColor = "#1A6FD4"; // Royal Blue
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
