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
    <div className="w-full max-w-3xl mx-auto pb-24 lg:pb-12 pt-4 lg:pt-8 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Data & Privacy
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Privacy</h2>
            <p className="text-sm text-gray-600 mt-1">
              How we protect and manage your personal data.
            </p>
          </div>
        </div>
        <div className="p-6 bg-gray-50/50 space-y-4">
          <p className="text-sm text-gray-700">
            At ANGA9, we are committed to protecting your privacy and ensuring your data is secure. We only collect the information necessary to provide you with the best B2B wholesale experience.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600">
            <li>Your personal and business data is encrypted and securely stored.</li>
            <li>We do not sell your personal data to third parties.</li>
            <li>You have full control over your communication preferences.</li>
          </ul>
          <div className="pt-2">
            <Link href="/privacy" target="_blank" className="text-sm font-bold text-blue-600 hover:underline">
              Read our full Privacy Policy &rarr;
            </Link>
          </div>
        </div>
      </div>

      {isCustomer && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Delete Account</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Permanently remove your personal data and access to ANGA9.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50">
            <div className="space-y-4">
              <div className="flex gap-3 text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900 mb-1">What happens when you delete your account?</p>
                  <ul className="list-disc pl-4 space-y-1 mt-2 text-gray-600">
                    <li>Your profile information (name, email, phone) will be permanently anonymized.</li>
                    <li>All your saved addresses and payment methods will be deleted.</li>
                    <li>You will lose access to your order history and loyalty coins.</li>
                    <li>Any active orders will still be processed and delivered, but you won't be able to track them through the app.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all active:scale-[0.98] gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
    </div>
  );
}
