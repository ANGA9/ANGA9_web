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
  Cell
} from "recharts";
import { Loader2, LayoutGrid } from "lucide-react";
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
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#8B5CF6] shadow-sm" />
        <span className="text-[14px] font-bold text-gray-900">{payload[0].payload.category}</span>
        <span className="text-[13px] font-medium text-gray-500 ml-1">{payload[0].value} orders</span>
      </div>
    );
  }
  return null;
}

export default function CategoryChart() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#8B5CF6]" /> Category Performance
          </h2>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Orders distributed by top product categories</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-[300px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <LayoutGrid className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-[14px] font-bold text-gray-900">No category data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F3F4F6"
                horizontal={false}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                type="category"
                dataKey="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }}
                width={130}
              />
              <Tooltip cursor={{ fill: "#f9fafb" }} content={<CustomTooltip />} />
              <Bar
                dataKey="orders"
                radius={[0, 8, 8, 0]}
                barSize={24}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={activeIndex === index ? "#7C3AED" : "#8B5CF6"} 
                    className="transition-colors duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
