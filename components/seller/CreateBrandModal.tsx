"use client";

/**
 * CreateBrandModal — registers a NEW child brand under the logged-in
 * company (parent) account.
 *
 * Calls POST /api/users/brands, which inserts a child `users` row
 * (parent_user_id = the logged-in user, no login credentials) plus a
 * `seller_profiles` row. The backend requires `store_slug` and returns 409
 * if the slug is already taken.
 *
 * On success we call `onCreated()` so the parent can refreshBrands() and
 * (optionally) switch into the new brand.
 */

import { useEffect, useState } from "react";
import { Store, Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called after the brand is created. Receives the new brand's users.id. */
  onCreated: (newBrandId: string) => void;
}

interface CreateBrandResponse {
  brand: { user: { id: string }; profile: unknown };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CreateBrandModal({ open, onClose, onCreated }: Props) {
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  // Tracks whether the user has hand-edited the slug; until then we keep it
  // auto-synced to the store name.
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStoreName("");
      setSlug("");
      setSlugTouched(false);
      setDescription("");
      setError("");
    }
  }, [open]);

  function handleNameChange(value: string) {
    setStoreName(value);
    setError("");
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(slugify(value));
    setError("");
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");

    const trimmedName = storeName.trim();
    if (trimmedName.length < 2) {
      setError("Brand name must be at least 2 characters.");
      return;
    }
    if (!slug) {
      setError("A store slug is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<CreateBrandResponse>("/api/users/brands", {
        store_name: trimmedName,
        store_slug: slug,
        store_description: description.trim() || undefined,
      });
      const newBrandId = res?.brand?.user?.id;
      if (!newBrandId) throw new Error("Brand created but no id returned");
      toast.success("Brand created");
      onCreated(newBrandId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create brand";
      // Backend returns "Store slug is already taken" (409) — surface it inline.
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-[#1A6FD4]" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-gray-900 tracking-tight">
                Add a new brand
              </h2>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Register another storefront under your company. Products and orders stay separate per brand.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors -mt-1 -mr-1"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Brand / Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Aurelia Kids"
              autoFocus
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[15px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Store Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="aurelia-kids"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[15px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors placeholder:text-gray-400"
            />
            <p className="text-[12px] text-gray-400 font-medium mt-1.5">
              Used in your storefront URL. Lowercase letters, numbers and dashes only. Must be unique.
            </p>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-gray-700 mb-1.5">
              Description <span className="font-medium text-gray-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              maxLength={500}
              placeholder="Short description of this brand..."
              className="w-full h-20 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[15px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors resize-y placeholder:text-gray-400"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || storeName.trim().length < 2 || !slug}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] hover:bg-gray-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating…
              </span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Brand
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
