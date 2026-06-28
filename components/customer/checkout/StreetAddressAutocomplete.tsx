"use client";

// Street-address field with Ola Places autocomplete.
//
// The customer types their building / society / road; we debounce the query,
// fetch predictions through the same /ola-proxy used elsewhere, and on select
// resolve the place into a structured address (line2 + city/state/pincode).
// It stays a plain controlled input when no one interacts with the dropdown —
// so manual typing keeps working exactly as before.

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import {
  placeAutocomplete,
  resolvePrediction,
  type PlacePrediction,
  type DetectedAddress,
} from "@/lib/olaMaps";

interface Props {
  /** Current street value (maps to the form's line2). */
  value: string;
  /** Fired on every keystroke so the parent form stays in control. */
  onChange: (value: string) => void;
  /** Fired when the user picks a prediction and it resolves to an address. */
  onResolved: (address: DetectedAddress) => void;
  className?: string;
  placeholder?: string;
}

export default function StreetAddressAutocomplete({
  value,
  onChange,
  onResolved,
  className,
  placeholder,
}: Props) {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  // Guard against the dropdown popping back open right after a selection.
  const justSelectedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced fetch on value change.
  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const handle = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const results = await placeAutocomplete(q, controller.signal);
      // Ignore if a newer keystroke already superseded this request.
      if (controller.signal.aborted) return;
      setPredictions(results);
      setOpen(results.length > 0);
      setHighlight(-1);
      setLoading(false);
    }, 300);

    return () => {
      window.clearTimeout(handle);
      setLoading(false);
    };
  }, [value]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const handleSelect = async (pred: PlacePrediction) => {
    justSelectedRef.current = true;
    setOpen(false);
    setPredictions([]);
    setResolving(true);
    // Reflect the chosen label immediately for responsiveness.
    onChange(pred.primary || pred.description);
    try {
      const address = await resolvePrediction(pred);
      onResolved(address);
    } finally {
      setResolving(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || predictions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % predictions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + predictions.length) % predictions.length);
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      handleSelect(predictions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => predictions.length > 0 && setOpen(true)}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {(loading || resolving) && (
        <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      )}

      {open && predictions.length > 0 && (
        <ul
          className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150"
          role="listbox"
        >
          {predictions.map((p, i) => (
            <li key={p.placeId || p.description} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => handleSelect(p)}
                className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors ${
                  i === highlight ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-gray-900 truncate">
                    {p.primary}
                  </span>
                  {p.secondary && (
                    <span className="block text-[12px] text-gray-500 truncate">
                      {p.secondary}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
