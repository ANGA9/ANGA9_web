import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Dashboard — ANGA9",
  description: "Manage your products, orders, and business on ANGA9.",
  robots: { index: false, follow: false },
};

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
