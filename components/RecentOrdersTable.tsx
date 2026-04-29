"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface RecentOrder {
  id: string;
  order_number: string;
  buyer_name: string;
  total: number;
  status: string;
  placed_at: string;
  items_count: number;
}

const statusStyles: Record<string, string> = {
  delivered: "bg-[#22C55E]/10 text-[#22C55E]",
  shipped: "bg-[#1A6FD4]/10 text-[#1A6FD4]",
  processing: "bg-[#F59E0B]/10 text-[#F59E0B]",
  confirmed: "bg-[#6366F1]/10 text-[#6366F1]",
  pending: "bg-[#9CA3AF]/10 text-[#9CA3AF]",
  cancelled: "bg-[#EF4444]/10 text-[#EF4444]",
};

function formatINR(value: number) {
  return "\u20B9" + Number(value).toLocaleString("en-IN");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get<RecentOrder[]>("/api/admin/dashboard/recent-orders", { silent: true });
        if (res) setOrders(res);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div className="rounded-xl border border-anga-border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-anga-text">Recent Orders</h3>
          <p className="text-sm text-anga-text-secondary">Latest marketplace transactions</p>
        </div>
        <Link href="/admin/orders" className="text-sm font-medium text-[#1A6FD4] hover:underline">
          View All
        </Link>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-[#1A6FD4]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-sm text-anga-text-secondary">
          No orders yet
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-anga-border hover:bg-transparent">
              <TableHead className="text-xs font-medium text-anga-text-secondary">Order ID</TableHead>
              <TableHead className="text-xs font-medium text-anga-text-secondary">Buyer</TableHead>
              <TableHead className="text-xs font-medium text-anga-text-secondary text-center">Items</TableHead>
              <TableHead className="text-xs font-medium text-anga-text-secondary text-right">Amount</TableHead>
              <TableHead className="text-xs font-medium text-anga-text-secondary">Status</TableHead>
              <TableHead className="text-xs font-medium text-anga-text-secondary text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="border-anga-border hover:bg-anga-bg/50 transition-colors"
              >
                <TableCell className="text-sm font-medium text-anga-text">
                  {order.order_number}
                </TableCell>
                <TableCell className="text-sm text-anga-text-secondary">
                  {order.buyer_name}
                </TableCell>
                <TableCell className="text-sm text-anga-text-secondary text-center">
                  {order.items_count}
                </TableCell>
                <TableCell className="text-sm font-medium text-anga-text text-right">
                  {formatINR(order.total)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      statusStyles[order.status] || "bg-gray-100 text-gray-600"
                    )}
                  >
                    {capitalize(order.status)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-anga-text-secondary text-right">
                  {formatDate(order.placed_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
