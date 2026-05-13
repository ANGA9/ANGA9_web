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
  LifeBuoy,
  MessageSquare,
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
    case "support.ticket.created":
    case "support.ticket.admin_initiated":
      return { Icon: LifeBuoy, bg: "#EAF2FF", fg: "#1A6FD4" };
    case "support.ticket.message_added":
    case "support.ticket.replied":
    case "support.ticket.assigned":
      return { Icon: MessageSquare, bg: "#EDE9FE", fg: "#7C3AED" };
    case "support.ticket.status_changed":
    case "support.ticket.resolved":
      return { Icon: CheckCheck, bg: "#DCFCE7", fg: "#16A34A" };
    case "support.ticket.sla_breached":
      return { Icon: AlertCircle, bg: "#FEE2E2", fg: "#DC2626" };
    default:
      return { Icon: AlertCircle, bg: "#F3F4F6", fg: "#6B7280" };
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
        className="relative flex gap-4 px-5 py-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 group transition-colors cursor-pointer"
        style={{
          background: n.read ? "transparent" : "#F8FBFF",
          borderLeft: n.read ? "4px solid transparent" : "4px solid #1A6FD4",
          paddingLeft: opts.isGrouped ? 28 : undefined,
        }}
      >
        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0"
          style={{ background: bg }}
        >
          <Icon className="w-5 h-5" style={{ color: fg }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className={`text-[15px] md:text-[16px] leading-tight text-gray-900 ${n.read ? "font-medium" : "font-bold"}`}>
              {n.title}
            </h3>
            {!n.read && <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 bg-[#1A6FD4]" />}
          </div>
          <p className="text-[14px] mt-1 text-gray-500 leading-relaxed">{n.body}</p>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3">
            <span className="text-[13px] font-medium text-gray-400">{timeAgo(n.sent_at)}</span>
            {opts.showLink && orderHref && (
              <Link
                href={orderHref}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[13px] font-bold text-[#1A6FD4] hover:text-[#155bb5] transition-colors"
              >
                View Details
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {!n.read && (
              <button
                onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                className="flex items-center gap-1 text-[13px] font-bold text-[#1A6FD4] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#155bb5]"
              >
                <Check className="w-4 h-4" /> Mark read
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
              className="flex items-center gap-1 text-[13px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="w-full mx-auto max-w-4xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white md:bg-transparent min-h-[calc(100vh-64px)] text-[#1A1A2E]">
      
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            Notifications
          </h1>
          <span className="text-[18px] font-bold text-gray-400">
            {total} alert{total !== 1 ? "s" : ""}
          </span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-[14px] font-bold text-[#1A6FD4] hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Notifications</h1>
          <span className="text-[14px] text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-full">{total}</span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex self-start items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[13px] font-bold text-[#1A6FD4] shadow-sm"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-3 overflow-x-auto no-scrollbar">
        {(["all", "unread"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setFilter(tab); setPage(1); }}
            className={`rounded-full px-6 py-2 text-[14px] font-bold transition-all active:scale-[0.98] ${
              filter === tab
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 px-5 py-5 border-b border-gray-100 last:border-b-0">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
            <Bell className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-2">
            {filter === "unread" ? "All caught up!" : "No notifications yet"}
          </h3>
          <p className="max-w-md text-[14px] font-medium text-gray-500 leading-relaxed">
            {filter === "unread"
              ? "You have no unread notifications. Great job staying on top of things."
              : "Notifications about your orders, payouts, and account updates will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
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
                    className="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-gray-50/80 hover:bg-gray-100 transition-colors text-left border-b border-gray-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ChevronDown
                        className="w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200"
                        style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
                      />
                      <span className="text-[14px] font-bold text-gray-900 truncate uppercase tracking-wider">Group: Order {label}</span>
                      <span className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600 shrink-0">
                        {g.items.length} updates
                      </span>
                      {groupUnread > 0 && (
                        <span className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[#1A6FD4] shrink-0">
                          {groupUnread} new
                        </span>
                      )}
                    </div>
                    {g.orderId && (
                      <Link
                        href={`/seller/dashboard/orders/${g.orderId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden sm:flex items-center gap-1 text-[13px] font-bold text-gray-500 hover:text-[#1A6FD4] transition-colors shrink-0"
                      >
                        View Order
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </button>
                  {!isCollapsed && (
                    <div className="border-b border-gray-200 last:border-b-0 bg-white">
                      {g.items.map((n) => renderItem(n, { showLink: false, isGrouped: true }))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-[14px] font-bold px-3 text-gray-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
