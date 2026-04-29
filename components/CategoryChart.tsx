"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface CategoryData {
  category: string;
  orders: number;
}

interface TooltipPayloadItem {
  value: number;
  payload: { category: string };
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
          {payload[0].payload.category}
        </p>
        <p className="text-sm font-bold text-anga-text">
          {payload[0].value} orders
        </p>
      </div>
    );
  }
  return null;
}

export default function CategoryChart() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get<CategoryData[]>("/api/admin/dashboard/category-performance", { silent: true });
        if (res) setData(res);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  return (
    <div className="rounded-xl border border-anga-border bg-white p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-anga-text">
          Category Performance
        </h3>
        <p className="text-sm text-anga-text-secondary">
          Orders by product category
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[280px]">
          <Loader2 className="h-6 w-6 animate-spin text-[#1A6FD4]" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] text-sm text-anga-text-secondary">
          No category data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              horizontal={false}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: '12px' }}
            />
            <YAxis
              type="category"
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: '12px' }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="orders"
              fill="#1A6FD4"
              radius={[0, 6, 6, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
