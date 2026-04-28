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

const formatINR = (v: number) => "\u20B9" + v.toLocaleString("en-IN", { minimumFractionDigits: 2 });

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

  const inputClass =
    "h-10 rounded-lg border border-[#E8EEF4] bg-white px-3 text-sm focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-[#1A6FD4]" />
          <h1 className="text-xl font-bold text-[#1A1A2E]">Reports</h1>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || loading}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "#1A6FD4" }}
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export CSV
        </button>
      </div>

      {/* Date range + tabs */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: tab === t.key ? "#1A6FD4" : "#F3F4F6",
                color: tab === t.key ? "#FFFFFF" : "#4B5563",
              }}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
        {tab !== "inventory" && (
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              className={inputClass}
              value={dateRange.from}
              onChange={(e) => setDateRange((d) => ({ ...d, from: e.target.value }))}
            />
            <span className="text-sm text-[#9CA3AF]">to</span>
            <input
              type="date"
              className={inputClass}
              value={dateRange.to}
              onChange={(e) => setDateRange((d) => ({ ...d, to: e.target.value }))}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : !report ? (
        <div className="text-center py-16">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-[#9CA3AF]">No report data available</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {tab === "sales" && <SalesSummaryCards summary={report.summary as SalesSummary} />}
          {tab === "inventory" && <InventorySummaryCards summary={report.summary as InventorySummary} />}
          {tab === "payouts" && <PayoutsSummaryCards summary={report.summary as PayoutsSummary} />}

          {/* Data Table */}
          {report.data.length > 0 && (
            <div className="rounded-xl border border-[#E8EEF4] bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8EEF4] bg-[#F8FAFC]">
                    {Object.keys(report.data[0]).map((key) => (
                      <th key={key} className="text-left px-5 py-3 font-semibold text-[#4B5563] capitalize">
                        {key.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.data.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-b border-[#E8EEF4] last:border-0 hover:bg-[#F8FAFC]">
                      {Object.entries(row).map(([key, val], j) => (
                        <td key={j} className="px-5 py-3 text-[#1A1A2E]">
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
              {report.data.length > 50 && (
                <div className="px-5 py-3 text-center text-xs text-[#9CA3AF] border-t border-[#E8EEF4]">
                  Showing 50 of {report.data.length} rows. Export CSV for full data.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#E8EEF4] bg-white p-5">
      <p className="text-xs font-medium text-[#9CA3AF] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
      {sub && <p className="text-xs text-[#4B5563] mt-1">{sub}</p>}
    </div>
  );
}

function SalesSummaryCards({ summary }: { summary: SalesSummary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <SummaryCard label="Total Revenue" value={formatINR(summary.totalRevenue)} />
      <SummaryCard label="Total Orders" value={String(summary.totalOrders)} />
      <SummaryCard label="Completed" value={String(summary.completedOrders)} />
      <SummaryCard label="Cancelled" value={String(summary.cancelledOrders)} />
    </div>
  );
}

function InventorySummaryCards({ summary }: { summary: InventorySummary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <SummaryCard label="Total Products" value={String(summary.totalProducts)} />
      <SummaryCard label="Out of Stock" value={String(summary.outOfStock)} />
      <SummaryCard label="Low Stock (≤10)" value={String(summary.lowStock)} />
    </div>
  );
}

function PayoutsSummaryCards({ summary }: { summary: PayoutsSummary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <SummaryCard label="Total Payouts" value={String(summary.totalPayouts)} />
      <SummaryCard label="Total Amount" value={formatINR(summary.totalAmount)} />
      <SummaryCard label="Pending" value={formatINR(summary.pendingAmount)} />
      <SummaryCard label="Completed" value={formatINR(summary.completedAmount)} />
    </div>
  );
}
