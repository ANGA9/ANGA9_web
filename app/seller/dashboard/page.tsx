"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { IndianRupee, ShoppingCart, Package, Plus, Clock, CheckCircle2, Store, Loader2, Eye, Truck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type VStatus = "unverified" | "pending" | "verified" | "rejected";

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  placed_at: string;
  items: { id: string; product_name: string; quantity: number; total_price: number; status: string }[];
}

interface EarningEntry {
  id: string;
  amount: number;
  created_at: string;
}

interface RevenuePoint {
  month: string;
  revenue: number;
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8EEF4] p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl md:text-3xl font-bold text-[#1A1A2E]">{value}</p>
        <p className="text-xs md:text-sm text-[#9CA3AF] font-medium">{label}</p>
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-[#EDE9FE] text-[#6366F1]",
  processing: "bg-[#FFFBEB] text-[#F59E0B]",
  shipped: "bg-[#EAF2FF] text-[#1A6FD4]",
  delivered: "bg-[#F0FDF4] text-[#22C55E]",
  cancelled: "bg-[#FEF2F2] text-[#EF4444]",
  pending: "bg-[#F3F4F6] text-[#9CA3AF]",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatINR(v: number) {
  return "\u20B9" + v.toLocaleString("en-IN");
}

function formatINRShort(value: number) {
  if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `\u20B9${(value / 1000).toFixed(1)}K`;
  return `\u20B9${value}`;
}

interface TooltipPayloadItem {
  value: number;
  payload: { month: string };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#E8EEF4] bg-white px-3 py-2 shadow-lg">
        <p className="text-xs text-[#9CA3AF]">{payload[0].payload.month}</p>
        <p className="text-sm font-bold text-[#1A1A2E]">{formatINR(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export default function DashboardHome() {
  const { loading: authLoading, getToken } = useAuth();
  const [status, setStatus] = useState<VStatus | null>(null);
  const [bizName, setBizName] = useState("");
  const [stats, setStats] = useState({ products: 0, pending: 0, active: 0 });
  const [revenue, setRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenuePoint[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) { setLoaded(true); return; }

        const profileRes = await fetch(`${API}/api/users/seller-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const { sellerProfile } = await profileRes.json();
          if (sellerProfile) {
            setStatus(sellerProfile.verification_status || "unverified");
            setBizName(sellerProfile.business_name || "");
          }
        }

        try {
          const prodRes = await fetch(`${API}/api/products?seller_id=me&limit=1`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (prodRes.ok) {
            const d = await prodRes.json();
            setStats(prev => ({ ...prev, products: d.total || 0 }));
          }
        } catch { /* ignore */ }

        try {
          const earnRes = await fetch(`${API}/api/seller/earnings`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (earnRes.ok) {
            const d = await earnRes.json();
            setRevenue(d.total || 0);
          }
        } catch { /* ignore */ }

        try {
          const orderRes = await fetch(`${API}/api/orders/seller`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (orderRes.ok) {
            const d = await orderRes.json();
            const orders: RecentOrder[] = d.orders || [];
            setOrderCount(d.total ?? orders.length);
            setRecentOrders(orders.slice(0, 5));
            const pendingCount = orders.filter((o: RecentOrder) => {
              const s = o.items[0]?.status || o.status;
              return s === "confirmed" || s === "processing" || s === "pending";
            }).length;
            setPendingOrderCount(pendingCount);
          }
        } catch { /* ignore */ }

        try {
          const histRes = await fetch(`${API}/api/seller/earnings/history?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (histRes.ok) {
            const d = await histRes.json();
            const entries: EarningEntry[] = d.data || d.history || [];
            const monthMap: Record<string, number> = {};
            entries.forEach((e) => {
              const dt = new Date(e.created_at);
              const key = `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
              monthMap[key] = (monthMap[key] || 0) + Number(e.amount);
            });
            setRevenueChart(
              Object.entries(monthMap).map(([month, rev]) => ({ month, revenue: rev }))
            );
          }
        } catch { /* ignore */ }
      } catch { /* ignore */ }
      setLoaded(true);
    })();
  }, [authLoading, getToken]);

  if (authLoading || !loaded) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" /></div>;
  }

  if (status !== "verified") {
    const cfg: Record<string, { icon: React.ReactNode; bg: string; title: string; desc: string }> = {
      unverified: { icon: <Store className="w-10 h-10 text-[#9CA3AF]" />, bg: "bg-[#F3F4F6] border-[#E8EEF4]", title: "Complete Your Onboarding", desc: "Please complete the onboarding to start selling." },
      pending: { icon: <Clock className="w-10 h-10 text-[#F59E0B]" />, bg: "bg-[#FFFBEB] border-[#FDE68A]", title: "Your Profile is Under Review", desc: "Our team is reviewing your profile. You'll get access to list products once verified. This typically takes 1-2 business days." },
      rejected: { icon: <CheckCircle2 className="w-10 h-10 text-[#EF4444]" />, bg: "bg-[#FEF2F2] border-[#FECACA]", title: "Verification Unsuccessful", desc: "Please contact sell@anga9.com for assistance." },
    };
    const c = cfg[status || "unverified"];
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className={`rounded-2xl border-2 p-8 text-center ${c.bg}`}>
          <div className="flex justify-center mb-4">{c.icon}</div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-2">{c.title}</h1>
          {bizName && status === "pending" && <p className="text-sm md:text-base font-medium text-[#1A6FD4] mb-1">{bizName}</p>}
          <p className="text-sm md:text-base text-[#4B5563] leading-relaxed mb-6">{c.desc}</p>
          {status === "unverified" && <Link href="/seller/onboarding" className="inline-flex h-10 px-5 bg-[#1A6FD4] text-white text-sm md:text-base font-semibold rounded-lg items-center hover:bg-[#155bb5] transition-colors">Continue Onboarding</Link>}
          {status === "pending" && (
            <div className="mt-4 pt-4 border-t border-[#FDE68A] flex justify-center gap-6">
              {[{ l: "Submitted", d: true }, { l: "Under Review", d: false }, { l: "Verified", d: false }].map(s => (
                <div key={s.l} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s.d ? "bg-[#22C55E] text-white" : "bg-white text-[#9CA3AF] border"}`}>{s.d ? "\u2713" : "\u2026"}</div>
                  <span className={`text-xs md:text-sm ${s.d ? "text-[#1A1A2E]" : "text-[#9CA3AF]"}`}>{s.l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E]">Welcome{bizName ? `, ${bizName}` : ""}!</h1>
          <p className="text-sm md:text-base text-[#9CA3AF]">Here&apos;s an overview of your store</p>
        </div>
        <Link
          href="/seller/dashboard/products/new"
          className="flex items-center gap-2 h-10 px-5 bg-[#4338CA] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#3730A3] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<IndianRupee className="w-5 h-5 text-[#22C55E]" />} label="Total Revenue" value={formatINR(revenue)} color="bg-[#F0FDF4]" />
        <StatCard icon={<ShoppingCart className="w-5 h-5 text-[#1A6FD4]" />} label="Total Orders" value={orderCount} color="bg-[#EAF2FF]" />
        <StatCard icon={<Package className="w-5 h-5 text-[#4338CA]" />} label="Products" value={stats.products} color="bg-[#F3EEFF]" />
        <StatCard icon={<Clock className="w-5 h-5 text-[#F59E0B]" />} label="Pending Orders" value={pendingOrderCount} color="bg-[#FFFBEB]" />
      </div>

      {/* Revenue Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-6">
          <h2 className="text-base md:text-lg font-bold text-[#1A1A2E] mb-1">Revenue Trend</h2>
          <p className="text-xs md:text-sm text-[#9CA3AF] mb-4">Monthly earnings overview</p>
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueChart} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="sellerRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4338CA" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#4338CA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={formatINRShort} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#4338CA" strokeWidth={2} fill="url(#sellerRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-[#9CA3AF]">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-6">
          <h2 className="text-base md:text-lg font-bold text-[#1A1A2E] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/seller/dashboard/products/new" className="flex items-center gap-3 p-4 rounded-lg border border-[#E8EEF4] hover:border-[#4338CA]/30 transition-colors">
              <Package className="w-5 h-5 text-[#4338CA]" />
              <div><p className="text-sm md:text-base font-semibold text-[#1A1A2E]">Add Product</p><p className="text-xs md:text-sm text-[#9CA3AF]">List a new product for sale</p></div>
            </Link>
            <Link href="/seller/dashboard/products" className="flex items-center gap-3 p-4 rounded-lg border border-[#E8EEF4] hover:border-[#1A6FD4]/30 transition-colors">
              <Eye className="w-5 h-5 text-[#1A6FD4]" />
              <div><p className="text-sm md:text-base font-semibold text-[#1A1A2E]">View Products</p><p className="text-xs md:text-sm text-[#9CA3AF]">Manage your listings</p></div>
            </Link>
            <Link href="/seller/dashboard/inventory" className="flex items-center gap-3 p-4 rounded-lg border border-[#E8EEF4] hover:border-[#F59E0B]/30 transition-colors">
              <Truck className="w-5 h-5 text-[#F59E0B]" />
              <div><p className="text-sm md:text-base font-semibold text-[#1A1A2E]">Manage Inventory</p><p className="text-xs md:text-sm text-[#9CA3AF]">Update stock levels</p></div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-bold text-[#1A1A2E]">Recent Orders</h2>
            <Link href="/seller/dashboard/orders" className="text-sm font-medium text-[#1A6FD4] hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8EEF4]">
                  <th className="text-left py-2 font-semibold text-[#4B5563]">Order</th>
                  <th className="text-left py-2 font-semibold text-[#4B5563]">Product</th>
                  <th className="text-right py-2 font-semibold text-[#4B5563]">Amount</th>
                  <th className="text-left py-2 font-semibold text-[#4B5563]">Status</th>
                  <th className="text-right py-2 font-semibold text-[#4B5563]">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const total = o.items.reduce((s, i) => s + i.total_price, 0);
                  const orderStatus = o.items[0]?.status || o.status;
                  return (
                    <tr key={o.id} className="border-b border-[#E8EEF4] last:border-0">
                      <td className="py-2.5">
                        <Link href={`/seller/dashboard/orders/${o.id}`} className="font-medium text-[#1A6FD4] hover:underline">
                          {o.order_number}
                        </Link>
                      </td>
                      <td className="py-2.5 text-[#4B5563] truncate max-w-[160px]">
                        {o.items[0]?.product_name || "—"}
                        {o.items.length > 1 && <span className="text-[#9CA3AF]"> +{o.items.length - 1}</span>}
                      </td>
                      <td className="py-2.5 text-right font-medium text-[#1A1A2E]">{formatINR(total)}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[orderStatus] || "bg-[#F3F4F6] text-[#9CA3AF]"}`}>
                          {orderStatus}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-[#9CA3AF]">
                        {new Date(o.placed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
