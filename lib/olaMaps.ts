// Browser geolocation + Ola Maps reverse geocoding for address auto-fill.
//
// Flow: getCurrentPosition() (GPS on mobile, Wi-Fi/IP on desktop) → lat/lng →
// our /ola-proxy route → Ola reverse-geocode → a fully-populated address form.
//
// Ola Maps mirrors Google's geocoding response shape: results[] each carry
// address_components[] ({ long_name, short_name, types[] }), a formatted_address
// string, and geometry.location.{lat,lng}. We parse defensively because Ola's
// component coverage varies by location (rural areas often lack street_number).

export interface DetectedAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  /** Full human-readable address from Ola, useful as a fallback / preview. */
  formatted: string;
  lat: number;
  lng: number;
}

interface OlaAddressComponent {
  long_name?: string;
  short_name?: string;
  types?: string[];
}

interface OlaGeocodeResult {
  formatted_address?: string;
  address_components?: OlaAddressComponent[];
  geometry?: { location?: { lat?: number; lng?: number } };
}

interface OlaReverseGeocodeResponse {
  results?: OlaGeocodeResult[];
  status?: string;
}

/** Get the browser's current coordinates, wrapped as a promise. */
export function getBrowserPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Location is not supported on this device"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        // Map the browser's terse codes to actionable messages.
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("Location permission denied. Enter your address manually."));
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reject(new Error("Couldn't determine your location. Enter it manually."));
        } else {
          reject(new Error("Location request timed out. Try again or enter manually."));
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

/** Pull the first component whose `types` includes any of the given type keys. */
function pick(components: OlaAddressComponent[], ...wanted: string[]): string {
  for (const w of wanted) {
    const hit = components.find((c) => c.types?.includes(w));
    if (hit?.long_name) return hit.long_name;
  }
  return "";
}

/**
 * Reverse-geocode coordinates into a structured Indian address.
 * Throws with a user-friendly message if nothing usable comes back.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<DetectedAddress> {
  const res = await fetch(
    `/ola-proxy/places/v1/reverse-geocode?latlng=${lat},${lng}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) {
    throw new Error("Location service is unavailable right now. Enter your address manually.");
  }

  const data = (await res.json()) as OlaReverseGeocodeResponse;
  const result = data.results?.[0];
  if (!result) {
    throw new Error("Couldn't find an address for your location. Enter it manually.");
  }

  const comps = result.address_components ?? [];

  // Build line1 from the finest-grained street components Ola gives us.
  const streetNumber = pick(comps, "street_number", "premise");
  const route = pick(comps, "route", "street_address");

  // The "area" is what a courier actually navigates by (e.g. "Koramangala").
  // Prefer `neighborhood` — Ola's `sublocality` is often a municipal-body name
  // ("...City Corporation") that's useless on a parcel label.
  const area = pick(
    comps,
    "neighborhood",
    "sublocality_level_1",
    "sublocality",
    "sublocality_level_2",
  );

  const line1Parts = [streetNumber, route].filter(Boolean);
  const line1 = line1Parts.join(", ") || area || result.formatted_address || "";

  // line2 = the area/landmark, unless it already appears in line1.
  const line2 = area && !line1.includes(area) ? area : "";

  const city = pick(
    comps,
    "locality",
    "city",
    "administrative_area_level_3",
    "administrative_area_level_2",
  );
  const state = pick(comps, "administrative_area_level_1", "state");
  const pincode = pick(comps, "postal_code", "pincode");

  return {
    line1,
    line2,
    city,
    state,
    pincode,
    formatted: result.formatted_address ?? "",
    lat: result.geometry?.location?.lat ?? lat,
    lng: result.geometry?.location?.lng ?? lng,
  };
}

/** One-shot: detect the browser position and reverse-geocode it. */
export async function detectAddress(): Promise<DetectedAddress> {
  const { lat, lng } = await getBrowserPosition();
  return reverseGeocode(lat, lng);
}
