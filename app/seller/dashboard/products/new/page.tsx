"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, ChevronDown, ImagePlus, Video, X } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const labelCls = "block text-sm md:text-base font-medium text-[#4B5563] mb-1.5";
const inputCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors";
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
    const stock = parseInt(form.initial_stock);
    if (Number.isNaN(stock) || stock < 0) errs.push("Initial stock is required (0 or more)");

    const readyImages = images.filter(i => !i.uploading && i.url);
    const readyVideos = videos.filter(v => !v.uploading && v.url);
    if (images.some(i => i.uploading) || videos.some(v => v.uploading)) errs.push("Please wait for uploads to finish");
    if (readyImages.length < MIN_IMAGES) errs.push(`Upload at least ${MIN_IMAGES} images (${readyImages.length}/${MIN_IMAGES})`);
    if (readyVideos.length < MIN_VIDEOS) errs.push(`Upload at least ${MIN_VIDEOS} video`);
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
    <div className="max-w-[680px]">
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
        {/* Media */}
        <div>
          <label className={labelCls}>Photos * <span className="text-[#9CA3AF] font-normal">(min {MIN_IMAGES}, max {MAX_IMAGES} — JPG/PNG/WebP, ≤ 5 MB each)</span></label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg border border-[#E8EEF4] overflow-hidden bg-[#F8FBFF]">
                {img.uploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-[#1A6FD4]" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                )}
                {!img.uploading && (
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button type="button" onClick={() => imgInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-[#E8EEF4] hover:border-[#1A6FD4] text-[#9CA3AF] hover:text-[#1A6FD4] flex flex-col items-center justify-center gap-1 transition-colors">
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
          <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleImagePick(e.target.files)} />
        </div>

        <div>
          <label className={labelCls}>Videos * <span className="text-[#9CA3AF] font-normal">(min {MIN_VIDEOS}, max {MAX_VIDEOS} — MP4/WebM, ≤ 50 MB each)</span></label>
          <div className="grid grid-cols-2 gap-2">
            {videos.map((vid, i) => (
              <div key={i} className="relative aspect-video rounded-lg border border-[#E8EEF4] overflow-hidden bg-[#F8FBFF]">
                {vid.uploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-[#1A6FD4]" />
                  </div>
                ) : (
                  <video src={vid.url} className="w-full h-full object-cover" controls />
                )}
                {!vid.uploading && (
                  <button type="button" onClick={() => removeVideo(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {videos.length < MAX_VIDEOS && (
              <button type="button" onClick={() => vidInputRef.current?.click()} className="aspect-video rounded-lg border-2 border-dashed border-[#E8EEF4] hover:border-[#1A6FD4] text-[#9CA3AF] hover:text-[#1A6FD4] flex flex-col items-center justify-center gap-1 transition-colors">
                <Video className="w-5 h-5" />
                <span className="text-xs">Add Video</span>
              </button>
            )}
          </div>
          <input ref={vidInputRef} type="file" accept="video/*" multiple className="hidden" onChange={e => handleVideoPick(e.target.files)} />
        </div>

        {/* Basic info */}
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

        {/* Pricing */}
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

        {/* Stock + MOQ */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Initial Stock *</label>
            <input className={inputCls} type="number" min="0" value={form.initial_stock} onChange={e => set("initial_stock", e.target.value)} placeholder="0" />
          </div>
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
        </div>

        {/* Logistics */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Weight (kg)</label>
            <input className={inputCls} type="number" step="0.001" min="0" value={form.weight_kg} onChange={e => set("weight_kg", e.target.value)} placeholder="0.500" />
          </div>
          <div>
            <label className={labelCls}>Brand</label>
            <input className={inputCls} value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="e.g. Tata" />
          </div>
          <div>
            <label className={labelCls}>Country of Origin *</label>
            <div className="relative">
              <select className={inputCls + " appearance-none cursor-pointer"} value={form.country_of_origin} onChange={e => set("country_of_origin", e.target.value)}>
                {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* GST + SKU */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>HSN Code</label>
            <input className={inputCls} value={form.hsn_code} onChange={e => set("hsn_code", e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="e.g. 1006" maxLength={8} />
          </div>
          <div>
            <label className={labelCls}>GST Rate (%)</label>
            <input className={inputCls} type="number" step="0.01" min="0" max="28" value={form.gst_rate} onChange={e => set("gst_rate", e.target.value)} placeholder="18" />
          </div>
          <div>
            <label className={labelCls}>SKU</label>
            <input className={inputCls} value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="Optional" maxLength={64} />
          </div>
        </div>

        {/* Policies */}
        <div>
          <label className={labelCls}>Return Policy</label>
          <textarea className={inputCls + " h-20 py-3 resize-none"} value={form.return_policy} onChange={e => set("return_policy", e.target.value)} placeholder="e.g. 7-day return for unopened items" maxLength={500} />
        </div>
        <div>
          <label className={labelCls}>Warranty</label>
          <input className={inputCls} value={form.warranty} onChange={e => set("warranty", e.target.value)} placeholder="e.g. 1 year manufacturer warranty" maxLength={200} />
        </div>

        {/* Tags */}
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
