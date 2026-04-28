"use client";
import { useState, useEffect, use } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const labelCls = "block text-sm md:text-base font-medium text-[#4B5563] mb-1.5";
const inputCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", base_price: "", min_order_qty: "1", category_id: "" });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API}/api/categories`),
          fetch(`${API}/api/products/${id}`),
        ]);
        if (catRes.ok) {
          const d = await catRes.json();
          setCategories(d.categories || d.data || d || []);
        }
        if (prodRes.ok) {
          const p = await prodRes.json();
          const product = p.data || p;
          setForm({
            name: product.name || "",
            description: product.description || "",
            base_price: String(product.base_price || ""),
            min_order_qty: String(product.min_order_qty || 1),
            category_id: product.category_id || "",
          });
        }
      } catch {
        setErrors(["Failed to load product"]);
      }
      setLoading(false);
    })();
  }, [id]);

  function set(k: string, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
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
    if (!form.category_id) errs.push("Category is required");
    if (errs.length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API}/api/products/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          base_price: price,
          min_order_qty: qty,
          category_id: form.category_id,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/seller/dashboard/products"), 2000);
      } else {
        const d = await res.json().catch(() => ({}));
        setErrors([d.error || "Failed to update product"]);
      }
    } catch {
      setErrors(["Network error"]);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <CheckCircle2 className="w-14 h-14 text-[#22C55E] mx-auto mb-4" />
        <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-2">Product Updated!</h1>
        <p className="text-sm md:text-base text-[#4B5563]">Your changes have been saved. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[580px]">
      <Link href="/seller/dashboard/products" className="inline-flex items-center gap-1 text-sm md:text-base text-[#1A6FD4] font-medium hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>
      <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-1">Edit Product</h1>
      <p className="text-sm md:text-base text-[#9CA3AF] mb-6">Update your product details below</p>

      {errors.length > 0 && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
          {errors.map((e, i) => (
            <p key={i} className="text-sm md:text-base text-red-600">{e}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E8EEF4] p-6 space-y-5">
        <div>
          <label className={labelCls}>Product Name *</label>
          <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Organic Basmati Rice" maxLength={200} />
        </div>
        <div>
          <label className={labelCls}>Description *</label>
          <textarea className={inputCls + " h-28 py-3 resize-none"} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe your product in detail (min 10 chars)" maxLength={2000} />
        </div>
        <div>
          <label className={labelCls}>Category *</label>
          <div className="relative">
            <select className={inputCls + " appearance-none cursor-pointer"} value={form.category_id} onChange={(e) => set("category_id", e.target.value)} required>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Price (₹) *</label>
            <input className={inputCls} type="number" step="0.01" min="0" value={form.base_price} onChange={(e) => set("base_price", e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className={labelCls}>Min Order Qty *</label>
            <input className={inputCls} type="number" min="1" value={form.min_order_qty} onChange={(e) => set("min_order_qty", e.target.value)} placeholder="1" />
          </div>
        </div>
        <button type="submit" disabled={submitting} className="w-full h-11 bg-[#4338CA] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#3730A3] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Changes
        </button>
      </form>
    </div>
  );
}
