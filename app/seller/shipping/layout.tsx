import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery for ANGA9 Sellers — Pan-India Logistics",
  description:
    "ANGA9 partners with leading logistics providers to deliver your products across 19,000+ pin codes in India. Discounted rates, end-to-end tracking, and reliable returns.",
  alternates: { canonical: "https://seller.anga9.com/shipping" },
  openGraph: {
    title: "ANGA9 Seller Shipping & Delivery",
    description:
      "Pan-India logistics with discounted shipping rates for ANGA9 sellers.",
    url: "https://seller.anga9.com/shipping",
    siteName: "ANGA9 Seller",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
