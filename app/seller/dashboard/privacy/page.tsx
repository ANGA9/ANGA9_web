"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Smartphone,
  Trash2,
  Loader2,
  AlertTriangle,
  Camera,
  FolderOpen,
  Bell,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const PERMISSIONS = [
  {
    name: "Camera",
    icon: Camera,
    desc: "Used for seller KYC verification, catalog photo capture, and barcode scanning.",
  },
  {
    name: "Storage & Media",
    icon: FolderOpen,
    desc: "Used to upload GST/trademark certificates and download invoice/shipping PDFs.",
  },
  {
    name: "Push Notifications",
    icon: Bell,
    desc: "Used for instant alerts on new bulk orders, courier pickups, and payouts.",
  },
  {
    name: "Location",
    icon: MapPin,
    desc: "Used to verify warehouse address and coordinate doorstep courier pickups.",
  },
];

export default function SellerPrivacyPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete("/api/users/profile");
      toast.success("Seller account successfully deleted");
      setIsDeleteModalOpen(false);

      setTimeout(() => {
        logout();
        router.push("/seller/login");
      }, 1500);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete seller account");
      setIsDeleting(false);
    }
  };

  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white md:bg-transparent min-h-[calc(100vh-64px)] text-[#1A1A2E]">
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            Data & Privacy
          </h1>
          <span className="text-[18px] font-bold text-gray-400">
            Manage your privacy, app permissions and store closure
          </span>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Data & Privacy</h1>
        <p className="text-[14px] text-gray-500 font-medium">Manage your privacy and store closure</p>
      </div>

      <div className="max-w-3xl space-y-8">
        {/* ── 1. Privacy Overview Card ── */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#1A6FD4]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Privacy & Data Handling</h2>
              <p className="text-[14px] text-gray-500 font-medium">How ANGA9 protects and manages merchant information.</p>
            </div>
          </div>

          <div className="space-y-4 text-[14px] text-gray-700 leading-relaxed">
            <p>
              At ANGA9, we only collect business details necessary to verify your store, process orders, and disburse bank payouts.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>KYC data (GSTIN, PAN, bank details) is encrypted at rest using AES-256 standards.</li>
              <li>Merchant data is securely hosted within India in compliance with the DPDP Act 2023.</li>
              <li>We never sell or rent your business information to third-party advertisers.</li>
            </ul>

            <div className="pt-2">
              <Link
                href="/privacy?audience=seller"
                target="_blank"
                className="inline-flex items-center gap-1.5 font-bold text-[#1A6FD4] hover:underline text-[14px]"
              >
                Read full Seller Privacy Policy <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 2. Android App Permissions Card ── */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-[#1A6FD4]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Mobile App Permissions</h2>
              <p className="text-[14px] text-gray-500 font-medium">Device permissions requested by the ANGA9 Seller App.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PERMISSIONS.map((p) => (
              <div key={p.name} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 space-y-1">
                <div className="flex items-center gap-2">
                  <p.icon className="w-4 h-4 text-[#1A6FD4]" />
                  <span className="text-[14px] font-bold text-gray-900">{p.name}</span>
                </div>
                <p className="text-[14px] text-gray-500 leading-normal">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. Account Deletion Card (Google Play Store Mandate) ── */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Store Closure & Account Deletion</h2>
              <p className="text-[14px] text-gray-500 font-medium">Permanently delete your seller account and listings.</p>
            </div>
          </div>

          <div className="space-y-4 text-[14px] text-gray-700 leading-relaxed">
            <p>
              Deleting your seller account will permanently remove your product listings, store profile, and merchant login access. Outstanding delivered orders and payouts must be settled prior to account closure.
            </p>
            <p className="text-[14px] text-gray-500">
              Tax invoices and statutory financial transaction records are retained for 8 years as required by Indian GST and commercial regulations.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all flex items-center justify-center gap-2 text-[14px]"
              >
                <Trash2 className="w-4 h-4" />
                Delete Seller Account
              </button>
              <Link
                href="/seller/data-deletion"
                target="_blank"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2 text-[14px]"
              >
                Data Deletion Web Portal & Policy <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-gray-900">Are you absolutely sure?</h3>
                  <p className="text-[14px] text-red-600 font-medium mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[14px] text-gray-600 leading-relaxed">
                This will permanently delete your seller profile, de-list your catalog, and remove your account from ANGA9.
              </p>

              <div className="space-y-2 pt-2">
                <label className="text-[14px] font-bold uppercase tracking-wider text-gray-500">
                  Please type <strong className="text-red-600 select-all">DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full h-11 rounded-xl border border-gray-300 px-4 font-mono text-center tracking-widest text-[16px] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 sm:flex-row flex-col-reverse">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmText("");
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-[14px] text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={confirmText !== "DELETE" || isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-[14px] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
