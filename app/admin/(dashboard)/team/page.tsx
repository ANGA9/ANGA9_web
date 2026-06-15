"use client";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Mail,
  Loader2,
  Crown,
  Shield,
  HeadphonesIcon,
  ChevronDown,
  UserPlus,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

type TeamMember = {
  id: string;
  email: string;
  granted_role: "customer" | "admin";
  admin_level: "super_admin" | "admin" | null;
  is_support: boolean;
  created_at: string;
};

type AdminUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  admin_level: "super_admin" | "admin";
  is_support?: boolean;
  granted_role: "admin";
};

type CombinedMember = {
  source: "allowlist" | "users";
  allowlistId?: string;
  userId?: string;
  email: string;
  role: "super_admin" | "admin" | "support";
  is_support: boolean;
  name?: string;
  created_at?: string;
};

export default function TeamManagementPage() {
  const [members, setMembers] = useState<CombinedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"super_admin" | "admin" | "support">("support");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allowlistRes, adminsRes, meRes] = await Promise.all([
        api.get<{ data: TeamMember[] }>("/api/admin/team", { silent: true }).catch(() => ({ data: [] as TeamMember[] })),
        api.get<{ data: AdminUser[] }>("/api/admin/users?role=admin", { silent: true }).catch(() => ({ data: [] as AdminUser[] })),
        api.get<{ user: { id: string } }>("/api/auth/me", { silent: true }).catch(() => null),
      ]);

      const combined: CombinedMember[] = [];
      const seenEmails = new Set<string>();

      // 1. Add all admin users from the users table (these are real registered users)
      const adminUsers = adminsRes?.data || [];
      const myId = meRes?.user?.id;

      for (const admin of adminUsers) {
        if (!admin.email) continue;
        const emailLower = admin.email.toLowerCase();
        seenEmails.add(emailLower);

        // Check if this admin also has an allowlist entry
        const allowlistEntry = (allowlistRes?.data || []).find(
          (a) => a.email.toLowerCase() === emailLower
        );

        combined.push({
          source: "users",
          userId: admin.id,
          allowlistId: allowlistEntry?.id,
          email: admin.email,
          role: admin.admin_level,
          is_support: allowlistEntry?.is_support ?? false,
          name: admin.full_name || undefined,
          created_at: allowlistEntry?.created_at,
        });
      }

      // 2. Add allowlist entries that aren't in the admin users (support-only or pending)
      for (const entry of allowlistRes?.data || []) {
        const emailLower = entry.email.toLowerCase();
        if (seenEmails.has(emailLower)) continue;
        seenEmails.add(emailLower);

        let role: "super_admin" | "admin" | "support" = "support";
        if (entry.granted_role === "admin" && entry.admin_level) {
          role = entry.admin_level;
        }

        combined.push({
          source: "allowlist",
          allowlistId: entry.id,
          email: entry.email,
          role: entry.is_support && entry.granted_role !== "admin" ? "support" : role,
          is_support: entry.is_support,
          created_at: entry.created_at,
        });
      }

      setMembers(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      const payload: any = { email: newEmail };

      if (newRole === "super_admin") {
        payload.granted_role = "admin";
        payload.admin_level = "super_admin";
        payload.is_support = false;
      } else if (newRole === "admin") {
        payload.granted_role = "admin";
        payload.admin_level = "admin";
        payload.is_support = false;
      } else {
        payload.granted_role = "customer";
        payload.admin_level = null;
        payload.is_support = true;
      }

      await api.post("/api/admin/team", payload);
      setNewEmail("");
      setNewRole("support");
      setShowAddForm(false);
      toast.success("Team member added successfully");
      await fetchAll();
    } catch (err) {
      toast.error("Failed to add team member. They may already exist.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (member: CombinedMember) => {
    if (!confirm(`Remove ${member.email} from the team? This will revoke their access immediately.`)) return;
    try {
      if (member.allowlistId) {
        await api.delete(`/api/admin/team/${member.allowlistId}`);
      }
      toast.success("Team member removed");
      await fetchAll();
    } catch (err) {
      toast.error("Failed to remove team member.");
    }
  };

  const handleRoleChange = async (member: CombinedMember, newRole: string) => {
    setUpdatingId(member.email);
    try {
      // If user exists in users table, update admin_level directly
      if (member.userId && (newRole === "super_admin" || newRole === "admin")) {
        await api.patch(`/api/admin/users/${member.userId}/admin-level`, {
          admin_level: newRole,
        });
      }

      // If there's an allowlist entry, update it too
      if (member.allowlistId) {
        await api.delete(`/api/admin/team/${member.allowlistId}`);
        const payload: any = { email: member.email };
        if (newRole === "super_admin") {
          payload.granted_role = "admin";
          payload.admin_level = "super_admin";
          payload.is_support = member.is_support;
        } else if (newRole === "admin") {
          payload.granted_role = "admin";
          payload.admin_level = "admin";
          payload.is_support = member.is_support;
        } else {
          payload.granted_role = "customer";
          payload.admin_level = null;
          payload.is_support = true;
        }
        await api.post("/api/admin/team", payload);
      }

      toast.success(`Role updated to ${newRole.replace("_", " ")}`);
      await fetchAll();
    } catch (err) {
      toast.error("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleSupport = async (member: CombinedMember) => {
    setUpdatingId(member.email);
    try {
      const newSupportState = !member.is_support;

      // Delete and re-add with updated is_support
      if (member.allowlistId) {
        await api.delete(`/api/admin/team/${member.allowlistId}`);
      }

      const payload: any = { email: member.email, is_support: newSupportState };
      if (member.role === "super_admin" || member.role === "admin") {
        payload.granted_role = "admin";
        payload.admin_level = member.role;
      } else {
        payload.granted_role = "customer";
        payload.admin_level = null;
      }
      await api.post("/api/admin/team", payload);

      toast.success(newSupportState ? "Support access granted" : "Support access revoked");
      await fetchAll();
    } catch (err) {
      toast.error("Failed to toggle support access");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Crown className="w-3.5 h-3.5" />;
      case "admin":
        return <Shield className="w-3.5 h-3.5" />;
      case "support":
        return <HeadphonesIcon className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "admin":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "support":
        return "bg-teal-50 text-teal-700 border-teal-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "support":
        return "Support";
      default:
        return role;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              Access Control
            </span>
          </div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            Team Management
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Manage admin, super admin, and support staff roles across the platform.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 h-12 px-6 rounded-xl bg-[#8B5CF6] text-white text-[14px] font-bold hover:bg-[#7C3AED] transition-all shadow-sm hover:shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-[#8B5CF6]/5 group-hover:scale-125 transition-transform duration-700" />

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">
                New Team Member
              </h2>
              <p className="text-[13px] font-medium text-gray-500">
                Add an email and assign a role. They will be granted access upon their next login.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end relative z-10">
            <div className="md:col-span-1 space-y-2">
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all shadow-inner"
                  placeholder="name@anga9.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                Assign Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["super_admin", "admin", "support"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setNewRole(role)}
                    className={`h-12 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 border-2 transition-all ${
                      newRole === role
                        ? role === "super_admin"
                          ? "bg-purple-50 text-purple-700 border-purple-400 ring-2 ring-purple-200"
                          : role === "admin"
                          ? "bg-blue-50 text-blue-700 border-blue-400 ring-2 ring-blue-200"
                          : "bg-teal-50 text-teal-700 border-teal-400 ring-2 ring-teal-200"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {getRoleIcon(role)}
                    {getRoleLabel(role)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={adding || !newEmail.trim()}
                className="flex-1 h-12 px-6 bg-gray-900 text-white rounded-2xl text-[14px] font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {adding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="h-12 px-5 bg-gray-100 text-gray-600 rounded-2xl text-[14px] font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Member
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Support Access
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Added
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#8B5CF6]" />
                    <p className="text-[14px] text-gray-500 font-medium">
                      Loading team...
                    </p>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-[15px] font-bold text-gray-900 mb-1">
                      No team members yet
                    </p>
                    <p className="text-[13px] text-gray-500">
                      Click "Add Team Member" to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.email}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* Member */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[14px] shadow-sm ${
                            m.role === "super_admin"
                              ? "bg-gradient-to-br from-purple-500 to-purple-700"
                              : m.role === "admin"
                              ? "bg-gradient-to-br from-blue-500 to-blue-700"
                              : "bg-gradient-to-br from-teal-500 to-teal-700"
                          }`}
                        >
                          {m.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-gray-900">
                            {m.name || m.email.split("@")[0]}
                          </p>
                          <p className="text-[12px] text-gray-500 font-medium">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Selector */}
                    <td className="py-4 px-6">
                      <div className="relative inline-block">
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m, e.target.value)}
                          disabled={updatingId === m.email}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-[12px] font-bold border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 ${getRoleBadge(
                            m.role
                          )} ${
                            updatingId === m.email
                              ? "opacity-50 cursor-wait"
                              : ""
                          }`}
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="support">Support</option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                      </div>
                    </td>

                    {/* Support Toggle */}
                    <td className="py-4 px-6">
                      {m.role === "admin" || m.role === "super_admin" ? (
                        <button
                          onClick={() => handleToggleSupport(m)}
                          disabled={updatingId === m.email}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${
                            m.is_support
                              ? "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100"
                              : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-600"
                          } ${
                            updatingId === m.email
                              ? "opacity-50 cursor-wait"
                              : ""
                          }`}
                        >
                          <HeadphonesIcon className="w-3.5 h-3.5" />
                          {m.is_support ? "Enabled" : "Disabled"}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-[12px] font-bold border border-teal-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Inherent
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-[13px] text-gray-500 font-medium">
                      {m.created_at
                        ? format(new Date(m.created_at), "MMM d, yyyy")
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleRemove(m)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        title={`Remove ${m.email}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
