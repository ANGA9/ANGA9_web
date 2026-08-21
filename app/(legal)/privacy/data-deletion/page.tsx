import type { Metadata } from "next";
import DataDeletionContent from "@/app/seller/data-deletion/DataDeletionContent";

export const metadata: Metadata = {
  title: "Account & Data Deletion | ANGA9",
  description:
    "ANGA9 Data Deletion Portal — Learn how to delete your account and personal data in-app or submit an online deletion request.",
  alternates: { canonical: "https://anga9.com/seller/data-deletion" },
  robots: { index: true, follow: true },
};

export default function PrivacyDataDeletionPage() {
  return <DataDeletionContent />;
}
