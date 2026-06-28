"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { api, getAuthHeaders } from "@/lib/api";

// ── In-flight order tombstone ───────────────────────────────────
// When the modal opens we drop {orderId, ...} into sessionStorage. The
// success/dismiss/fail handlers remove it. If the user refreshes, closes the
// tab, or kills the browser, the tombstone survives — the next mount of the
// checkout page reads it, cancels the orphan order, and refills the cart.
// Belt-and-suspenders alongside the modal's own ondismiss (which doesn't
// fire on hard navigation).

export const IN_FLIGHT_PAYMENT_KEY = "anga9_inflight_payment";

export interface InFlightPayment {
  orderId: string;
  /** Items captured at the moment pay() was called, so we can refill the cart on cleanup. */
  cartSnapshot: { productId: string; qty: number }[];
  /** When the payment was started — used to expire stale tombstones. */
  startedAt: number;
}

export function readInFlightPayment(): InFlightPayment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(IN_FLIGHT_PAYMENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InFlightPayment;
  } catch {
    return null;
  }
}

export function clearInFlightPayment(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(IN_FLIGHT_PAYMENT_KEY);
  } catch {
    /* sessionStorage can throw in privacy modes — ignore */
  }
}

function writeInFlightPayment(p: InFlightPayment): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(IN_FLIGHT_PAYMENT_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

// ── Razorpay window typing ──────────────────────────────────────
// Kept local to this hook so checkout/page.tsx no longer needs to redeclare
// the global. Mirrors the shape we actually use, not the full SDK.

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstrument {
  method: string;
  // UPI: brand-specific app preselection — Razorpay accepts these for hosted
  // Standard Checkout. The list is small and stable: google_pay, phonepe,
  // paytm, bhim. Unknown values are ignored by the modal, not rejected.
  apps?: string[];
  // Wallet: brand-specific wallet preselection. We use: phonepe, mobikwik,
  // airtelmoney, olamoney.
  wallets?: string[];
  // UPI: which flows to expose inside the block. Order matters in the modal.
  flows?: ("collect" | "intent" | "qr")[];
}

interface RazorpayDisplayBlock {
  name: string;
  instruments: RazorpayInstrument[];
}

interface RazorpayDisplayConfig {
  display: {
    blocks: Record<string, RazorpayDisplayBlock>;
    sequence: string[];
    preferences: { show_default_blocks: boolean };
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  config?: RazorpayDisplayConfig;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

// ── Public payment method shape ─────────────────────────────────
// The picker UI emits one of these. `kind` decides which Razorpay block
// (if any) opens; `brand` (when present) pre-filters that block to one app
// or wallet inside the modal — the difference between "tap GPay → see UPI
// input" and "tap GPay → see GPay highlighted".

export type PaymentMethod =
  | { kind: "upi"; brand?: "google_pay" | "phonepe" | "paytm" | "bhim" }
  | { kind: "card" }
  | { kind: "wallet"; brand?: "phonepe" | "mobikwik" | "airtelmoney" | "olamoney" }
  | { kind: "netbanking" }
  | { kind: "cod" }
  | { kind: "all" };

// ── display.blocks builder ──────────────────────────────────────
// Razorpay's Standard Checkout doesn't let us skip the modal frame on
// desktop, but `display.blocks` + `show_default_blocks: false` collapses it
// to a single pre-focused block. With `apps` / `wallets` set, the brand
// inside that block is also pre-selected.
//
// Returns null for COD — caller must short-circuit before reaching Razorpay.

function buildDisplayConfig(method: PaymentMethod): RazorpayDisplayConfig | null {
  switch (method.kind) {
    case "upi": {
      const instrument: RazorpayInstrument = {
        method: "upi",
        flows: ["collect", "intent", "qr"],
      };
      
      // Removed the strict `apps: [brand]` filter because it causes Razorpay
      // to throw "No appropriate payment method found" on desktop environments
      // where UPI Intent is not available.
      
      return {
        display: {
          blocks: {
            upi: { name: "Pay via UPI", instruments: [instrument] },
          },
          sequence: ["block.upi"],
          preferences: { show_default_blocks: false },
        },
      };
    }
    case "card":
      return {
        display: {
          blocks: {
            card: { name: "Pay with Card", instruments: [{ method: "card" }] },
          },
          sequence: ["block.card"],
          preferences: { show_default_blocks: false },
        },
      };
    case "wallet": {
      const instrument: RazorpayInstrument = { method: "wallet" };
      if (method.brand) instrument.wallets = [method.brand];
      return {
        display: {
          blocks: {
            wallet: { name: "Pay via Wallet", instruments: [instrument] },
          },
          sequence: ["block.wallet"],
          preferences: { show_default_blocks: false },
        },
      };
    }
    case "netbanking":
      return {
        display: {
          blocks: {
            nb: { name: "Pay via Netbanking", instruments: [{ method: "netbanking" }] },
          },
          sequence: ["block.nb"],
          preferences: { show_default_blocks: false },
        },
      };
    case "all":
    case "cod":
      return null;
  }
}

// ── Hook ────────────────────────────────────────────────────────

export interface UsePaymentArgs {
  /** Cart items for the order body */
  items: { productId: string; qty: number }[];
  shippingAddressId: string | null;
  couponCode?: string;
  coinsToRedeem?: number;
  /** Prefill for the Razorpay modal */
  prefill: { name?: string; email?: string; contact?: string };
  /** Branded modal color */
  themeColor?: string;
  /** Called after a successful payment (or COD placement) — caller clears cart + navigates */
  onSuccess: () => Promise<void> | void;
  /** Called when the user dismisses the Razorpay modal without paying. The
   * hook has already cancelled the order server-side (frees inventory,
   * returns coins). The caller should refill the cart so the user can
   * retry with a different method and surface a "pick again" affordance. */
  onDismiss: (method: PaymentMethod) => Promise<void> | void;
  /** Called on payment.failed — same contract as onDismiss: order cancelled
   * server-side, caller refills cart + dims the failed row. */
  onFailed: (method: PaymentMethod, message: string) => Promise<void> | void;
}

export function usePayment(args: UsePaymentArgs) {
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const pay = useCallback(
    async (method: PaymentMethod) => {
      setPlacing(true);
      setError("");

      try {
        // Step 1: create the order (server decides whether to mint a Razorpay
        // order or auto-confirm — see backend createOrder COD branch).
        const orderResponse = await api.post<{
          id: string;
          order_number: string;
          total: number;
          status: string;
        }>("/api/orders", {
          items: args.items,
          ...(args.shippingAddressId ? { shippingAddressId: args.shippingAddressId } : {}),
          ...(args.couponCode ? { couponCode: args.couponCode } : {}),
          ...(args.coinsToRedeem && args.coinsToRedeem > 0 ? { coinsToRedeem: args.coinsToRedeem } : {}),
          paymentMethod: method.kind === "cod" ? "cod" : "razorpay",
        });

        // COD short-circuit: the backend already flipped the order to
        // `confirmed` and inserted a synthetic cod_pending payment. No
        // Razorpay involvement.
        if (method.kind === "cod") {
          toast.success("Order placed! Pay cash on delivery 🎉");
          await args.onSuccess();
          return;
        }

        // Fully-promo-covered orders also short-circuit (existing behavior).
        if (Number(orderResponse.total) <= 0) {
          toast.success("Order confirmed successfully! 🎉");
          await args.onSuccess();
          return;
        }

        // ── Tombstone for refresh/close survival ────────────────────
        // Write IMMEDIATELY after createOrder succeeds. Razorpay's ondismiss
        // does NOT fire on browser refresh, tab close, or hard navigation —
        // the iframe is just killed. Without a tombstone the placed order
        // leaks until the 30-min cron sweeps it, and the user sees a phantom
        // "Processing" order. The next mount of the checkout page reads this
        // record and runs cancel + cart-restore on the user's behalf.
        //
        // Writing this before /api/payments/create means even a crash there
        // (e.g. payment-service down) doesn't leak the order.
        writeInFlightPayment({
          orderId: orderResponse.id,
          cartSnapshot: args.items,
          startedAt: Date.now(),
        });

        // Step 2: create the Razorpay order via payment-service.
        const paymentResponse = await api.post<{
          razorpay_order_id: string;
          amount: number;
          currency: string;
          key_id: string;
        }>("/api/payments/create", {
          orderId: orderResponse.id,
          amount: orderResponse.total,
        });

        // Step 3: open the modal with brand-and-method-filtered display config.
        if (typeof window === "undefined" || !window.Razorpay) {
          throw new Error("Payment gateway not ready. Please refresh.");
        }

        const displayConfig = buildDisplayConfig(method);

        // Track whether the modal already handled a terminal event (success
        // or fail). If the success handler fires, ondismiss should not also
        // cancel the order — the payment went through.
        let terminalHandled = false;

        // Cancel the just-placed order on the server. Releases inventory,
        // returns coupon + coins, removes it from /orders. The 30-min cron
        // is still in place as a safety net for crashes; this is the fast
        // path for normal cancel/dismiss/fail.
        const cancelPlacedOrder = async (reason: string) => {
          try {
            await api.post(`/api/orders/${orderResponse.id}/cancel`, { reason });
          } catch {
            // Swallow — the cron will pick it up after 30 min if this fails
            // (e.g. user offline). Don't spam them with an error toast on top
            // of the dismiss flow.
          }
        };

        // ── Best-effort cancel on page unload ───────────────────────
        // Some browsers honor fetch({ keepalive: true }) inside beforeunload
        // and let the POST complete even as the page goes away. Others kill
        // it immediately. We treat this as a fast path: if it lands the
        // order is already cancelled by the time the user's next page loads.
        // If it doesn't, the tombstone path on the next mount picks up the
        // slack. The two strategies are independent and both safe to fire
        // (the cancel endpoint is idempotent — second call is a no-op).
        const beforeUnloadHandler = () => {
          if (terminalHandled) return;
          try {
            // Capture token synchronously — getAuthHeaders is async but
            // beforeunload won't wait for promises. Best we can do is
            // attempt the request; if no auth header lands, the cron is
            // still our safety net.
            const url = `${typeof window !== "undefined" && window.location.origin}/api/orders/${orderResponse.id}/cancel`;
            void getAuthHeaders().then((headers) => {
              fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...headers },
                body: JSON.stringify({ reason: "Page closed during payment" }),
                keepalive: true,
              }).catch(() => {});
            });
          } catch {
            /* never throw inside beforeunload */
          }
        };
        window.addEventListener("beforeunload", beforeUnloadHandler);
        window.addEventListener("pagehide", beforeUnloadHandler);

        // Unified cleanup: clear tombstone, drop listeners. Called from
        // success/dismiss/fail so we don't leave stale state lying around.
        const cleanup = () => {
          clearInFlightPayment();
          window.removeEventListener("beforeunload", beforeUnloadHandler);
          window.removeEventListener("pagehide", beforeUnloadHandler);
        };

        const options: RazorpayOptions = {
          key: paymentResponse.key_id,
          amount: paymentResponse.amount,
          currency: paymentResponse.currency,
          name: "ANGA9",
          description: `Order ${orderResponse.order_number}`,
          order_id: paymentResponse.razorpay_order_id,
          handler: async (response: RazorpayResponse) => {
            terminalHandled = true;
            cleanup();
            try {
              await api.post("/api/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success("Payment successful! Order confirmed 🎉", { duration: 4000 });
              await args.onSuccess();
            } catch {
              toast.error("Payment verification failed. Please contact support.");
              setError(
                "Payment verification failed. Your payment may have been processed — please contact support.",
              );
            } finally {
              setPlacing(false);
            }
          },
          prefill: args.prefill,
          theme: { color: args.themeColor ?? "#1A6FD4" },
          modal: {
            ondismiss: () => {
              // Razorpay fires ondismiss after BOTH success and fail handlers,
              // so we guard against double-firing terminal logic.
              if (terminalHandled) return;
              terminalHandled = true;
              cleanup();
              setPlacing(false);
              // Fire-and-forget the cancel, then let the caller refill cart.
              // No await: a slow network on cancel shouldn't block the picker
              // from re-appearing.
              void cancelPlacedOrder("Payment modal dismissed without payment");
              void args.onDismiss(method);
            },
          },
          ...(displayConfig ? { config: displayConfig } : {}),
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: unknown) => {
          terminalHandled = true;
          cleanup();
          setPlacing(false);
          const failedResponse = response as { error?: { description?: string } };
          const message = failedResponse?.error?.description || "Payment failed. Try another method.";
          void cancelPlacedOrder(`Payment failed: ${message}`);
          void args.onFailed(method, message);
        });
        rzp.open();
      } catch (err: unknown) {
        setPlacing(false);
        // If we already wrote a tombstone but blew up before the modal could
        // open (e.g. /api/payments/create returned 500), cancel that order
        // now and clear the tombstone so the next mount doesn't try to clean
        // up something we're already handling.
        const stranded = readInFlightPayment();
        if (stranded) {
          clearInFlightPayment();
          api
            .post(`/api/orders/${stranded.orderId}/cancel`, {
              reason: "Payment initiation failed before modal opened",
            })
            .catch(() => { /* cron will pick it up */ });
        }
        const message = err instanceof Error ? err.message : "Failed to initiate payment";
        setError(message);
        toast.error(message);
      }
    },
    [args],
  );

  return { pay, placing, error, setError };
}
