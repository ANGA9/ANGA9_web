"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Users,
  ClipboardCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Store, label: "Sellers", href: "/admin/sellers" },
  { icon: ClipboardCheck, label: "Product Reviews", href: "/admin/reviews" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-lg bg-white p-2 shadow-md border border-anga-border xl:hidden"
        style={{ display: mobileOpen ? "none" : undefined }}
      >
        <Menu className="h-5 w-5 text-anga-text" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 xl:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen flex-col bg-white border-r border-anga-border transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[240px]",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full xl:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A6FD4] text-white font-bold text-lg shrink-0">
              A
            </div>
            {!collapsed && (
              <span className="text-xl font-bold text-anga-text tracking-tight">
                ANGA9
              </span>
            )}
          </Link>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="xl:hidden text-anga-text-secondary hover:text-anga-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#1A6FD4] text-white shadow-sm"
                    : "text-anga-text-secondary hover:bg-anga-bg hover:text-anga-text"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden xl:flex mx-3 mb-3 items-center justify-center rounded-lg border border-anga-border p-2 text-anga-text-secondary hover:bg-anga-bg hover:text-anga-text transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* User section */}
        <div className="border-t border-anga-border p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-[#EAF2FF] text-[#1A6FD4] font-semibold text-sm">
                A9
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-anga-text truncate">
                  ANGA9 Admin
                </p>
                <p className="text-xs text-anga-text-secondary truncate">
                  Administrator
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
