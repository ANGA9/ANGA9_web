"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { category: "Electronics", orders: 482 },
  { category: "Home Decor", orders: 365 },
  { category: "Retail", orders: 298 },
  { category: "Industrial", orders: 245 },
  { category: "Furniture", orders: 189 },
  { category: "Office Essentials", orders: 156 },
];

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
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E3FF"
            horizontal={false}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="orders"
            fill="#6C47FF"
            radius={[0, 6, 6, 0]}
            barSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
