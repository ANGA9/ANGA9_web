import { getSupabaseBrowserClient } from "./supabase";

let API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Proxy localhost requests through Next.js on the client to avoid mobile PNA popups
// and to allow mobile testing without exposing port 4000 separately.
if (typeof window !== "undefined" && API_URL.includes("localhost")) {
  API_URL = "";
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** If true, don't throw on error — return null instead */
  silent?: boolean;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  // Dev-only admin bypass — only when NEXT_PUBLIC_ADMIN_BYPASS_TOKEN is set
  // (which it should NEVER be in production Vercel env vars).
  const devBypass = process.env.NEXT_PUBLIC_ADMIN_BYPASS_TOKEN;
  if (
    devBypass &&
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin') &&
    document.cookie.includes('portal=admin')
  ) {
    return { Authorization: `Bearer ${devBypass}` };
  }

  try {
    const headers: Record<string, string> = {};
    const { data: { session } } = await getSupabaseBrowserClient().auth.getSession();
    
    if (session) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    // Inject X-Brand-ID if we have one selected
    if (typeof window !== 'undefined') {
      const activeBrand = localStorage.getItem('anga_active_brand_id');
      if (activeBrand) {
        headers['X-Brand-ID'] = activeBrand;
      }
    }

    return headers;
  } catch {
    // Supabase client may not be initialized (e.g. admin pages)
    return {};
  }
}

/**
 * Read the active brand id chosen in the Brand Switcher.
 * Returns null when no brand is selected (parent acts as self).
 */
export function getActiveBrandId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("anga_active_brand_id");
}

/**
 * The effective seller id to use for `seller_id=` query params and storage
 * folders. Pages that filter products/orders by an explicit seller_id must
 * use THIS, not dbUser.id — otherwise switching brands has no effect on reads.
 */
export function effectiveSellerId(fallbackUserId: string): string {
  return getActiveBrandId() || fallbackUserId;
}

/**
 * Drop-in replacement for `fetch(\`${API}/...\`, { headers: { Authorization }})`
 * used across the seller dashboard. It attaches the Supabase bearer token AND
 * the X-Brand-ID header (when a child brand is active), so every seller-portal
 * request operates on the selected brand's context. Returns the raw Response so
 * existing `res.ok` / `res.json()` call sites keep working unchanged.
 *
 * `path` may be an absolute URL or a path; callers currently pass
 * `\`${API}${path}\``, which is preserved.
 */
export async function sellerFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const authHeaders = await getAuthHeaders(); // includes Authorization + X-Brand-ID
  return fetch(input, {
    ...init,
    headers: {
      ...authHeaders,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

async function request<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, headers: customHeaders, silent, ...rest } = options;

  const authHeaders = await getAuthHeaders();

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...customHeaders,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    if (silent) return null as T;
    const errorBody = await res.json().catch(() => ({}));
    const message =
      (errorBody as Record<string, string>).error ||
      (errorBody as Record<string, string>).message ||
      `API error: ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get<T = unknown>(path: string, opts?: ApiOptions) {
    return request<T>(path, { ...opts, method: "GET" });
  },
  post<T = unknown>(path: string, body?: unknown, opts?: ApiOptions) {
    return request<T>(path, { ...opts, method: "POST", body });
  },
  put<T = unknown>(path: string, body?: unknown, opts?: ApiOptions) {
    return request<T>(path, { ...opts, method: "PUT", body });
  },
  patch<T = unknown>(path: string, body?: unknown, opts?: ApiOptions) {
    return request<T>(path, { ...opts, method: "PATCH", body });
  },
  delete<T = unknown>(path: string, opts?: ApiOptions) {
    return request<T>(path, { ...opts, method: "DELETE" });
  },
};
