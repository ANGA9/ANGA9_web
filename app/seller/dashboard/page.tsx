import {
  IndianRupee,
  Package,
  ShoppingBag,
  Star,
  ExternalLink,
  Landmark,
  CalendarDays,
} from "lucide-react";
import SellerHeader from "@/components/seller/SellerHeader";
import EarningsChart from "@/components/seller/EarningsChart";
import TopProductsGrid from "@/components/seller/TopProductsGrid";
import PendingActionsPanel from "@/components/seller/PendingActionsPanel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/* ─── Static data ─── */

const stats = [
  {
    title: "Total Earnings",
    value: "\u20B98,34,200",
    delta: "+12.4% this month",
    deltaType: "positive",
    icon: IndianRupee,
    iconColor: "#6C47FF",
    iconBg: "#6C47FF15",
  },
  {
    title: "Active Listings",
    value: "148",
    delta: "3 pending approval",
    deltaType: "neutral",
    icon: Package,
    iconColor: "#6C47FF",
    iconBg: "#6C47FF15",
  },
  {
    title: "Orders Today",
    value: "27",
    delta: "5 need action",
    deltaType: "warning",
    icon: ShoppingBag,
    iconColor: "#F59E0B",
    iconBg: "#F59E0B15",
  },
  {
    title: "Avg. Rating",
    value: "4.7 / 5",
    delta: "from 312 reviews",
    deltaType: "positive",
    icon: Star,
    iconColor: "#F59E0B",
    iconBg: "#F59E0B15",
  },
];

const recentOrders = [
  {
    id: "ORD-7291",
    product: "Bluetooth Speaker X200",
    buyer: "Mumbai",
    amount: 8400,
    status: "Processing",
  },
  {
    id: "ORD-7293",
    product: "USB-C Hub 7-in-1",
    buyer: "Delhi",
    amount: 4200,
    status: "Processing",
  },
  {
    id: "ORD-7288",
    product: "LED Desk Lamp Pro",
    buyer: "Bangalore",
    amount: 3750,
    status: "Shipped",
  },
  {
    id: "ORD-7285",
    product: "Wireless Earbuds V3",
    buyer: "Chennai",
    amount: 5400,
    status: "Delivered",
  },
  {
    id: "ORD-7282",
    product: "Bluetooth Speaker X200",
    buyer: "Hyderabad",
    amount: 8400,
    status: "Delivered",
  },
  {
    id: "ORD-7279",
    product: "USB-C Hub 7-in-1",
    buyer: "Pune",
    amount: 4200,
    status: "Cancelled",
  },
];

const statusStyles: Record<string, string> = {
  Processing: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Shipped: "bg-[#6C47FF]/10 text-[#6C47FF]",
  Delivered: "bg-[#22C55E]/10 text-[#22C55E]",
  Cancelled: "bg-[#EF4444]/10 text-[#EF4444]",
};

const deltaStyles: Record<string, string> = {
  positive: "bg-[#22C55E]/10 text-[#22C55E]",
  neutral: "bg-[#6C47FF]/10 text-[#6C47FF]",
  warning: "bg-[#F59E0B]/10 text-[#F59E0B]",
};

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function SellerDashboardPage() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      <SellerHeader />
      <main className="p-6 xl:p-8">
        {/* Welcome Banner */}
        <div className="mb-6 rounded-xl border border-seller-border bg-gradient-to-r from-[#6C47FF] to-[#8B6CFF] p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">
                Good morning, Rajesh Electronics
              </h1>
              <p className="mt-1 text-sm text-white/80">{today}</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/25 transition-colors">
              <ExternalLink className="h-4 w-4" />
              View Store
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border border-seller-border bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-anga-text-secondary">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-anga-text tracking-tight">
                    {stat.value}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      deltaStyles[stat.deltaType]
                    )}
                  >
                    {stat.delta}
                  </span>
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: stat.iconBg }}
                >
                  <stat.icon
                    className="h-6 w-6"
                    style={{ color: stat.iconColor }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Earnings Chart + Pending Actions */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 xl:col-span-8">
            <EarningsChart />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <PendingActionsPanel />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-seller-border bg-white p-6 mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-anga-text">
                Recent Orders
              </h3>
              <p className="text-sm text-anga-text-secondary">
                Your latest customer orders
              </p>
            </div>
            <button className="text-sm font-medium text-[#6C47FF] hover:underline">
              View All
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-seller-border hover:bg-transparent">
                <TableHead className="text-xs font-medium text-anga-text-secondary">
                  Order ID
                </TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">
                  Product
                </TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">
                  Buyer City
                </TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary text-right">
                  Amount
                </TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-seller-border hover:bg-seller-bg/50 transition-colors"
                >
                  <TableCell className="text-sm font-medium text-anga-text">
                    {order.id}
                  </TableCell>
                  <TableCell className="text-sm text-anga-text">
                    {order.product}
                  </TableCell>
                  <TableCell className="text-sm text-anga-text-secondary">
                    {order.buyer}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-anga-text text-right">
                    {formatINR(order.amount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        statusStyles[order.status]
                      )}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-xs font-medium text-[#6C47FF] hover:underline">
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Top Products */}
        <div className="mb-6">
          <TopProductsGrid />
        </div>

        {/* Payout Summary */}
        <div className="rounded-xl border border-seller-border bg-white p-6">
          <h3 className="text-base font-semibold text-anga-text mb-4">
            Payout Summary
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C47FF]/10">
                <Landmark className="h-6 w-6 text-[#6C47FF]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-anga-text tracking-tight">
                  {"\u20B9"}1,24,500
                </p>
                <p className="text-sm text-anga-text-secondary">Next payout</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F59E0B]/10">
                <CalendarDays className="h-6 w-6 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-anga-text">
                  15th April, 2025
                </p>
                <p className="text-sm text-anga-text-secondary">
                  Bank: HDFC ****4821
                </p>
              </div>
            </div>
            <button className="rounded-lg border-2 border-[#6C47FF] px-5 py-2.5 text-sm font-semibold text-[#6C47FF] hover:bg-[#6C47FF] hover:text-white transition-colors">
              Request Early Payout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
