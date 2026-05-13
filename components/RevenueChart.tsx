"use client";

import { useEffect, useState } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Loader2, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

interface RevenueDay {
  date: string;
  revenue: number;
  sales: number;
}

interface MonthData {
  month: string;
  revenue: number;
  sales: number;
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
  name: string;
  payload: { month: string };
  color: string;
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
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
        <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          {payload[0].payload.month}
        </p>
        <div className="flex flex-col gap-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[13px] font-bold text-gray-500 min-w-[70px]">{entry.name}:</span>
              <span className="text-[14px] font-black text-gray-900">
                {entry.name === 'Revenue' ? formatINRFull(entry.value) : entry.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function aggregateByMonth(days: RevenueDay[]): MonthData[] {
  const map: Record<string, { revenue: number; sales: number }> = {};
  days.forEach((d) => {
    const dt = new Date(d.date);
    const key = `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
    if (!map[key]) {
      map[key] = { revenue: 0, sales: 0 };
    }
    map[key].revenue += d.revenue;
    map[key].sales += d.sales || 0;
  });
  return Object.entries(map).map(([month, data]) => ({ month, revenue: data.revenue, sales: data.sales }));
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
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#8B5CF6]" /> Platform Revenue Trend
          </h2>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Monthly gross merchandise value and orders</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-[15px] font-bold text-gray-900">No data available</p>
            <p className="text-[13px] font-medium text-gray-500">Charts will populate once sales occur.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }}
                tickFormatter={formatINR}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E8EEF4', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 700, paddingTop: '10px' }} iconType="circle" />
              <Bar
                yAxisId="right"
                dataKey="sales"
                name="Sales"
                fill="#F59E0B"
                barSize={12}
                radius={[4, 4, 0, 0]}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#8B5CF6"
                strokeWidth={3}
                fill="url(#adminRevGrad)"
                activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
