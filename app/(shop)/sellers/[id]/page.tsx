"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Store, Star, BadgeCheck, MapPin, Package, ShoppingBag, Loader2,
  ArrowLeft, ExternalLink,
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: t.bluePrimary }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
        <Store className="w-12 h-12 mb-4" style={{ color: t.textSecondary }} />
        <h1 className="text-lg font-bold mb-2" style={{ color: t.textPrimary }}>
          Storefront unavailable
        </h1>
        <p className="text-sm mb-6" style={{ color: t.textSecondary }}>
          {error ?? "This seller's storefront isn't published yet."}
        </p>
        <Link href="/" className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: t.bluePrimary }}>
          Back to home
        </Link>
      </div>
    );
  }

  const p = data.profile;
  const storeName = p.store_name || data.user?.company_name || data.user?.full_name || "Seller";
  const location = [p.city, p.state, p.country].filter(Boolean).join(", ");
  const socials = Object.entries(p.social_links ?? {}).filter(([, v]) => !!v);

  return (
    <div className="min-h-screen pb-24 md:pb-12" style={{ background: "#F8FBFF" }}>
      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: t.bluePrimary }}
        >
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      {/* Hero banner */}
      <header className="max-w-7xl mx-auto px-4 md:px-6 mt-3">
        <div
          className="relative rounded-2xl overflow-hidden h-32 md:h-56"
          style={{
            background: p.storefront_banner_url
              ? `url(${p.storefront_banner_url}) center/cover`
              : `linear-gradient(135deg, ${t.bluePrimary}, #4338CA)`,
          }}
        >
          {!p.storefront_banner_url && (
            <div className="absolute inset-0 flex items-center justify-center text-white/70">
              <Store size={48} />
            </div>
          )}
        </div>

        {/* Profile strip */}
        <div className="relative flex items-end gap-3 md:gap-5 -mt-8 md:-mt-10 px-2">
          <div
            className="w-16 h-16 md:w-24 md:h-24 rounded-2xl border-4 border-white shadow-md flex items-center justify-center bg-white overflow-hidden flex-shrink-0"
          >
            {p.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.logo_url} alt={storeName} className="w-full h-full object-cover" />
            ) : (
              <Store size={32} style={{ color: t.bluePrimary }} />
            )}
          </div>
          <div className="pb-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base md:text-2xl font-bold truncate" style={{ color: t.textPrimary }}>
                {storeName}
              </h1>
              {p.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "#DCFCE7", color: "#15803D" }}>
                  <BadgeCheck size={12} /> Verified
                </span>
              )}
            </div>
            {location && (
              <p className="text-xs md:text-sm mt-0.5 inline-flex items-center gap-1" style={{ color: t.textSecondary }}>
                <MapPin size={12} /> {location}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Stats strip */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-5">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <Stat icon={<Package size={16} />} label="Products" value={data.stats.active_products} />
          <Stat icon={<ShoppingBag size={16} />} label="Orders fulfilled" value={data.stats.orders_fulfilled} />
          <Stat
            icon={<Star size={16} fill="#F59E0B" color="#F59E0B" />}
            label={`Rating (${data.stats.rating_count})`}
            value={data.stats.avg_rating > 0 ? data.stats.avg_rating.toFixed(1) : "—"}
          />
        </div>
      </section>

      {/* About */}
      {p.about_md && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
          <div className="rounded-2xl border bg-white p-5" style={{ borderColor: t.border }}>
            <h2 className="font-bold mb-2" style={{ color: t.textPrimary }}>About</h2>
            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: t.textSecondary }}>
              {p.about_md}
            </p>
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {socials.map(([k, v]) => (
                  <a
                    key={k}
                    href={v}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium underline"
                    style={{ color: t.bluePrimary }}
                  >
                    {k} <ExternalLink size={10} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-bold" style={{ color: t.textPrimary }}>
            Products
          </h2>
          {data.stats.active_products > 0 && (
            <span className="text-xs" style={{ color: t.textSecondary }}>
              {products.length} of {data.stats.active_products}
            </span>
          )}
        </div>
        {products.length === 0 ? (
          <div className="rounded-xl border p-8 text-center text-sm bg-white" style={{ borderColor: t.border, color: t.textSecondary }}>
            This seller hasn't listed any products yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((prod) => {
              const price = prod.sale_price ?? prod.base_price;
              const hasDiscount = prod.sale_price && prod.base_price > prod.sale_price;
              return (
                <Link
                  key={prod.id}
                  href={`/products/${prod.id}`}
                  className="rounded-xl border bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                  style={{ borderColor: t.border }}
                >
                  <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                    {prod.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={32} style={{ color: t.textSecondary }} />
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="text-sm font-medium line-clamp-2 mb-2" style={{ color: t.textPrimary }}>
                      {prod.name}
                    </h3>
                    <div className="mt-auto flex items-baseline gap-2">
                      <span className="font-bold text-sm md:text-base" style={{ color: t.textPrimary }}>
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                      {hasDiscount && (
                        <span className="line-through text-xs" style={{ color: t.textSecondary }}>
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
      </section>

      {/* Rating average rendered nicely */}
      {data.stats.avg_rating > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
          <div className="rounded-2xl border bg-white p-5 flex items-center gap-4" style={{ borderColor: t.border }}>
            <StarRow rating={data.stats.avg_rating} size={20} />
            <p className="text-sm" style={{ color: t.textSecondary }}>
              <span className="font-semibold" style={{ color: t.textPrimary }}>
                {data.stats.avg_rating.toFixed(1)}
              </span>{" "}
              average across {data.stats.rating_count} customer review{data.stats.rating_count !== 1 ? "s" : ""}.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-white p-3 md:p-4" style={{ borderColor: t.border }}>
      <div className="flex items-center gap-2 mb-1" style={{ color: t.textSecondary }}>
        {icon}
        <span className="text-[11px] md:text-xs">{label}</span>
      </div>
      <div className="text-base md:text-xl font-bold" style={{ color: t.textPrimary }}>
        {value}
      </div>
    </div>
  );
}
