export type DetectedLocation = { city: string; pincode: string };

function cleanLocalityName(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\s+(Tehsil|Block|Mandal|Taluk|Taluka|District|Sub-Division|Division|Municipal Corporation|Municipality)$/i, "")
    .trim();
}

export async function detectLocationFromBrowser(): Promise<DetectedLocation> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Geolocation not supported on this device");
  }

  // 1. Triggers the browser's native location permission dialog ("anga9 wants to know your location: Allow / Block")
  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });
  });

  const { latitude, longitude } = pos.coords;

  // Check if we have an existing cached IP location as fallback for pincode
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

  let city = "";
  let pincode = "";

  // 2. Fast CORS-enabled client reverse geocoding via BigDataCloud
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const data = await bdcRes.json();

      // Look in localityInfo.administrative for district/sub-district (e.g. Okhla, Maheshtala, Burhanpur)
      if (data?.localityInfo?.administrative?.length) {
        const admin = data.localityInfo.administrative as Array<{
          name: string;
          order?: number;
          adminLevel?: number;
        }>;
        const subDistrict = admin.find((a) => a.order === 4 || a.adminLevel === 6 || a.adminLevel === 5);
        const district = admin.find((a) => a.order === 3 || a.adminLevel === 4);

        if (subDistrict?.name) {
          city = cleanLocalityName(subDistrict.name);
        } else if (district?.name) {
          city = cleanLocalityName(district.name);
        }
      }

      if (!city) {
        city = cleanLocalityName(data?.locality || data?.city || data?.principalSubdivision || "");
      }

      if (data?.postcode) {
        const p = String(data.postcode).replace(/\s+/g, "");
        if (/^\d{6}$/.test(p)) pincode = p;
      }
    }
  } catch {}

  // 3. Fallback to OpenStreetMap / Nominatim if BigDataCloud missed
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
        if (!city && raw) {
          city = cleanLocalityName(raw);
        }
        if (!pincode && a.postcode) {
          const p = String(a.postcode).replace(/\s+/g, "");
          if (/^\d{6}$/.test(p)) pincode = p;
        }
      }
    } catch {}
  }

  // 4. If we have the city but missing 6-digit pincode, query postal-proxy
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

  // 5. If still no pincode, use cached pincode from previous IP lookup
  if (!pincode && cachedPin) {
    pincode = cachedPin;
  }

  if (city) {
    return { city, pincode };
  }

  // 6. Last resort: IP location
  try {
    const ipRes = await fetch("https://ipapi.co/json/");
    if (ipRes.ok) {
      const ipData = (await ipRes.json()) as { city?: string; postal?: string };
      if (ipData?.city) {
        return {
          city: cleanLocalityName(ipData.city),
          pincode: ipData.postal || cachedPin || "",
        };
      }
    }
  } catch {}

  throw new Error("Could not detect location. Please check browser permissions.");
}
