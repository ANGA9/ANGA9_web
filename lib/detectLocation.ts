const NOMINATIM_CONTACT = "shawsumit6286@gmail.com";

type NominatimAddress = {
  postcode?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  state_district?: string;
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
    const url = `https://api.postalpincode.in/postoffice/${encodeURIComponent(
      name
    )}`;
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
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Geolocation not supported on this device");
  }
  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
  const { latitude, longitude } = pos.coords;
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&email=${encodeURIComponent(
    NOMINATIM_CONTACT
  )}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = (await res.json()) as { address?: NominatimAddress };
  const a = data.address;
  const city =
    a?.suburb ||
    a?.neighbourhood ||
    a?.city_district ||
    a?.city ||
    a?.town ||
    a?.village ||
    "";
  if (!city) throw new Error("Couldn't resolve a locality. Enter manually.");

  const lookupName = city.replace(/\s+(Tehsil|Block|Mandal|Taluk|Taluka)$/i, "").trim();
  const hintDistrict = a?.city_district || a?.state_district || a?.city;
  const hintState = a?.state;
  const fromPostal = await pincodeForLocality(
    lookupName,
    latitude,
    longitude,
    hintState,
    hintDistrict
  );
  const pin = fromPostal || a?.postcode || "";
  if (!pin || !/^\d{6}$/.test(pin)) {
    throw new Error("Couldn't resolve a 6-digit pincode here. Enter manually.");
  }
  return { city: lookupName, pincode: pin };
}
