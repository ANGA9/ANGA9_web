"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Users, Shield, Ban, CheckCircle2 } from "lucide-react";
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

const ROLE_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  admin: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  seller: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  customer: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">User Directory</h1>
          <p className="text-[15px] text-gray-500 font-medium">{total} total registered account{total !== 1 ? "s" : ""}</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm self-start md:self-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setRoleFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-[14px] font-bold transition-all capitalize ${
                roleFilter === f 
                  ? "bg-[#8B5CF6] text-white shadow-md shadow-purple-500/20" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {f === "All" ? "All Users" : f + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Users Found</h2>
          <p className="text-[15px] text-gray-500 font-medium">No users match the selected role filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => {
                  const rb = ROLE_BADGE[u.role] || ROLE_BADGE.customer;
                  const isSuspended = u.status === "suspended";
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold shadow-sm">
                            {(u.full_name || u.email || "?")[0].toUpperCase()}
                          </div>
                          <span className="font-bold text-[14px] text-gray-900">{u.full_name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium text-gray-900">{u.email || "—"}</span>
                          {u.phone && <span className="text-[12px] font-medium text-gray-500 mt-0.5">{u.phone}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={actionLoading === u.id}
                          className={`rounded-xl border px-3 py-1.5 text-[12px] font-bold capitalize outline-none cursor-pointer ${rb.bg} ${rb.text} ${rb.border} focus:ring-2 focus:ring-purple-500/20 transition-all`}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r} className="bg-white text-gray-900">{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <Ban className="w-3.5 h-3.5" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-500">
                        {new Date(u.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isSuspended ? (
                            <button
                              onClick={() => handleActivate(u.id)}
                              disabled={actionLoading === u.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-[13px] font-bold hover:bg-green-600 transition-all shadow-sm disabled:opacity-50"
                            >
                              {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(u.id)}
                              disabled={actionLoading === u.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 text-[13px] font-bold hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
                            >
                              {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />} Suspend
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <span className="text-[13px] font-medium text-gray-500">
                Showing page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage((p) => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages} 
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
