"use client";

import { useState } from "react";
import { ArrowLeft, ShieldAlert, Trash2, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import toast from "react-hot-toast";

export default function PrivacyPage() {
  const router = useRouter();
  const { user, dbUser, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // If not logged in, layout will redirect
  if (!user) {
    return null;
  }

  const isCustomer = dbUser?.role === "customer";

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete("/api/users/profile");
      toast.success("Account successfully deleted");
      setIsModalOpen(false);
      // Wait a moment for the toast, then log out
      setTimeout(() => {
        logout();
        router.push("/");
      }, 1500);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };
  return (
    <main className="w-full mx-auto max-w-5xl px-0 md:px-8 pt-0 md:py-10 bg-white md:bg-transparent min-h-screen">
      {/* Mobile header */}
      <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40 md:hidden">
        <Link href="/account" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight">Data & Privacy</h1>
      </header>

      <div className="px-4 sm:px-6 md:px-0 pt-6 md:pt-0 pb-24 lg:pb-12 max-w-3xl mx-auto md:mx-0">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4 mb-8">
          <Link
            href="/account"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </Link>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            Data & Privacy
          </h1>
        </div>

        <div className="space-y-6">
          <p className="text-[15px] text-gray-900 leading-relaxed">
            At ANGA9, we are committed to protecting your privacy and ensuring your data is secure. We only collect the information necessary to provide you with the best B2B wholesale experience.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[14px] text-gray-800">
            <li>Your personal and business data is encrypted and securely stored.</li>
            <li>We do not sell your personal data to third parties.</li>
            <li>You have full control over your communication preferences.</li>
          </ul>
          <div className="pt-2">
            <Link href="/privacy" target="_blank" className="text-[14px] font-semibold text-gray-900 hover:text-black underline underline-offset-4 decoration-gray-300 hover:decoration-black transition-colors">
              Read our full Privacy Policy &rarr;
            </Link>
          </div>
          
          {isCustomer && (
            <div className="pt-8 mt-8 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-red-800 bg-white border-2 border-red-800 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete My Account
              </button>
              <p className="text-[13px] text-gray-500 mt-3">
                This will permanently remove your personal data and access to ANGA9.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Are you absolutely sure?</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                This action <strong className="text-gray-900">cannot</strong> be undone. This will permanently delete your account and remove your data from our servers.
              </p>
              
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Please type <strong className="text-red-600 select-all">DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 font-mono text-center tracking-widest text-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 sm:flex-row flex-col-reverse">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setConfirmText("");
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || isDeleting}
                className="flex-1 px-4 py-3 rounded-xl font-bold active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50"
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
