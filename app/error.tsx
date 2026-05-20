"use client"; // Error boundaries must be Client Components in App Router.

import { useEffect } from "react";

/**
 * Segment-level error boundary.
 * Wraps page.tsx (and nested segments) so a render throw shows fallback UI
 * instead of unmounting the whole tree to a blank screen.
 *
 * For root-layout / RootLayout-level throws, see global-error.tsx.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[app/error.tsx]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1A1A2E", marginBottom: 8 }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 14, color: "#5B6B7C", marginBottom: 20, maxWidth: 420 }}>
        We hit an unexpected error. You can try again, or refresh the page.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{
            background: "#4338CA",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            background: "#FFFFFF",
            color: "#1A1A2E",
            border: "1px solid #E8EEF4",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </div>
      {error?.digest && (
        <p style={{ fontSize: 11, color: "#9AA5B1", marginTop: 16 }}>
          Ref: {error.digest}
        </p>
      )}
    </div>
  );
}
