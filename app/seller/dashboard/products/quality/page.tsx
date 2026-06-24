"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { sellerFetch, effectiveSellerId } from "@/lib/api";
import Link from "next/link";
import { Loader2, ArrowLeft, Award, AlertTriangle, CheckCircle2, ChevronRight, Target } from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Product {
  id: string;
  name: string;
  status: string;
  images: string[];
  quality_score?: number;
  quality_nudges?: string[];
}

export default function CatalogQualityPage() {
  const { loading: authLoading, getToken, dbUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (authLoading || !dbUser) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const params = new URLSearchParams({
        seller_id: effectiveSellerId(dbUser.id),
        limit: "100",
      });
      const res = await sellerFetch(`${API}/api/products?${params}`);
      if (res.ok) {
        const d = await res.json();
        setProducts(d.data || []);
      }
    } catch {
      toast.error("Failed to load catalog quality data");
    } finally {
      setLoading(false);
    }
  }, [authLoading, dbUser, getToken]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Compute stats
  const total = products.length;
  const scoredProducts = products.filter(p => typeof p.quality_score === "number");
  const avgScore = scoredProducts.length > 0 
    ? Math.round(scoredProducts.reduce((sum, p) => sum + (p.quality_score || 0), 0) / scoredProducts.length)
    : 0;

  const perfectListings = scoredProducts.filter(p => p.quality_score === 100).length;
  const needsWork = scoredProducts.filter(p => (p.quality_score || 0) < 100).sort((a, b) => (a.quality_score || 0) - (b.quality_score || 0));

  return (
    <main className="w-full mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/seller/dashboard/products" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Catalog Quality</h1>
          <p className="text-[15px] text-gray-500 font-medium">Improve your listings to rank higher and increase sales</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#1A6FD4]" />
        </div>
      ) : total === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">No products to analyze</h2>
          <p className="text-[14px] text-gray-500 mb-6">Add products to your catalog to get quality scores and recommendations.</p>
          <Link href="/seller/dashboard/products/new" className="inline-flex px-6 py-2.5 rounded-xl font-bold bg-white border-2 border-[#1A6FD4] text-[#1A6FD4] hover:bg-gray-50">
            Add Product
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 w-full h-2 ${avgScore >= 80 ? 'bg-green-500' : avgScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
              <Award className={`w-10 h-10 mb-2 ${avgScore >= 80 ? 'text-green-500' : avgScore >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-1">Average Score</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[48px] font-black text-gray-900 tracking-tighter leading-none">{avgScore}</span>
                <span className="text-[20px] font-bold text-gray-400">/100</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Perfect Listings</p>
                  <p className="text-[24px] font-black text-gray-900">{perfectListings} <span className="text-[14px] font-medium text-gray-500">products</span></p>
                </div>
              </div>
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                These products have complete attributes, descriptions, and media. They will rank the highest in search.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Needs Work</p>
                  <p className="text-[24px] font-black text-gray-900">{needsWork.length} <span className="text-[14px] font-medium text-gray-500">products</span></p>
                </div>
              </div>
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                These products are missing key attributes that could hurt your visibility and conversion rates.
              </p>
            </div>
          </div>

          {/* Detailed Nudges List */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-[16px] font-bold text-gray-900">Actionable Recommendations</h2>
              <p className="text-[13px] text-gray-500 font-medium mt-1">Review the list below and edit your products to increase their scores.</p>
            </div>
            
            {needsWork.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-[16px] font-bold text-gray-900">Great job!</p>
                <p className="text-[14px] text-gray-500">Your entire catalog is perfectly optimized.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {needsWork.map(p => (
                  <div key={p.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-gray-100 shrink-0">
                          {p.images && p.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-gray-400" /></div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-gray-900 leading-tight mb-1">{p.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              (p.quality_score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                              (p.quality_score || 0) >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              Score: {p.quality_score}/100
                            </span>
                            <span className="text-[12px] text-gray-400 font-medium">•</span>
                            <span className="text-[12px] text-gray-500 font-medium capitalize">{p.status.replace("_", " ")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {p.quality_nudges?.map((nudge, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-red-50/50 text-red-700 text-[13px] font-medium px-3 py-2 rounded-lg border border-red-100">
                            <span className="shrink-0 mt-0.5">⚠️</span>
                            {nudge}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="sm:w-32 flex sm:flex-col items-center justify-center shrink-0">
                      <Link
                        href={`/seller/dashboard/products/${p.id}`}
                        className="w-full flex items-center justify-center gap-1 px-4 py-2.5 text-[13px] font-bold rounded-xl transition-colors bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50"
                      >
                        Edit <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
