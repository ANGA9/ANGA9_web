"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";
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
      <div className="rounded-lg border border-anga-border bg-white px-3 py-2 shadow-lg">
        <p className="text-sm font-semibold text-anga-text">
          {payload[0].name}: {payload[0].value}%
        </p>
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
    <div className="rounded-xl border border-anga-border bg-white p-6">
      <h3 className="text-base font-semibold text-anga-text mb-1">Order Status</h3>
      <p className="text-sm text-anga-text-secondary mb-4">Current distribution</p>
      {loading ? (
        <div className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-[#1A6FD4]" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-sm text-anga-text-secondary">
          No order data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-anga-text-secondary">{item.name}</span>
                <span className="text-xs font-semibold text-anga-text ml-auto">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
