import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CDN_BASE = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/public-assets`
  : "";

export function cdnUrl(path: string): string {
  if (!CDN_BASE) return path;
  if (!path.startsWith("/")) return path;
  return `${CDN_BASE}${path}`;
}
