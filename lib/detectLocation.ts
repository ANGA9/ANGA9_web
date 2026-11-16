const NOMINATIM_CONTACT = "support@anga9.com";

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

type PostOffice = {
  Name: string;
  District: string;
  State: string;
  Pincode: string;
};

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function pincodeForLocality(
  name: string,
  userLat: number,
  userLon: number,
  hintState?: string,
  hintDistrict?: string
): Promise<string | null> {
  try {
    // Proxied through our Next.js route to work around the upstream's
    // expired TLS cert (ERR_CERT_DATE_INVALID).
    const url = `/postal-proxy/postoffice/${encodeURIComponent(name)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      Status: string;
      PostOffice?: PostOffice[];
    }>;
    const entry = data?.[0];
    if (entry?.Status !== "Success" || !entry.PostOffice?.length) return null;
    const offices = entry.PostOffice;

    let pool = offices;
    if (hintState) {
      const filtered = pool.filter(
        (o) => o.State?.toLowerCase() === hintState.toLowerCase()
      );
      if (filtered.length) pool = filtered;
    }
    if (hintDistrict && pool.length > 1) {
      const filtered = pool.filter(
        (o) => o.District?.toLowerCase() === hintDistrict.toLowerCase()
      );
      if (filtered.length) pool = filtered;
    }

    if (pool.length === 1) return pool[0].Pincode;

    const withCoords = await Promise.all(
      pool.slice(0, 8).map(async (o) => {
        try {
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&postalcode=${o.Pincode}&country=India&limit=1&email=${encodeURIComponent(NOMINATIM_CONTACT)}`,
            { headers: { Accept: "application/json" } }
          );
          const arr = (await geo.json()) as Array<{ lat: string; lon: string }>;
          const hit = arr?.[0];
          if (!hit) return { o, dist: Infinity };
          const dist = haversineKm(
            userLat,
            userLon,
            parseFloat(hit.lat),
            parseFloat(hit.lon)
          );
          return { o, dist };
        } catch {
          return { o, dist: Infinity };
        }
      })
    );
    withCoords.sort((a, b) => a.dist - b.dist);
    const best = withCoords[0];
    if (best && Number.isFinite(best.dist)) return best.o.Pincode;
    return pool[0].Pincode;
  } catch {
    return null;
  }
}

export type DetectedLocation = { city: string; pincode: string };

export async function detectLocationFromBrowser(): Promise<DetectedLocation> {
  if (typeof window === "undefined") {
    throw new Error("Geolocation not supported on this device");
  }

  // 1. Try High-Accuracy Browser Geolocation first
  if ("geolocation" in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        });
      });
      const { latitude, longitude } = pos.coords;
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&email=${encodeURIComponent(
        NOMINATIM_CONTACT
      )}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = (await res.json()) as { address?: NominatimAddress };
        const a = data.address;
        // Prioritize specific district / locality (e.g. Okhla, Maheshtala, Burhanpur)
        const rawLocality =
          a?.suburb ||
          a?.neighbourhood ||
          a?.subdistrict ||
          a?.city ||
          a?.town ||
          a?.municipality ||
          a?.city_district ||
          a?.district ||
          a?.state_district ||
          a?.residential ||
          a?.village ||
          "";

        if (rawLocality) {
          const lookupName = rawLocality
            .replace(/\s+(Tehsil|Block|Mandal|Taluk|Taluka|District|Sub-Division|Division)$/i, "")
            .trim();
          let pin = (a?.postcode || "").replace(/\s+/g, "");
          if (!/^\d{6}$/.test(pin)) {
            const hintDistrict = a?.city_district || a?.state_district || a?.district || a?.city;
            const hintState = a?.state;
            const fromPostal = await pincodeForLocality(
              lookupName,
              latitude,
              longitude,
              hintState,
              hintDistrict
            );
            if (fromPostal && /^\d{6}$/.test(fromPostal.trim())) {
              pin = fromPostal.trim();
            }
          }
          if (pin && /^\d{6}$/.test(pin)) {
            return { city: lookupName, pincode: pin };
          }
        }
      }
    } catch {
      // Fall through to IP detection fallback
    }
  }

  // 2. IP Fallback if GPS is blocked or unavailable
  try {
    const ipRes = await fetch("https://ipapi.co/json/");
    if (ipRes.ok) {
      const ipData = (await ipRes.json()) as { city?: string; postal?: string; district?: string };
      const city = ipData?.district || ipData?.city || "";
      const pincode = (ipData?.postal || "").replace(/\s+/g, "");
      if (city && /^\d{6}$/.test(pincode)) {
        return { city, pincode };
      }
    }
  } catch {}

  throw new Error("Could not detect location. Please check browser permissions.");
}
