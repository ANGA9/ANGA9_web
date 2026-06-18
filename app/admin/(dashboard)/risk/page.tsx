"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Search, Filter, Loader2, Ban, CheckCircle, ShieldOff, ArrowRight } from "lucide-react";
import { riskApi, RiskEvent } from "@/lib/riskApi";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminRiskPage() {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await riskApi.listEvents();
      setEvents(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load risk events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOverride = async (id: string) => {
    if (!confirm("Mark this event as allowed?")) return;
    try {
      await riskApi.overrideEvent(id, "allow");
      toast.success("Event overridden");
      fetchEvents();
    } catch (err: any) {
      toast.error("Failed to override event");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Trust & Safety</span>
          </div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Fraud / Risk Queue</h1>
          <p className="text-[15px] text-gray-500 font-medium">Review suspicious activities and manage blocked identities</p>
        </div>

        <Link
          href="/admin/risk/blocklist"
          className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-gray-900 text-white text-[14px] font-bold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
        >
          <Ban className="w-4 h-4" />
          Manage Blocklist
        </Link>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-gray-200 bg-white text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-white border border-gray-200 text-gray-700 text-[14px] font-bold hover:bg-gray-50 transition-all shadow-sm">
          <Filter className="w-4 h-4" />
          Filter Action
        </button>
      </div>

      {/* ── Events Table ── */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <ShieldCheck className="w-16 h-16 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No suspicious events</h3>
            <p className="text-gray-500">The risk queue is currently empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Actor / User</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Score & Signals</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-medium text-gray-900">
                        {new Date(event.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[12px] text-gray-500">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-[12px] font-bold text-gray-600">
                            {event.user_id.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-gray-900 truncate max-w-[150px]">
                            {event.user_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                        event.action === 'block' ? 'bg-red-50 text-red-700 border border-red-100' :
                        event.action === 'review' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {event.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[15px] font-black ${event.score > 50 ? 'text-red-600' : 'text-amber-600'}`}>
                          {event.score}
                        </span>
                        <span className="text-[12px] font-medium text-gray-400">Risk Score</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {event.signals.map((sig, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {sig}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {event.action !== 'allow' && (
                        <button
                          onClick={() => handleOverride(event.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-white hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm active:scale-95"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Override
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 7 2a1 1 0 0 1 1 1v7z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
