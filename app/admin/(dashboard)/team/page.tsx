"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Plus, Trash2, Mail, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";

type TeamMember = {
  id: string;
  email: string;
  granted_role: "customer" | "admin";
  admin_level: "super_admin" | "admin" | null;
  is_support: boolean;
  created_at: string;
};

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"customer" | "admin">("customer");
  const [newAdminLevel, setNewAdminLevel] = useState<"super_admin" | "admin" | "">("");
  const [newIsSupport, setNewIsSupport] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get<{ data: TeamMember[] }>("/api/admin/team");
      setMembers(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post("/api/admin/team", {
        email: newEmail,
        granted_role: newRole,
        admin_level: newRole === "admin" ? newAdminLevel : null,
        is_support: newIsSupport,
      });
      setNewEmail("");
      setNewRole("customer");
      setNewAdminLevel("");
      setNewIsSupport(false);
      await fetchMembers();
    } catch (err) {
      alert("Failed to add team member. They may already exist.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure? This will instantly revoke their access.")) return;
    try {
      await api.delete(`/api/admin/team/${id}`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to remove team member.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Team Management</h1>
        <p className="text-gray-500 mt-2 font-medium">
          Manage staff access. Users listed here will have their roles automatically upgraded upon login.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-400" />
            Add Team Member
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                  placeholder="agent@anga9.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">System Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "customer" | "admin")}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
              >
                <option value="customer">None (Customer)</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {newRole === "admin" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Admin Level</label>
                <select
                  required
                  value={newAdminLevel}
                  onChange={(e) => setNewAdminLevel(e.target.value as "super_admin" | "admin")}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                >
                  <option value="" disabled>Select level...</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 h-[42px] px-2">
              <input
                type="checkbox"
                id="isSupport"
                checked={newIsSupport}
                onChange={(e) => setNewIsSupport(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
              />
              <label htmlFor="isSupport" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                Support Portal Access
              </label>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="h-[42px] px-6 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Member"}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Role</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Support Agent</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Added Date</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                    Loading team members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                    No team members found in the allowlist.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{m.email}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          m.granted_role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {m.granted_role.toUpperCase()}
                        </span>
                        {m.admin_level && (
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                            {m.admin_level.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {m.is_support ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                          <ShieldCheck className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs font-bold">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                      {format(new Date(m.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleRemove(m.id)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove Member"
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
