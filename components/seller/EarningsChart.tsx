"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Nov", earnings: 520000 },
  { month: "Dec", earnings: 680000 },
  { month: "Jan", earnings: 610000 },
  { month: "Feb", earnings: 740000 },
  { month: "Mar", earnings: 890000 },
  { month: "Apr", earnings: 834200 },
];

function formatINR(value: number) {
  if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`;
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
      <div className="rounded-lg border border-seller-border bg-white px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-anga-text-secondary mb-1">
          {payload[0].payload.month} 2025
        </p>
        <p className="text-sm font-bold text-anga-text">
          {formatINRFull(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function EarningsChart() {
  return (
    <div className="rounded-xl border border-seller-border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-anga-text">
            Earnings Overview
          </h3>
          <p className="text-sm text-anga-text-secondary">
            Monthly earnings trend
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg bg-[#6C47FF] px-3 py-1.5 text-xs font-medium text-white">
            Monthly
          </button>
          <button className="rounded-lg border border-seller-border px-3 py-1.5 text-xs font-medium text-anga-text-secondary hover:bg-seller-bg transition-colors">
            Weekly
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C47FF" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#6C47FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E3FF"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            tickFormatter={formatINR}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="earnings"
            stroke="#6C47FF"
            strokeWidth={2.5}
            fill="url(#earningsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
