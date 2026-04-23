import { getSupabaseBrowserClient } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** If true, don't throw on error — return null instead */
  silent?: boolean;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  // If in admin portal, send bypass token
  if (typeof document !== 'undefined' && document.cookie.includes('portal=admin')) {
    return { Authorization: 'Bearer ADMIN_BYPASS_TOKEN' };
  }

  try {
    const { data: { session } } = await getSupabaseBrowserClient().auth.getSession();
    if (!session) return {};
    return { Authorization: `Bearer ${session.access_token}` };
  } catch {
    // Supabase client may not be initialized (e.g. admin pages)
    return {};
  }
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
