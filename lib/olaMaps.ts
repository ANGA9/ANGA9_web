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

/** Escape a string for safe use inside a RegExp (city/state can carry `.`, `(`, etc.). */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

  const city = pick(
    comps,
    "locality",
    "city",
    "administrative_area_level_3",
    "administrative_area_level_2",
  );
  const state = pick(comps, "administrative_area_level_1", "state");
  const pincode = pick(comps, "postal_code", "pincode");

  // ── Street address (line1) ───────────────────────────────────────
  // We want line1 to be as detailed as Ola can resolve — building/society name,
  // road, layout, area — so the customer only has to add their flat/house no.
  // Ola's `formatted_address` carries the richest chain; the discrete
  // address_components are far sparser (often just a single "route"). So we
  // lean on formatted_address and strip out:
  //   • the city / state / pincode / country — they have their own fields, and
  //   • any bare house-number token (e.g. "2", "12A") — the one thing we
  //     deliberately leave blank for the customer to fill in.
  const formatted = result.formatted_address ?? "";
  const dropTail = new Set(
    [city, state, pincode, "India"].filter(Boolean).map((s) => s.toLowerCase()),
  );
  const seen = new Set<string>();
  const streetParts = formatted
    .split(",")
    .map((p) => p.trim())
    // Scrub the city/state/pincode even when Ola jams them into one segment
    // without a comma (e.g. "...HSR Layout, Karnataka 560102").
    .map((p) => {
      let s = p;
      if (pincode) s = s.replace(new RegExp(`\\b${escapeRegex(pincode)}\\b`), "");
      // Remove the longest token first: when state is a substring of city
      // (e.g. city "New Delhi", state "Delhi") stripping "Delhi" first would
      // leave the orphan "New". Sort by length desc so "New Delhi" goes before
      // "Delhi" and the whole token is removed cleanly.
      const tokens = [city, state]
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);
      for (const t of tokens) {
        s = s.replace(new RegExp(`\\b${escapeRegex(t)}\\b`, "i"), "");
      }
      return s.trim();
    })
    .filter(Boolean)
    .filter((p) => !dropTail.has(p.toLowerCase()))
    // Drop any leftover fragment that is itself a sub-token of the city/state
    // we removed (guards against partial-match remnants like a stray "New").
    .filter((p) => {
      const lp = p.toLowerCase();
      return ![city, state].some(
        (t) => t && t.toLowerCase() !== lp && t.toLowerCase().split(/\s+/).includes(lp),
      );
    })
    .filter((p) => !/^\d+\s*[a-z]?$/i.test(p)) // drop bare house numbers
    .filter((p) => {
      const key = p.toLowerCase();
      if (seen.has(key)) return false; // de-dupe repeated tokens
      seen.add(key);
      return true;
    });

  // Structured fallback if formatted_address was empty or fully stripped.
  const route = pick(comps, "route", "street_address");
  const area = pick(
    comps,
    "neighborhood",
    "sublocality_level_1",
    "sublocality",
    "sublocality_level_2",
  );
  const line1 =
    streetParts.join(", ") ||
    [route, area].filter(Boolean).join(", ") ||
    area ||
    "";

  return {
    line1,
    // Everything navigable now lives in line1; leave line2 free for the
    // customer to add a landmark ("near X gate") if they want.
    line2: "",
    city,
    state,
    pincode,
    formatted,
    lat: result.geometry?.location?.lat ?? lat,
    lng: result.geometry?.location?.lng ?? lng,
  };
}

/** One-shot: detect the browser position and reverse-geocode it. */
export async function detectAddress(): Promise<DetectedAddress> {
  const { lat, lng } = await getBrowserPosition();
  return reverseGeocode(lat, lng);
}
