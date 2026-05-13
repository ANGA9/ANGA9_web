"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, ChevronDown, ImagePlus, Video, X, PackageOpen, LayoutList, IndianRupee, Truck, FileText } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const UNIT_OPTIONS = ["piece", "set", "box", "pack", "roll", "kg", "g", "L", "mL", "pair", "dozen", "meter"];
const COUNTRY_OPTIONS = ["India", "China", "USA", "Bangladesh", "Vietnam", "Other"];

const MIN_IMAGES = 5;
const MAX_IMAGES = 10;
const MIN_VIDEOS = 1;
const MAX_VIDEOS = 2;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

interface UploadedFile {
  url: string;
  path: string;
  uploading?: boolean;
}

export default function AddProductPage() {
  const { getToken, dbUser } = useAuth();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", description: "", base_price: "", sale_price: "",
    min_order_qty: "1", category_id: "", unit: "piece",
    tags: "", hsn_code: "", gst_rate: "18",
    initial_stock: "", brand: "", country_of_origin: "India",
    weight_kg: "", return_policy: "", warranty: "", sku: "",
  });
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [videos, setVideos] = useState<UploadedFile[]>([]);
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

  async function uploadFile(file: File, bucket: "product-images" | "product-videos"): Promise<UploadedFile | null> {
    if (!dbUser) return null;
    const { data: sessionData } = await supabase.auth.getSession();
    const authUid = sessionData.session?.user?.id;
    if (!authUid) {
      setErrors(["Please sign in again before uploading."]);
      return null;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${authUid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      setErrors([`Upload failed: ${error.message}`]);
      return null;
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: pub.publicUrl, path };
  }

  async function handleImagePick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = MAX_IMAGES - images.length;
    const batch = Array.from(files).slice(0, room);
    for (const f of batch) {
      if (!f.type.startsWith("image/")) { setErrors([`${f.name} is not an image.`]); continue; }
      if (f.size > MAX_IMAGE_BYTES) { setErrors([`${f.name} is over 5 MB.`]); continue; }
      const placeholder: UploadedFile = { url: "", path: "", uploading: true };
      setImages(prev => [...prev, placeholder]);
      const result = await uploadFile(f, "product-images");
      setImages(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(x => x === placeholder);
        if (idx === -1) return copy;
        if (result) copy[idx] = result; else copy.splice(idx, 1);
        return copy;
      });
    }
    if (imgInputRef.current) imgInputRef.current.value = "";
  }

  async function handleVideoPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = MAX_VIDEOS - videos.length;
    const batch = Array.from(files).slice(0, room);
    for (const f of batch) {
      if (!f.type.startsWith("video/")) { setErrors([`${f.name} is not a video.`]); continue; }
      if (f.size > MAX_VIDEO_BYTES) { setErrors([`${f.name} is over 50 MB.`]); continue; }
      const placeholder: UploadedFile = { url: "", path: "", uploading: true };
      setVideos(prev => [...prev, placeholder]);
      const result = await uploadFile(f, "product-videos");
      setVideos(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(x => x === placeholder);
        if (idx === -1) return copy;
        if (result) copy[idx] = result; else copy.splice(idx, 1);
        return copy;
      });
    }
    if (vidInputRef.current) vidInputRef.current.value = "";
  }

  async function removeImage(idx: number) {
    const target = images[idx];
    setImages(prev => prev.filter((_, i) => i !== idx));
    if (target?.path) await supabase.storage.from("product-images").remove([target.path]).catch(() => {});
  }
  async function removeVideo(idx: number) {
    const target = videos[idx];
    setVideos(prev => prev.filter((_, i) => i !== idx));
    if (target?.path) await supabase.storage.from("product-videos").remove([target.path]).catch(() => {});
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
    const stock = parseInt(form.initial_stock);
    if (Number.isNaN(stock) || stock < 0) errs.push("Initial stock is required (0 or more)");

    const readyImages = images.filter(i => !i.uploading && i.url);
    const readyVideos = videos.filter(v => !v.uploading && v.url);
    if (images.some(i => i.uploading) || videos.some(v => v.uploading)) errs.push("Please wait for uploads to finish");
    if (readyImages.length < MIN_IMAGES) errs.push(`Upload at least ${MIN_IMAGES} images (${readyImages.length}/${MIN_IMAGES})`);
    if (readyVideos.length < MIN_VIDEOS) errs.push(`Upload at least ${MIN_VIDEOS} video`);
    if (errs.length) { 
      setErrors(errs); 
      window.scrollTo({ top: 0, behavior: "smooth" });
      return; 
    }

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
        images: readyImages.map(i => i.url),
        videos: readyVideos.map(v => v.url),
        initial_stock: stock,
        country_of_origin: form.country_of_origin,
        gst_rate: parseFloat(form.gst_rate) || 18,
      };
      if (salePrice !== null) body.sale_price = salePrice;
      if (tagArray.length > 0) body.tags = tagArray;
      if (form.hsn_code) body.hsn_code = form.hsn_code;
      if (form.brand.trim()) body.brand = form.brand.trim();
      if (form.weight_kg) body.weight_kg = parseFloat(form.weight_kg);
      if (form.return_policy.trim()) body.return_policy = form.return_policy.trim();
      if (form.warranty.trim()) body.warranty = form.warranty.trim();
      if (form.sku.trim()) body.sku = form.sku.trim();

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
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch { 
      setErrors(["Network error"]); 
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-[24px] font-bold text-gray-900 mb-3">Product Submitted!</h1>
        <p className="text-[15px] text-gray-500 font-medium leading-relaxed">
          Your product has been submitted for review. You&apos;ll be notified once it&apos;s approved and live on the marketplace.
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
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Add New Product</h1>
          <p className="text-[15px] text-gray-500 font-medium">Create a new listing for your store.</p>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-1 mb-6">
        <h1 className="text-[24px] font-bold tracking-tight text-gray-900">Add Product</h1>
        <p className="text-[14px] text-gray-500 font-medium">Create a new listing.</p>
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
          
          {/* ── Media ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-[#1A6FD4]" /> Media & Imagery
            </h2>
            
            <div className="mb-6">
              <label className={labelCls}>Photos <span className="text-red-500">*</span> <span className="text-gray-400 font-medium ml-1 text-[13px]">(min {MIN_IMAGES}, max {MAX_IMAGES})</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 group shadow-sm">
                    {img.uploading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    )}
                    {!img.uploading && (
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow-sm text-gray-700 hover:text-red-600 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button type="button" onClick={() => imgInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-[#1A6FD4] text-gray-400 hover:text-[#1A6FD4] flex flex-col items-center justify-center gap-2 transition-colors">
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-[13px] font-bold">Add Photo</span>
                  </button>
                )}
              </div>
              <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleImagePick(e.target.files)} />
            </div>

            <div>
              <label className={labelCls}>Videos <span className="text-red-500">*</span> <span className="text-gray-400 font-medium ml-1 text-[13px]">(min {MIN_VIDEOS}, max {MAX_VIDEOS})</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((vid, i) => (
                  <div key={i} className="relative aspect-video rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 group shadow-sm">
                    {vid.uploading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
                      </div>
                    ) : (
                      <video src={vid.url} className="w-full h-full object-cover" controls />
                    )}
                    {!vid.uploading && (
                      <button type="button" onClick={() => removeVideo(i)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow-sm text-gray-700 hover:text-red-600 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {videos.length < MAX_VIDEOS && (
                  <button type="button" onClick={() => vidInputRef.current?.click()} className="aspect-video rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-[#1A6FD4] text-gray-400 hover:text-[#1A6FD4] flex flex-col items-center justify-center gap-2 transition-colors">
                    <Video className="w-6 h-6" />
                    <span className="text-[13px] font-bold">Add Video</span>
                  </button>
                )}
              </div>
              <input ref={vidInputRef} type="file" accept="video/*" multiple className="hidden" onChange={e => handleVideoPick(e.target.files)} />
            </div>
          </section>

          {/* ── Basic Info ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LayoutList className="w-5 h-5 text-[#1A6FD4]" /> Basic Details
            </h2>
            <div>
              <label className={labelCls}>Product Name <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Organic Premium Basmati Rice - 5kg" maxLength={200} />
            </div>
            <div>
              <label className={labelCls}>Description <span className="text-red-500">*</span></label>
              <textarea className={inputCls + " h-32 py-4 resize-y"} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe your product's features, benefits, and specifications in detail..." maxLength={2000} />
            </div>
            <div>
              <label className={labelCls}>Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <select className={inputCls + " appearance-none cursor-pointer pr-10"} value={form.category_id} onChange={e => set("category_id", e.target.value)} required>
                  <option value="">Select a category</option>
                  {categories.map(c => (
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
                  <input className={inputCls + " pl-8"} type="number" step="0.01" min="0" value={form.base_price} onChange={e => set("base_price", e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Sale Price (₹) <span className="text-gray-400 font-medium ml-1">(Optional)</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input className={inputCls + " pl-8"} type="number" step="0.01" min="0" value={form.sale_price} onChange={e => set("sale_price", e.target.value)} placeholder="0.00" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              <div>
                <label className={labelCls}>Initial Stock <span className="text-red-500">*</span></label>
                <input className={inputCls} type="number" min="0" value={form.initial_stock} onChange={e => set("initial_stock", e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Min Order Qty <span className="text-red-500">*</span></label>
                <input className={inputCls} type="number" min="1" value={form.min_order_qty} onChange={e => set("min_order_qty", e.target.value)} placeholder="1" />
              </div>
              <div>
                <label className={labelCls}>Unit</label>
                <div className="relative">
                  <select className={inputCls + " appearance-none cursor-pointer pr-10"} value={form.unit} onChange={e => set("unit", e.target.value)}>
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* ── Logistics ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#1A6FD4]" /> Logistics & Compliance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>Weight (kg)</label>
                <input className={inputCls} type="number" step="0.001" min="0" value={form.weight_kg} onChange={e => set("weight_kg", e.target.value)} placeholder="0.500" />
              </div>
              <div>
                <label className={labelCls}>Brand</label>
                <input className={inputCls} value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="e.g. Tata" />
              </div>
              <div>
                <label className={labelCls}>Origin <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className={inputCls + " appearance-none cursor-pointer pr-10"} value={form.country_of_origin} onChange={e => set("country_of_origin", e.target.value)}>
                    {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              <div>
                <label className={labelCls}>HSN Code</label>
                <input className={inputCls} value={form.hsn_code} onChange={e => set("hsn_code", e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="e.g. 1006" maxLength={8} />
              </div>
              <div>
                <label className={labelCls}>GST Rate (%)</label>
                <input className={inputCls} type="number" step="0.01" min="0" max="28" value={form.gst_rate} onChange={e => set("gst_rate", e.target.value)} placeholder="18" />
              </div>
              <div>
                <label className={labelCls}>SKU Code</label>
                <input className={inputCls} value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="Optional" maxLength={64} />
              </div>
            </div>
          </section>

          {/* ── Policies & Tags ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1A6FD4]" /> Policies & Search
            </h2>
            <div>
              <label className={labelCls}>Return Policy</label>
              <textarea className={inputCls + " h-24 py-3 resize-none"} value={form.return_policy} onChange={e => set("return_policy", e.target.value)} placeholder="e.g. 7-day return window for defective items..." maxLength={500} />
            </div>
            <div>
              <label className={labelCls}>Warranty Information</label>
              <input className={inputCls} value={form.warranty} onChange={e => set("warranty", e.target.value)} placeholder="e.g. 1 Year Manufacturer Warranty" maxLength={200} />
            </div>
            <div>
              <label className={labelCls}>Search Tags</label>
              <input className={inputCls} value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="organic, premium, bulk (comma separated)" />
              <p className="text-[13px] text-gray-400 font-medium mt-1.5">Up to 20 tags to help buyers find your product.</p>
            </div>
          </section>

          {/* ── Mobile Save Button ── */}
          <div className="lg:hidden pb-10 pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-8 py-4 text-[16px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PackageOpen className="w-5 h-5" />}
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </div>

        {/* ── Desktop Sidebar (Sticky) ── */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <div className="sticky top-[104px] flex flex-col gap-5">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-2">Publish Product</h3>
              <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed">
                By submitting this product, it will go through a review process before appearing on the marketplace.
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-4 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PackageOpen className="w-5 h-5" />}
                {submitting ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
            
            <div className="bg-[#F8FBFF] rounded-3xl border border-blue-100 p-6">
              <h3 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1A6FD4]" /> Checklist
              </h3>
              <ul className="space-y-3">
                {[
                  { text: `Min ${MIN_IMAGES} photos uploaded`, done: images.filter(i => !i.uploading).length >= MIN_IMAGES },
                  { text: `Min ${MIN_VIDEOS} video uploaded`, done: videos.filter(v => !v.uploading).length >= MIN_VIDEOS },
                  { text: "Category selected", done: !!form.category_id },
                  { text: "Pricing & Stock added", done: parseFloat(form.base_price) > 0 && parseInt(form.initial_stock) >= 0 }
                ].map((item, i) => (
                  <li key={i} className={`text-[13px] font-medium flex items-start gap-2 ${item.done ? "text-green-600" : "text-gray-500"}`}>
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${item.done ? "text-green-500" : "text-gray-300"}`} />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
