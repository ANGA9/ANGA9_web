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
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

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
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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

export default function SellerNotificationsPage() {
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

      const res = await api.get<NotificationsResponse>(`/api/notifications?${params.toString()}`);
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
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#1A1A2E]">Notifications</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-0.5">{total} notification{total !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-lg border border-[#E8EEF4] px-3 py-2 text-[13px] font-medium text-[#1A6FD4] hover:bg-[#F8FBFF] transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#E8EEF4]">
        {(["all", "unread"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setFilter(tab); setPage(1); }}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
              filter === tab
                ? "border-[#1A6FD4] text-[#1A6FD4]"
                : "border-transparent text-[#4B5563]"
            }`}
          >
            {tab === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-xl border border-[#E8EEF4] overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 px-4 py-4 border-b border-[#E8EEF4] last:border-b-0">
              <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF]">
            <Bell className="h-8 w-8 text-[#1A6FD4]" />
          </div>
          <h3 className="text-base font-semibold text-[#1A1A2E]">
            {filter === "unread" ? "All caught up!" : "No notifications yet"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[#4B5563]">
            {filter === "unread"
              ? "You have no unread notifications."
              : "Notifications about orders, payouts, and updates will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[#E8EEF4] overflow-hidden">
            {notifications.map((n) => {
              const Icon = getNotificationIcon(n.type);
              return (
                <div
                  key={n.id}
                  className="flex gap-3 px-4 py-4 border-b border-[#E8EEF4] last:border-b-0 hover:bg-[#F8FBFF] group transition-colors"
                  style={{ background: n.read ? "transparent" : "rgba(26,111,212,0.02)" }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 bg-[#EAF2FF]">
                    <Icon className="w-5 h-5 text-[#1A6FD4]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[14px] leading-tight text-[#1A1A2E] ${n.read ? "" : "font-semibold"}`}>
                        {n.title}
                      </p>
                      {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-[#1A6FD4]" />}
                    </div>
                    <p className="text-[13px] mt-1 text-[#4B5563]">{n.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[12px] text-[#9CA3AF]">{timeAgo(n.sent_at)}</span>
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="flex items-center gap-1 text-[12px] font-medium text-[#1A6FD4] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="flex items-center gap-1 text-[12px] text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-9 h-9 rounded-lg border border-[#E8EEF4] flex items-center justify-center disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 text-[#4B5563]" />
              </button>
              <span className="text-[13px] px-2 text-[#4B5563]">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-9 h-9 rounded-lg border border-[#E8EEF4] flex items-center justify-center disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4 text-[#4B5563]" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
