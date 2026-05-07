import type { Metadata } from "next";
import ShippingContent from "./ShippingContent";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "ANGA9 Shipping Policy — how orders are shipped, delivery timelines, charges, and tracking on India's leading B2B marketplace.",
  alternates: { canonical: "https://anga9.com/shipping-policy" },
  robots: { index: true, follow: true },
};

export default function ShippingPolicyPage() {
  return <ShippingContent />;
}
