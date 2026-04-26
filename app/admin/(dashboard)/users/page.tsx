"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Users, Shield, Ban, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import toast from "react-hot-toast";

interface User {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role: string;
  status?: string;
  created_at: string;
}

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#F3EEFF", text: "#6C47FF" },
  seller: { bg: "#EAF2FF", text: "#1A6FD4" },
  customer: { bg: "#F0FDF4", text: "#22C55E" },
};

const ROLES = ["customer", "seller", "admin"];
const FILTERS = ["All", "customer", "seller", "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("All");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const limit = 15;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (roleFilter !== "All") params.set("role", roleFilter);
      const res = await api.get<{ data: User[]; total: number }>(`/api/admin/users?${params}`, { silent: true });
      setUsers(res?.data || []);
      setTotal(res?.total || 0);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const totalPages = Math.ceil(total / limit);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
    setActionLoading(null);
  };

  const handleSuspend = async (userId: string) => {
    const reason = prompt("Reason for suspension:");
    if (!reason) return;
    setActionLoading(userId);
    try {
      await api.patch(`/api/admin/users/${userId}/status`, { status: "suspended", suspended_reason: reason });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "suspended" } : u)));
      toast.success("User suspended");
    } catch {
      toast.error("Failed to suspend user");
    }
    setActionLoading(null);
  };

  const handleActivate = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.patch(`/api/admin/users/${userId}/status`, { status: "active" });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "active" } : u)));
      toast.success("User activated");
    } catch {
      toast.error("Failed to activate user");
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6 xl:p-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-anga-text">User Management</h1>
          <p className="text-sm text-anga-text-secondary">{total} user{total !== 1 ? "s" : ""} registered</p>
        </div>

        <div className="flex gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setRoleFilter(f); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize"
              style={{
                background: roleFilter === f ? "#1A6FD4" : "white",
                color: roleFilter === f ? "white" : "#4B5563",
                borderColor: roleFilter === f ? "#1A6FD4" : "#E8EEF4",
              }}
            >
              {f === "All" ? "All Users" : f + "s"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl border border-anga-border p-12 text-center">
            <Users className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
            <h2 className="text-base font-bold text-anga-text mb-2">No Users Found</h2>
            <p className="text-sm text-anga-text-secondary">No users match the selected filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-anga-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-anga-border bg-[#F8FBFF]">
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Contact</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Joined</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const rb = ROLE_BADGE[u.role] || ROLE_BADGE.customer;
                    const isSuspended = u.status === "suspended";
                    return (
                      <tr key={u.id} className="border-b border-anga-border last:border-0 hover:bg-[#F8FBFF] transition-colors">
                        <td className="px-4 py-3 font-medium text-anga-text">{u.full_name || "—"}</td>
                        <td className="px-4 py-3 text-[#4B5563]">
                          <div>{u.email || "—"}</div>
                          {u.phone && <div className="text-xs text-[#9CA3AF]">{u.phone}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={actionLoading === u.id}
                            className="rounded-lg border px-2 py-1 text-xs font-semibold capitalize"
                            style={{ background: rb.bg, color: rb.text, borderColor: rb.bg }}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#EF4444]">
                              <Ban className="w-3 h-3" /> Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#22C55E]">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#9CA3AF]">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {isSuspended ? (
                              <button
                                onClick={() => handleActivate(u.id)}
                                disabled={actionLoading === u.id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#22C55E] text-white text-xs font-semibold hover:bg-[#16A34A] disabled:opacity-50"
                              >
                                {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspend(u.id)}
                                disabled={actionLoading === u.id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                                style={{ borderColor: "#FECACA", color: "#EF4444" }}
                              >
                                {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />} Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-anga-border">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40" style={{ borderColor: "#E8EEF4" }}>
                  Prev
                </button>
                <span className="text-sm text-[#4B5563]">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40" style={{ borderColor: "#E8EEF4" }}>
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
