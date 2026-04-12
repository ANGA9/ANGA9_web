import {
  IndianRupee,
  ShoppingCart,
  Store,
  Package,
} from "lucide-react";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import RevenueChart from "@/components/RevenueChart";
import OrderStatusChart from "@/components/OrderStatusChart";
import RecentOrdersTable from "@/components/RecentOrdersTable";
import TopSellersList from "@/components/TopSellersList";
import CategoryChart from "@/components/CategoryChart";

const stats = [
  {
    title: "Total Revenue",
    value: "\u20B924,81,340",
    delta: "18.2% this month",
    deltaType: "positive" as const,
    icon: IndianRupee,
    iconColor: "#111111",
    iconBg: "#11111115",
  },
  {
    title: "Active Orders",
    value: "1,284",
    delta: "6 today",
    deltaType: "positive" as const,
    icon: ShoppingCart,
    iconColor: "#6B7280",
    iconBg: "#6B728015",
  },
  {
    title: "Registered Sellers",
    value: "342",
    delta: "12 this week",
    deltaType: "positive" as const,
    icon: Store,
    iconColor: "#9CA3AF",
    iconBg: "#9CA3AF15",
  },
  {
    title: "Products Listed",
    value: "5,670",
    delta: "34 this week",
    deltaType: "positive" as const,
    icon: Package,
    iconColor: "#374151",
    iconBg: "#37415115",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6 xl:p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Revenue Chart + Order Status */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 xl:col-span-8">
            <RevenueChart />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <OrderStatusChart />
          </div>
        </div>

        {/* Recent Orders + Top Sellers */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 xl:col-span-8">
            <RecentOrdersTable />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <TopSellersList />
          </div>
        </div>

        {/* Category Performance */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <CategoryChart />
          </div>
        </div>
      </main>
    </div>
  );
}
