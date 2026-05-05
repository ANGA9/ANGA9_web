import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import FAQAccordion from "@/components/legal/FAQAccordion";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Answers to the most common questions about ordering, payments, shipping, returns, and selling on ANGA9 — India's B2B wholesale marketplace.",
  alternates: { canonical: "https://anga9.com/faq" },
  robots: { index: true, follow: true },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is ANGA9?",
    a: "ANGA9 is a B2B wholesale marketplace connecting verified sellers with retailers and businesses across India. We deliver to 19,000+ pin codes and operate at 0% commission for sellers.",
  },
  {
    q: "Who can buy on ANGA9?",
    a: "Retailers, small businesses, resellers, and individuals looking for wholesale prices can shop on ANGA9. Some sellers may have minimum order quantities.",
  },
  {
    q: "Do I need a GST number to order?",
    a: "A GST number is not required to place an order, but providing it at checkout enables you to claim input tax credit on eligible purchases.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, credit and debit cards, net banking, popular wallets, and cash on delivery for eligible orders.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery typically takes 2–5 business days for metro cities and 4–8 business days for other locations. Remote areas may take longer.",
  },
  {
    q: "Can I track my order?",
    a: "Yes — once your order is dispatched, you'll get a tracking link via SMS, email, and on the My Orders page in your account.",
  },
  {
    q: "How do I return a product?",
    a: "Go to My Orders, select the order, click Return, choose a reason, and submit. A pickup will be scheduled. See our Returns & Refunds Policy for details.",
  },
  {
    q: "When will I get my refund?",
    a: "After the seller approves the return, refunds typically reach UPI/wallets in 1–2 business days, cards in 3–7 business days, and bank transfers in 3–7 business days.",
  },
  {
    q: "Can I cancel my order?",
    a: "Yes, you can cancel an order any time before it is dispatched. Once shipped, you'll need to wait for delivery and request a return.",
  },
  {
    q: "How do I become a seller on ANGA9?",
    a: "Visit seller.anga9.com/sell-on-anga9, click Start Selling, and complete onboarding with your business details, GST, and bank information.",
  },
  {
    q: "Does ANGA9 charge sellers commission?",
    a: "ANGA9 charges 0% commission on seller listings. Sellers only pay payment gateway and logistics charges as per actual.",
  },
  {
    q: "Is ANGA9 available outside India?",
    a: "Currently, ANGA9 ships only within India. International availability may be added in the future.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
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
      <LegalLayout title="Frequently Asked Questions" lastUpdated="May 5, 2026">
        <p>
          Quick answers to common questions about shopping, selling, and using ANGA9. Can&apos;t
          find what you&apos;re looking for? Reach us at{" "}
          <a href="mailto:shawsumit6286@gmail.com">shawsumit6286@gmail.com</a>.
        </p>

        <FAQAccordion faqs={FAQS} />
      </LegalLayout>
    </>
  );
}
