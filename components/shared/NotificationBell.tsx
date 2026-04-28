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

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get<{ count: number }>("/api/notifications/unread-count", { silent: true });
      setUnreadCount(res?.count ?? 0);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

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
