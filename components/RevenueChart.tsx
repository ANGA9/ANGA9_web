"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface RevenueDay {
  date: string;
  revenue: number;
}

interface MonthData {
  month: string;
  revenue: number;
}

function formatINR(value: number) {
  if (value >= 10000000) return `\u20B9${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `\u20B9${(value / 1000).toFixed(1)}K`;
  return `\u20B9${value}`;
}

function formatINRFull(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

interface TooltipPayloadItem {
  value: number;
  payload: { month: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-anga-border bg-white px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-anga-text-secondary mb-1">
          {payload[0].payload.month}
        </p>
        <p className="text-sm font-bold text-anga-text">
          {formatINRFull(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function aggregateByMonth(days: RevenueDay[]): MonthData[] {
  const map: Record<string, number> = {};
  days.forEach((d) => {
    const dt = new Date(d.date);
    const key = `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
    map[key] = (map[key] || 0) + d.revenue;
  });
  return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
}

export default function RevenueChart() {
  const [data, setData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const res = await api.get<RevenueDay[]>("/api/admin/dashboard/revenue", { silent: true });
        if (res && res.length > 0) {
          setData(aggregateByMonth(res));
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchRevenue();
  }, []);

  return (
    <div className="rounded-xl border border-anga-border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-anga-text">Revenue Overview</h3>
          <p className="text-sm text-anga-text-secondary">Monthly revenue trend</p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-[#1A6FD4]" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-sm text-anga-text-secondary">
          No revenue data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A6FD4" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#1A6FD4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: '12px' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: '12px' }}
              tickFormatter={formatINR}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1A6FD4"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
