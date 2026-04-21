"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Cpu,
  ShoppingBag,
  Factory,
  Armchair,
  Briefcase,
} from "lucide-react";
import HeroBanner from "@/components/customer/HeroBanner";
import ProductCard, { type Product } from "@/components/customer/ProductCard";
import { api } from "@/lib/api";

const categoryIcons = [
  { name: "Home Decor", icon: Home },
  { name: "Electronics", icon: Cpu },
  { name: "Retail", icon: ShoppingBag },
  { name: "Industrial", icon: Factory },
  { name: "Furniture", icon: Armchair },
  { name: "Office Essentials", icon: Briefcase },
];

/** Shape returned by GET /api/products */
interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  seller_id: string;
  category_id?: string;
  description?: string;
  base_price: number;
  sale_price?: number | null;
  min_order_qty: number;
  unit: string;
  status: string;
  images: string[];
  tags: string[];
  created_at: string;
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
}

/** Map API product to ProductCard's expected shape */
function toCardProduct(p: ApiProduct, categoryName?: string): Product {
  return {
    id: p.id,
    name: p.name,
    seller: "", // seller name not available in list response
    category: categoryName || "",
    originalPrice: p.base_price,
    price: p.sale_price ?? p.base_price,
    minOrder: `${p.min_order_qty} ${p.unit}${p.min_order_qty > 1 ? "s" : ""}`,
    badge: undefined,
  };
}

export default function CustomerHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        // Fetch products and categories in parallel
        const [productsRes, categoriesRes] = await Promise.all([
          api.get<{ data: ApiProduct[]; total: number }>(
            "/api/products?status=active&limit=12&sort_by=newest"
          ),
          api.get<{ categories: ApiCategory[] } | ApiCategory[]>("/api/categories").catch(() => ({ categories: [] })),
        ]);

        if (cancelled) return;

        // Build category lookup — handle both { categories: [...] } and bare array
        const catMap = new Map<string, string>();
        const rawCats = categoriesRes;
        const cats = Array.isArray(rawCats) ? rawCats : (rawCats as { categories: ApiCategory[] })?.categories ?? [];
        for (const c of cats) {
          catMap.set(c.id, c.name);
        }

        const mapped = (productsRes?.data ?? []).map((p) =>
          toCardProduct(p, p.category_id ? catMap.get(p.category_id) : undefined)
        );
        setProducts(mapped);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="py-6">
      {/* Hero */}
      <HeroBanner />

      {/* Shop by Category */}
      <section style={{ marginTop: 40 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2
            className="font-bold"
            style={{ color: "#1A1A2E", fontSize: 20 }}
          >
            Shop by category
          </h2>
          <button
            className="font-medium transition-opacity hover:opacity-80"
            style={{ color: "#1A6FD4", fontSize: 13 }}
          >
            View All
          </button>
        </div>
        <div
          className="grid grid-cols-3 sm:grid-cols-6"
          style={{ gap: 12 }}
        >
          {categoryIcons.map((cat) => (
            <button
              key={cat.name}
              className="flex flex-col items-center border cursor-pointer transition-all duration-150 hover:border-[#1A6FD4] hover:scale-[1.03]"
              style={{
                background: "#FFFFFF",
                borderColor: "#E8EEF4",
                borderRadius: 16,
                padding: "20px 12px",
                textAlign: "center",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full transition-colors duration-150"
                style={{
                  width: 52,
                  height: 52,
                  background: "#EAF2FF",
                  marginBottom: 10,
                }}
              >
                <cat.icon
                  style={{ width: 22, height: 22, color: "#1A6FD4" }}
                />
              </div>
              <span
                className="font-medium text-center leading-tight"
                style={{ color: "#1A1A2E", fontSize: 13 }}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Discover Products */}
      <section style={{ marginTop: 48 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2
            className="font-bold"
            style={{ color: "#1A1A2E", fontSize: 20 }}
          >
            Discover products for you
          </h2>
          <button
            className="font-medium transition-opacity hover:opacity-80"
            style={{ color: "#1A6FD4", fontSize: 13 }}
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[14px] border"
                style={{ background: "#F3F4F6", borderColor: "#E8EEF4", height: 340 }}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center py-12" style={{ color: "#9CA3AF" }}>
            No products available yet.
          </p>
        )}
      </section>
    </div>
  );
}
