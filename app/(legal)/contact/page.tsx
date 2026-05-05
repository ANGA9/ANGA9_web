import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import ContactCards from "@/components/legal/ContactCards";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with ANGA9 — for buyer support, seller queries, partnerships, press, or general feedback about our B2B wholesale marketplace.",
  alternates: { canonical: "https://anga9.com/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <LegalLayout title="Contact Us" lastUpdated="May 5, 2026">
      <p>
        We&apos;re here to help. Whether you have a question about an order, want to sell on
        ANGA9, or have a partnership idea — pick the channel that fits and we&apos;ll get back
        to you.
      </p>

      <ContactCards />

      <h2>Grievance Officer</h2>
      <p>
        In accordance with the Information Technology Act, 2000 and Consumer Protection
        (E-Commerce) Rules, 2020, the contact details of the Grievance Officer are:
      </p>
      <p>
        <strong>Name:</strong> Sumit Shaw
        <br />
        <strong>Email:</strong>{" "}
        <a href="mailto:shawsumit6286@gmail.com">shawsumit6286@gmail.com</a>
        <br />
        <strong>Hours:</strong> Mon–Fri, 10:00 AM – 6:00 PM IST
      </p>

      <h2>Registered Office</h2>
      <p>
        ANGA9
        <br />
        New Delhi, India
      </p>

      <hr />

      <p>
        Before reaching out, you might find your answer faster on our{" "}
        <a href="/faq">FAQ page</a>.
      </p>
    </LegalLayout>
  );
}
