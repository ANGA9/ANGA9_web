"use client";

import LegalLayout from "@/components/legal/LegalLayout";
import { useLang } from "@/lib/i18n";
import { getTermsT } from "@/lib/termsTranslations";

export default function TermsContent() {
  const { lang } = useLang();
  const t = getTermsT(lang);
  const isEn = lang === "en";
  const dir = lang === "ur" ? "rtl" : "ltr";

  const Notice = () =>
    !isEn && t.notice ? (
      <p
        style={{
          fontSize: 13,
          color: "#6B7280",
          fontStyle: "italic",
          background: "#F9FAFB",
          padding: "8px 12px",
          borderRadius: 8,
          borderLeft: "3px solid #D1D5DB",
          marginBottom: 16,
        }}
      >
        {t.notice}
      </p>
    ) : null;

  return (
    <LegalLayout title={t.title} lastUpdated="May 5, 2026">
      <div dir={dir}>
        <p>{t.intro}</p>

        <h2>{t.heading("s1")}</h2>
        <Notice />
        <p>
          The Platform is intended for use by businesses and individuals who are at least 18 years
          of age and capable of entering into legally binding contracts under the Indian Contract
          Act, 1872. By creating an account, you represent that you meet these requirements and
          that the information you provide is accurate and complete.
        </p>

        <h2>{t.heading("s2")}</h2>
        <Notice />
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activities that occur under your account. You agree to notify us immediately of
          any unauthorized access. We reserve the right to suspend or terminate accounts that
          violate these Terms.
        </p>

        <h2>{t.heading("s3")}</h2>
        <Notice />
        <p>You agree not to:</p>
        <ul>
          <li>Use the Platform for any unlawful, fraudulent, or harmful purpose.</li>
          <li>Upload content that infringes on the intellectual property rights of others.</li>
          <li>Attempt to interfere with the proper functioning of the Platform.</li>
          <li>Use automated tools (bots, scrapers) without our prior written consent.</li>
          <li>Resell, sublicense, or redistribute access to the Platform.</li>
        </ul>

        <h2>{t.heading("s4")}</h2>
        <Notice />
        <p>
          All product listings on ANGA9 are made by independent sellers. Prices, availability, and
          product descriptions are provided by sellers and may change without notice. ANGA9 acts
          as a facilitator and is not the seller of record for products listed by third-party
          sellers. You agree to pay the total amount displayed at checkout, including any
          applicable taxes and shipping charges.
        </p>

        <h2>{t.heading("s5")}</h2>
        <Notice />
        <p>
          Delivery timelines are estimates and may vary based on location, product availability,
          and logistics partner performance. For details, please refer to our{" "}
          <a href="/shipping-policy">Shipping Policy</a>.
        </p>

        <h2>{t.heading("s6")}</h2>
        <Notice />
        <p>
          Returns and refunds are governed by the seller&apos;s policy, subject to our platform
          rules. See our <a href="/returns">Returns &amp; Refunds Policy</a> and{" "}
          <a href="/cancellation">Cancellation Policy</a> for details.
        </p>

        <h2>{t.heading("s7")}</h2>
        <Notice />
        <p>
          The Platform, including its design, logos, text, graphics, and software, is owned by
          ANGA9 or its licensors and is protected by Indian and international intellectual
          property laws. You may not copy, modify, distribute, or create derivative works without
          our prior written consent.
        </p>

        <h2>{t.heading("s8")}</h2>
        <Notice />
        <p>
          By submitting content (reviews, photos, ratings) to the Platform, you grant ANGA9 a
          non-exclusive, royalty-free, worldwide license to use, display, and distribute that
          content in connection with the Platform.
        </p>

        <h2>{t.heading("s9")}</h2>
        <Notice />
        <p>
          The Platform is provided &ldquo;as is&rdquo; without warranties of any kind, either
          express or implied. We do not guarantee uninterrupted access, error-free operation, or
          the accuracy of seller-provided information.
        </p>

        <h2>{t.heading("s10")}</h2>
        <Notice />
        <p>
          To the maximum extent permitted by law, ANGA9 shall not be liable for any indirect,
          incidental, special, or consequential damages arising out of or related to your use of
          the Platform.
        </p>

        <h2>{t.heading("s11")}</h2>
        <Notice />
        <p>
          You agree to indemnify and hold ANGA9, its officers, employees, and affiliates harmless
          from any claims, damages, or expenses arising from your breach of these Terms or your
          misuse of the Platform.
        </p>

        <h2>{t.heading("s12")}</h2>
        <Notice />
        <p>
          These Terms are governed by the laws of India. Any disputes arising shall be subject to
          the exclusive jurisdiction of the courts at New Delhi, India.
        </p>

        <h2>{t.heading("s13")}</h2>
        <Notice />
        <p>
          We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the
          top reflects the most recent revision. Continued use of the Platform after changes
          constitutes acceptance of the revised Terms.
        </p>

        <h2>{t.heading("s14")}</h2>
        <Notice />
        <p>
          For questions about these Terms, please contact us at{" "}
          <a href="mailto:support@anga9.com">support@anga9.com</a> or visit our{" "}
          <a href="/contact">Contact</a> page.
        </p>
      </div>
    </LegalLayout>
  );
}
