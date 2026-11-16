export type DetectedLocation = { city: string; pincode: string };

export async function detectLocationFromBrowser(): Promise<DetectedLocation> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Geolocation not supported on this device");
  }

  // 1. Trigger the native browser location prompt
  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });

  const { latitude, longitude } = pos.coords;

  // 2. Query our internal server-side reverse-geocoding route (bypasses CORS and rate limits)
  try {
    const res = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; city?: string; pincode?: string };
      if (data?.city && data?.pincode) {
        return { city: data.city, pincode: data.pincode };
      }
    }
  } catch {}

  // 3. Direct client fallback if API route was unreachable
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const city = bdcData?.locality || bdcData?.city || "";
      const pincode = String(bdcData?.postcode || "").replace(/\s+/g, "");
      if (city && /^\d{6}$/.test(pincode)) {
        return { city, pincode };
      }
    }
  } catch {}

  throw new Error("Could not detect precise location. Please check browser permissions.");
}
