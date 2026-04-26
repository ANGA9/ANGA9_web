"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  Building2,
  Settings,
  CheckCircle2,
  Pencil,
  ArrowLeft,
  ChevronRight,
  Bell,
  Headset,
  Store,
  FileText,
  HelpCircle,
  LogOut,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Address {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const EMPTY_FORM: Omit<Address, "id" | "is_default"> = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

const navItems = [
  { label: "Profile", icon: User },
  { label: "My Orders", icon: Package },
  { label: "Addresses", icon: MapPin },
  { label: "Business Info", icon: Building2 },
  { label: "Settings", icon: Settings },
];

function MenuItem({
  icon: Icon,
  label,
}: {
  icon: any;
  label: string;
  isLast?: boolean;
}) {
  return (
    <button className="flex items-center w-full bg-white px-4 py-3.5 hover:bg-gray-50 transition-colors relative">
      <Icon className="w-[22px] h-[22px] text-black" />
      <span className="ml-4 text-base font-normal text-gray-800 flex-1 text-left">
        {label}
      </span>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

const inputCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10";

export default function CustomerAccountPage() {
  const [activeNav, setActiveNav] = useState("Profile");
  const { user, dbUser, loading, logout } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const accentBlue = "#2874f0";

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.get<{ addresses?: Address[]; data?: Address[] }>("/api/users/addresses", { silent: true });
      setAddresses(res?.addresses || res?.data || []);
    } catch { /* ignore */ }
    setLoadingAddresses(false);
  };

  useEffect(() => {
    if (dbUser) fetchAddresses();
  }, [dbUser]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (addr: Address) => {
    setEditingId(addr.id);
    setForm({ label: addr.label || "", line1: addr.line1, line2: addr.line2 || "", city: addr.city, state: addr.state, pincode: addr.pincode });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.line1 || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill required fields");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/api/users/addresses/${editingId}`, form);
        toast.success("Address updated");
      } else {
        await api.post("/api/users/addresses", form);
        toast.success("Address added");
      }
      setShowForm(false);
      setEditingId(null);
      fetchAddresses();
    } catch {
      toast.error("Failed to save address");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await api.delete(`/api/users/addresses/${id}`);
      toast.success("Address deleted");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/api/users/addresses/${id}/default`, {});
      toast.success("Default address updated");
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      );
    } catch {
      toast.error("Failed to set default");
    }
  };

  const displayName = dbUser?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || dbUser?.email || "—";
  const displayPhone = user?.phone || dbUser?.phone || "—";
  const initials = getInitials(dbUser?.full_name, user?.email);

  const profileFields = [
    { label: "Full Name", value: dbUser?.full_name || "—" },
    { label: "Phone", value: displayPhone },
    { label: "Email", value: displayEmail },
    { label: "GSTIN", value: dbUser?.gstin || "—" },
    { label: "Company Name", value: dbUser?.company_name || "—" },
  ];

  const isLoggedIn = !!user;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  const addressFormUI = (
    <div className="rounded-[14px] border p-6" style={{ background: t.bgCard, borderColor: t.border }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: t.textPrimary }}>
          {editingId ? "Edit Address" : "Add New Address"}
        </h2>
        <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5" style={{ color: t.textMuted }} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Label</label>
          <input className={inputCls} placeholder="Home, Office..." value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Pincode *</label>
          <input className={inputCls} placeholder="560001" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Address Line 1 *</label>
          <input className={inputCls} placeholder="House/Flat No, Street" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Address Line 2</label>
          <input className={inputCls} placeholder="Landmark, Area" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>City *</label>
          <input className={inputCls} placeholder="Bangalore" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>State *</label>
          <input className={inputCls} placeholder="Karnataka" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg border text-sm font-semibold" style={{ borderColor: t.border, color: t.textSecondary }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: t.bluePrimary }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
          {editingId ? "Update" : "Save"} Address
        </button>
      </div>
    </div>
  );

  const addressBookUI = (
    <div className="rounded-[14px] border p-6" style={{ background: t.bgCard, borderColor: t.border }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: t.textPrimary }}>Address Book</h2>
        <button onClick={openAddForm} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: t.bluePrimary }}>
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {loadingAddresses ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-10 h-10 mx-auto mb-2" style={{ color: t.border }} />
          <p className="text-sm mb-3" style={{ color: t.textSecondary }}>No addresses added yet</p>
          <button onClick={openAddForm} className="text-sm font-semibold" style={{ color: t.bluePrimary }}>
            + Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl border p-4 relative" style={{ borderColor: addr.is_default ? t.bluePrimary : t.border }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold" style={{ color: t.textPrimary }}>
                  {addr.label || "Address"}
                </span>
                {addr.is_default && (
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: t.bgBlueTint, color: t.bluePrimary }}>
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: t.textSecondary }}>{addr.line1}</p>
              {addr.line2 && <p className="text-sm" style={{ color: t.textSecondary }}>{addr.line2}</p>}
              <p className="text-sm" style={{ color: t.textSecondary }}>
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              <div className="flex gap-3 mt-3">
                <button onClick={() => openEditForm(addr)} className="text-xs font-medium hover:underline" style={{ color: t.bluePrimary }}>
                  Edit
                </button>
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-xs font-medium hover:underline" style={{ color: t.textSecondary }}>
                    Set Default
                  </button>
                )}
                {!addr.is_default && (
                  <button onClick={() => handleDelete(addr.id)} className="text-xs font-medium hover:underline" style={{ color: t.outOfStock }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full relative">
      {/* ══════════ MOBILE VIEW ══════════ */}
      <div
        className="block md:hidden min-h-screen bg-[#f1f3f6] pb-[80px]"
        style={{ width: "calc(100% + 48px)", marginLeft: "-24px" }}
      >
        <div className="w-full bg-[#f1f3f6] min-h-screen relative shadow-sm">
          <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
            <Link href="/" className="mr-4">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 tracking-wide">Account</h1>
          </header>

          {!isLoggedIn ? (
            <div className="bg-white px-4 py-5 flex items-center justify-between mb-2">
              <span className="text-base font-medium text-gray-900 w-2/3 leading-tight">
                Log in for exclusive offers
              </span>
              <Link
                href="/login"
                className="flex items-center justify-center rounded-[4px] px-6 py-2.5 text-sm font-medium transition-colors"
                style={{ background: accentBlue, color: "#FFFFFF" }}
              >
                Log In
              </Link>
            </div>
          ) : (
            <div className="bg-white px-4 py-4 flex items-center gap-3 mb-2">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: accentBlue }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-sm text-gray-500 truncate">{displayEmail}</p>
              </div>
            </div>
          )}

          <div className="bg-white mb-2 pb-2">
            <div className="px-4 py-4 pt-5">
              <h2 className="text-base font-bold text-gray-900">Account Settings</h2>
            </div>
            <div className="flex flex-col">
              <MenuItem icon={Bell} label="Notification Settings" />
              <MenuItem icon={Headset} label="Help Center" isLast />
            </div>
          </div>

          <div className="bg-white mb-2 pb-2">
            <div className="px-4 py-4 pt-5">
              <h2 className="text-base font-bold text-gray-900">Earn with ANGA</h2>
            </div>
            <div className="flex flex-col">
              <MenuItem icon={Store} label="Sell on ANGA" isLast />
            </div>
          </div>

          <div className="bg-white mb-3 pb-2 shadow-sm">
            <div className="px-4 py-4 pt-5">
              <h2 className="text-base font-bold text-gray-900">Feedback & Information</h2>
            </div>
            <div className="flex flex-col">
              <MenuItem icon={FileText} label="Terms, Policies and Licenses" />
              <MenuItem icon={HelpCircle} label="Browse FAQs" isLast />
            </div>
          </div>

          {isLoggedIn && (
            <div className="px-4 mb-4">
              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ DESKTOP VIEW ══════════ */}
      <div className="hidden md:block mx-auto max-w-[1280px] px-4 sm:px-8 py-6">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-20">
            <User className="w-16 h-16 text-[#D0E3F7] mb-4" />
            <h2 className="text-xl font-semibold mb-2" style={{ color: t.textPrimary }}>
              Sign in to your account
            </h2>
            <p className="text-sm mb-6" style={{ color: t.textSecondary }}>
              Access your orders, addresses, and business profile
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white transition-all hover:shadow-md"
              style={{ background: t.bluePrimary }}
            >
              Log In / Sign Up
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <div
                className="rounded-[14px] border overflow-hidden"
                style={{ background: t.bgCard, borderColor: t.border }}
              >
                {navItems.map((item) => {
                  const isActive = activeNav === item.label;
                  return (
                    <button
                      key={item.label}
                      onClick={() => setActiveNav(item.label)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors",
                        isActive ? "border-l-[3px]" : "border-l-[3px] border-transparent"
                      )}
                      style={{
                        background: isActive ? t.bgBlueTint : "transparent",
                        color: isActive ? t.bluePrimary : t.textSecondary,
                        borderLeftColor: isActive ? t.bluePrimary : "transparent",
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}

                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium border-t transition-colors hover:bg-red-50"
                  style={{ borderColor: t.border, color: "#EF4444" }}
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </div>

            <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
              {/* Profile card - always visible */}
              {(activeNav === "Profile" || activeNav === "Business Info") && (
                <div
                  className="rounded-[14px] border p-6"
                  style={{ background: t.bgCard, borderColor: t.border }}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
                      style={{ background: t.bluePrimary }}
                    >
                      {initials}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-lg font-semibold" style={{ color: t.textPrimary }}>
                        {displayName}
                      </h2>
                      <p className="text-sm mt-0.5" style={{ color: t.textSecondary }}>
                        {displayEmail}
                      </p>

                      {dbUser?.role && (
                        <span
                          className="inline-flex items-center gap-1 mt-2 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: t.bgDelivered, color: t.inStock }}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {dbUser.role === "seller" ? "Verified Seller" : dbUser.role === "admin" ? "Admin" : "Customer"}
                        </span>
                      )}
                    </div>

                    <button
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ background: t.yellowCta, color: t.ctaText }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Profile
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {profileFields.map((field) => (
                      <div key={field.label}>
                        <p className="text-xs mb-0.5" style={{ color: t.textMuted }}>
                          {field.label}
                        </p>
                        <p className="text-sm" style={{ color: t.textPrimary }}>
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* My Orders shortcut */}
              {activeNav === "My Orders" && (
                <div className="rounded-[14px] border p-6 text-center" style={{ background: t.bgCard, borderColor: t.border }}>
                  <Package className="w-10 h-10 mx-auto mb-3" style={{ color: t.bluePrimary }} />
                  <h2 className="text-lg font-semibold mb-2" style={{ color: t.textPrimary }}>My Orders</h2>
                  <p className="text-sm mb-4" style={{ color: t.textSecondary }}>View and manage all your orders</p>
                  <Link href="/orders" className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white" style={{ background: t.bluePrimary }}>
                    View Orders <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Address book */}
              {(activeNav === "Profile" || activeNav === "Addresses") && (
                showForm ? addressFormUI : addressBookUI
              )}

              {/* Settings placeholder */}
              {activeNav === "Settings" && (
                <div className="rounded-[14px] border p-6 text-center" style={{ background: t.bgCard, borderColor: t.border }}>
                  <Settings className="w-10 h-10 mx-auto mb-3" style={{ color: t.textMuted }} />
                  <h2 className="text-lg font-semibold mb-2" style={{ color: t.textPrimary }}>Settings</h2>
                  <p className="text-sm" style={{ color: t.textSecondary }}>Account settings coming soon</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
