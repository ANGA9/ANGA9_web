"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Loader2, Package, CheckCircle2, XCircle, X } from "lucide-react";
import Header from "@/components/Header";

interface Product {
  id: string; name: string; slug: string; base_price: number;
  min_order_qty?: number; unit?: string; description?: string;
  status: string; created_at: string;
}

export default function ReviewsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Product | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
                      <td className="px-4 py-3 text-[#4B5563] max-w-[250px] truncate">{p.description || "—"}</td>
                      <td className="px-4 py-3 text-anga-text font-medium">₹{p.base_price}</td>
                      <td className="px-4 py-3 text-[#4B5563]">{p.min_order_qty || 1} {p.unit || "pc"}</td>
                      <td className="px-4 py-3 text-[#9CA3AF]">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
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

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
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
