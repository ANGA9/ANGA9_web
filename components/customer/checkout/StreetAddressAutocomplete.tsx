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

  // Value-based suppression: after a selection we write the field
  // programmatically (twice — the label, then the resolved street). While the
  // field still equals a value WE set, don't re-search or re-open the dropdown.
  // Only a genuine user edit (typing or clearing a character) makes `value`
  // differ from `suppressedRef`, which resumes search.
  const suppressedRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea vertically as the user types or when value changes programmatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  // Debounced fetch on value change.
  useEffect(() => {
    // Skip while the value matches what we set during/after a selection.
    if (suppressedRef.current !== null && value === suppressedRef.current) {
      return;
    }
    // The user changed the field for real — clear suppression and search.
    suppressedRef.current = null;

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
    // Populate the full address content instead of just the title
    const label = pred.description || pred.primary || "";
    // Suppress search for both the immediate label write and the resolved
    // street write below, so selecting confirms the place instead of kicking
    // off a fresh round of suggestions.
    suppressedRef.current = label;
    setOpen(false);
    setPredictions([]);
    setHighlight(-1);
    setResolving(true);
    // Reflect the chosen label immediately for responsiveness.
    onChange(label);
    try {
      const address = await resolvePrediction(pred);
      // resolvePrediction sets line1 = the clicked label, so the street field
      // ends up showing exactly what the user picked. Keep suppression aligned
      // with that final value.
      suppressedRef.current = address.line1 || label;
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
      <textarea
        ref={textareaRef}
        className={`${(className || "").replace(/\bh-12\b/g, "")} resize-none overflow-hidden min-h-[46px] py-3 leading-relaxed`}

        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown as any}
        onFocus={() => predictions.length > 0 && setOpen(true)}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        rows={1}
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
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-gray-900 break-words whitespace-normal leading-tight mb-0.5">
                    {p.primary}
                  </span>
                  {p.secondary && (
                    <span className="block text-[12px] text-gray-500 break-words whitespace-normal leading-tight">
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
