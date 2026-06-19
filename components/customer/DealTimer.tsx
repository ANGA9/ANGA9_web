"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function DealTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const end = new Date(endsAt).getTime();

    const update = () => {
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!timeLeft || (timeLeft.d === 0 && timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0)) {
    return null; // Deal expired
  }

  return (
    <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-2.5 rounded-lg border border-red-100 mb-4 inline-flex">
      <Clock className="w-4 h-4 animate-pulse" />
      <span className="text-sm font-semibold">Deal ends in:</span>
      <div className="flex items-center gap-1 font-mono font-bold text-[15px]">
        {timeLeft.d > 0 && <span>{timeLeft.d}d</span>}
        <span>{timeLeft.h.toString().padStart(2, "0")}h</span>
        <span>:</span>
        <span>{timeLeft.m.toString().padStart(2, "0")}m</span>
        <span>:</span>
        <span>{timeLeft.s.toString().padStart(2, "0")}s</span>
      </div>
    </div>
  );
}
