import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "ANGA9 Terms of Use — the rules and conditions that govern your use of anga9.com and the ANGA9 B2B wholesale marketplace.",
  alternates: { canonical: "https://anga9.com/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return <TermsContent />;
}
