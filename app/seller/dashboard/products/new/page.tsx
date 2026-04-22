"use client";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const labelCls = "block text-[13px] font-medium text-[#4B5563] mb-1.5";
const inputCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors";

export default function AddProductPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", base_price: "", min_order_qty: "1" });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(k: string, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!form.name.trim() || form.name.length < 3) errs.push("Product name must be at least 3 characters");
    if (!form.description.trim() || form.description.length < 10) errs.push("Description must be at least 10 characters");
    const price = parseFloat(form.base_price);
    if (!price || price <= 0) errs.push("Price must be greater than 0");
    const qty = parseInt(form.min_order_qty);
    if (!qty || qty < 1) errs.push("Min order quantity must be at least 1");
    if (errs.length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) return;
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug,
          description: form.description.trim(),
          base_price: price,
          min_order_qty: qty,
          status: "pending_review",
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/seller/dashboard/products"), 2000);
      } else {
        const d = await res.json().catch(() => ({}));
        setErrors([d.error || "Failed to create product"]);
      }
    } catch { setErrors(["Network error"]); }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <CheckCircle2 className="w-14 h-14 text-[#22C55E] mx-auto mb-4" />
        <h1 className="text-[22px] font-bold text-[#1A1A2E] mb-2">Product Submitted!</h1>
        <p className="text-[14px] text-[#4B5563]">Your product has been submitted for review. You&apos;ll be notified once it&apos;s approved.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[580px]">
      <Link href="/seller/dashboard/products" className="inline-flex items-center gap-1 text-[13px] text-[#1A6FD4] font-medium hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>
      <h1 className="text-[20px] font-bold text-[#1A1A2E] mb-1">Add New Product</h1>
      <p className="text-[13px] text-[#9CA3AF] mb-6">Product will be submitted for review before going live</p>

      {errors.length > 0 && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
          {errors.map((e, i) => <p key={i} className="text-[13px] text-red-600">{e}</p>)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E8EEF4] p-6 space-y-5">
        <div>
          <label className={labelCls}>Product Name *</label>
          <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Organic Basmati Rice" maxLength={200} />
        </div>
        <div>
          <label className={labelCls}>Description *</label>
          <textarea className={inputCls + " h-28 py-3 resize-none"} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe your product in detail (min 10 chars)" maxLength={2000} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Price (₹) *</label>
            <input className={inputCls} type="number" step="0.01" min="0" value={form.base_price} onChange={e => set("base_price", e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className={labelCls}>Min Order Qty *</label>
            <input className={inputCls} type="number" min="1" value={form.min_order_qty} onChange={e => set("min_order_qty", e.target.value)} placeholder="1" />
          </div>
        </div>
        <button type="submit" disabled={submitting} className="w-full h-11 bg-[#6C47FF] text-white text-[14px] font-semibold rounded-lg hover:bg-[#5A3AE0] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Submit for Review
        </button>
      </form>
    </div>
  );
}
