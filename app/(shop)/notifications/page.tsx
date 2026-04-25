"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  CreditCard,
  Truck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import EmptyState from "@/components/shared/EmptyState";

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

interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (filter === "unread") params.set("read", "false");

      const res = await api.get<NotificationsResponse>(
        `/api/notifications?${params.toString()}`
      );
      setNotifications(res?.data ?? []);
      setTotalPages(res?.totalPages ?? 0);
      setTotal(res?.total ?? 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user, page, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await api.patch(`/api/notifications/${id}/read`, {}, { silent: true });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    await api.patch("/api/notifications/read-all", {}, { silent: true });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await api.delete(`/api/notifications/${id}`, { silent: true });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setTotal((t) => t - 1);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-[20px]" style={{ color: t.textPrimary }}>
            Notifications
          </h1>
          <p className="text-[13px] mt-1" style={{ color: t.textMuted }}>
            {total} notification{total !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[#F8FBFF]"
            style={{ borderColor: t.border, color: t.bluePrimary }}
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: t.border }}>
        {(["all", "unread"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setFilter(tab); setPage(1); }}
            className="px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2"
            style={{
              borderColor: filter === tab ? t.bluePrimary : "transparent",
              color: filter === tab ? t.bluePrimary : t.textSecondary,
            }}
          >
            {tab === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="space-y-0 rounded-xl border overflow-hidden" style={{ borderColor: t.border }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex gap-3 px-4 py-4 border-b last:border-b-0"
              style={{ borderColor: t.border }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-1/4 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "All caught up!" : "No notifications yet"}
          description={
            filter === "unread"
              ? "You have no unread notifications."
              : "You'll see notifications about orders, payments, and updates here."
          }
          accentColor={t.bluePrimary}
        />
      ) : (
        <>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: t.border }}
          >
            {notifications.map((n) => {
              const Icon = getNotificationIcon(n.type);
              return (
                <div
                  key={n.id}
                  className="flex gap-3 px-4 py-4 border-b last:border-b-0 transition-colors hover:bg-[#F8FBFF] group"
                  style={{
                    borderColor: t.border,
                    background: n.read ? "transparent" : `${t.bluePrimary}05`,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                    style={{ background: t.bgBlueTint }}
                  >
                    <Icon className="w-5 h-5" style={{ color: t.bluePrimary }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="text-[14px] leading-tight"
                        style={{
                          color: t.textPrimary,
                          fontWeight: n.read ? 400 : 600,
                        }}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                          style={{ background: t.bluePrimary }}
                        />
                      )}
                    </div>
                    <p
                      className="text-[13px] mt-1"
                      style={{ color: t.textSecondary }}
                    >
                      {n.body}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[12px]" style={{ color: t.textMuted }}>
                        {timeAgo(n.sent_at)}
                      </span>
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="flex items-center gap-1 text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: t.bluePrimary }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="flex items-center gap-1 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: t.textMuted }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-40"
                style={{ borderColor: t.border }}
              >
                <ChevronLeft className="w-4 h-4" style={{ color: t.textSecondary }} />
              </button>
              <span className="text-[13px] px-2" style={{ color: t.textSecondary }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-40"
                style={{ borderColor: t.border }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: t.textSecondary }} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
