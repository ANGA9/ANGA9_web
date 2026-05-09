"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  CreditCard,
  Truck,
  PackageCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
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

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24 && isSameDay(date, now)) return `${hrs}h ago`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type IconStyle = { Icon: typeof Package; bg: string; fg: string };

function getNotificationStyle(type: string): IconStyle {
  switch (type) {
    case "shipment":
    case "order_shipped":
      return { Icon: Truck, bg: "#EEF2FF", fg: "#4F46E5" };
    case "delivery":
    case "order_delivered":
      return { Icon: PackageCheck, bg: "#ECFDF5", fg: "#059669" };
    case "payment_success":
    case "payout":
      return { Icon: CreditCard, bg: "#ECFDF5", fg: "#047857" };
    case "payment_failed":
      return { Icon: CreditCard, bg: "#FEF2F2", fg: "#DC2626" };
    case "order_placed":
    case "order_confirmed":
    case "order_status":
      return { Icon: Package, bg: "#FEF3C7", fg: "#B45309" };
    case "order_cancelled":
      return { Icon: AlertCircle, bg: "#FEF2F2", fg: "#DC2626" };
    default:
      return { Icon: AlertCircle, bg: "#F1F5F9", fg: "#475569" };
  }
}

function extractOrderId(n: Notification): string | null {
  const d = n.data as Record<string, unknown> | undefined;
  if (!d) return null;
  const id = d.orderId ?? d.order_id;
  return typeof id === "string" ? id : null;
}

function extractOrderNumber(n: Notification): string | null {
  const d = n.data as Record<string, unknown> | undefined;
  if (!d) return null;
  const num = d.orderNumber ?? d.order_number;
  return typeof num === "string" ? num : null;
}

interface Group {
  key: string;
  orderId: string | null;
  orderNumber: string | null;
  items: Notification[];
}

function groupByOrder(notifications: Notification[]): Group[] {
  const groups: Group[] = [];
  const indexByOrder = new Map<string, number>();
  for (const n of notifications) {
    const oid = extractOrderId(n);
    if (oid) {
      const existing = indexByOrder.get(oid);
      if (existing !== undefined) {
        groups[existing].items.push(n);
        if (!groups[existing].orderNumber) {
          groups[existing].orderNumber = extractOrderNumber(n);
        }
        continue;
      }
      indexByOrder.set(oid, groups.length);
      groups.push({
        key: `order-${oid}`,
        orderId: oid,
        orderNumber: extractOrderNumber(n),
        items: [n],
      });
    } else {
      groups.push({ key: `single-${n.id}`, orderId: null, orderNumber: null, items: [n] });
    }
  }
  return groups;
}

export default function SellerNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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
    setTotal((tot) => tot - 1);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const groups = useMemo(() => groupByOrder(notifications), [notifications]);

  const toggleGroup = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const renderItem = (n: Notification, opts: { showLink: boolean; isGrouped?: boolean }) => {
    const { Icon, bg, fg } = getNotificationStyle(n.type);
    const orderId = extractOrderId(n);
    const orderHref = orderId ? `/seller/dashboard/orders/${orderId}` : null;

    return (
      <div
        key={n.id}
        onClick={() => { if (!n.read) markAsRead(n.id); }}
        className="relative flex gap-3 px-4 py-4 border-b border-[#E8EEF4] last:border-b-0 hover:bg-[#F8FBFF] group transition-colors cursor-pointer"
        style={{
          background: n.read ? "transparent" : "rgba(26,111,212,0.06)",
          borderLeft: n.read ? "4px solid transparent" : "4px solid #1A6FD4",
          paddingLeft: opts.isGrouped ? 24 : undefined,
        }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
          style={{ background: bg }}
        >
          <Icon className="w-5 h-5" style={{ color: fg }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm md:text-base leading-tight text-[#1A1A2E] ${n.read ? "" : "font-semibold"}`}>
              {n.title}
            </p>
            {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-[#1A6FD4]" />}
          </div>
          <p className="text-sm md:text-base mt-1 text-[#4B5563]">{n.body}</p>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mt-2">
            <span className="text-xs md:text-sm text-[#9CA3AF]">{timeAgo(n.sent_at)}</span>
            {opts.showLink && orderHref && (
              <Link
                href={orderHref}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs md:text-sm font-semibold text-[#1A6FD4] hover:underline"
              >
                View Order
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {!n.read && (
              <button
                onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                className="flex items-center gap-1 text-xs md:text-sm font-medium text-[#1A6FD4] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Check className="w-3.5 h-3.5" /> Mark read
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
              className="flex items-center gap-1 text-xs md:text-sm text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#1A1A2E]">Notifications</h1>
          <p className="text-sm md:text-base text-[#9CA3AF] mt-0.5">{total} notification{total !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-lg border border-[#E8EEF4] px-3 py-2 text-sm md:text-base font-medium text-[#1A6FD4] hover:bg-[#F8FBFF] transition-colors"
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
            className={`px-4 py-2.5 text-sm md:text-base font-medium border-b-2 transition-colors ${
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
            {groups.map((g) => {
              if (g.items.length === 1 && !g.orderId) return renderItem(g.items[0], { showLink: false });
              if (g.items.length === 1 && g.orderId) return renderItem(g.items[0], { showLink: true });
              const isCollapsed = collapsed[g.key] ?? false;
              const groupUnread = g.items.filter((n) => !n.read).length;
              const label = g.orderNumber ?? g.orderId ?? "Order";
              return (
                <div key={g.key}>
                  <button
                    onClick={() => toggleGroup(g.key)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left border-b border-[#E8EEF4]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ChevronDown
                        className="w-4 h-4 shrink-0 text-[#4B5563] transition-transform"
                        style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
                      />
                      <span className="text-sm font-bold text-[#1A1A2E] truncate">Order {label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 shrink-0">
                        {g.items.length}
                      </span>
                      {groupUnread > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A6FD41A] text-[#1A6FD4] shrink-0">
                          {groupUnread} new
                        </span>
                      )}
                    </div>
                    {g.orderId && (
                      <Link
                        href={`/seller/dashboard/orders/${g.orderId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden sm:flex items-center gap-1 text-xs md:text-sm font-semibold text-[#1A6FD4] hover:underline shrink-0"
                      >
                        View Order
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </button>
                  {!isCollapsed && (
                    <div>
                      {g.items.map((n) => renderItem(n, { showLink: false, isGrouped: true }))}
                    </div>
                  )}
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
              <span className="text-sm md:text-base px-2 text-[#4B5563]">Page {page} of {totalPages}</span>
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
