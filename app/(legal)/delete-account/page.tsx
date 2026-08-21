import type { Metadata } from "next";
import AccountDeletionPortal from "@/components/legal/AccountDeletionPortal";

export const metadata: Metadata = {
  title: "Account & Personal Data Deletion Request | ANGA9",
  description:
    "Official ANGA9 Account and Data Deletion Portal for Customers and Seller Partners. Request account deletion in-app or via our verified online form.",
  alternates: { canonical: "https://anga9.com/delete-account" },
  robots: { index: true, follow: true },
};

export default function DeleteAccountPage() {
  return <AccountDeletionPortal />;
}
