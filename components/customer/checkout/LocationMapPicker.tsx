"use client";

// Map-based location picker (MapLibre GL JS + Ola Maps).
//
// Swiggy/Uber-style: a pin is fixed at the centre of the viewport and the map
// pans underneath it. Whenever the map settles, we reverse-geocode the centre
// coordinate (via Ola) and show the precise address below. "Next" hands the
// resolved address back to the checkout flow, which then reveals the pre-filled
// manual form.
//
// The Ola API key never reaches the browser: the style and every tile/sprite/
// glyph request is routed through our same-origin /ola-proxy, which injects the
// key server-side. `transformRequest` rewrites Ola's absolute asset URLs to the
// proxy path.

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Loader2, LocateFixed, MapPin, ChevronRight } from "lucide-react";
import { reverseGeocode, type DetectedAddress } from "@/lib/olaMaps";

const OLA_HOST = "https://api.olamaps.io";
const STYLE_URL = "/ola-proxy/tiles/vector/v1/styles/default-light-standard/style.json";
// Centre of India — a safe fallback before we have the user's position.
const INDIA_CENTER: [number, number] = [78.9629, 20.5937];

interface Props {
  /** Initial centre when known (from GPS). [lng, lat]. */
  initialLng?: number;
  initialLat?: number;
  /** Called when the user confirms the pinned location. */
  onConfirm: (address: DetectedAddress) => void;
  /** Called when the user backs out without confirming. */
  onCancel: () => void;
}

export default function LocationMapPicker({
  initialLng,
  initialLat,
  onConfirm,
  onCancel,
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // Sequence guard so a slow reverse-geocode from an earlier pan can't overwrite
  // the result of a later one.
  const geocodeSeq = useRef(0);

  const [ready, setReady] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [locating, setLocating] = useState(false);
  const [detected, setDetected] = useState<DetectedAddress | null>(null);

  const hasInitial =
    typeof initialLng === "number" && typeof initialLat === "number";
  const startCenter: [number, number] = hasInitial
    ? [initialLng as number, initialLat as number]
    : INDIA_CENTER;

  // Reverse-geocode the current map centre and update the preview field.
  const geocodeCenter = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;
    const { lng, lat } = map.getCenter();
    const seq = ++geocodeSeq.current;
    setGeocoding(true);
    try {
      const addr = await reverseGeocode(lat, lng);
      if (seq === geocodeSeq.current) setDetected(addr);
    } catch {
      // Keep the previous preview; the pin is still valid even if naming failed.
    } finally {
      if (seq === geocodeSeq.current) setGeocoding(false);
    }
  }, []);

  // Initialise the map once.
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    let cancelled = false;

    const origin = window.location.origin;

    (async () => {
      let style: any;
      try {
        const res = await fetch(`${origin}${STYLE_URL}`);
        const rawStyle = await res.json();
        
        // MapLibre v5+ crashes in the Web Worker ("Expected value to be of type
        // number, but found null instead") if a math expression evaluates a null 
        // property. Ola's style has `symbol-sort-key: ["-", ["get", "pop"]]`,
        // and many POIs don't have a `pop` property, crashing the renderer.
        let styleStr = JSON.stringify(rawStyle);
        styleStr = styleStr.replace(
          /\["-",\["get","pop"\]\]/g,
          '["-",["coalesce",["get","pop"],0]]'
        );
        style = JSON.parse(styleStr);

        // Remove the broken 3d_model_data layer which Ola includes but doesn't serve
        if (Array.isArray(style.layers)) {
          style.layers = style.layers.filter((l: any) => l.id !== "3d_model_data");
        }
      } catch (err) {
        console.error("Failed to fetch/clean style JSON:", err);
        style = `${origin}${STYLE_URL}`;
      }

      if (cancelled) return;

      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style,
        center: startCenter,
        zoom: hasInitial ? 16 : 4,
        attributionControl: false,
        // Route every Ola asset through our key-injecting proxy.
        // MapLibre uses `new Request(url)` internally which requires absolute
        // URLs, so we prepend the page origin.
        transformRequest: (url) => {
          if (url.startsWith(OLA_HOST)) {
            const rewritten = `${origin}${url.replace(OLA_HOST, "/ola-proxy")}`;
            return { url: rewritten };
          }
          return { url };
        },
      });
      mapRef.current = map;

      // Suppress the harmless "3d_model" layer error that Ola's style triggers —
      // their style JSON references a source layer their tiles don't actually
      // serve. Swallow that specific error; let everything else through.
      map.on("error", (e) => {
        if (e.error?.message?.includes("3d_model")) return;
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "bottom-right",
      );

      map.on("load", () => {
        setReady(true);
        void geocodeCenter();
      });
      map.on("moveend", () => void geocodeCenter());
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentre to the user's live GPS position on demand.
  const recenterToGps = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 16,
          duration: 800,
        });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  const handleConfirm = async () => {
    if (!detected) return;
    setConfirming(true);
    try {
      onConfirm(detected);
    } finally {
      setConfirming(false);
    }
  };

  // Build the display text for the detected address.
  const addressText = detected?.formatted || detected?.line1 || "";

  return (
    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Map viewport — flush with the parent card edges */}
      <div className="relative h-[280px] sm:h-[340px] w-full bg-gray-100">
        <div ref={mapContainer} className="absolute inset-0" />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {/* Fixed centre pin */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full z-10">
          <MapPin
            className="w-9 h-9 text-[#1A6FD4] drop-shadow-md"
            fill="#1A6FD4"
            fillOpacity={0.15}
            strokeWidth={2.2}
          />
        </div>

        {/* Recenter-to-GPS button */}
        <button
          type="button"
          onClick={recenterToGps}
          disabled={locating}
          className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 text-[12px] font-semibold text-gray-700 shadow-md border border-gray-200/80 hover:bg-white active:scale-95 transition-all disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LocateFixed className="w-3.5 h-3.5" />
          )}
          Locate me
        </button>
      </div>

      {/* Address preview + actions — sits directly below the map */}
      <div className="px-5 sm:px-6 py-4 bg-white border-t border-gray-100">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#1A6FD4] mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            {geocoding && !detected ? (
              <p className="text-[14px] text-gray-400 animate-pulse">
                Locating address…
              </p>
            ) : addressText ? (
              <p className="text-[14px] text-gray-800 leading-snug">
                {addressText}
                {geocoding && (
                  <Loader2 className="inline w-3 h-3 animate-spin text-gray-400 ml-2 align-middle" />
                )}
              </p>
            ) : (
              <p className="text-[14px] text-gray-400">
                Move the map to pin your location
              </p>
            )}
            <p className="text-[11px] text-gray-400 mt-1">
              Drag the map so the pin sits on your building
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!detected || confirming || geocoding}
            className="flex-1 px-6 py-2.5 rounded-xl bg-white border-2 border-indigo-600 text-[14px] font-bold text-indigo-600 hover:bg-indigo-50 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {confirming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
