"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Package, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/Header";

interface Product {
  id: string; name: string; slug: string; base_price: number;
  min_order_qty?: number; status: string; created_at: string;
}

export default function ReviewsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ data: Product[] }>("/api/products?status=pending_review&limit=50");
        setProducts(res?.data || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen"><Header /><div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" /></div></div>;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6 xl:p-8">
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-anga-text">Product Reviews</h1>
          <p className="text-[13px] text-anga-text-secondary">{products.length} product{products.length !== 1 ? "s" : ""} awaiting review</p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-anga-border p-12 text-center">
            <Package className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
            <h2 className="text-[16px] font-bold text-anga-text mb-2">No Pending Reviews</h2>
            <p className="text-[13px] text-anga-text-secondary">All product submissions have been reviewed</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-anga-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-anga-border bg-[#F8FBFF]">
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Product Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Min Qty</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Submitted</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-anga-border last:border-0 hover:bg-[#F8FBFF] transition-colors">
                      <td className="px-4 py-3 font-medium text-anga-text">{p.name}</td>
                      <td className="px-4 py-3 text-anga-text">₹{p.base_price}</td>
                      <td className="px-4 py-3 text-[#4B5563]">{p.min_order_qty || 1}</td>
                      <td className="px-4 py-3 text-[#9CA3AF]">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#22C55E] text-white text-[11px] font-semibold hover:bg-[#16A34A] transition-colors">
                            <CheckCircle2 className="w-3 h-3" /> Approve
                          </button>
                          <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EF4444] text-white text-[11px] font-semibold hover:bg-[#DC2626] transition-colors">
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
    </div>
  );
}
