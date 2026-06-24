"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { sellerFetch, effectiveSellerId } from "@/lib/api";
import Link from "next/link";
import { IndianRupee, ShoppingCart, Package, Plus, Clock, CheckCircle2, Store, Loader2, ArrowRight, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type VStatus = "unverified" | "pending" | "verified" | "rejected";

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  placed_at: string;
  items: { id: string; product_name: string; quantity: number; total_price: number; status: string; product_image?: string }[];
}

interface AnalyticsData {
  period: string;
  revenueChart: { date: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; revenue: number; unitsSold: number }[];
  categoryBreakdown: { category: string; revenue: number; count: number }[];
  fulfillmentRate: number;
  returnRate: number;
  totalRevenue: number;
  activeOrders: number;
}

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-gray-100 text-gray-700 border-gray-200",
};

const COLORS = ['#1A6FD4', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

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
  payload: { date: string };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
        <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">{payload[0].payload.date}</p>
        <p className="text-[18px] font-bold text-gray-900">{formatINR(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export default function DashboardHome() {
  const { loading: authLoading, getToken, dbUser } = useAuth();
  const [status, setStatus] = useState<VStatus | null>(null);
  const [bizName, setBizName] = useState("");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [stats, setStats] = useState({ products: 0, pendingOrders: 0, totalOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState("30d");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) { setLoaded(true); return; }

        const profileRes = await sellerFetch(`${API}/api/users/seller-profile`);
        if (profileRes.ok) {
          const { sellerProfile } = await profileRes.json();
          if (sellerProfile) {
            setStatus(sellerProfile.verification_status || "unverified");
            setBizName(sellerProfile.business_name || "");
            setRejectionReason(sellerProfile.rejection_reason || null);
          }
        }

        try {
          if (dbUser) {
            // seller_id must follow the active brand, not just the logged-in user.
            const sid = effectiveSellerId(dbUser.id);
            const prodRes = await sellerFetch(`${API}/api/products?seller_id=${sid}&status=active&limit=1`);
            if (prodRes.ok) {
              const d = await prodRes.json();
              setStats(prev => ({ ...prev, products: d.total || 0 }));
            }
          }
        } catch { /* ignore */ }

        try {
          const orderRes = await sellerFetch(`${API}/api/orders/seller`);
          if (orderRes.ok) {
            const d = await orderRes.json();
            const orders: RecentOrder[] = d.orders || [];
            setRecentOrders(orders.slice(0, 5));
            const pendingCount = orders.filter((o: RecentOrder) => {
              const s = o.items[0]?.status || o.status;
              return s === "confirmed" || s === "processing" || s === "pending";
            }).length;
            setStats(prev => ({ ...prev, pendingOrders: pendingCount, totalOrders: d.total ?? orders.length }));
          }
        } catch { /* ignore */ }

        try {
          const analyticsRes = await sellerFetch(`${API}/api/users/seller-analytics?period=${period}`);
          if (analyticsRes.ok) {
            const d = await analyticsRes.json();
            setAnalytics(d);
          }
        } catch { /* ignore */ }
      } catch { /* ignore */ }
      setLoaded(true);
    })();
  }, [authLoading, getToken, period, dbUser]);

  if (authLoading || !loaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-[#1A6FD4] mb-4" />
        <span className="text-[15px] font-bold">Loading dashboard...</span>
      </div>
    );
  }

  // ── Dashboard Layout ──
  const cfg: Record<string, { icon: React.ReactNode; bg: string; iconBg: string; title: string; desc: string }> = {
    unverified: { 
      icon: <Store className="w-8 h-8 text-gray-400" />, 
      bg: "border-gray-200 bg-white shadow-sm", 
      iconBg: "bg-gray-100",
      title: "Complete Your Store Profile", 
      desc: "You're almost there! Complete your seller onboarding to start listing products and making sales." 
    },
    pending: { 
      icon: <Clock className="w-8 h-8 text-yellow-500" />, 
      bg: "border-yellow-200 bg-yellow-50/50", 
      iconBg: "bg-yellow-100",
      title: "Profile Under Review", 
      desc: "Our team is currently reviewing your profile to ensure marketplace quality. This typically takes 1-2 business days." 
    },
    rejected: { 
      icon: <CheckCircle2 className="w-8 h-8 text-red-500" />, 
      bg: "border-red-200 bg-red-50", 
      iconBg: "bg-red-100",
      title: "Verification Unsuccessful", 
      desc: "Unfortunately, we couldn't verify your store at this time. Please contact seller support for more details." 
    },
  };
  const c = status && status !== "verified" ? cfg[status] : null;

  return (
    <main className="w-full mx-auto max-w-7xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            Welcome back{bizName ? `, ${bizName}` : ""}!
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <Link
          href="/seller/dashboard/products/new"
          className="flex items-center gap-2 h-12 px-6 text-[15px] font-bold rounded-2xl transition-all shadow-md active:scale-[0.98] bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] hover:bg-gray-50"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </Link>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-gray-900">
            Welcome{bizName ? `, ${bizName}` : ""}!
          </h1>
          <p className="text-[14px] text-gray-500 font-medium mt-1">Here&apos;s your store overview.</p>
        </div>
        <Link
          href="/seller/dashboard/products/new"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 text-[15px] font-bold rounded-2xl shadow-md bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] hover:bg-gray-50"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </Link>
      </div>

      {/* ── KYC Alert Banner ── */}
      {c && (
        <div className={`mb-8 w-full rounded-3xl border ${c.bg} p-6 flex flex-col md:flex-row md:items-center justify-between gap-6`}>
          <div className="flex items-start md:items-center gap-5">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${c.iconBg}`}>
              {c.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">
                  {c.title}
                </h2>
                {bizName && status === "pending" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[12px] font-bold">
                    {bizName}
                  </span>
                )}
              </div>
              <p className="text-[14px] text-gray-600 font-medium">
                {c.desc}
              </p>
              {status === "rejected" && rejectionReason && (
                <div className="mt-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[13px] font-medium text-red-700">Reason: {rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
          {(status === "unverified" || status === "rejected") && (
            <Link 
              href="/seller/onboarding" 
              className="inline-flex items-center justify-center h-12 px-6 text-[14px] font-bold rounded-2xl transition-all shadow-md active:scale-95 shrink-0 bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] hover:bg-gray-50"
            >
              {status === "rejected" ? "Update Application" : "Complete Setup"} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
        </div>
      )}

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <Link href="/seller/dashboard/products" className="group flex items-center gap-4 p-5 rounded-3xl border border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-gray-900">Manage Products</p>
            <p className="text-[13px] font-medium text-gray-500">Add or edit listings</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </Link>
        <Link href="/seller/dashboard/orders" className="group flex items-center gap-4 p-5 rounded-3xl border border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/30 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-gray-900">Fulfill Orders</p>
            <p className="text-[13px] font-medium text-gray-500">Process shipments</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
        </Link>
        <Link href="/seller/dashboard/inventory" className="group flex items-center gap-4 p-5 rounded-3xl border border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-gray-900">Manage Inventory</p>
            <p className="text-[13px] font-medium text-gray-500">Update stock levels</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
        </Link>
      </div>
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl border border-blue-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{formatINR(analytics?.totalRevenue || 0)}</p>
            <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Total Revenue</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{stats.totalOrders || 0}</p>
            <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Total Orders</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-50 text-purple-600 border border-purple-100">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{stats.products || 0}</p>
            <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Active Products</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-yellow-50 text-yellow-600 border border-yellow-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{stats.pendingOrders || 0}</p>
            <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Orders to Fulfill</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
        
        {/* ── Revenue Chart ── */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#1A6FD4]" /> Revenue Trend
              </h2>
              <p className="text-[13px] text-gray-500 font-medium mt-1">Daily earnings over {period}</p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:border-[#1A6FD4]"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="365d">Last Year</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[250px]">
            {analytics?.revenueChart && analytics.revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sellerRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A6FD4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1A6FD4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }} tickFormatter={formatINRShort} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#E8EEF4', strokeWidth: 2, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#1A6FD4" strokeWidth={3} fill="url(#sellerRevGrad)" activeDot={{ r: 6, fill: '#1A6FD4', stroke: '#fff', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-[15px] font-bold text-gray-900">Not enough data</p>
                <p className="text-[13px] font-medium text-gray-500">Revenue charts will appear once you complete sales.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Category Breakdown ── */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">Category Sales</h2>
          <p className="text-[13px] text-gray-500 font-medium mb-6">Revenue breakdown by category</p>
          
          <div className="flex-1 flex flex-col justify-center">
            {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
              <>
                <div className="h-[180px] w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="revenue"
                      >
                        {analytics.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => formatINR(Number(val))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {analytics.categoryBreakdown.map((cat, i) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[13px] font-bold text-gray-700">{cat.category}</span>
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">{formatINRShort(cat.revenue)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-[13px] font-medium text-gray-500">No category data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
        {/* ── Recent Orders ── */}
        {recentOrders.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1A6FD4]" /> Recent Orders
              </h2>
              <Link href="/seller/dashboard/orders" className="text-[14px] font-bold text-[#1A6FD4] hover:underline">
                View All Orders
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[25%]">Order ID</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[35%]">Primary Item</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Amount</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Status</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right w-[10%]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((o) => {
                    const total = o.items.reduce((s, i) => s + i.total_price, 0);
                    const orderStatus = o.items[0]?.status || o.status;
                    return (
                      <tr key={o.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <Link href={`/seller/dashboard/orders/${o.id}`} className="font-bold text-[14px] text-[#1A6FD4] hover:underline">
                            #{o.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                              {o.items[0]?.product_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={o.items[0].product_image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-[14px] text-gray-900 truncate max-w-[200px]">
                                {o.items[0]?.product_name || "Unknown Item"}
                              </span>
                              {o.items.length > 1 && (
                                <span className="text-[12px] font-medium text-gray-400">
                                  +{o.items.length - 1} more item{o.items.length - 1 > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-[15px] text-gray-900">
                          {formatINR(total)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${STATUS_BADGE[orderStatus] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-[13px] font-medium text-gray-500">
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

        {/* ── Top Products ── */}
        {analytics?.topProducts && analytics.topProducts.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-500" /> Top Products
              </h2>
            </div>
            <div className="p-2">
              {analytics.topProducts.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[14px]">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[12px] font-medium text-gray-500">{p.unitsSold} units sold</p>
                  </div>
                  <div className="font-bold text-[14px] text-gray-900">
                    {formatINRShort(p.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
