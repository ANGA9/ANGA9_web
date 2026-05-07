import type { Metadata } from "next";
import ReturnsContent from "./ReturnsContent";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy",
  description:
    "ANGA9 Returns and Refunds Policy — how to return products, eligibility, refund timelines, and the process on our B2B wholesale marketplace.",
  alternates: { canonical: "https://anga9.com/returns" },
  robots: { index: true, follow: true },
};

export default function ReturnsPage() {
  return <ReturnsContent />;
}
