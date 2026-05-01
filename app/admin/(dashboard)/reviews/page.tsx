"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Loader2, Package, CheckCircle2, XCircle, X, Eye, Play, Store, PackageOpen, Truck } from "lucide-react";
import Header from "@/components/Header";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price?: number | null;
  min_order_qty?: number;
  unit?: string;
  description?: string;
  status: string;
  created_at: string;
  images?: string[];
  videos?: string[];
  tags?: string[];
  brand?: string;
  country_of_origin?: string;
  weight_kg?: number;
  sku?: string;
  hsn_code?: string;
  gst_rate?: number;
  return_policy?: string;
  warranty?: string;
}

function formatINR(value: number) {
  return "\u20B9" + Number(value || 0).toLocaleString("en-IN");
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|avi|mkv)([?#]|$)/i.test(url);
}

export default function ReviewsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Product | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get<{ data: Product[] }>("/api/products?status=pending_review&limit=50");
      setProducts(res?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleApprove(productId: string) {
    setActionLoading(productId);
    try {
      await api.patch(`/api/products/${productId}/review`, { action: "approve" });
      setProducts(prev => prev.filter(p => p.id !== productId));
      if (previewTarget?.id === productId) setPreviewTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    }
    setActionLoading(null);
  }

  async function handleReject() {
    if (!rejectTarget || !rejectNotes.trim()) return;
    setActionLoading(rejectTarget.id);
    try {
      await api.patch(`/api/products/${rejectTarget.id}/review`, { action: "reject", notes: rejectNotes.trim() });
      setProducts(prev => prev.filter(p => p.id !== rejectTarget.id));
      if (previewTarget?.id === rejectTarget.id) setPreviewTarget(null);
      setRejectTarget(null);
      setRejectNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject");
    }
    setActionLoading(null);
  }

  if (loading) return <div className="min-h-screen"><Header /><div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" /></div></div>;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6 xl:p-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-anga-text">Product Reviews</h1>
          <p className="text-sm md:text-base text-anga-text-secondary">{products.length} product{products.length !== 1 ? "s" : ""} awaiting review</p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-anga-border p-12 text-center">
            <Package className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
            <h2 className="text-base md:text-lg font-bold text-anga-text mb-2">No Pending Reviews</h2>
            <p className="text-sm md:text-base text-anga-text-secondary">All product submissions have been reviewed</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-anga-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b border-anga-border bg-[#F8FBFF]">
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Product Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Description</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Min Qty</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Submitted</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-anga-border last:border-0 hover:bg-[#F8FBFF] transition-colors">
                      <td className="px-4 py-3 font-medium text-anga-text max-w-[200px]">{p.name}</td>
                      <td className="px-4 py-3 text-[#4B5563] max-w-[250px] truncate">{p.description || "\u2014"}</td>
                      <td className="px-4 py-3 text-anga-text font-medium">{formatINR(p.base_price)}</td>
                      <td className="px-4 py-3 text-[#4B5563]">{p.min_order_qty || 1} {p.unit || "pc"}</td>
                      <td className="px-4 py-3 text-[#9CA3AF]">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewTarget(p)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#1A6FD4] text-white text-xs md:text-sm font-semibold hover:bg-[#155CB0] transition-colors"
                          >
                            <Eye className="w-3 h-3" /> Preview
                          </button>
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={actionLoading === p.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#22C55E] text-white text-xs md:text-sm font-semibold hover:bg-[#16A34A] transition-colors disabled:opacity-50"
                          >
                            {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                          </button>
                          <button
                            onClick={() => { setRejectTarget(p); setRejectNotes(""); }}
                            disabled={actionLoading === p.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#EF4444] text-white text-xs md:text-sm font-semibold hover:bg-[#DC2626] transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewTarget && (
        <PreviewModal
          product={previewTarget}
          onClose={() => setPreviewTarget(null)}
          onApprove={() => handleApprove(previewTarget.id)}
          onReject={() => { setRejectTarget(previewTarget); setRejectNotes(""); setPreviewTarget(null); }}
          actionLoading={actionLoading === previewTarget.id}
        />
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-anga-text">Reject Product</h3>
              <button onClick={() => setRejectTarget(null)} className="text-[#9CA3AF] hover:text-anga-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm md:text-base text-[#4B5563] mb-1">
              Rejecting: <span className="font-semibold">{rejectTarget.name}</span>
            </p>
            <p className="text-xs md:text-sm text-[#9CA3AF] mb-4">The seller will see your rejection reason and can re-submit after making changes.</p>
            <label className="block text-sm md:text-base font-medium text-[#4B5563] mb-1.5">Rejection Reason *</label>
            <textarea
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              placeholder="e.g. Product description is insufficient, missing proper images..."
              className="h-28 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 py-3 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#EF4444] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/10 transition-colors resize-none"
              maxLength={500}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectTarget(null)} className="flex-1 h-10 rounded-lg border border-[#E8EEF4] text-sm md:text-base font-medium text-[#4B5563] hover:bg-[#F8FBFF] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNotes.trim() || actionLoading === rejectTarget.id}
                className="flex-1 h-10 rounded-lg bg-[#EF4444] text-white text-sm md:text-base font-semibold hover:bg-[#DC2626] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === rejectTarget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Reject Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PreviewModalProps {
  product: Product;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  actionLoading: boolean;
}

function PreviewModal({ product, onClose, onApprove, onReject, actionLoading }: PreviewModalProps) {
  const [selectedMedia, setSelectedMedia] = useState(0);

  const allMedia = [
    ...(product.images || []),
    ...(product.videos || []),
  ];
  const currentUrl = allMedia[selectedMedia] || "";
  const currentIsVideo = isVideoUrl(currentUrl);

  const price = product.sale_price ?? product.base_price;
  const discount = product.sale_price && product.base_price > product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/60 overflow-y-auto">
      <div className="bg-white rounded-none md:rounded-xl shadow-2xl w-full max-w-5xl my-0 md:my-8 mx-0 md:mx-4 relative">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 md:px-6 py-3 bg-white border-b border-[#E8EEF4] rounded-t-xl">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="w-4 h-4 text-[#1A6FD4] shrink-0" />
            <span className="text-xs md:text-sm font-semibold text-[#1A6FD4] uppercase tracking-wider shrink-0">Customer Preview</span>
            <span className="text-[#9CA3AF] hidden md:inline">\u2014</span>
            <span className="text-sm text-[#4B5563] truncate hidden md:inline">how this listing will appear on anga9.com</span>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-anga-text shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Media gallery */}
            <div>
              <div className="relative rounded-xl overflow-hidden flex items-center justify-center aspect-square md:h-[480px] md:aspect-auto" style={{ background: "#F1F7FF" }}>
                {allMedia.length > 0 ? (
                  currentIsVideo ? (
                    <video key={currentUrl} src={currentUrl} controls className="w-full h-full object-contain bg-black" />
                  ) : (
                    <img src={currentUrl} alt={product.name} className="w-full h-full object-contain" />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                    <PackageOpen className="w-16 h-16 opacity-40" />
                    <span className="text-sm">No media uploaded</span>
                  </div>
                )}
              </div>
              {allMedia.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
                  {allMedia.map((url, idx) => {
                    const isVid = isVideoUrl(url);
                    const active = idx === selectedMedia;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedMedia(idx)}
                        className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
                        style={{
                          borderColor: active ? "#1A6FD4" : "#E8EEF4",
                          background: isVid ? "#111" : "#F1F7FF",
                        }}
                      >
                        {isVid ? (
                          <>
                            <video src={url} muted preload="metadata" className="w-full h-full object-cover opacity-70" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-5 h-5 text-white drop-shadow-md" fill="white" />
                            </div>
                          </>
                        ) : (
                          <img src={url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#4B5563]">
                <span className="px-2 py-1 rounded-md bg-[#F8FBFF] border border-[#E8EEF4]">
                  {product.images?.length || 0} image{(product.images?.length || 0) !== 1 ? "s" : ""}
                </span>
                <span className="px-2 py-1 rounded-md bg-[#F8FBFF] border border-[#E8EEF4]">
                  {product.videos?.length || 0} video{(product.videos?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Info column */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-anga-text leading-tight mb-2">{product.name}</h2>

              <div className="flex items-center gap-1.5 mb-4 text-sm text-[#4B5563]">
                <Store className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>ANGA9 Seller</span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl md:text-4xl font-bold text-anga-text">{formatINR(price)}</span>
                {discount > 0 && (
                  <>
                    <span className="line-through text-sm text-[#9CA3AF]">{formatINR(product.base_price)}</span>
                    <span className="text-sm font-semibold text-[#22C55E]">{discount}% off</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span className="text-sm font-medium text-[#22C55E]">In Stock (preview)</span>
              </div>

              <p className="text-sm text-[#4B5563] mb-5">
                Min order: {product.min_order_qty || 1} {product.unit || "pc"}{(product.min_order_qty || 1) > 1 ? "s" : ""}
              </p>

              <div className="mb-5 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3" style={{ backgroundColor: "#F8FBFF", borderColor: "#EAF2FF" }}>
                <div>
                  <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Total Amount</p>
                  <span className="text-[22px] font-black text-anga-text leading-none">{formatINR(price * (product.min_order_qty || 1))}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#9CA3AF]">
                  <Truck className="w-4 h-4" /> Delivery applied at checkout
                </span>
              </div>

              {/* Description */}
              {product.description ? (
                <div className="border-t border-[#E8EEF4] pt-5 mb-5">
                  <h3 className="font-semibold text-base mb-2 text-anga-text">Description</h3>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-[#4B5563]">
                    {product.description}
                  </p>
                </div>
              ) : (
                <div className="border-t border-[#E8EEF4] pt-5 mb-5">
                  <p className="text-sm italic text-[#EF4444]">No description provided.</p>
                </div>
              )}

              {/* Specs */}
              {(product.brand || product.country_of_origin || product.weight_kg || product.sku || product.hsn_code || product.gst_rate || product.warranty || product.return_policy) && (
                <div className="border-t border-[#E8EEF4] pt-5 mb-5">
                  <h3 className="font-semibold text-base mb-3 text-anga-text">Specifications</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {product.brand && <SpecRow label="Brand" value={product.brand} />}
                    {product.country_of_origin && <SpecRow label="Country of Origin" value={product.country_of_origin} />}
                    {typeof product.weight_kg === "number" && <SpecRow label="Weight" value={`${product.weight_kg} kg`} />}
                    {product.sku && <SpecRow label="SKU" value={product.sku} />}
                    {product.hsn_code && <SpecRow label="HSN Code" value={product.hsn_code} />}
                    {typeof product.gst_rate === "number" && <SpecRow label="GST" value={`${product.gst_rate}%`} />}
                    {product.warranty && <SpecRow label="Warranty" value={product.warranty} />}
                    {product.return_policy && <SpecRow label="Return Policy" value={product.return_policy} />}
                  </dl>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="border-t border-[#E8EEF4] pt-5">
                  <h3 className="font-semibold text-sm mb-2 text-anga-text">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "#F1F7FF", color: "#1A6FD4" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky footer with decision buttons */}
        <div className="sticky bottom-0 z-10 flex flex-col sm:flex-row gap-3 px-5 md:px-6 py-4 bg-white border-t border-[#E8EEF4] rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-[#E8EEF4] text-sm font-medium text-[#4B5563] hover:bg-[#F8FBFF] transition-colors"
          >
            Close
          </button>
          <button
            onClick={onReject}
            disabled={actionLoading}
            className="flex-1 h-11 rounded-lg bg-[#EF4444] text-white text-sm font-semibold hover:bg-[#DC2626] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="flex-1 h-11 rounded-lg bg-[#22C55E] text-white text-sm font-semibold hover:bg-[#16A34A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
          </button>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#F1F7FF] py-1.5">
      <dt className="text-[#9CA3AF]">{label}</dt>
      <dd className="text-anga-text font-medium text-right">{value}</dd>
    </div>
  );
}
