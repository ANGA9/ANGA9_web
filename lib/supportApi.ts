import { api } from "./api";

/* ─── Types ────────────────────────────────────────────────── */
export type TicketStatus =
  | "open"
  | "pending_user"
  | "in_progress"
  | "resolved"
  | "closed"
  | "reopened";

export type TicketPriority = "low" | "normal" | "high" | "urgent";

export type RequesterRole = "customer" | "seller";

export interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  requester_id: string;
  requester_role: RequesterRole;
  assignee_id: string | null;
  initiator_role: "requester" | "admin";
  related_order_id: string | null;
  related_product_id: string | null;
  related_payout_id: string | null;
  source: string;
  sla_due_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  csat_score: number | null;
  csat_comment: string | null;
  csat_at: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface TicketAttachment {
  id: string;
  url: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
}

export interface TicketMessage {
  id: string;
  author_id: string | null;
  author_role: "customer" | "seller" | "admin" | "system";
  body: string;
  is_internal: boolean;
  created_at: string;
  attachments: TicketAttachment[];
}

export interface TicketEvent {
  id: string;
  actor_role: string;
  event_type: string;
  from_value: string | null;
  to_value: string | null;
  created_at: string;
}

export interface TicketDetail {
  ticket: Ticket;
  messages: TicketMessage[];
  events: TicketEvent[];
}

export interface PageResp<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  body_md?: string;
  audience: "customer" | "seller" | "all";
  category: string | null;
  published: boolean;
  views: number;
  helpful_yes: number;
  helpful_no: number;
  created_at: string;
  updated_at: string;
}

