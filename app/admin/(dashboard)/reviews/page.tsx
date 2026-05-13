"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Loader2, Package, CheckCircle2, XCircle, X, Eye, Play, Store, PackageOpen, Truck, ChevronRight, AlertCircle } from "lucide-react";

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Product Submissions</h1>
          <p className="text-[15px] text-gray-500 font-medium">
            {products.length} product{products.length !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">Queue is Clear</h2>
          <p className="text-[15px] text-gray-500 font-medium">All product submissions have been reviewed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Pricing</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                          {p.images && p.images[0] ? (
                             <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                             <Package className="w-5 h-5 text-gray-400 m-auto mt-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[14px] text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-[12px] font-medium text-gray-400 truncate uppercase tracking-tight">ID: {p.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-gray-600 line-clamp-2 max-w-[250px] leading-relaxed">
                        {p.description || "No description provided."}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-[15px] text-gray-900">{formatINR(p.base_price)}</p>
                      <p className="text-[12px] font-bold text-gray-500">Min: {p.min_order_qty || 1} {p.unit || "pc"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(p.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setPreviewTarget(p)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-[12px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={actionLoading === p.id}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-[12px] font-bold hover:bg-green-100 transition-colors disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Approve
                        </button>
                        <button
                          onClick={() => { setRejectTarget(p); setRejectNotes(""); }}
                          disabled={actionLoading === p.id}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[12px] font-bold hover:bg-red-100 transition-colors disabled:opacity-50 shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[20px] font-bold text-gray-900">Reject Submission</h3>
              <button 
                onClick={() => setRejectTarget(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[14px] font-medium text-gray-500 mb-4">
              Rejecting: <span className="text-gray-900 font-bold">{rejectTarget.name}</span>
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium text-amber-800">
                The seller will see your rejection reason and can re-submit after making changes.
              </p>
            </div>
            
            <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Rejection Reason *</label>
            <textarea
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              placeholder="e.g. Product description is insufficient, missing proper images..."
              className="h-32 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all resize-none shadow-inner"
              maxLength={500}
            />
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setRejectTarget(null)} className="flex-1 h-12 rounded-xl border border-gray-200 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNotes.trim() || actionLoading === rejectTarget.id}
                className="flex-1 h-12 rounded-xl bg-red-500 text-white text-[14px] font-bold hover:bg-red-600 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === rejectTarget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm Reject
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-0 sm:p-4 lg:p-8">
      <div className="bg-white rounded-none sm:rounded-[32px] shadow-2xl w-full max-w-6xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
               <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Customer Preview</h2>
              <p className="text-[13px] font-medium text-gray-500">How this listing will appear to buyers</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Media gallery */}
            <div className="space-y-4">
              <div className="relative rounded-[32px] overflow-hidden bg-gray-50 border border-gray-100 aspect-square lg:h-[500px] flex items-center justify-center shadow-inner group">
                {allMedia.length > 0 ? (
                  currentIsVideo ? (
                    <video key={currentUrl} src={currentUrl} controls className="w-full h-full object-contain bg-black" />
                  ) : (
                    <img src={currentUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-300">
                    <PackageOpen className="w-20 h-20" />
                    <span className="text-[15px] font-bold">No Media Content</span>
                  </div>
                )}
              </div>
              
              {allMedia.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {allMedia.map((url, idx) => {
                    const isVid = isVideoUrl(url);
                    const active = idx === selectedMedia;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedMedia(idx)}
                        className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${
                          active ? "border-[#8B5CF6] scale-105 shadow-purple-500/10" : "border-transparent hover:border-gray-200"
                        }`}
                      >
                        {isVid ? (
                          <>
                            <video src={url} muted preload="metadata" className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-6 h-6 text-white drop-shadow-md" fill="white" />
                            </div>
                          </>
                        ) : (
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info column */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                 <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-wider">Product Listing</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                 <span className="text-[13px] font-medium text-gray-500 font-mono">ID: {product.id}</span>
              </div>
              
              <h2 className="text-[32px] lg:text-[40px] font-medium text-gray-900 leading-[1.1] mb-4 tracking-tight">{product.name}</h2>

              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                   <Store className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-[14px] font-bold text-gray-500">Official ANGA9 Verified Seller</span>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-[40px] lg:text-[48px] font-medium text-gray-900 leading-none tracking-tight">{formatINR(price)}</span>
                {discount > 0 && (
                  <div className="flex flex-col">
                    <span className="line-through text-[16px] font-bold text-gray-300">{formatINR(product.base_price)}</span>
                    <span className="text-[14px] font-black text-green-500 uppercase tracking-wide">{discount}% OFF SAVINGS</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-[28px] p-6 border border-gray-100 mb-8 space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">Minimum Order</span>
                   <span className="text-[15px] font-black text-gray-900">{product.min_order_qty || 1} {product.unit || "pc"}{(product.min_order_qty || 1) > 1 ? "s" : ""}</span>
                </div>
                <div className="h-px bg-gray-200/60" />
                <div className="flex items-center justify-between">
                   <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">Estimated Total</span>
                   <span className="text-[24px] font-black text-[#8B5CF6] tracking-tight">{formatINR(price * (product.min_order_qty || 1))}</span>
                </div>
                <p className="text-[12px] font-medium text-gray-400 text-center flex items-center justify-center gap-1.5">
                   <Truck className="w-3.5 h-3.5" /> Shipping costs will be calculated at checkout
                </p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider mb-3">Product Overview</h3>
                {product.description ? (
                   <p className="text-[16px] text-gray-600 leading-relaxed font-medium">
                     {product.description}
                   </p>
                ) : (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[14px] font-bold flex items-center gap-2">
                     <AlertCircle className="w-4 h-4" /> Description Missing
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div className="border-t border-gray-100 pt-8 mb-8">
                  <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-[14px] font-medium">
                    {product.brand && <SpecRow label="Brand" value={product.brand} />}
                    {product.country_of_origin && <SpecRow label="Origin" value={product.country_of_origin} />}
                    {typeof product.weight_kg === "number" && <SpecRow label="Weight" value={`${product.weight_kg} kg`} />}
                    {product.sku && <SpecRow label="SKU" value={product.sku} />}
                    {product.hsn_code && <SpecRow label="HSN" value={product.hsn_code} />}
                    {typeof product.gst_rate === "number" && <SpecRow label="GST" value={`${product.gst_rate}%`} />}
                  </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-[#8B5CF6]/5 text-[#8B5CF6] text-[12px] font-bold border border-[#8B5CF6]/10">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky footer with decision buttons */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReject}
            disabled={actionLoading}
            className="flex-1 h-14 rounded-2xl bg-white border border-red-200 text-red-600 text-[15px] font-black hover:bg-red-50 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" /> REJECT SUBMISSION
          </button>
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="flex-1 h-14 rounded-2xl bg-[#22C55E] text-white text-[15px] font-black hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} APPROVE LISTING
          </button>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50">
      <span className="text-gray-400 font-bold text-[12px] uppercase tracking-wider">{label}</span>
      <span className="text-gray-900 font-black">{value}</span>
    </div>
  );
}
