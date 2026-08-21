import type { Metadata } from "next";
import DataDeletionContent from "./DataDeletionContent";

export const metadata: Metadata = {
  title: "Seller Account & Data Deletion | ANGA9",
  description:
    "Official ANGA9 Seller Data Deletion and Privacy Rights Portal. Learn how to delete your seller account and personal data in-app or submit an online deletion request.",
  alternates: { canonical: "https://anga9.com/seller/data-deletion" },
  robots: { index: true, follow: true },
};

export default function SellerDataDeletionPage() {
  return <DataDeletionContent />;
}
