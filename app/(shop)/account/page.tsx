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
  FileText,
  HelpCircle,
  LogOut,
  Loader2,
  Plus,
  Trash2,
  X,
  Save,
  Smartphone,
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  badge,
  onClick,
  href,
}: {
  icon: any;
  label: string;
  badge?: string | number;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <>
      <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
        <Icon className="w-[18px] h-[18px] text-gray-700" />
      </div>
      <span className="ml-4 text-[15px] font-semibold text-gray-800 flex-1 text-left">
        {label}
      </span>
      {badge && (
        <span className="mr-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </>
  );

  const className = "flex items-center w-full bg-white px-5 py-4 hover:bg-gray-50 transition-colors relative active:bg-gray-100 group border-b border-gray-50 last:border-b-0";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
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
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const { user, dbUser, loading, logout } = useAuth();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
    if (dbUser) {
      fetchAddresses();
      fetchUnreadNotifications();
    }
  }, [dbUser]);

  const fetchUnreadNotifications = async () => {
    try {
      const params = new URLSearchParams();
      params.set("limit", "1");
      params.set("read", "false");
      const res = await api.get<{ total: number }>(`/api/notifications?${params.toString()}`, { silent: true });
      if (res && typeof res.total === 'number') {
        setUnreadNotificationsCount(res.total);
      }
    } catch { /* ignore */ }
  };

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

  // Common UI components used in both Mobile and Desktop views
  const addressFormUI = (
    <div className="rounded-xl border p-6 bg-white" style={{ borderColor: t.border }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: t.textPrimary }}>
          {editingId ? "Edit Address" : "Add New Address"}
        </h2>
        <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5" style={{ color: t.textMuted }} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Label</label>
          <input className={inputCls} placeholder="Home, Office..." value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Pincode *</label>
          <input className={inputCls} placeholder="560001" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Address Line 1 *</label>
          <input className={inputCls} placeholder="House/Flat No, Street" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Address Line 2</label>
          <input className={inputCls} placeholder="Landmark, Area" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">City *</label>
          <input className={inputCls} placeholder="Bangalore" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">State *</label>
          <input className={inputCls} placeholder="Karnataka" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border text-[14px] font-bold active:scale-95 transition-all flex-1 sm:flex-none" style={{ borderColor: t.border, color: t.textSecondary }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-xl text-[14px] font-bold text-white disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none" style={{ background: t.bluePrimary }}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {editingId ? "Update Address" : "Save Address"}
        </button>
      </div>
    </div>
  );

  const addressBookUI = (
    <div className="rounded-xl border p-6 bg-white" style={{ borderColor: t.border }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50">
            <MapPin className="w-5 h-5 text-[#1A6FD4]" />
          </div>
          <h2 className="text-[20px] font-black text-gray-900 tracking-tight">Address Book</h2>
        </div>
        <button onClick={openAddForm} className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[13px] sm:text-[14px] font-bold text-[#1A6FD4] bg-blue-50 hover:bg-blue-100 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {loadingAddresses ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-[16px] font-bold text-gray-700 mb-1">No addresses saved</p>
          <p className="text-[14px] text-gray-500 mb-6">Add an address for quick checkout</p>
          <button onClick={openAddForm} className="px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all active:scale-95" style={{ background: t.bluePrimary }}>
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((addr) => (
           <div key={addr.id} className="group rounded-xl border p-5 relative transition-all hover:shadow-md bg-white flex flex-col" style={{ borderColor: addr.is_default ? t.bluePrimary : t.border }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[16px] font-black text-gray-900">
                  {addr.label || "Address"}
                </span>
                {addr.is_default && (
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#1A6FD4]">
                    Default
                  </span>
                )}
              </div>
              <div className="space-y-1 mb-6 flex-1">
                <p className="text-[14px] text-gray-600 leading-snug">{addr.line1}</p>
                {addr.line2 && <p className="text-[14px] text-gray-600 leading-snug">{addr.line2}</p>}
                <p className="text-[14px] font-medium text-gray-800 pt-1">
                  {addr.city}, {addr.state} {addr.pincode}
                </p>
              </div>
              <div className="flex gap-4 pt-3 border-t border-gray-100 mt-auto">
                <button onClick={() => openEditForm(addr)} className="text-[13px] font-bold text-[#1A6FD4] hover:underline">
                  Edit
                </button>
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-[13px] font-bold text-gray-500 hover:underline">
                    Make Default
                  </button>
                )}
                {!addr.is_default && (
                  <button onClick={() => handleDelete(addr.id)} className="text-[13px] font-bold text-red-500 hover:underline ml-auto">
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

  const profileUI = (
    <div className="rounded-xl border p-4 sm:p-6 bg-white" style={{ borderColor: t.border }}>
      <div className="flex items-start gap-5">
        <div
          className="flex h-[70px] w-[70px] sm:h-[80px] sm:w-[80px] shrink-0 items-center justify-center rounded-full text-[24px] sm:text-[28px] font-black text-white shadow-inner"
          style={{ background: "linear-gradient(135deg, #2874f0 0%, #1A6FD4 100%)" }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-[20px] sm:text-[22px] font-black tracking-tight truncate" style={{ color: t.textPrimary }}>
            {displayName}
          </h2>
          <p className="text-[14px] sm:text-[15px] font-medium mt-0.5 truncate" style={{ color: t.textSecondary }}>
            {displayEmail}
          </p>

          {dbUser?.role && (
            <span
              className="inline-flex items-center gap-1.5 mt-3 rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm border border-gray-100"
              style={{ 
                background: dbUser.role === "customer" ? "#F3F4F6" : t.bgDelivered, 
                color: dbUser.role === "customer" ? "#6B7280" : t.inStock 
              }}
            >
              {dbUser.role !== "customer" && <CheckCircle2 className="h-3 w-3" />}
              {dbUser.role === "seller" ? "Verified Seller" : dbUser.role === "admin" ? "Admin" : "Verified Customer"}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="hidden sm:inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-bold transition-all hover:bg-gray-50 border shadow-sm active:scale-95"
          style={{ borderColor: t.border, color: t.textPrimary }}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="mt-4 sm:hidden flex">
        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-bold transition-all bg-gray-50 border shadow-sm active:scale-95"
          style={{ borderColor: t.border, color: t.textPrimary }}
        >
          <Pencil className="h-4 w-4" />
          Edit Profile
        </button>
      </div>

      {isEditingProfile ? (
        <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Full Name</label>
               <input className={inputCls} defaultValue={dbUser?.full_name || ""} />
             </div>
             <div>
               <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Phone</label>
               <input className={inputCls} defaultValue={displayPhone} />
             </div>
             <div className="sm:col-span-2">
               <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Company Name</label>
               <input className={inputCls} defaultValue={dbUser?.company_name || ""} />
             </div>
           </div>
           <div className="flex gap-3 mt-6">
              <button onClick={() => setIsEditingProfile(false)} className="px-6 py-2.5 rounded-xl border text-[14px] font-bold flex-1 sm:flex-none" style={{ borderColor: t.border }}>Cancel</button>
              <button onClick={() => { toast.success("Profile update simulated"); setIsEditingProfile(false); }} className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 flex-1 sm:flex-none" style={{ background: t.bluePrimary }}>
                <Save className="w-4 h-4" /> Save Changes
              </button>
           </div>
        </div>
      ) : (
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-6 pt-6 border-t border-gray-100">
          {profileFields.map((field) => (
            <div key={field.label} className="bg-gray-50/50 p-3 rounded-lg border border-gray-50">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textMuted }}>
                {field.label}
              </p>
              <p className="text-[14px] sm:text-[15px] font-semibold" style={{ color: t.textPrimary }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full relative">
      
      {/* ══════════ MOBILE VIEW (<md) ══════════ */}
      <div className="block md:hidden pb-24">
        {mobileMenuOpen ? (
          // --- Main Mobile Menu ---
          <div className="w-full flex flex-col">
            {/* Sticky header matching Cart/Wishlist/Orders */}
            <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
              <Link href="/" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-800" />
              </Link>
              <h1 className="text-[17px] font-medium text-gray-900 leading-tight">
                Account
              </h1>
            </header>

            <div className="px-4 pt-4 flex flex-col gap-3">

            {!isLoggedIn ? (
              <div className="bg-white rounded-xl p-5 flex items-center justify-between shadow-sm border border-gray-200">
                <span className="text-[15px] font-bold text-gray-900 w-2/3 leading-snug">
                  Log in for exclusive wholesale offers
                </span>
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-sm active:scale-95"
                  style={{ background: accentBlue, color: "#FFFFFF" }}
                >
                  Log In
                </Link>
              </div>
            ) : (
              <button 
                onClick={() => { setActiveNav("Profile"); setIsEditingProfile(true); setMobileMenuOpen(false); }}
                className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-200 active:scale-[0.98] transition-all text-left w-full"
              >
                <div
                  className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full text-[22px] font-black text-white shadow-inner relative"
                  style={{ background: "linear-gradient(135deg, #2874f0 0%, #1A6FD4 100%)" }}
                >
                  {initials}
                  {/* Edit pencil overlay */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    <Pencil className="w-2.5 h-2.5 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[18px] font-black text-gray-900 truncate tracking-tight">{displayName}</p>
                  <p className="text-[13px] font-medium text-gray-500 truncate mt-0.5">{displayEmail}</p>
                  <p className="text-[11px] font-semibold mt-1" style={{ color: "#1A6FD4" }}>Edit profile →</p>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-300" />
              </button>
            )}

            {isLoggedIn && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-wider">My Account</h2>
                </div>
                <div className="flex flex-col">
                  <MenuItem icon={Package} label="My Orders" onClick={() => router.push('/orders')} />
                  <MenuItem icon={MapPin} label="Addresses" onClick={() => { setActiveNav("Addresses"); setMobileMenuOpen(false); }} />
                  <MenuItem icon={Building2} label="Business Info" onClick={() => { setActiveNav("Business Info"); setMobileMenuOpen(false); }} />
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Settings & Help</h2>
              </div>
              <div className="flex flex-col">
                <MenuItem icon={Bell} label="Notification Settings" badge={unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined} href="/notifications" />
                <MenuItem icon={Headset} label="Help Center" href="/help" />
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Feedback & Information</h2>
              </div>
              <div className="flex flex-col">
                <MenuItem icon={FileText} label="Terms, Policies and Licenses" href="/terms" />
                <MenuItem icon={HelpCircle} label="Browse FAQs" href="/faq" />
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-wider">More from ANGA9</h2>
              </div>
              <div className="flex flex-col">
                <MenuItem icon={Store} label="Sell on ANGA9" href="/seller/sell-on-anga9" />
                <MenuItem icon={Smartphone} label="Download App" />
              </div>
            </div>

            {isLoggedIn && (
              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-100 bg-red-50 py-4 text-[15px] font-bold text-red-600 transition-all active:scale-[0.98] mt-2 mb-8"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Log Out
              </button>
            )}
            </div>
          </div>
        ) : (
          // --- Mobile Drill-down View ---
          <div className="w-full flex flex-col min-h-screen bg-gray-50">
            <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="mr-3 p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
              >
                <ArrowLeft className="w-6 h-6 text-gray-800" />
              </button>
              <h1 className="text-[17px] font-medium text-gray-900 leading-tight truncate">
                {activeNav}
              </h1>
            </header>
            <div className="p-4">
              {activeNav === "Profile" && profileUI}
              {activeNav === "Business Info" && profileUI}
              {activeNav === "Addresses" && (showForm ? addressFormUI : addressBookUI)}
              {/* Other tabs can be added here if needed */}
            </div>
          </div>
        )}
      </div>

      {/* ══════════ DESKTOP VIEW (md+) ══════════ */}
      <div className="hidden md:block mx-auto max-w-6xl px-6 py-10">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <User className="w-10 h-10 text-[#1A6FD4]" />
            </div>
            <h2 className="text-[24px] font-black tracking-tight mb-2 text-gray-900">
              Sign in to your account
            </h2>
            <p className="text-[15px] mb-8 text-gray-500 text-center max-w-sm">
              Access your wholesale orders, saved addresses, and manage your business profile.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl px-10 py-3.5 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg active:scale-95"
              style={{ background: t.bluePrimary }}
            >
              Log In or Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-start gap-8">
            {/* Sidebar Navigation */}
            <div className="w-72 shrink-0 space-y-1">
              <h3 className="px-4 text-[12px] font-black text-gray-400 uppercase tracking-wider mb-4">Account Menu</h3>
              {navItems.map((item) => {
                const isActive = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveNav(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3.5 text-[15px] font-bold rounded-xl transition-all border",
                      isActive 
                        ? "bg-white text-[#1A6FD4] border-gray-200 shadow-sm" 
                        : "text-gray-600 border-transparent hover:bg-gray-100/50"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-[#1A6FD4]" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}

              <div className="h-px bg-gray-200 my-4 mx-4" />
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-[15px] font-bold rounded-xl transition-colors text-red-500 hover:bg-red-50 border border-transparent"
              >
                <LogOut className="h-5 w-5" />
                Log Out
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {activeNav === "Profile" && profileUI}
              {activeNav === "Business Info" && profileUI}
              {activeNav === "Addresses" && (showForm ? addressFormUI : addressBookUI)}
              
              {activeNav === "My Orders" && (
                <div className="rounded-xl border p-12 text-center bg-white" style={{ borderColor: t.border }}>
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Package className="w-10 h-10 text-[#1A6FD4]" />
                  </div>
                  <h2 className="text-[22px] font-black text-gray-900 tracking-tight mb-2">My Orders</h2>
                  <p className="text-[15px] mb-8 text-gray-500">Track, return, or buy items again</p>
                  <Link href="/orders" className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-[15px] font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md" style={{ background: t.bluePrimary }}>
                    View All Orders <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {activeNav === "Settings" && (
                <div className="rounded-xl border p-12 text-center bg-white" style={{ borderColor: t.border }}>
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Settings className="w-10 h-10 text-gray-400" />
                  </div>
                  <h2 className="text-[22px] font-black text-gray-900 tracking-tight mb-2">Settings</h2>
                  <p className="text-[15px] text-gray-500">Security and notification settings coming soon.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
