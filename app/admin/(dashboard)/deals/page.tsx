"use client";

import { useState, useEffect } from "react";
import { dealsApi, type Deal } from "@/lib/dealsApi";
import { Tag, Calendar, Clock, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const data = await dealsApi.getDeals();
      setDeals(data);
    } catch {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await dealsApi.deleteDeal(id);
      toast.success("Deal removed");
      setDeals((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error("Failed to delete deal");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Global Deals Monitor</h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Monitor and manage all promotional deals created by sellers across the platform.
          </p>
        </div>
      </div>
      {/* ── Content ── */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : deals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Tag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">No deals active</h2>
          <p className="text-[15px] text-gray-500 font-medium">
            Sellers have not created any promotional deals yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Seller ID</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Deal Price</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deals.map((deal) => {
                  const now = new Date();
                  const start = new Date(deal.starts_at);
                  const end = new Date(deal.ends_at);
                  let status = "Inactive";
                  let statusColor = "bg-gray-100 text-gray-700";
                  
                  if (deal.active) {
                    if (now < start) {
                      status = "Scheduled";
                      statusColor = "bg-amber-100 text-amber-700";
                    } else if (now > end) {
                      status = "Expired";
                      statusColor = "bg-red-100 text-red-700";
                    } else {
                      status = "Active";
                      statusColor = "bg-green-100 text-green-700";
                    }
                  }

                  return (
                    <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                        {deal.products?.name || "Unknown Product"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-[150px] truncate" title={deal.products?.seller_id}>
                        {deal.products?.seller_id || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold capitalize">
                          {deal.type?.replace('_', ' ') || 'Flash'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">₹{deal.deal_price}</span>
                          {deal.quantity_threshold && (
                            <span className="text-xs text-gray-500">(Min: {deal.quantity_threshold})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start: {start.toLocaleString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> End: {end.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Deal"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
