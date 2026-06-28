// Server-side proxy for the Ola Maps Platform (api.olamaps.io).
//
// Why a proxy:
//   1. Keeps OLA_MAPS_API_KEY server-side — it is NOT a NEXT_PUBLIC_ var, so it
//      never reaches the browser bundle. The client calls /ola-proxy/... and we
//      append the key here.
//   2. Same-origin from the browser's POV, avoiding mobile PNA / CORS popups,
//      matching the existing postal-proxy convention.
//
// Accepts any Ola subpath, e.g.:
//   /ola-proxy/places/v1/reverse-geocode?latlng=12.99,77.61
//   /ola-proxy/places/v1/autocomplete?input=koramangala
// The `api_key` query param is injected here and must NOT be sent by the client.

import { type NextRequest } from "next/server";

export const runtime = "nodejs";
// Reverse-geocode/autocomplete results are request-specific; don't cache at the
// edge. (Ola also rate-limits, so we keep calls explicit and on-demand.)
export const dynamic = "force-dynamic";

const OLA_HOST = "https://api.olamaps.io";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!path?.length) {
    return Response.json({ error: "missing path" }, { status: 400 });
  }

  const apiKey = process.env.OLA_MAPS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Location service not configured" },
      { status: 503 },
    );
  }

  // Rebuild the upstream URL: preserve the caller's query params, then append
  // our server-held api_key (overriding any client-supplied one for safety).
  const incoming = req.nextUrl.searchParams;
  const search = new URLSearchParams(incoming);
  search.set("api_key", apiKey);

  const upstreamPath = path.map(encodeURIComponent).join("/");
  const upstream = `${OLA_HOST}/${upstreamPath}?${search.toString()}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    // Forward the caller's Accept so binary map assets negotiate correctly;
    // JSON callers (geocode/autocomplete) send their own application/json.
    const res = await fetch(upstream, {
      headers: { Accept: req.headers.get("accept") ?? "application/json" },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    // Pass the upstream body through as raw bytes and preserve its content-type.
    // This keeps JSON endpoints (geocode/autocomplete) working AND lets binary
    // map assets (vector tiles .pbf, sprites .png, glyph .pbf, style JSON) flow
    // through for MapLibre, which a text() round-trip would corrupt.
    const buf = await res.arrayBuffer();
    const contentType =
      res.headers.get("content-type") ?? "application/octet-stream";

    // Cache immutable map assets (tiles/sprites/glyphs/styles); never cache
    // request-specific geocode/autocomplete JSON.
    const isJson = contentType.includes("application/json");
    const headers: Record<string, string> = { "Content-Type": contentType };
    if (!isJson) headers["Cache-Control"] = "public, max-age=86400";

    return new Response(buf, { status: res.status, headers });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "upstream error" },
      { status: 502 },
    );
  }
}
