import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CDN_BASE = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/public-assets`
  : "";

export function cdnUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  if (!SUPABASE_URL) return path;
  if (path.startsWith("product-images/") || path.startsWith("/product-images/")) {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
  }
  if (!CDN_BASE) return path;
  return `${CDN_BASE}${path.startsWith("/") ? path : "/" + path}`;
}