export interface Macro {
  id: string;
  title: string;
  body: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportSummary {
  openTickets: number;
  slaBreached: number;
  resolvedLast24h: number;
  csat: { average: number | null; sampleSize: number };
}

/* ─── Categories (UI-side dropdowns) ───────────────────────── */
export const CUSTOMER_CATEGORIES = [
  "Order issue",
  "Refund/return",
  "Payment",
  "Account",
  "Other",
] as const;

export const SELLER_CATEGORIES = [
  "Payouts",
  "Listing rejected",
  "KYC",
  "Inventory issue",
  "Commission dispute",
  "Account",
  "Other",
] as const;

/* ─── Customer / seller endpoints ──────────────────────────── */
export const supportApi = {
  // Tickets
  createTicket(body: {
    subject: string;
    initial_message: string;
    category: string;
    priority?: TicketPriority;
    related_order_id?: string;
    related_product_id?: string;
    related_payout_id?: string;
    source?: string;
    context?: Record<string, unknown>;
  }) {
    return api.post<Ticket>("/api/support/tickets", body);
  },

  listMyTickets(params: { page?: number; limit?: number; status?: TicketStatus | "all" } = {}) {
    const q = new URLSearchParams();
    if (params.page)   q.set("page", String(params.page));
    if (params.limit)  q.set("limit", String(params.limit));
    if (params.status) q.set("status", params.status);
    const qs = q.toString();
    return api.get<PageResp<Ticket>>(`/api/support/tickets${qs ? `?${qs}` : ""}`);
  },

  getTicket(id: string) {
    return api.get<TicketDetail>(`/api/support/tickets/${id}`);
  },

  postMessage(id: string, body: { body: string; is_internal?: boolean; attachments?: TicketAttachment[] }) {
    return api.post<{ id: string }>(`/api/support/tickets/${id}/messages`, body);
  },

  changeStatus(id: string, status: TicketStatus, reason?: string) {
    return api.patch<{ success: boolean }>(`/api/support/tickets/${id}/status`, { status, reason });
  },

  rate(id: string, score: number, comment?: string) {
    return api.post<{ success: boolean }>(`/api/support/tickets/${id}/rate`, { score, comment });
  },

  // Articles (public)
  listArticles(params: { audience?: "customer" | "seller" | "all"; category?: string; q?: string; page?: number; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.audience) q.set("audience", params.audience);
    if (params.category) q.set("category", params.category);
    if (params.q)        q.set("q", params.q);
    if (params.page)     q.set("page", String(params.page));
    if (params.limit)    q.set("limit", String(params.limit));
    const qs = q.toString();
    return api.get<PageResp<Article>>(`/api/support/articles${qs ? `?${qs}` : ""}`);
  },

  getArticle(slug: string) {
    return api.get<Article>(`/api/support/articles/${slug}`);
  },

  feedbackArticle(slug: string, helpful: boolean) {
    return api.post<{ success: boolean }>(`/api/support/articles/${slug}/feedback`, { helpful });
  },
};

/* ─── Admin endpoints ──────────────────────────────────────── */
export const supportAdminApi = {
  listTickets(params: {
    status?: TicketStatus | "all";
    priority?: TicketPriority;
    category?: string;
    assignee_id?: string;
    requester_role?: RequesterRole;
    sla_breached?: boolean;
    q?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const q = new URLSearchParams();
    if (params.status)         q.set("status", params.status);
    if (params.priority)       q.set("priority", params.priority);
    if (params.category)       q.set("category", params.category);
    if (params.assignee_id)    q.set("assignee_id", params.assignee_id);
    if (params.requester_role) q.set("requester_role", params.requester_role);
    if (params.sla_breached)   q.set("sla_breached", "true");
    if (params.q)              q.set("q", params.q);
    if (params.page)           q.set("page", String(params.page));
    if (params.limit)          q.set("limit", String(params.limit));
    const qs = q.toString();
    return api.get<PageResp<Ticket>>(`/api/admin/support/tickets${qs ? `?${qs}` : ""}`);
  },

  patchTicket(id: string, patch: {
    assignee_id?: string | null;
    priority?: TicketPriority;
    category?: string;
    status?: TicketStatus;
  }) {
    return api.patch<Ticket>(`/api/admin/support/tickets/${id}`, patch);
  },

  internalNote(id: string, body: string) {
    return api.post<{ id: string }>(`/api/admin/support/tickets/${id}/internal-note`, { body });
  },

  deleteTicket(id: string) {
    return api.delete<{ success: boolean }>(`/api/admin/support/tickets/${id}`);
  },

  createAdminTicket(body: {
    recipient_id: string;
    recipient_role: RequesterRole;
    subject: string;
    body: string;
    category: string;
    priority?: TicketPriority;
  }) {
    return api.post<Ticket>(`/api/admin/support/tickets`, body);
  },

  // Macros
  listMacros() {
    return api.get<{ data: Macro[] }>(`/api/admin/support/macros`);
  },
  createMacro(body: { title: string; body: string; category?: string }) {
    return api.post<Macro>(`/api/admin/support/macros`, body);
  },
  deleteMacro(id: string) {
    return api.delete<{ success: boolean }>(`/api/admin/support/macros/${id}`);
  },

  // Reports
  reportSummary() {
    return api.get<ReportSummary>(`/api/admin/support/reports/summary`);
  },

  // Articles (admin)
  upsertArticle(body: {
    slug: string;
    title: string;
    body_md: string;
    audience?: "customer" | "seller" | "all";
    category?: string;
    published?: boolean;
  }) {
    return api.post<Article>(`/api/admin/support/articles`, body);
  },
  deleteArticle(slug: string) {
    return api.delete<{ success: boolean }>(`/api/admin/support/articles/${slug}`);
  },
};

/* ─── UI helpers ───────────────────────────────────────────── */
export function statusLabel(s: TicketStatus): string {
  switch (s) {
    case "open":         return "Open";
    case "pending_user": return "Awaiting your reply";
    case "in_progress":  return "In progress";
    case "resolved":     return "Resolved";
    case "closed":       return "Closed";
    case "reopened":     return "Reopened";
  }
}

export function priorityLabel(p: TicketPriority): string {
  return p[0].toUpperCase() + p.slice(1);
}

export function timeAgo(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
