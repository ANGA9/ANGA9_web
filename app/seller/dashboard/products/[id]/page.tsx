"use client";
import { useState, useEffect, use } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, ChevronDown, LayoutList, IndianRupee, FileText } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const UNIT_OPTIONS = ["piece", "set", "box", "pack", "roll", "kg", "g", "L", "mL", "pair", "dozen", "meter"];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", description: "", base_price: "", sale_price: "",
    min_order_qty: "1", category_id: "", unit: "piece",
    tags: "", hsn_code: "",
  });
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
            sale_price: product.sale_price ? String(product.sale_price) : "",
            min_order_qty: String(product.min_order_qty || 1),
            category_id: product.category_id || "",
            unit: product.unit || "piece",
            tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
            hsn_code: product.hsn_code || "",
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

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
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
    if (errs.length) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) return;
      const tagArray = form.tags
        ? form.tags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 20)
        : [];
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim(),
        base_price: price,
        min_order_qty: qty,
        category_id: form.category_id,
        unit: form.unit,
      };
      if (salePrice !== null) body.sale_price = salePrice;
      else body.sale_price = null;
      if (tagArray.length > 0) body.tags = tagArray;
      else body.tags = [];
      if (form.hsn_code) body.hsn_code = form.hsn_code;

      const res = await fetch(`${API}/api/products/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/seller/dashboard/products"), 2000);
      } else {
        const d = await res.json().catch(() => ({}));
        setErrors([d.error || "Failed to update product"]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setErrors(["Network error"]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4] mb-4" />
        <span className="text-[15px] font-medium">Loading product...</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-[24px] font-bold text-gray-900 mb-3">Product Updated!</h1>
        <p className="text-[15px] text-gray-500 font-medium leading-relaxed">
          Your changes have been saved successfully. Redirecting back to products...
        </p>
      </div>
    );
  }

  const labelCls = "block text-[14px] font-bold text-gray-700 mb-1.5";
  const inputCls = "w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400";

  return (
    <main className="w-full mx-auto max-w-6xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      
      <Link href="/seller/dashboard/products" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-gray-500 hover:text-[#1A6FD4] transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Products
      </Link>

      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Edit Product</h1>
          <p className="text-[15px] text-gray-500 font-medium">Update your product details below.</p>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-1 mb-6">
        <h1 className="text-[24px] font-bold tracking-tight text-gray-900">Edit Product</h1>
        <p className="text-[14px] text-gray-500 font-medium">Update your product details.</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-8 rounded-2xl bg-red-50 border border-red-200 p-5 shadow-sm">
          <h3 className="text-[15px] font-bold text-red-800 mb-2">Please fix the following errors:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((e, i) => <li key={i} className="text-[14px] font-medium text-red-600">{e}</li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        <div className="flex-1 max-w-4xl space-y-6 md:space-y-8">
          
          {/* ── Basic Info ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LayoutList className="w-5 h-5 text-[#1A6FD4]" /> Basic Details
            </h2>
            <div>
              <label className={labelCls}>Product Name <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Organic Basmati Rice" maxLength={200} />
            </div>
            <div>
              <label className={labelCls}>Description <span className="text-red-500">*</span></label>
              <textarea className={inputCls + " h-32 py-4 resize-y"} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe your product in detail..." maxLength={2000} />
            </div>
            <div>
              <label className={labelCls}>Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <select className={inputCls + " appearance-none cursor-pointer pr-10"} value={form.category_id} onChange={(e) => set("category_id", e.target.value)} required>
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </section>

          {/* ── Pricing & Inventory ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-[#1A6FD4]" /> Pricing & Inventory
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Base Price (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input className={inputCls + " pl-8"} type="number" step="0.01" min="0" value={form.base_price} onChange={(e) => set("base_price", e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Sale Price (₹) <span className="text-gray-400 font-medium ml-1">(Optional)</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input className={inputCls + " pl-8"} type="number" step="0.01" min="0" value={form.sale_price} onChange={(e) => set("sale_price", e.target.value)} placeholder="0.00" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className={labelCls}>Min Order Qty <span className="text-red-500">*</span></label>
                <input className={inputCls} type="number" min="1" value={form.min_order_qty} onChange={(e) => set("min_order_qty", e.target.value)} placeholder="1" />
              </div>
              <div>
                <label className={labelCls}>Unit</label>
                <div className="relative">
                  <select className={inputCls + " appearance-none cursor-pointer pr-10"} value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* ── Tags & HSN ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1A6FD4]" /> Tags & HSN
            </h2>
            <div>
              <label className={labelCls}>Search Tags</label>
              <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="organic, premium, bulk (comma separated)" />
              <p className="text-[13px] text-gray-400 font-medium mt-1.5">Up to 20 tags to help buyers find your product.</p>
            </div>
            <div className="pt-2">
              <label className={labelCls}>HSN Code</label>
              <input className={inputCls} value={form.hsn_code} onChange={(e) => set("hsn_code", e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="e.g. 1006" maxLength={8} />
            </div>
          </section>

          {/* ── Mobile Save Button ── */}
          <div className="lg:hidden pb-10 pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-8 py-4 text-[16px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ── Desktop Sidebar (Sticky) ── */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <div className="sticky top-[104px] flex flex-col gap-5">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-2">Save Updates</h3>
              <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed">
                Changes made to the product details will be reflected immediately across the marketplace if the product is active.
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-4 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
