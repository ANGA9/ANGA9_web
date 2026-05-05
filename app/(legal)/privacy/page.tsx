import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ANGA9 Privacy Policy — how we collect, use, and protect your personal information when you use our B2B wholesale marketplace.",
  alternates: { canonical: "https://anga9.com/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="May 5, 2026">
      <p>
        ANGA9 (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy and is
        committed to protecting the personal information you share with us. This Privacy Policy
        explains what we collect, how we use it, and the choices you have.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li>Account details: name, phone number, email, GST number (for sellers).</li>
        <li>Business details: company name, address, bank details (for sellers).</li>
        <li>Order details: shipping address, contact information, payment information.</li>
        <li>Communications: messages you send to support or sellers.</li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li>Device & browser data (IP address, device type, OS, browser version).</li>
        <li>Usage data (pages viewed, products clicked, time on site).</li>
        <li>Approximate location based on IP or, with your consent, precise location.</li>
        <li>Cookies and similar tracking technologies.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To create and manage your ANGA9 account.</li>
        <li>To process orders, payments, shipments, returns, and refunds.</li>
        <li>To personalize product recommendations and search results.</li>
        <li>To communicate with you about orders, offers, and updates.</li>
        <li>To detect, prevent, and address fraud, abuse, or security issues.</li>
        <li>To comply with legal obligations under Indian law.</li>
      </ul>

      <h2>3. How We Share Your Information</h2>
      <p>We share information only as needed to operate the Platform:</p>
      <ul>
        <li>
          <strong>Sellers:</strong> for order fulfillment, your shipping details are shared with
          the seller and their logistics partner.
        </li>
        <li>
          <strong>Service providers:</strong> payment gateways, logistics, analytics, customer
          support tools — bound by confidentiality obligations.
        </li>
        <li>
          <strong>Legal authorities:</strong> when required by law, court order, or to protect
          our rights and safety.
        </li>
        <li>
          <strong>Business transfers:</strong> in the event of a merger, acquisition, or asset
          sale.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal information to third-party advertisers.
      </p>

      <h2>4. Cookies & Tracking</h2>
      <p>
        We use cookies for authentication, session management, analytics, and personalization.
        You can disable cookies in your browser settings, but parts of the Platform may not
        function properly.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We retain your personal data for as long as your account is active and for a reasonable
        period afterward to comply with legal, tax, and accounting obligations under Indian law.
      </p>

      <h2>6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access and review the personal information we hold about you.</li>
        <li>Request correction of inaccurate information.</li>
        <li>Request deletion of your account and personal data, subject to legal limits.</li>
        <li>Opt out of marketing communications at any time.</li>
      </ul>
      <p>
        To exercise these rights, email us at{" "}
        <a href="mailto:shawsumit6286@gmail.com">shawsumit6286@gmail.com</a>.
      </p>

      <h2>7. Data Security</h2>
      <p>
        We use industry-standard security measures (HTTPS encryption, access controls, secure
        cloud infrastructure) to protect your data. However, no system is completely secure, and
        we cannot guarantee absolute security.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        ANGA9 is not intended for users under 18. We do not knowingly collect personal
        information from children. If you believe we have, please contact us and we will delete
        it.
      </p>

      <h2>9. Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy occasionally. The &ldquo;Last updated&rdquo; date
        reflects the latest version. Material changes will be communicated via the Platform or
        email.
      </p>

      <h2>10. Contact</h2>
      <p>
        Privacy questions or requests:{" "}
        <a href="mailto:shawsumit6286@gmail.com">shawsumit6286@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
