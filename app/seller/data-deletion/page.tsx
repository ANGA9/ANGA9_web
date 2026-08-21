import type { Metadata } from "next";
import AccountDeletionPortal from "@/components/legal/AccountDeletionPortal";

export const metadata: Metadata = {
  title: "Seller Account & Data Deletion | ANGA9",
  description:
    "Official ANGA9 Seller Data Deletion Portal. Learn how to delete your seller account in-app or submit an online deletion request.",
  alternates: { canonical: "https://anga9.com/seller/data-deletion" },
  robots: { index: true, follow: true },
};

export default function SellerDataDeletionPage() {
  return <AccountDeletionPortal />;
}
