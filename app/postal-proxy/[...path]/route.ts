// Server-side proxy for api.postalpincode.in.
//
// As of mid-2026 the upstream TLS certificate is expired
// (browser fails with ERR_CERT_DATE_INVALID). Until they renew it,
// we proxy the request from Node, where we can accept the bad cert
// for this single host without weakening browser TLS for users.
//
// Accepts any subpath: /api/util/postal/pincode/110019,
//                      /api/util/postal/postoffice/Saket, etc.
// The upstream API is read-only and has no authentication.

import { type NextRequest } from "next/server";
import https from "node:https";

export const runtime = "nodejs";
// Always re-fetch — pincode data is small and we don't want stale results
// across browsers; upstream sets its own cache headers anyway.
export const dynamic = "force-dynamic";

// Scoped to this proxy only. Does NOT affect the global fetch agent.
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!path?.length) {
    return Response.json({ error: "missing path" }, { status: 400 });
  }

  const upstream = `https://api.postalpincode.in/${path.map(encodeURIComponent).join("/")}`;

  try {
    // Node's undici fetch accepts an agent via `dispatcher`, but the simplest
    // portable path is to drop to the https module for this one call.
    const body = await new Promise<string>((resolve, reject) => {
      const req = https.get(upstream, { agent: insecureAgent }, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`upstream ${res.statusCode}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        res.on("error", reject);
      });
      req.on("error", reject);
      req.setTimeout(10_000, () => req.destroy(new Error("upstream timeout")));
    });

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // Cache pincode lookups for a day — they almost never change.
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "upstream error" },
      { status: 502 },
    );
  }
}
