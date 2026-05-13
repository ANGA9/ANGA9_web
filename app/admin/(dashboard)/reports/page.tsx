"use client";

import { useState, useEffect } from "react";
import { BarChart3, Loader2, Download, Package, ShoppingCart, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

type ReportTab = "sales" | "inventory" | "payouts";

interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface InventorySummary {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
}

interface PayoutsSummary {
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  totalPayouts: number;
}

interface ReportResponse {
  reportType: string;
  summary: SalesSummary | InventorySummary | PayoutsSummary;
  data: Record<string, unknown>[];
}

const TABS: { key: ReportTab; label: string; icon: typeof BarChart3 }[] = [
  { key: "sales", label: "Sales", icon: ShoppingCart },
  { key: "inventory", label: "Inventory", icon: Package },
  { key: "payouts", label: "Payouts", icon: Wallet },
];

const formatINR = (v?: number | string | null) => "\u20B9" + Number(v ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

function getDefaultDateRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const to = now.toISOString().split("T")[0];
  return { from, to };
}

export default function AdminReportsPage() {
  const [tab, setTab] = useState<ReportTab>("sales");
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = tab !== "inventory" ? `?from=${dateRange.from}&to=${dateRange.to}` : "";
      const res = await api.get<ReportResponse>(`/api/admin/reports/${tab}${params}`, { silent: true });
      setReport(res || null);
    } catch {
      setReport(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, [tab, dateRange]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab, from: dateRange.from, to: dateRange.to }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tab}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported");
    } catch {
      toast.error("Failed to export report");
    }
    setExporting(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Business Reports</h1>
          <p className="text-[15px] text-gray-500 font-medium">Export and analyze platform performance</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {tab !== "inventory" && (
            <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm w-full sm:w-auto">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((d) => ({ ...d, from: e.target.value }))}
                className="h-9 w-full sm:w-auto px-3 bg-transparent text-[13px] font-bold text-gray-700 outline-none"
              />
              <span className="text-gray-300">-</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((d) => ({ ...d, to: e.target.value }))}
                className="h-9 w-full sm:w-auto px-3 bg-transparent text-[13px] font-bold text-gray-700 outline-none"
              />
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={exporting || loading || !report || report.data.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-[14px] font-bold hover:bg-[#7C3AED] transition-colors shadow-sm disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 w-full sm:w-max overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-xl text-[14px] font-bold transition-all ${
                active
                  ? "bg-[#8B5CF6] text-white shadow-md shadow-purple-500/20"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        </div>
      ) : !report ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-[15px] text-gray-500 font-medium">There is no report data for the selected criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {tab === "sales" && <SalesSummaryCards summary={report.summary as SalesSummary} />}
          {tab === "inventory" && <InventorySummaryCards summary={report.summary as InventorySummary} />}
          {tab === "payouts" && <PayoutsSummaryCards summary={report.summary as PayoutsSummary} />}

          {/* Data Table */}
          {report.data.length > 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      {Object.keys(report.data[0]).map((key) => (
                        <th key={key} className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                          {key.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {report.data.slice(0, 50).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        {Object.entries(row).map(([key, val], j) => (
                          <td key={j} className={`px-6 py-4 ${key.includes("amount") || key === "total_amount" ? 'font-black text-gray-900 text-[15px]' : 'text-[14px] font-medium text-gray-600'}`}>
                            {key.includes("amount") || key === "total_amount"
                              ? formatINR(Number(val || 0))
                              : key.includes("_at") || key === "created_at"
                              ? new Date(String(val)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                              : String(val ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {report.data.length > 50 && (
                <div className="px-6 py-4 text-center text-[13px] font-medium text-gray-500 bg-gray-50/50 border-t border-gray-100">
                  Showing 50 of {report.data.length} rows. Export CSV for the complete dataset.
                </div>
              )}
            </div>
          ) : (
             <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <BarChart3 className="w-10 h-10 text-gray-300" />
               </div>
               <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Records Found</h2>
               <p className="text-[15px] text-gray-500 font-medium">The exported report is empty.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#8B5CF6]/5 group-hover:scale-150 transition-transform duration-500 ease-out" />
      <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2 relative z-10">{label}</p>
      <p className="text-[32px] font-medium text-gray-900 tracking-tight relative z-10">{value}</p>
      {sub && <p className="text-[13px] font-medium text-gray-500 mt-1 relative z-10">{sub}</p>}
    </div>
  );
}

function SalesSummaryCards({ summary }: { summary: SalesSummary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <SummaryCard label="Total Revenue" value={formatINR(summary.totalRevenue)} />
      <SummaryCard label="Total Orders" value={String(summary.totalOrders)} />
      <SummaryCard label="Completed" value={String(summary.completedOrders)} />
      <SummaryCard label="Cancelled" value={String(summary.cancelledOrders)} />
    </div>
  );
}

function InventorySummaryCards({ summary }: { summary: InventorySummary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <SummaryCard label="Total Products" value={String(summary.totalProducts)} />
      <SummaryCard label="Out of Stock" value={String(summary.outOfStock)} />
      <SummaryCard label="Low Stock (≤10)" value={String(summary.lowStock)} />
    </div>
  );
}

function PayoutsSummaryCards({ summary }: { summary: PayoutsSummary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <SummaryCard label="Total Payouts" value={String(summary.totalPayouts)} />
      <SummaryCard label="Total Amount" value={formatINR(summary.totalAmount)} />
      <SummaryCard label="Pending" value={formatINR(summary.pendingAmount)} />
      <SummaryCard label="Completed" value={formatINR(summary.completedAmount)} />
    </div>
  );
}
