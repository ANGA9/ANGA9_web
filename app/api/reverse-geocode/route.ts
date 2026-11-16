import { type NextRequest } from "next/server";
import https from "node:https";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const insecureAgent = new https.Agent({ rejectUnauthorized: false });

type NominatimAddress = {
  postcode?: string;
  suburb?: string;
  neighbourhood?: string;
  residential?: string;
  subdistrict?: string;
  city_district?: string;
  city?: string;
  town?: string;
  municipality?: string;
  district?: string;
  state_district?: string;
  county?: string;
  village?: string;
  state?: string;
};

async function fetchJsonWithTimeout(url: string, headers: Record<string, string> = {}, timeoutMs = 8000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function pincodeFromPostalApi(name: string, hintDistrict?: string): Promise<string | null> {
  try {
    const upstream = `https://api.postalpincode.in/postoffice/${encodeURIComponent(name)}`;
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
      req.setTimeout(6000, () => req.destroy(new Error("upstream timeout")));
    });

    const parsed = JSON.parse(body) as Array<{ Status: string; PostOffice?: Array<{ Pincode: string; District: string }> }>;
    const entry = parsed?.[0];
    if (entry?.Status === "Success" && entry.PostOffice?.length) {
      if (hintDistrict) {
        const match = entry.PostOffice.find(p => p.District.toLowerCase() === hintDistrict.toLowerCase());
        if (match?.Pincode) return match.Pincode;
      }
      return entry.PostOffice[0].Pincode;
    }
  } catch {}
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");

  if (!latStr || !lonStr) {
    return Response.json({ error: "Missing lat/lon parameters" }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon)) {
    return Response.json({ error: "Invalid lat/lon values" }, { status: 400 });
  }

  let detectedCity = "";
  let detectedPincode = "";

  // 1. Try Nominatim (OpenStreetMap)
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&email=support@anga9.com`;
    const nomData = await fetchJsonWithTimeout(nominatimUrl, {
      "User-Agent": "ANGA9-Wholesale/1.0 (support@anga9.com)",
      Accept: "application/json",
    });

    if (nomData?.address) {
      const a = nomData.address as NominatimAddress;
      // Prioritize granular localities & districts (e.g. Okhla, Maheshtala, Burhanpur)
      const rawLocality =
        a.suburb ||
        a.neighbourhood ||
        a.subdistrict ||
        a.city ||
        a.town ||
        a.municipality ||
        a.city_district ||
        a.district ||
        a.state_district ||
        a.residential ||
        a.village ||
        "";

      if (rawLocality) {
        detectedCity = rawLocality
          .replace(/\s+(Tehsil|Block|Mandal|Taluk|Taluka|District|Sub-Division|Division)$/i, "")
          .trim();
      }

      if (a.postcode) {
        const cleanPin = a.postcode.replace(/\s+/g, "");
        if (/^\d{6}$/.test(cleanPin)) {
          detectedPincode = cleanPin;
        }
      }

      // If postcode wasn't in Nominatim, query Indian Postal API
      if (detectedCity && !detectedPincode) {
        const hintDistrict = a.city_district || a.state_district || a.district || a.city;
        const postalPin = await pincodeFromPostalApi(detectedCity, hintDistrict);
        if (postalPin && /^\d{6}$/.test(postalPin)) {
          detectedPincode = postalPin;
        }
      }
    }
  } catch {}

  // 2. Fallback to BigDataCloud Client Reverse Geocode if Nominatim missed
  if (!detectedCity || !detectedPincode) {
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const bdcData = await fetchJsonWithTimeout(bdcUrl, {}, 6000);
      if (bdcData) {
        if (!detectedCity) {
          detectedCity = bdcData.locality || bdcData.city || bdcData.principalSubdivision || "";
        }
        if (!detectedPincode && bdcData.postcode) {
          const cleanPin = String(bdcData.postcode).replace(/\s+/g, "");
          if (/^\d{6}$/.test(cleanPin)) {
            detectedPincode = cleanPin;
          }
        }
      }
    } catch {}
  }

  if (detectedCity && detectedPincode) {
    return Response.json({
      success: true,
      city: detectedCity,
      pincode: detectedPincode,
    });
  }

  if (detectedCity) {
    return Response.json({
      success: true,
      city: detectedCity,
      pincode: detectedPincode || "110001",
    });
  }

  return Response.json({ error: "Could not resolve locality" }, { status: 404 });
}

