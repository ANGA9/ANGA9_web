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
  ArrowLeft,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import EmptyState from "@/components/shared/EmptyState";

/* ─── Types ─── */
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

interface Group {
  key: string;
  orderId: string | null;
  orderNumber: string | null;
  items: Notification[];
}

/* ─── Helpers ─── */
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
  if (isSameDay(date, now)) return hrs === 1 ? "1h ago" : `${hrs}h ago`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Yesterday";
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type IconStyle = { Icon: typeof Package; bg: string; fg: string };

function getNotificationStyle(type: string): IconStyle {
  switch (type) {
    // ── Shipping ──────────────────────────────────────────────
    case "order.shipped":
    case "order_shipped":
    case "shipment":
      return { Icon: Truck,        bg: "#EEF2FF", fg: "#4F46E5" };

    // ── Delivery ──────────────────────────────────────────────
    case "order.delivered":
    case "order_delivered":
    case "delivery":
      return { Icon: PackageCheck, bg: "#ECFDF5", fg: "#059669" };

    // ── Payment success ───────────────────────────────────────
    case "payment.success":
    case "payment_success":
    case "payout":
      return { Icon: CreditCard,   bg: "#F0FDF4", fg: "#047857" };

    // ── Payment failed ────────────────────────────────────────
    case "payment.failed":
    case "payment_failed":
      return { Icon: CreditCard,   bg: "#FEF2F2", fg: "#DC2626" };

    // ── Order placed / confirmed / status ─────────────────────
    case "order.placed":
    case "order.confirmed":
    case "order_placed":
    case "order_confirmed":
    case "order_status":
      return { Icon: Package,      bg: "#FEF3C7", fg: "#B45309" };

    // ── Order cancelled ───────────────────────────────────────
    case "order.cancelled":
    case "order_cancelled":
      return { Icon: XCircle,      bg: "#FEF2F2", fg: "#DC2626" };

    // ── Order returned ────────────────────────────────────────
    case "order.returned":
    case "order_returned":
      return { Icon: PackageCheck, bg: "#FFF7ED", fg: "#C2410C" };

    // ── Inventory low (seller) ────────────────────────────────
    case "inventory.low":
      return { Icon: AlertCircle,  bg: "#FFFBEB", fg: "#D97706" };

    // ── User / seller events ──────────────────────────────────
    case "user.registered":
    case "seller.approved":
      return { Icon: CheckCheck,   bg: "#ECFDF5", fg: "#059669" };

    case "user.suspended":
      return { Icon: AlertCircle,  bg: "#FEF2F2", fg: "#DC2626" };

    case "product.approved":
      return { Icon: PackageCheck, bg: "#ECFDF5", fg: "#059669" };

    case "product.rejected":
      return { Icon: XCircle,      bg: "#FEF2F2", fg: "#DC2626" };

    // ── Fallback ──────────────────────────────────────────────
    default:
      return { Icon: AlertCircle,  bg: "#F1F5F9", fg: "#475569" };
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
      groups.push({ key: `order-${oid}`, orderId: oid, orderNumber: extractOrderNumber(n), items: [n] });
    } else {
      groups.push({ key: `single-${n.id}`, orderId: null, orderNumber: null, items: [n] });
    }
  }
  return groups;
}

