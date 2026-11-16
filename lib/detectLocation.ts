export type DetectedLocation = { city: string; pincode: string };

export async function detectLocationFromBrowser(): Promise<DetectedLocation> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Geolocation not supported on this device");
  }

  // 1. Triggers the browser's native permission prompt ("anga9 wants to know your location: Allow / Block")
  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });
  });

  const { latitude, longitude } = pos.coords;

  // 2. High-speed client-side reverse geocoding via BigDataCloud (CORS-enabled, free, public API)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const data = await bdcRes.json();
      // Extract granular district/locality (e.g. Okhla, Maheshtala, Burhanpur)
      const rawLocality = data?.locality || data?.city || data?.principalSubdivision || "";
      const city = rawLocality
        .replace(/\s+(Tehsil|Block|Mandal|Taluk|Taluka|District|Sub-Division|Division)$/i, "")
        .trim();
      const pin = String(data?.postcode || "").replace(/\s+/g, "");

      if (city && /^\d{6}$/.test(pin)) {
        return { city, pincode: pin };
      }
      if (city) {
        // Fallback to postal-proxy if postcode was missing
        try {
          const proxyRes = await fetch(`/postal-proxy/postoffice/${encodeURIComponent(city)}`);
          if (proxyRes.ok) {
            const postalData = await proxyRes.json();
            const entry = postalData?.[0];
            if (entry?.Status === "Success" && entry.PostOffice?.length) {
              const postalPin = entry.PostOffice[0].Pincode;
              if (postalPin && /^\d{6}$/.test(postalPin)) {
                return { city, pincode: postalPin };
              }
            }
          }
        } catch {}
        if (/^\d{6}$/.test(pin)) {
          return { city, pincode: pin };
        }
      }
    }
  } catch {}

  // 3. Fallback to OpenStreetMap / Nominatim if BigDataCloud was unreachable
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const a = nomData?.address;
      const raw = a?.suburb || a?.neighbourhood || a?.city || a?.town || a?.city_district || a?.district || "";
      const city = raw.replace(/\s+(Tehsil|Block|Mandal|Taluk|Taluka|District|Sub-Division|Division)$/i, "").trim();
      const pin = String(a?.postcode || "").replace(/\s+/g, "");
      if (city && /^\d{6}$/.test(pin)) {
        return { city, pincode: pin };
      }
    }
  } catch {}

  throw new Error("Could not resolve location. Please try again.");
}
