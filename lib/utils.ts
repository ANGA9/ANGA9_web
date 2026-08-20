import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fdfdrtbvyepvkvfawhqp.supabase.co";
const CDN_BASE = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/public-assets`
  : "";

export function parseImageArray(images: unknown): string[] {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.flatMap(item => parseImageArray(item)).filter(Boolean);
  }
  if (typeof images === "string") {
    const trimmed = images.trim();
    if (!trimmed) return [];
    // If it's a JSON array string e.g. ["url1", "url2"]
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseImageArray(parsed);
      } catch {
        // Fall through
      }
    }
    // If it's a Postgres array string e.g. {"url1","url2"}
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const inner = trimmed.slice(1, -1);
      if (!inner) return [];
      return inner
        .split(",")
        .map(s => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

export function cdnUrl(path: string | null | undefined): string {
  if (!path || typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";

  // If path is a stringified JSON array or Postgres array, parse first item
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = parseImageArray(trimmed);
    if (parsed.length > 0) return cdnUrl(parsed[0]);
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (!SUPABASE_URL) return trimmed;

  // If it specifies bucket: product-images or product-videos
  if (trimmed.startsWith("product-images/") || trimmed.startsWith("/product-images/")) {
    const cleanPath = trimmed.replace(/^\/+/, "");
    return `${SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
  }
  if (trimmed.startsWith("product-videos/") || trimmed.startsWith("/product-videos/")) {
    const cleanPath = trimmed.replace(/^\/+/, "");
    return `${SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
  }

  // If it's a folder/file pattern like <brand_uuid>/<timestamp>-<rand>.<ext>
  // (which is uploaded to product-images bucket)
  const isStoragePath = /^[0-9a-fA-F-]{36}\/.+/i.test(trimmed.replace(/^\/+/, ""));
  if (isStoragePath) {
    const cleanPath = trimmed.replace(/^\/+/, "");
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${cleanPath}`;
  }

  if (trimmed.startsWith("images/") || trimmed.startsWith("/images/") ||
      trimmed.startsWith("banners/") || trimmed.startsWith("/banners/") ||
      trimmed.startsWith("illustrations/") || trimmed.startsWith("/illustrations/") ||
      trimmed.startsWith("avatars/") || trimmed.startsWith("/avatars/")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
    return `${CDN_BASE}/${cleanPath}`;
  }

  if (!CDN_BASE) return trimmed;
  return `${CDN_BASE}${trimmed.startsWith("/") ? trimmed : "/" + trimmed}`;
}

export function getProductImage(product: any): string {
  if (!product) return "";
  const list = parseImageArray(product.images || product.image_urls || product.image || product.imageUrl);
  if (list.length > 0) {
    return cdnUrl(list[0]);
  }
  return "";
}
