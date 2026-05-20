"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";

/**
 * Last-resort error boundary.
 * This fires when an error escapes app/error.tsx — e.g. a throw inside
 * RootLayout, AuthProvider, or TooltipProvider in app/layout.tsx.
 * Because it replaces the root layout, it must define its own <html>/<body>.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[app/global-error.tsx]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F7F9FB",
          fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
          color: "#1A1A2E",
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 440 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: "#5B6B7C", margin: "0 0 20px" }}>
            The page hit an unexpected error. Try again, or reload.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
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
      </body>
    </html>
  );
}
