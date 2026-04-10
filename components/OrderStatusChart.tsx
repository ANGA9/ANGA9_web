"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Delivered", value: 52, color: "#6C47FF" },
  { name: "Processing", value: 28, color: "#14B8A6" },
  { name: "Cancelled", value: 12, color: "#EF4444" },
  { name: "Pending", value: 8, color: "#F59E0B" },
];

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
  return (
    <div className="rounded-xl border border-anga-border bg-white p-6">
      <h3 className="text-base font-semibold text-anga-text mb-1">Order Status</h3>
      <p className="text-sm text-anga-text-secondary mb-4">Current distribution</p>
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
      {/* Legend */}
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
    </div>
  );
}
