"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const labelCls = "block text-sm md:text-base font-medium text-[#4B5563] mb-1.5";
const inputCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors";
const UNIT_OPTIONS = ["pc", "kg", "g", "L", "mL", "box", "set", "pair", "dozen", "pack", "roll", "meter"];

export default function AddProductPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", description: "", base_price: "", sale_price: "",
    min_order_qty: "1", category_id: "", unit: "pc",
    tags: "", hsn_code: "",
  });
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/categories`);
        if (res.ok) {
          const d = await res.json();
          setCategories(d.categories || d.data || d || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    })();
  }, []);

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
    const salePrice = form.sale_price ? parseFloat(form.sale_price) : null;
    if (salePrice !== null && salePrice >= price) errs.push("Sale price must be less than base price");
    const qty = parseInt(form.min_order_qty);
    if (!qty || qty < 1) errs.push("Min order quantity must be at least 1");
    if (!form.category_id) errs.push("Category is required");
    if (form.hsn_code && !/^\d{4,8}$/.test(form.hsn_code)) errs.push("HSN code must be 4-8 digits");
    if (errs.length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) return;
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const tagArray = form.tags
        ? form.tags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 20)
        : [];
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        slug,
        description: form.description.trim(),
        base_price: price,
        min_order_qty: qty,
        category_id: form.category_id,
        unit: form.unit,
        status: "pending_review",
      };
      if (salePrice !== null) body.sale_price = salePrice;
      if (tagArray.length > 0) body.tags = tagArray;
      if (form.hsn_code) body.hsn_code = form.hsn_code;

      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
        <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-2">Product Submitted!</h1>
        <p className="text-sm md:text-base text-[#4B5563]">Your product has been submitted for review. You&apos;ll be notified once it&apos;s approved.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[580px]">
      <Link href="/seller/dashboard/products" className="inline-flex items-center gap-1 text-sm md:text-base text-[#1A6FD4] font-medium hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>
      <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-1">Add New Product</h1>
      <p className="text-sm md:text-base text-[#9CA3AF] mb-6">Product will be submitted for review before going live</p>

      {errors.length > 0 && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
          {errors.map((e, i) => <p key={i} className="text-sm md:text-base text-red-600">{e}</p>)}
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
        <div>
          <label className={labelCls}>Category *</label>
          <div className="relative">
            <select className={inputCls + " appearance-none cursor-pointer"} value={form.category_id} onChange={e => set("category_id", e.target.value)} required>
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Base Price (₹) *</label>
            <input className={inputCls} type="number" step="0.01" min="0" value={form.base_price} onChange={e => set("base_price", e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className={labelCls}>Sale Price (₹)</label>
            <input className={inputCls} type="number" step="0.01" min="0" value={form.sale_price} onChange={e => set("sale_price", e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Min Order Qty *</label>
            <input className={inputCls} type="number" min="1" value={form.min_order_qty} onChange={e => set("min_order_qty", e.target.value)} placeholder="1" />
          </div>
          <div>
            <label className={labelCls}>Unit</label>
            <div className="relative">
              <select className={inputCls + " appearance-none cursor-pointer"} value={form.unit} onChange={e => set("unit", e.target.value)}>
                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>HSN Code</label>
            <input className={inputCls} value={form.hsn_code} onChange={e => set("hsn_code", e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="e.g. 1006" maxLength={8} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Tags</label>
          <input className={inputCls} value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="Comma-separated, e.g. organic, premium, bulk" />
          <p className="text-xs text-[#9CA3AF] mt-1">Up to 20 tags, separated by commas</p>
        </div>
        <button type="submit" disabled={submitting} className="w-full h-11 bg-[#4338CA] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#3730A3] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Submit for Review
        </button>
      </form>
    </div>
  );
}
