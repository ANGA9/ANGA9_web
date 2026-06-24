"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

interface DAUStats {
  timeSeries: { date: string; count: number }[];
  portals: { name: string; value: number }[];
  regions: { region: string; count: number }[];
}

const COLORS = ["#1A6FD4", "#8B5CF6", "#22C55E", "#F59E0B", "#EF4444", "#0EA5E9"];

export default function ActivityDashboardPage() {
  const [stats, setStats] = useState<DAUStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDAU() {
      try {
        // Endpoint lives under the admin-service `/dashboard` route group, so the
        // gateway path is /api/admin/dashboard/activity/dau (NOT /api/admin/activity/dau).
        const res = await api.get<DAUStats>("/api/admin/dashboard/activity/dau", { silent: true });
        if (res) {
          setStats(res);
        }
      } catch (err) {
        console.error("Failed to fetch DAU stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDAU();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A6FD4]"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col text-gray-500">
        <Activity size={48} className="mb-4 text-gray-300" />
        <p>No activity data available yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="p-6 xl:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center gap-3">
            <Activity className="text-[#1A6FD4]" />
            Daily Active Users
          </h1>
          <p className="text-gray-500 mt-1">Unique sessions across all portals (Last 30 Days)</p>
        </div>

        {/* Time Series Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-[#1A1A2E] mb-6">30-Day Trend</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF4" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#6B7280", fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#6B7280", fontSize: 12 }} 
                  dx={-10} 
                  allowDecimals={false}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Active Users" 
                  stroke="#1A6FD4" 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#1A6FD4" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portal Breakdown */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-6">Traffic by Portal</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.portals}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {stats.portals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} 
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Region Breakdown */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-6">Top Regions (Vercel Edge)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.regions} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8EEF4" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6B7280" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="region" axisLine={false} tickLine={false} tick={{ fill: "#1A1A2E", fontWeight: 500 }} />
                  <RechartsTooltip 
                    cursor={{ fill: "#F8FAFC" }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} 
                  />
                  <Bar dataKey="count" name="Users" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={24}>
                    {stats.regions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
