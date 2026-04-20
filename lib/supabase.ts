import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // During static build/prerender, env vars may not exist.
    // Return a dummy client that won't be used at runtime.
    if (typeof window === "undefined") {
      return createBrowserClient(
        "https://placeholder.supabase.co",
        "placeholder-key",
      );
    }
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  client = createBrowserClient(url, key);
  return client;
}
