"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Store, Star, BadgeCheck, MapPin, Package, ShoppingBag, Loader2,
  ArrowLeft, ExternalLink, Info, Grid, ShieldCheck
} from "lucide-react";
import { api } from "@/lib/api";
import { getStorefront, type Storefront } from "@/lib/sellersApi";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price?: number | null;
  images?: string[];
  unit?: string;
  min_order_qty?: number;
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="inline-flex items-center gap-0.5 align-middle">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(rating) ? "#F59E0B" : "transparent"}
          color={n <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
    </div>
  );
}

export default function PublicSellerStorefront() {
  const params = useParams<{ id: string }>();
  const sellerId = params.id;

  const [data, setData] = useState<Storefront | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [storefront, prods] = await Promise.all([
          getStorefront(sellerId),
          api.get<{ data: ProductRow[] } | ProductRow[]>(
            `/api/products?seller_id=${sellerId}&status=active&limit=24`,
            { silent: true },
          ).catch(() => ({ data: [] as ProductRow[] })),
        ]);
        if (cancelled) return;
        setData(storefront);
        const rows = Array.isArray(prods) ? prods : prods?.data ?? [];
        setProducts(rows);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Storefront not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1A6FD4] mb-4" />
        <span className="text-gray-500 font-medium">Loading storefront...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center bg-[#F8FAFC]">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6">
           <Store className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Storefront unavailable
        </h1>
        <p className="text-[15px] font-medium text-gray-500 mb-8 max-w-md">
          {error ?? "This seller's storefront isn't published yet. Check back later."}
        </p>
        <Link href="/" className="rounded-2xl px-8 py-3.5 text-[15px] font-bold text-white bg-[#1A6FD4] hover:bg-[#155bb5] transition-colors shadow-md">
          Back to Home
        </Link>
      </div>
    );
  }

  const p = data.profile;
  const storeName = p.store_name || data.user?.company_name || data.user?.full_name || "Seller";
  const location = [p.city, p.state, p.country].filter(Boolean).join(", ");
  const socials = Object.entries(p.social_links ?? {}).filter(([, v]) => !!v);

  return (
    <div className="min-h-screen pb-24 md:pb-16 bg-[#F8FAFC] font-sans">
      {/* Back nav - floating glass */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md text-[14px] font-bold shadow-lg hover:shadow-xl hover:bg-white transition-all text-gray-800"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      {/* Hero banner - edge to edge with gradient overlay */}
      <header className="relative h-[280px] md:h-[380px] w-full overflow-hidden">
        {p.storefront_banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.storefront_banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A6FD4] via-indigo-600 to-purple-700"></div>
        )}
        
        {/* Soft gradient overlay for text readability and premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent opacity-80"></div>
        
        {/* Stats overlapping banner on bottom right (Desktop) */}
        <div className="hidden lg:flex absolute bottom-8 right-10 gap-5 z-10">
           <GlassStat icon={<Package size={18} />} label="Active Products" value={data.stats.active_products} />
           <GlassStat icon={<ShoppingBag size={18} />} label="Orders Fulfilled" value={data.stats.orders_fulfilled} />
           <GlassStat icon={<Star size={18} fill="#F59E0B" color="#F59E0B" />} label="Avg Rating" value={data.stats.avg_rating > 0 ? data.stats.avg_rating.toFixed(1) : "—"} />
        </div>
      </header>

      {/* Profile Info - Overlapping */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 relative -mt-16 md:-mt-24 mb-12 z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Logo */}
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] bg-white p-2 shadow-2xl ring-1 ring-black/5 flex-shrink-0 relative group">
            <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-gray-50 flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.02]">
              {p.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo_url} alt={storeName} className="w-full h-full object-cover" />
              ) : (
                <Store size={48} className="text-gray-300" />
              )}
            </div>
            {p.is_verified && (
              <div className="absolute -bottom-3 -right-3 bg-green-500 text-white p-2.5 rounded-full shadow-xl border-4 border-white transform transition-transform hover:scale-110">
                <BadgeCheck size={28} />
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="pt-2 lg:pt-[100px] flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-[42px] font-extrabold text-gray-900 tracking-tight flex items-center gap-3 leading-tight">
                  {storeName}
                </h1>
                {location && (
                  <p className="text-[15px] md:text-[17px] font-medium text-gray-500 mt-2.5 flex items-center gap-2">
                    <MapPin size={18} className="text-[#1A6FD4]" /> {location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats (Only visible on small screens) */}
        <div className="grid grid-cols-3 gap-3 mt-8 lg:hidden">
           <MobileStat icon={<Package size={18} />} label="Products" value={data.stats.active_products} />
           <MobileStat icon={<ShoppingBag size={18} />} label="Orders" value={data.stats.orders_fulfilled} />
           <MobileStat icon={<Star size={18} fill="#F59E0B" color="#F59E0B" />} label="Rating" value={data.stats.avg_rating > 0 ? data.stats.avg_rating.toFixed(1) : "—"} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Sidebar: About & Socials */}
        <div className="w-full lg:w-[360px] flex-shrink-0 space-y-6">
          {p.about_md && (
            <div className="bg-white rounded-3xl p-7 md:p-8 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
              <h2 className="text-[18px] font-bold text-gray-900 mb-5 flex items-center gap-2.5">
                <Info size={22} className="text-[#1A6FD4]" /> About Store
              </h2>
              <p className="text-[15px] leading-relaxed text-gray-600 whitespace-pre-wrap font-medium">
                {p.about_md}
              </p>
              
              {socials.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2.5">
                  {socials.map(([k, v]) => (
                    <a
                      key={k} href={v} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#1A6FD4] hover:text-white rounded-xl text-[13px] font-bold text-gray-700 capitalize transition-all shadow-sm inline-flex items-center gap-1.5"
                    >
                      {k} <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trust Badge */}
          <div className="bg-gradient-to-br from-[#1A6FD4] to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
             <ShieldCheck size={36} className="mb-5 opacity-90 drop-shadow-md" />
             <h3 className="text-[20px] font-bold mb-3 tracking-tight">Shop with Confidence</h3>
             <p className="text-white/85 text-[15px] leading-relaxed font-medium">
               All orders from this seller are protected by ANGA9's secure payment gateway, fast shipping, and easy return policy.
             </p>
          </div>
          
          {/* Average Rating Block */}
          {data.stats.avg_rating > 0 && (
            <div className="bg-white rounded-3xl p-7 shadow-sm ring-1 ring-black/5 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Star size={32} fill="#F59E0B" color="#F59E0B" />
              </div>
              <div>
                <div className="text-[28px] font-extrabold text-gray-900 leading-none mb-1">
                  {data.stats.avg_rating.toFixed(1)}
                </div>
                <div className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">
                  Based on {data.stats.rating_count} reviews
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Content: Products */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-[24px] md:text-[28px] font-bold text-gray-900 flex items-center gap-3 tracking-tight">
              <Grid size={28} className="text-[#1A6FD4]" /> All Products
            </h2>
            {data.stats.active_products > 0 && (
              <span className="px-4 py-2 bg-blue-50 text-[#1A6FD4] rounded-full text-[14px] font-bold shadow-sm">
                Showing {products.length} Items
              </span>
            )}
          </div>
          
          {products.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Package size={36} className="text-gray-300" />
              </div>
              <h3 className="text-[20px] font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-[15px] text-gray-500 font-medium">This seller hasn't listed any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((prod) => {
                const price = prod.sale_price ?? prod.base_price;
                const hasDiscount = prod.sale_price && prod.base_price > prod.sale_price;
                const discountPct = hasDiscount ? Math.round(((prod.base_price - prod.sale_price!) / prod.base_price) * 100) : 0;
                
                return (
                  <Link
                    key={prod.id}
                    href={`/products/${prod.id}`}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
                  >
                    <div className="aspect-[4/5] bg-[#F8FAFC] relative overflow-hidden">
                      {prod.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package size={48} className="text-gray-200" /></div>
                      )}
                      {hasDiscount && (
                        <div className="absolute top-4 left-4 bg-[#EF4444] text-white text-[12px] font-bold px-3 py-1.5 rounded-xl shadow-md">
                          {discountPct}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-5 md:p-6 flex-1 flex flex-col">
                      <h3 className="text-[15px] md:text-[16px] font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-[#1A6FD4] transition-colors leading-snug">
                        {prod.name}
                      </h3>
                      <div className="mt-auto pt-4 border-t border-gray-50 flex flex-wrap items-end gap-2">
                        <span className="text-[18px] md:text-[22px] font-extrabold text-gray-900 tracking-tight">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                          <span className="line-through text-[14px] text-gray-400 font-medium mb-1">
                            ₹{prod.base_price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GlassStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 flex flex-col gap-1 min-w-[140px] shadow-2xl hover:bg-white/20 transition-colors cursor-default">
      <div className="flex items-center gap-2 text-white/90 font-semibold text-[13px] uppercase tracking-wide">
        {icon} {label}
      </div>
      <div className="text-[28px] font-extrabold text-white tracking-tight mt-1">
        {value}
      </div>
    </div>
  );
}

function MobileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-black/5 flex flex-col items-center text-center gap-1.5">
      <div className="flex justify-center text-[#1A6FD4] mb-1 bg-blue-50 p-2.5 rounded-full">
        {icon}
      </div>
      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-[20px] font-extrabold text-gray-900">{value}</div>
    </div>
  );
}
