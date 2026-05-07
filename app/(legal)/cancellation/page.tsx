import type { Metadata } from "next";
import CancellationContent from "./CancellationContent";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description:
    "ANGA9 Cancellation Policy — how to cancel orders before dispatch, eligibility, and refund process for cancelled orders.",
  alternates: { canonical: "https://anga9.com/cancellation" },
  robots: { index: true, follow: true },
};

export default function CancellationPage() {
  return <CancellationContent />;
}
