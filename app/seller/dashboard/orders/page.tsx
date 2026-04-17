"use client";

import { useState } from "react";
import SellerHeader from "@/components/seller/SellerHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const tabs = ["All", "Pending", "Shipped", "Delivered"] as const;

const orders = [
  { id: "ORD-7291", product: "Bluetooth Speaker X200", buyer: "Sharma Electricals, Mumbai", amount: 8400, status: "Pending", date: "Apr 09, 2025" },
  { id: "ORD-7293", product: "USB-C Hub 7-in-1", buyer: "Tech Solutions, Delhi", amount: 4200, status: "Pending", date: "Apr 09, 2025" },
  { id: "ORD-7288", product: "LED Desk Lamp Pro", buyer: "Bright Spaces, Bangalore", amount: 3750, status: "Shipped", date: "Apr 08, 2025" },
  { id: "ORD-7285", product: "Wireless Earbuds V3", buyer: "Sound World, Chennai", amount: 5400, status: "Delivered", date: "Apr 07, 2025" },
  { id: "ORD-7282", product: "Bluetooth Speaker X200", buyer: "Music Hub, Hyderabad", amount: 8400, status: "Delivered", date: "Apr 07, 2025" },
  { id: "ORD-7279", product: "USB-C Hub 7-in-1", buyer: "Gadget Store, Pune", amount: 4200, status: "Shipped", date: "Apr 06, 2025" },
  { id: "ORD-7275", product: "HDMI Cable 2m (Pack of 10)", buyer: "Wire World, Jaipur", amount: 1200, status: "Delivered", date: "Apr 06, 2025" },
  { id: "ORD-7272", product: "Smart Power Strip", buyer: "PowerPlus, Kolkata", amount: 2800, status: "Pending", date: "Apr 05, 2025" },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Shipped: "bg-[#6C47FF]/10 text-[#6C47FF]",
  Delivered: "bg-[#22C55E]/10 text-[#22C55E]",
};

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");

  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <div className="min-h-screen">
      <SellerHeader />
      <main className="p-6 xl:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-anga-text">Orders</h1>
          <p className="text-sm text-anga-text-secondary">
            Track and manage customer orders
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-[#6C47FF] text-white"
                  : "border border-seller-border bg-white text-anga-text-secondary hover:bg-seller-bg"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders table */}
        <div className="rounded-xl border border-seller-border bg-white p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-seller-border hover:bg-transparent">
                <TableHead className="text-xs font-medium text-anga-text-secondary">Order ID</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">Product</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">Buyer</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary text-right">Amount</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">Status</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-seller-border hover:bg-seller-bg/50 transition-colors">
                  <TableCell className="text-sm font-medium text-anga-text">{order.id}</TableCell>
                  <TableCell className="text-sm text-anga-text">{order.product}</TableCell>
                  <TableCell className="text-sm text-anga-text-secondary">{order.buyer}</TableCell>
                  <TableCell className="text-sm font-medium text-anga-text text-right">{formatINR(order.amount)}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", statusStyles[order.status])}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-anga-text-secondary text-right">{order.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
