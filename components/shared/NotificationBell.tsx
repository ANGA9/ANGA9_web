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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get<{ data: Notification[] }>("/api/notifications?limit=5&page=1", { silent: true });
      setNotifications(res?.data ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`, {}, { silent: true });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/api/notifications/read-all", {}, { silent: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  const deleteNotification = async (id: string, wasUnread: boolean) => {
    try {
      await api.delete(`/api/notifications/${id}`, { silent: true });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center transition-colors hover:opacity-80"
      >
        <Bell style={{ width: 20, height: 20, color: t.textSecondary }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-1"
            style={{ background: t.outOfStock, color: "#FFFFFF" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[340px] rounded-xl border overflow-hidden"
          style={{
            background: t.bgCard,
            borderColor: t.border,
            boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
            zIndex: 60,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: t.border }}
          >
            <h3 className="font-semibold text-[14px]" style={{ color: t.textPrimary }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-medium transition-colors hover:opacity-80"
                style={{ color: t.bluePrimary }}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="space-y-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                      <div className="h-2.5 w-1/2 rounded bg-gray-100 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <Bell className="w-8 h-8 mb-2" style={{ color: t.textMuted, opacity: 0.4 }} />
                <p className="text-[13px]" style={{ color: t.textMuted }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = getNotificationIcon(n.type);
                return (
                  <div
                    key={n.id}
                    className="flex gap-3 px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-[#F8FBFF] group"
                    style={{
                      borderColor: t.border,
                      background: n.read ? "transparent" : `${t.bluePrimary}05`,
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                      style={{ background: t.bgBlueTint }}
                    >
                      <Icon className="w-4 h-4" style={{ color: t.bluePrimary }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-[13px] leading-tight"
                          style={{
                            color: t.textPrimary,
                            fontWeight: n.read ? 400 : 600,
                          }}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0 mt-1"
                            style={{ background: t.bluePrimary }}
                          />
                        )}
                      </div>
                      <p
                        className="text-[12px] mt-0.5 line-clamp-2"
                        style={{ color: t.textSecondary }}
                      >
                        {n.body}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px]" style={{ color: t.textMuted }}>
                          {timeAgo(n.sent_at)}
                        </span>
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: t.bluePrimary }}
                          >
                            <Check className="w-3.5 h-3.5 inline mr-0.5" />
                            Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n.id, !n.read)}
                          className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: t.textMuted }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <Link
            href={viewAllHref}
            onClick={() => setOpen(false)}
            className="block text-center py-2.5 border-t text-[13px] font-medium transition-colors hover:bg-[#F8FBFF]"
            style={{ borderColor: t.border, color: t.bluePrimary }}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
