"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { Plus, Loader2, Package } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price?: number;
  min_order_qty?: number;
  unit?: string;
  status: string;
  images?: string[];
  created_at: string;
  review_notes?: string;
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-[#F0FDF4] text-[#22C55E] border-[#BBF7D0]",
  pending_review: "bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A]",
  draft: "bg-[#F3F4F6] text-[#9CA3AF] border-[#E8EEF4]",
  archived: "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]",
  rejected: "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Published",
  pending_review: "Pending Review",
  draft: "Draft",
  archived: "Archived",
  rejected: "Rejected",
};

export default function ProductsPage() {
  const { loading: authLoading, getToken, dbUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [hoveredRejected, setHoveredRejected] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !dbUser) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(
          `${API}/api/products?seller_id=${dbUser.id}&status=active,pending_review,draft,archived,rejected&limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const d = await res.json();
          setProducts(d.data || []);
          setTotal(d.total || 0);
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
    })();
  }, [authLoading, dbUser, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E]">Products</h1>
          <p className="text-sm md:text-base text-[#9CA3AF]">
            {total} product{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/seller/dashboard/products/new"
          className="flex items-center gap-2 h-10 px-5 bg-[#4338CA] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#3730A3] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-12 text-center">
          <Package className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
          <h2 className="text-base md:text-lg font-bold text-[#1A1A2E] mb-2">No Products Yet</h2>
          <p className="text-sm md:text-base text-[#9CA3AF] mb-6">Start by adding your first product to list on ANGA9</p>
          <Link
            href="/seller/dashboard/products/new"
            className="inline-flex items-center gap-2 h-10 px-5 bg-[#1A6FD4] text-white text-sm md:text-base font-semibold rounded-lg hover:bg-[#155bb5] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8EEF4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b border-[#E8EEF4] bg-[#F8FBFF]">
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Min Qty</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#4B5563]">Added</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[#E8EEF4] last:border-0 hover:bg-[#F8FBFF] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1A1A2E]">{p.name}</p>
                    </td>
                    <td className="px-4 py-3 text-[#1A1A2E] font-medium">₹{p.base_price}</td>
                    <td className="px-4 py-3 text-[#4B5563]">
                      {p.min_order_qty || 1} {p.unit || "pc"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs md:text-sm font-semibold border cursor-pointer transition-opacity ${
                            STATUS_BADGE[p.status] || STATUS_BADGE.draft
                          }`}
                          onMouseEnter={() => p.status === "rejected" && setHoveredRejected(p.id)}
                          onMouseLeave={() => setHoveredRejected(null)}
                        >
                          {STATUS_LABEL[p.status] || p.status}
                        </span>

                        {/* Rejection Tooltip */}
                        {p.status === "rejected" && hoveredRejected === p.id && p.review_notes && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1A1A2E] text-white text-xs md:text-sm rounded-lg p-3 shadow-lg z-50 pointer-events-none">
                            <p className="font-semibold mb-2">Rejection Reason:</p>
                            <p className="text-white/90 leading-relaxed">{p.review_notes}</p>
                            <div className="absolute top-full left-4 w-2 h-2 bg-[#1A1A2E] transform rotate-45"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF]">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
