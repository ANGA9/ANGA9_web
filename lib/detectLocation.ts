export type DetectedLocation = { city: string; pincode: string };

function cleanLocalityName(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\s+(Tehsil|Block|Mandal|Taluk|Taluka|District|Sub-Division|Division|Municipal Corporation|Municipality)$/i, "")
    .trim();
}

async function getIpLocation(): Promise<DetectedLocation | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = (await res.json()) as { city?: string; postal?: string };
      if (data?.city) {
        return {
          city: cleanLocalityName(data.city),
          pincode: data.postal || "",
        };
      }
    }
  } catch {}
  return null;
}

export async function detectLocationFromBrowser(): Promise<DetectedLocation> {
  if (typeof window === "undefined") {
    throw new Error("Location not available on server");
  }

  // Check if we have an existing cached IP location as fallback
  let cachedPin = "";
  try {
    const raw = localStorage.getItem("userPincode") || localStorage.getItem("ipLocation");
    if (raw) {
      const parsed = JSON.parse(raw) as { pincode?: string };
      if (parsed?.pincode && /^\d{6}$/.test(parsed.pincode)) {
        cachedPin = parsed.pincode;
      }
    }
  } catch {}

  // 1. Try to get browser geolocation position
  let latitude: number | null = null;
  let longitude: number | null = null;

  if ("geolocation" in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch (geoErr: any) {
      // If permission is denied or position unavailable, fall back directly to IP location
      const ipFallback = await getIpLocation();
      if (ipFallback) return ipFallback;

      if (geoErr?.code === 1) {
        throw new Error("Location permission denied in browser. Reset permission in address bar.");
      }
      throw new Error("Location service unavailable. Please check browser permissions.");
    }
  }

  if (latitude === null || longitude === null) {
    const ipFallback = await getIpLocation();
    if (ipFallback) return ipFallback;
    throw new Error("Could not detect location.");
  }

  let city = "";
  let pincode = "";

  // 2. Primary: Local same-origin /ola-proxy (Ola Maps) — built for India, never blocked by CSP/CORS
  try {
    const olaRes = await fetch(
      `/ola-proxy/places/v1/reverse-geocode?latlng=${latitude},${longitude}`,
      { headers: { Accept: "application/json" } }
    );
    if (olaRes.ok) {
      const olaData = await olaRes.json();
      const firstResult = olaData?.results?.[0];
      const comps = (firstResult?.address_components || []) as Array<{
        long_name?: string;
        short_name?: string;
        types?: string[];
      }>;

      const pick = (...wanted: string[]): string => {
        for (const w of wanted) {
          const hit = comps.find((c) => c.types?.includes(w));
          if (hit?.long_name) return hit.long_name;
        }
        return "";
      };

      const sublocality = pick("sublocality", "sublocality_level_1", "sublocality_level_2", "neighborhood");
      const district = pick("administrative_area_level_3", "administrative_area_level_2");
      const locality = pick("locality", "city");
      const pin = pick("postal_code", "pincode");

      const chosenName = sublocality || district || locality;
      if (chosenName) {
        city = cleanLocalityName(chosenName);
      }
      if (pin && /^\d{6}$/.test(pin.replace(/\s+/g, ""))) {
        pincode = pin.replace(/\s+/g, "");
      }
    }
  } catch {}

  // 3. Fallback: BigDataCloud client reverse geocoding
  if (!city || !pincode) {
    try {
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      if (bdcRes.ok) {
        const data = await bdcRes.json();
        if (!city && data?.localityInfo?.administrative?.length) {
          const admin = data.localityInfo.administrative as Array<{
            name: string;
            order?: number;
            adminLevel?: number;
          }>;
          const subDistrict = admin.find((a) => a.order === 4 || a.adminLevel === 6 || a.adminLevel === 5);
          const district = admin.find((a) => a.order === 3 || a.adminLevel === 4);
          if (subDistrict?.name) city = cleanLocalityName(subDistrict.name);
          else if (district?.name) city = cleanLocalityName(district.name);
        }
        if (!city) {
          city = cleanLocalityName(data?.locality || data?.city || data?.principalSubdivision || "");
        }
        if (!pincode && data?.postcode) {
          const p = String(data.postcode).replace(/\s+/g, "");
          if (/^\d{6}$/.test(p)) pincode = p;
        }
      }
    } catch {}
  }

  // 4. Fallback: OpenStreetMap / Nominatim
  if (!city || !pincode) {
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        const a = nomData?.address || {};
        const raw =
          a.suburb ||
          a.neighbourhood ||
          a.subdistrict ||
          a.city ||
          a.town ||
          a.municipality ||
          a.city_district ||
          a.district ||
          a.state_district ||
          "";
        if (!city && raw) city = cleanLocalityName(raw);
        if (!pincode && a.postcode) {
          const p = String(a.postcode).replace(/\s+/g, "");
          if (/^\d{6}$/.test(p)) pincode = p;
        }
      }
    } catch {}
  }

  // 5. If we have city but missing pincode, check postal-proxy
  if (city && !pincode) {
    try {
      const proxyRes = await fetch(`/postal-proxy/postoffice/${encodeURIComponent(city)}`);
      if (proxyRes.ok) {
        const pData = await proxyRes.json();
        const first = pData?.[0]?.PostOffice?.[0];
        if (first?.Pincode && /^\d{6}$/.test(first.Pincode)) {
          pincode = first.Pincode;
        }
      }
    } catch {}
  }

  // 6. Use cached pincode if still missing
  if (!pincode && cachedPin) {
    pincode = cachedPin;
  }

  if (city) {
    return { city, pincode };
  }

  // 7. Last resort: IP location
  const ip = await getIpLocation();
  if (ip) return ip;

  throw new Error("Could not detect location. Please check browser permissions.");
}
