import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Login — ANGA9",
  description: "Sign in to your ANGA9 seller account to manage products, orders, and grow your wholesale business.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SellerLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
