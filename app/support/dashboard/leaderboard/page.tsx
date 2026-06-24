"use client";
import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Trophy, Medal, Star, ShieldCheck, Loader2 } from "lucide-react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type LeaderboardEntry = {
  id: string;
  name: string;
  resolvedCount: number;
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/support/leaderboard?period=${period}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      
      const { data: lbData } = await res.json();
      setData(lbData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            Support Heroes
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Recognizing the agents closing the most tickets and delivering top-tier support.
          </p>
        </div>

        <div className="flex bg-white rounded-xl border border-teal-100 p-1 shadow-sm w-fit">
          <button
            onClick={() => setPeriod("7d")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              period === "7d" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-teal-700"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              period === "30d" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-teal-700"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setPeriod("all")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              period === "all" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-teal-700"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center text-teal-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-bold">Crunching the numbers...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-24 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-teal-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No data yet</h3>
            <p className="text-gray-500 font-medium">Be the first to resolve a ticket in this period!</p>
          </div>
        ) : (
          <div className="divide-y divide-teal-50">
            {/* Top 3 Podium (Optional extra styling for top ranks) */}
            {data.map((agent, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              
              return (
                <div 
                  key={agent.id} 
                  className={`flex items-center gap-6 p-6 transition-colors hover:bg-teal-50/30 ${
                    isFirst ? "bg-amber-50/30" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    {isFirst ? <Medal className="w-10 h-10 text-amber-500 drop-shadow-md" /> :
                     isSecond ? <Medal className="w-8 h-8 text-gray-400" /> :
                     isThird ? <Medal className="w-8 h-8 text-amber-700" /> :
                     <span className="text-xl font-black text-gray-300">#{index + 1}</span>
                    }
                  </div>

                  {/* Avatar (Placeholder) */}
                  <div className="w-12 h-12 rounded-full from-teal-500 to-teal-700 flex items-center justify-center font-black shadow-sm flex-shrink-0 bg-white border-2 border-gradient-to-br text-gradient-to-br hover:bg-gray-50">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className={`text-lg font-black ${isFirst ? "text-amber-900" : "text-gray-900"}`}>
                      {agent.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <ShieldCheck className={`w-4 h-4 ${isFirst ? "text-amber-600" : "text-teal-600"}`} />
                      <span className="text-sm font-bold text-gray-500">Verified Support Agent</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-2xl font-black text-gray-900">
                      {agent.resolvedCount}
                      {isFirst && <Star className="w-6 h-6 text-amber-400 fill-amber-400" />}
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tickets Resolved</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
