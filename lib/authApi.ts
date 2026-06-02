import { api } from "./api";

export interface CheckIdentityResult {
  exists: boolean;
  /** Shape of the existing account, when exists=true */
  created_via?: "phone" | "email" | "both";
  /** Masked hint of the OPPOSITE identity, e.g. "98****3210" or "b***@example.com" */
  hint?: string;
}

/**
 * Pre-flight check used by the login UI to prevent split accounts
 * (a phone-first user later signing in with their linked email on a new
 * device would otherwise get a duplicate auth.users row + duplicate
 * public.users row). See backend `auth.service.ts#checkIdentity` for the
 * matching server logic.
 *
 * The endpoint is public and rate-limited at the gateway. We pass `silent`
 * so a transient backend outage degrades to "let Supabase handle it" rather
 * than blocking login entirely — the OTP path itself will still work.
 */
export const authApi = {
  async checkIdentity(query: { email?: string; phone?: string }): Promise<CheckIdentityResult> {
    const params = new URLSearchParams();
    if (query.email) params.set("email", query.email);
    if (query.phone) params.set("phone", query.phone);

    const res = await api.get<CheckIdentityResult>(
      `/api/auth/check-identity?${params.toString()}`,
      { silent: true },
    );
    // silent:true returns null on any non-OK response — treat as "don't block".
    return res ?? { exists: false };
  },
};
