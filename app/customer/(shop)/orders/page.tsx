"use client";

import { useState } from "react";
import OrderCard, { type Order } from "@/components/customer/OrderCard";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

const tabs = ["All Orders", "Active", "Delivered", "Cancelled"] as const;

const orders: Order[] = [
  {
    id: "ORD-8421",
    date: "Apr 10, 2025",
    product: "Premium Mesh Office Chair",
    seller: "Rajesh Furniture",
    qty: 5,
    amount: 62495,
    status: "Processing",
  },
  {
    id: "ORD-8419",
    date: "Apr 09, 2025",
    product: "LED Panel Light 40W",
    seller: "Bright Solutions",
    qty: 10,
    amount: 32990,
    status: "Delivered",
  },
  {
    id: "ORD-8410",
    date: "Apr 07, 2025",
    product: "Modular L-Shape Workstation",
    seller: "Sharma Interiors",
    qty: 2,
    amount: 17980,
    status: "Delivered",
  },
  {
    id: "ORD-8385",
    date: "Apr 01, 2025",
    product: "Wireless Keyboard + Mouse Combo",
    seller: "TechNest India",
    qty: 5,
    amount: 10995,
    status: "Cancelled",
  },
];

const tabFilter: Record<string, string[]> = {
  "All Orders": [],
  Active: ["Processing"],
  Delivered: ["Delivered"],
  Cancelled: ["Cancelled"],
};

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("All Orders");

  const filtered =
    activeTab === "All Orders"
      ? orders
      : orders.filter((o) => tabFilter[activeTab].includes(o.status));

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-6">
      <h1
        className="text-xl font-bold mb-1"
        style={{ color: t.textPrimary }}
      >
        My Orders
      </h1>
      <p className="text-sm mb-6" style={{ color: t.textSecondary }}>
        Track and manage your wholesale orders
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6" style={{ borderColor: t.border }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
              style={{
                borderColor: isActive ? t.bluePrimary : "transparent",
                color: isActive ? t.bluePrimary : t.textSecondary,
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Order cards */}
      <div className="space-y-3">
        {filtered.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3
              className="text-base font-semibold"
              style={{ color: t.textPrimary }}
            >
              No orders found
            </h3>
            <p className="mt-1 text-sm" style={{ color: t.textSecondary }}>
              Orders matching this filter will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
