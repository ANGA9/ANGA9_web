"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Trash2, Package, CreditCard, Truck, AlertCircle } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channel: string;
  read: boolean;
  sent_at: string;
  read_at?: string;
}

interface NotificationBellProps {
  portalType: "customer" | "seller" | "admin";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "order_placed":
    case "order_confirmed":
    case "order_status":
      return Package;
    case "payment_success":
    case "payment_failed":
    case "payout":
      return CreditCard;
    case "shipment":
    case "delivery":
      return Truck;
    default:
      return AlertCircle;
  }
}

export default function NotificationBell({ portalType }: NotificationBellProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const viewAllHref =
    portalType === "seller"
      ? "/seller/dashboard/notifications"
      : "/notifications";

  // Track consecutive failures so we can back off instead of hammering a
  // down backend every 30s. Also pause polling while the tab is hidden.
  const failuresRef = useRef(0);

  const fetchUnreadCount = useCallback(async (): Promise<boolean> => {
    if (!user) return true;
    try {
      const { data: { session } } = await getSupabaseBrowserClient().auth.getSession();
      if (!session) return true;

      const res = await api.get<{ count: number }>(
        "/api/notifications/unread-count",
        { silent: true },
      );
      if (res === null) return false; // silent failure (HTTP !ok)
      setUnreadCount(res?.count ?? 0);
      return true;
    } catch {
      return false; // network failure
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const BASE = 30_000; // 30s when healthy
    const MAX = 5 * 60_000; // cap backoff at 5 min

    const schedule = (delay: number) => {
      if (cancelled) return;
      timer = setTimeout(tick, delay);
    };

    const tick = async () => {
      // Skip work when the tab is hidden — visibilitychange will re-arm.
      if (typeof document !== "undefined" && document.hidden) return;

      const ok = await fetchUnreadCount();
      if (cancelled) return;

      if (ok) {
        failuresRef.current = 0;
        schedule(BASE);
      } else {
        failuresRef.current += 1;
        // 30s → 60s → 120s → 240s → 300s (cap)
        const delay = Math.min(BASE * 2 ** (failuresRef.current - 1), MAX);
        schedule(delay);
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
        timer = null;
      } else if (!timer) {
        // Refresh immediately on return, then resume normal cadence.
        tick();
      }
    };

    // Initial fetch, then start the loop.
    tick();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user, fetchUnreadCount]);

  if (!user) return null;

  return (
    <Link
      href={viewAllHref}
      className="relative flex items-center justify-center transition-colors hover:opacity-80"
    >
      <Bell style={{ width: 22, height: 22, color: t.textSecondary }} />
      {unreadCount > 0 && (
        <span
          className="absolute -top-1.5 -right-2 flex h-[16px] min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-1"
          style={{ background: "#4338CA", color: "#FFFFFF" }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
