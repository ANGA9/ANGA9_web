import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Seller on ANGA9 — Sell at minimal Commission",
  description:
    "Join 10,000+ sellers on ANGA9, India's leading B2B wholesale marketplace. List products, reach 19,000+ pin codes, and grow your wholesale business at 0% commission.",
  alternates: { canonical: "https://seller.anga9.com/sell-on-anga9" },
  openGraph: {
    title: "Become a Seller on ANGA9 — 0% Commission B2B Marketplace",
    description:
      "Sell on India's fastest-growing B2B marketplace at 0% commission. Reach verified retailers across 19,000+ pin codes.",
    url: "https://seller.anga9.com/sell-on-anga9",
    siteName: "ANGA9 Seller",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
