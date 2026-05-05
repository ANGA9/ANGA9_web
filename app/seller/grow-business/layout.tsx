import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grow Your Wholesale Business on ANGA9 — Tools & Insights",
  description:
    "Scale your wholesale business with smart pricing, sales analytics, promotions, and a verified retailer network. Tools built for B2B sellers across India.",
  alternates: { canonical: "https://seller.anga9.com/grow-business" },
  openGraph: {
    title: "Grow Your B2B Business on ANGA9",
    description:
      "Smart pricing, analytics, promotions — everything you need to scale your wholesale business.",
    url: "https://seller.anga9.com/grow-business",
    siteName: "ANGA9 Seller",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
