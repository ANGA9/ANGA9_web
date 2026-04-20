import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function request<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

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
    const errorBody = await res.json().catch(() => ({}));
    const message =
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
