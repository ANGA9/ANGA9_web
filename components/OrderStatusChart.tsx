"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";
import { api } from "@/lib/api";

interface StatusEntry {
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  delivered: "#22C55E",
  shipped: "#1A6FD4",
  processing: "#F59E0B",
  confirmed: "#6366F1",
  pending: "#9CA3AF",
  cancelled: "#EF4444",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: { color: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl flex items-center gap-2">
        <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: payload[0].payload.color }} />
        <span className="text-[14px] font-bold text-gray-900">{payload[0].name}</span>
        <span className="text-[13px] font-medium text-gray-500 ml-1">{payload[0].value}%</span>
      </div>
    );
  }
  return null;
}

export default function OrderStatusChart() {
  const [data, setData] = useState<StatusEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get<{ statusBreakdown: Record<string, number> }>("/api/admin/dashboard/orders", { silent: true });
        if (res?.statusBreakdown) {
          const total = Object.values(res.statusBreakdown).reduce((a, b) => a + b, 0);
          if (total > 0) {
            const entries = Object.entries(res.statusBreakdown).map(([status, count]) => ({
              name: capitalize(status),
              value: Math.round((count / total) * 100),
              color: STATUS_COLORS[status] || "#D1D5DB",
            }));
            setData(entries);
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-[#8B5CF6]" /> Order Status
          </h2>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Current fulfillment distribution</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-center">
            <PieChartIcon className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-[14px] font-bold text-gray-900">No data</p>
          </div>
        ) : (
          <>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                    cornerRadius={6}
                  >
                    {data.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-4">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div
                    className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[13px] font-bold text-gray-700">{item.name}</span>
                  <span className="text-[13px] font-black text-gray-900 ml-auto bg-gray-100 px-2 py-0.5 rounded-md">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
