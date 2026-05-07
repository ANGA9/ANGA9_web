import type { Metadata } from "next";
import FAQContent from "./FAQContent";
import { getEnglishFAQList } from "@/lib/legalTranslations/faqBody";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Answers to the most common questions about ordering, payments, shipping, returns, and selling on ANGA9 — India's B2B wholesale marketplace.",
  alternates: { canonical: "https://anga9.com/faq" },
  robots: { index: true, follow: true },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: getEnglishFAQList().map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FAQContent />
    </>
  );
}
