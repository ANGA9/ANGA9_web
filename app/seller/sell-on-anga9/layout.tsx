import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Seller on ANGA9 — Sell at minimal Commission",
  description:
    "Join 10,000+ sellers on ANGA9, India's leading B2B wholesale marketplace. List products, reach 19,000+ pin codes, and grow your wholesale business at 0% commission.",
  alternates: { canonical: "https://seller.anga9.com/sell-on-anga9" },
  openGraph: {
    title: "Become a Seller on ANGA9 — 0% Commission B2B Marketplace",
    description:
      "Sell on India's fastest-growing B2B marketplace at 0% commission. Reach verified retailers across 19,000+ pin codes.",
    url: "https://seller.anga9.com/sell-on-anga9",
    siteName: "ANGA9 Seller",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ANGA9",
  alternateName: "ANGA9 Seller",
  url: "https://anga9.com",
  logo: "https://anga9.com/favicon.ico",
  description:
    "ANGA9 is India's leading B2B wholesale marketplace connecting verified sellers with retailers across 19,000+ pin codes at 0% commission.",
  sameAs: [
    "https://seller.anga9.com",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "shawsumit6286@gmail.com",
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  },
};

const webPageLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Become a Seller on ANGA9",
  url: "https://seller.anga9.com/sell-on-anga9",
  description:
    "Join 10,000+ sellers on ANGA9, India's leading B2B wholesale marketplace. List products, reach 19,000+ pin codes, and grow your wholesale business at 0% commission.",
  isPartOf: {
    "@type": "WebSite",
    name: "ANGA9 Seller",
    url: "https://seller.anga9.com",
  },
  about: {
    "@type": "Service",
    name: "ANGA9 Seller Platform",
    provider: { "@type": "Organization", name: "ANGA9" },
    areaServed: "IN",
    serviceType: "B2B Wholesale Marketplace",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "0% commission on seller listings",
    },
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much commission does ANGA9 charge sellers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ANGA9 charges 0% commission on seller listings, making it one of the most seller-friendly B2B wholesale marketplaces in India.",
      },
    },
    {
      "@type": "Question",
      name: "How many pin codes does ANGA9 deliver to?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ANGA9 partners with leading logistics providers to deliver across 19,000+ pin codes in India.",
      },
    },
    {
      "@type": "Question",
      name: "Who can sell on ANGA9?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wholesalers, manufacturers, and distributors with valid GST registration can sign up to sell on ANGA9.",
      },
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {children}
    </>
  );
}
