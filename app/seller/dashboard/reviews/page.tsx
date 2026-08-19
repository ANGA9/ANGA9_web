"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Loader2, Star, MessageSquare, ArrowLeft, Filter, Search } from "lucide-react";

interface Product {
  seller_id: string;
  name: string;
  image_urls: string[];
}

interface Review {
  id: string;
  product_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  helpful_count: number;
  customer_id: string;
  products: Product;
}

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Review[] }>(`/api/products/seller/reviews?sort=${sort}`, { silent: true });
      setReviews(res?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [sort]);

  const filteredReviews = reviews.filter(r => {
    const term = search.toLowerCase();
    return (
      r.body?.toLowerCase().includes(term) ||
      r.title?.toLowerCase().includes(term) ||
      r.products?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <main className="w-full mx-auto max-w-7xl px-3 sm:px-4 py-6 md:px-8 md:py-10 text-[#1A1A2E]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Customer Reviews</h1>
          <p className="text-[15px] text-gray-500 font-medium mt-1">See what customers are saying about your products.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1A6FD4] transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews or products..."
            className="w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 py-3.5 text-[15px] font-medium outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm"
          />
        </div>
        <div className="relative group min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1A6FD4] transition-colors" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-12 pr-10 py-3.5 text-[15px] font-bold text-gray-900 outline-none focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="rating_asc">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <svg className="h-4 w-4 text-gray-400 group-focus-within:text-[#1A6FD4] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-2">No reviews found</h3>
          <p className="text-[14px] text-gray-500 font-medium max-w-sm">
            {search ? "No reviews match your search." : "You haven't received any product reviews yet. They will appear here once customers start reviewing your items."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((r) => (
            <div key={r.id} className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-[14px] font-bold text-gray-500 uppercase tracking-wide">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {r.helpful_count > 0 && (
                  <span className="bg-blue-50 text-[#1A6FD4] border border-blue-200 text-[14px] font-bold px-2 py-1 rounded-md">
                    {r.helpful_count} Helpful
                  </span>
                )}
              </div>
              
              <p className="text-[15px] text-gray-900 font-medium leading-relaxed mb-6 flex-1 line-clamp-4">
                {r.title && <span className="font-bold block mb-1">{r.title}</span>}
                &quot;{r.body || "No comment"}&quot;
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {r.products?.image_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={r.products.image_urls[0].startsWith('http') ? r.products.image_urls[0] : `${process.env.NEXT_PUBLIC_CDN_URL || ''}${r.products.image_urls[0]}`} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-gray-300 font-bold text-xs">IMG</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Product</p>
                  <Link href={`/seller/dashboard/products/${r.product_id}`} className="text-[14px] font-bold text-gray-900 truncate hover:text-[#1A6FD4] transition-colors">
                    {r.products?.name || "Unknown Product"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
