import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with ANGA9 — for buyer support, seller queries, partnerships, press, or general feedback about our B2B wholesale marketplace.",
  alternates: { canonical: "https://anga9.com/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return <ContactContent />;
}
