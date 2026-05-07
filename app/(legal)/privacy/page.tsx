import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ANGA9 Privacy Policy — how we collect, use, and protect your personal information when you use our B2B wholesale marketplace.",
  alternates: { canonical: "https://anga9.com/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
