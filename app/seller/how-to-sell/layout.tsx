import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Sell on ANGA9 — Step-by-Step Seller Guide",
  description:
    "Learn how to start selling on ANGA9 in 4 simple steps. Register, list products, fulfill orders, and grow your B2B business across India.",
  alternates: { canonical: "https://seller.anga9.com/how-to-sell" },
  openGraph: {
    title: "How to Sell on ANGA9 — Seller Onboarding Guide",
    description:
      "A simple 4-step guide to listing products and selling wholesale on ANGA9.",
    url: "https://seller.anga9.com/how-to-sell",
    siteName: "ANGA9 Seller",
    type: "article",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
