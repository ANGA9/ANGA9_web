import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "ANGA9 Terms of Use — the rules and conditions that govern your use of anga9.com and the ANGA9 B2B wholesale marketplace.",
  alternates: { canonical: "https://anga9.com/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Use" lastUpdated="May 5, 2026">
      <p>
        Welcome to ANGA9. These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of
        the website <strong>anga9.com</strong>, the ANGA9 mobile applications, and any related
        services (collectively, the &ldquo;Platform&rdquo;) operated by ANGA9 (&ldquo;we&rdquo;,
        &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By using the Platform, you agree to these Terms.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        The Platform is intended for use by businesses and individuals who are at least 18 years
        of age and capable of entering into legally binding contracts under the Indian Contract
        Act, 1872. By creating an account, you represent that you meet these requirements and
        that the information you provide is accurate and complete.
      </p>

      <h2>2. Account Registration</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and
        for all activities that occur under your account. You agree to notify us immediately of
        any unauthorized access. We reserve the right to suspend or terminate accounts that
        violate these Terms.
      </p>

      <h2>3. Use of the Platform</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Platform for any unlawful, fraudulent, or harmful purpose.</li>
        <li>Upload content that infringes on the intellectual property rights of others.</li>
        <li>Attempt to interfere with the proper functioning of the Platform.</li>
        <li>Use automated tools (bots, scrapers) without our prior written consent.</li>
        <li>Resell, sublicense, or redistribute access to the Platform.</li>
      </ul>

      <h2>4. Orders, Pricing & Payment</h2>
      <p>
        All product listings on ANGA9 are made by independent sellers. Prices, availability, and
        product descriptions are provided by sellers and may change without notice. ANGA9 acts
        as a facilitator and is not the seller of record for products listed by third-party
        sellers. You agree to pay the total amount displayed at checkout, including any
        applicable taxes and shipping charges.
      </p>

      <h2>5. Shipping & Delivery</h2>
      <p>
        Delivery timelines are estimates and may vary based on location, product availability,
        and logistics partner performance. For details, please refer to our{" "}
        <a href="/shipping-policy">Shipping Policy</a>.
      </p>

      <h2>6. Returns, Refunds & Cancellations</h2>
      <p>
        Returns and refunds are governed by the seller&apos;s policy, subject to our platform
        rules. See our <a href="/returns">Returns &amp; Refunds Policy</a> and{" "}
        <a href="/cancellation">Cancellation Policy</a> for details.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The Platform, including its design, logos, text, graphics, and software, is owned by
        ANGA9 or its licensors and is protected by Indian and international intellectual
        property laws. You may not copy, modify, distribute, or create derivative works without
        our prior written consent.
      </p>

      <h2>8. User-Generated Content</h2>
      <p>
        By submitting content (reviews, photos, ratings) to the Platform, you grant ANGA9 a
        non-exclusive, royalty-free, worldwide license to use, display, and distribute that
        content in connection with the Platform.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Platform is provided &ldquo;as is&rdquo; without warranties of any kind, either
        express or implied. We do not guarantee uninterrupted access, error-free operation, or
        the accuracy of seller-provided information.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, ANGA9 shall not be liable for any indirect,
        incidental, special, or consequential damages arising out of or related to your use of
        the Platform.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify and hold ANGA9, its officers, employees, and affiliates harmless
        from any claims, damages, or expenses arising from your breach of these Terms or your
        misuse of the Platform.
      </p>

      <h2>12. Governing Law & Jurisdiction</h2>
      <p>
        These Terms are governed by the laws of India. Any disputes arising shall be subject to
        the exclusive jurisdiction of the courts at New Delhi, India.
      </p>

      <h2>13. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the
        top reflects the most recent revision. Continued use of the Platform after changes
        constitutes acceptance of the revised Terms.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about these Terms, please contact us at{" "}
        <a href="mailto:support@anga9.com">support@anga9.com</a> or visit our{" "}
        <a href="/contact">Contact</a> page.
      </p>
    </LegalLayout>
  );
}
