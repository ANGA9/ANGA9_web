import { createBrowserClient } from "@supabase/ssr";

function getPortalContext(): "seller" | "admin" | "support" | "customer" {
  if (typeof window === "undefined") return "customer";
  const host = window.location.hostname;
  const path = window.location.pathname;

  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/support")) return "support";
  if (host.startsWith("seller.") || path.startsWith("/seller")) return "seller";
  return "customer";
}

const clients: Record<string, ReturnType<typeof createBrowserClient>> = {};

export function getSupabaseBrowserClient() {
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

  const portal = getPortalContext();
  if (clients[portal]) return clients[portal];

  const client = createBrowserClient(url, key, {
    auth: {
      storageKey: `anga9_${portal}_auth`,
    },
  });

  clients[portal] = client;
  return client;
}