/* ─── Page ─── */
export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  // Groups start collapsed when they have >1 item
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
      const data = res?.data ?? [];
      setNotifications(data);
      setTotalPages(res?.totalPages ?? 0);
      setTotal(res?.total ?? 0);
      // Auto-collapse groups that have >1 item
      const autoCollapse: Record<string, boolean> = {};
      groupByOrder(data).forEach((g) => {
        if (g.items.length > 1) autoCollapse[g.key] = true;
      });
      setCollapsed(autoCollapse);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user, page, filter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

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

  /* ─── Notification row ─── */
  const renderItem = (n: Notification, opts: { showLink: boolean; isGrouped?: boolean }) => {
    const { Icon, bg, fg } = getNotificationStyle(n.type);
    const orderId = extractOrderId(n);
    const orderHref = orderId ? `/orders` : null;

    return (
      <div
        key={n.id}
        onClick={() => { if (!n.read) markAsRead(n.id); }}
        className="relative flex gap-3 sm:gap-4 px-4 sm:px-6 py-4 transition-colors hover:bg-[#F8FBFF] group cursor-pointer"
        style={{
          background: n.read ? "transparent" : "#EEF6FF",
          borderLeft: n.read ? "3px solid transparent" : "3px solid #1A6FD4",
          paddingLeft: opts.isGrouped ? 40 : undefined,
        }}
      >
        {/* Type icon */}
        <div
          className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 mt-0.5"
          style={{ background: bg }}
        >
          <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" style={{ color: fg }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className="text-[14px] sm:text-[15px] leading-snug"
              style={{ color: t.textPrimary, fontWeight: n.read ? 500 : 700 }}
            >
              {n.title}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12px] tabular-nums" style={{ color: t.textMuted }}>
                {timeAgo(n.sent_at)}
              </span>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-[#1A6FD4] shrink-0" />
              )}
            </div>
          </div>

          <p
            className="text-[13px] sm:text-[14px] mt-1 leading-relaxed line-clamp-2"
            style={{ color: t.textSecondary }}
          >
            {n.body}
          </p>

          {/* Actions row */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mt-2">
            {opts.showLink && orderHref && (
              <Link
                href={orderHref}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[12.5px] font-bold hover:underline"
                style={{ color: t.bluePrimary }}
              >
                View Order <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {!n.read && (
              <button
                onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: t.bluePrimary }}
              >
                <Check className="w-3.5 h-3.5" /> Mark read
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
              style={{ color: t.textMuted }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ─── Render ─── */
  return (
    <div className="w-full">
      {/* Mobile sticky header */}
      <header className="flex md:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
        <Link href="/" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight flex-1">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-full"
            style={{ background: "#EEF6FF", color: t.bluePrimary }}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Read all
          </button>
        )}
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-12 pb-24 md:pb-12">
        {/* Desktop header */}
        <div className="hidden md:flex md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-[15px] mt-1.5" style={{ color: t.textSecondary }}>
              Stay updated with your orders, payments, and account activity.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 rounded-xl bg-white border px-4 py-2.5 text-[15px] font-bold shadow-sm transition-all hover:bg-gray-50 active:scale-95"
              style={{ borderColor: t.border, color: t.bluePrimary }}
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: t.border }}>
          {/* Filter tabs */}
          <div className="flex gap-1 px-3 sm:px-4 pt-2 border-b" style={{ borderColor: t.border }}>
            {(["all", "unread"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setFilter(tab); setPage(1); }}
                className="flex items-center gap-2 px-4 py-3 text-[14px] sm:text-[15px] font-bold transition-colors border-b-[3px]"
                style={{
                  borderColor: filter === tab ? t.bluePrimary : "transparent",
                  color: filter === tab ? t.bluePrimary : t.textSecondary,
                  marginBottom: "-1px",
                }}
              >
                {tab === "all" ? "All" : "Unread"}
                {tab === "all" && total > 0 && (
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-[11px]">{total}</span>
                )}
                {tab === "unread" && unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[11px]">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="divide-y" style={{ borderColor: t.border }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2.5 py-1">
                    <div className="h-3.5 w-1/2 rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-1/4 rounded bg-gray-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10">
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
            </div>
          ) : (
            <>
              <div className="divide-y" style={{ borderColor: t.border }}>
                {groups.map((g) => {
                  // Single notification, no order — plain row
                  if (g.items.length === 1 && !g.orderId) {
                    return renderItem(g.items[0], { showLink: false });
                  }
                  // Single notification with order — show "View Order" link
                  if (g.items.length === 1 && g.orderId) {
                    return renderItem(g.items[0], { showLink: true });
                  }

                  // Multi-notification group
                  const isCollapsed = collapsed[g.key] ?? true;
                  const groupUnread = g.items.filter((n) => !n.read).length;
                  const label = g.orderNumber ?? g.orderId ?? "Order";
                  const latestType = g.items[0]?.type ?? "";
                  const { Icon: GroupIcon, bg: groupBg, fg: groupFg } = getNotificationStyle(latestType);

                  return (
                    <div key={g.key}>
                      {/* Group header */}
                      <button
                        onClick={() => toggleGroup(g.key)}
                        className="w-full flex items-center gap-3 px-4 sm:px-6 py-3.5 transition-colors text-left"
                        style={{ background: groupUnread > 0 ? "#EEF6FF" : "#F9FAFB" }}
                      >
                        {/* Latest-event type icon */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: groupBg }}
                        >
                          <GroupIcon className="w-4 h-4" style={{ color: groupFg }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13.5px] font-bold truncate" style={{ color: t.textPrimary }}>
                              Order {label}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 shrink-0">
                              {g.items.length} updates
                            </span>
                            {groupUnread > 0 && (
                              <span
                                className="text-[11px] px-2 py-0.5 rounded-full shrink-0"
                                style={{ background: "#DBEAFE", color: t.bluePrimary }}
                              >
                                {groupUnread} new
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] mt-0.5" style={{ color: t.textMuted }}>
                            {timeAgo(g.items[0].sent_at)} · Tap to {isCollapsed ? "expand" : "collapse"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {g.orderId && (
                            <Link
                              href={`/orders`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-[12.5px] font-bold hover:underline"
                              style={{ color: t.bluePrimary }}
                            >
                              View Order <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          <ChevronDown
                            className="w-4 h-4 transition-transform duration-200"
                            style={{
                              color: t.textSecondary,
                              transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                            }}
                          />
                        </div>
                      </button>

                      {/* Expanded rows */}
                      {!isCollapsed && (
                        <div className="divide-y border-t" style={{ borderColor: t.border }}>
                          {g.items.map((n) => renderItem(n, { showLink: false, isGrouped: true }))}
                          {/* Footer link for mobile */}
                          {g.orderId && (
                            <div className="px-5 py-3 bg-gray-50">
                              <Link
                                href="/orders"
                                className="flex items-center gap-1.5 text-[13px] font-bold w-fit"
                                style={{ color: t.bluePrimary }}
                              >
                                View full order details <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 p-5 border-t" style={{ borderColor: t.border }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors hover:bg-gray-50 active:scale-95 disabled:opacity-40"
                    style={{ borderColor: t.border }}
                  >
                    <ChevronLeft className="w-5 h-5" style={{ color: t.textSecondary }} />
                  </button>
                  <span className="text-[14px] font-semibold px-2" style={{ color: t.textSecondary }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors hover:bg-gray-50 active:scale-95 disabled:opacity-40"
                    style={{ borderColor: t.border }}
                  >
                    <ChevronRight className="w-5 h-5" style={{ color: t.textSecondary }} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
