"use client";

import { useState } from "react";
import { Package, Truck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = ["All Orders", "Active", "Delivered", "Cancelled"] as const;

const orders = [
  {
    id: "ORD-8421",
    date: "Apr 10, 2025",
    product: "Ergonomic Mesh Office Chair",
    qty: 10,
    amount: 87500,
    status: "Processing",
    color: "#7C3AED",
    trackable: true,
  },
  {
    id: "ORD-8419",
    date: "Apr 09, 2025",
    product: "LED Panel Light 60x60cm (Box of 20)",
    qty: 20,
    amount: 225000,
    status: "Shipped",
    color: "#6C47FF",
    trackable: true,
  },
  {
    id: "ORD-8410",
    date: "Apr 07, 2025",
    product: "3-Tier Steel Storage Rack",
    qty: 4,
    amount: 27200,
    status: "Delivered",
    color: "#EF4444",
    trackable: false,
  },
  {
    id: "ORD-8398",
    date: "Apr 04, 2025",
    product: "Indoor Ceramic Planter Set",
    qty: 12,
    amount: 37800,
    status: "Delivered",
    color: "#14B8A6",
    trackable: false,
  },
  {
    id: "ORD-8385",
    date: "Apr 01, 2025",
    product: "Modular Workstation Unit — 4-Seater",
    qty: 2,
    amount: 54400,
    status: "Cancelled",
    color: "#7C3AED",
    trackable: false,
  },
  {
    id: "ORD-8372",
    date: "Mar 28, 2025",
    product: "Executive High-Back Chair",
    qty: 5,
    amount: 72000,
    status: "Delivered",
    color: "#7C3AED",
    trackable: false,
  },
];

const statusStyles: Record<string, string> = {
  Processing: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Shipped: "bg-[#6C47FF]/10 text-[#6C47FF]",
  Delivered: "bg-[#22C55E]/10 text-[#22C55E]",
  Cancelled: "bg-[#EF4444]/10 text-[#EF4444]",
};

const tabFilter: Record<string, string[]> = {
  "All Orders": [],
  Active: ["Processing", "Shipped"],
  Delivered: ["Delivered"],
  Cancelled: ["Cancelled"],
};

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("All Orders");

  const filtered =
    activeTab === "All Orders"
      ? orders
      : orders.filter((o) => tabFilter[activeTab].includes(o.status));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <h1 className="text-xl font-bold text-anga-text mb-1">My Orders</h1>
      <p className="text-sm text-anga-text-secondary mb-6">
        Track and manage your wholesale orders
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-[#6C47FF] text-white"
                : "border border-anga-border bg-white text-anga-text-secondary hover:bg-anga-bg"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Order cards */}
      <div className="space-y-4">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-anga-border bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Thumbnail placeholder */}
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl font-bold opacity-20"
                style={{
                  backgroundColor: `${order.color}12`,
                  color: order.color,
                }}
              >
                {order.product.charAt(0)}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-anga-text-secondary">
                    {order.id}
                  </span>
                  <span className="text-xs text-anga-text-secondary">
                    &middot; {order.date}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-anga-text truncate">
                  {order.product}
                </h3>
                <p className="text-xs text-anga-text-secondary mt-0.5">
                  Qty: {order.qty} &middot;{" "}
                  <span className="font-medium text-anga-text">
                    {formatINR(order.amount)}
                  </span>
                </p>
              </div>

              {/* Status + Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    statusStyles[order.status]
                  )}
                >
                  {order.status}
                </span>

                {order.trackable && (
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#6C47FF] px-3 py-1.5 text-xs font-semibold text-[#6C47FF] hover:bg-[#6C47FF]/5 transition-colors">
                    <Truck className="h-3.5 w-3.5" />
                    Track
                  </button>
                )}

                {order.status === "Delivered" && (
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-anga-border px-3 py-1.5 text-xs font-semibold text-anga-text-secondary hover:bg-anga-bg transition-colors">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reorder
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-anga-bg">
              <Package className="h-8 w-8 text-anga-text-secondary" />
            </div>
            <h3 className="text-base font-semibold text-anga-text">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-anga-text-secondary">
              Orders matching this filter will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
