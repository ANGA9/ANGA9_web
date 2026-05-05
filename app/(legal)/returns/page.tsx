import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy",
  description:
    "ANGA9 Returns and Refunds Policy — how to return products, eligibility, refund timelines, and the process on our B2B wholesale marketplace.",
  alternates: { canonical: "https://anga9.com/returns" },
  robots: { index: true, follow: true },
};

export default function ReturnsPage() {
  return (
    <LegalLayout title="Returns & Refunds Policy" lastUpdated="May 5, 2026">
      <p>
        We want every order on ANGA9 to be a good experience. If something isn&apos;t right,
        this policy explains how returns and refunds work.
      </p>

      <h2>1. Return Window</h2>
      <p>
        Most products are eligible for return within <strong>7 days</strong> of delivery, unless
        a different window is specified on the product page. Some categories (perishables,
        innerwear, customized items, hygiene products, opened consumables) are{" "}
        <strong>non-returnable</strong> for safety and hygiene reasons.
      </p>

      <h2>2. Eligibility</h2>
      <p>For a return to be accepted, the product must be:</p>
      <ul>
        <li>In its original condition with all tags, manuals, and packaging.</li>
        <li>Unused, unwashed, and undamaged by the buyer.</li>
        <li>Accompanied by the original invoice.</li>
      </ul>
      <p>Returns will not be accepted if:</p>
      <ul>
        <li>The product is damaged due to misuse, mishandling, or normal wear and tear.</li>
        <li>Tags, seals, or accessories are missing.</li>
        <li>The return is requested after the eligible window.</li>
      </ul>

      <h2>3. How to Initiate a Return</h2>
      <ol>
        <li>
          Go to <a href="/orders">My Orders</a> and select the order you want to return.
        </li>
        <li>Click &ldquo;Return&rdquo; and choose a reason.</li>
        <li>
          Upload clear photos of the product (especially if damaged or wrong item received).
        </li>
        <li>Submit the request — you&apos;ll get a confirmation and pickup schedule.</li>
      </ol>

      <h2>4. Pickup & Inspection</h2>
      <p>
        Our logistics partner will schedule a pickup at your address. Please hand over the
        product in its original packaging. Once received by the seller, the product will be
        inspected within 2–3 business days. If approved, your refund will be processed.
      </p>

      <h2>5. Refund Timelines</h2>
      <p>After approval, refunds typically reach you in:</p>
      <ul>
        <li>
          <strong>UPI / wallets:</strong> 1–2 business days.
        </li>
        <li>
          <strong>Credit / debit cards:</strong> 3–7 business days.
        </li>
        <li>
          <strong>Net banking:</strong> 3–7 business days.
        </li>
        <li>
          <strong>Cash on delivery:</strong> refunded to your bank account via NEFT once details
          are provided (5–7 business days).
        </li>
      </ul>
      <p>Actual credit time depends on your bank.</p>

      <h2>6. Replacements</h2>
      <p>
        For damaged, defective, or wrong items, you can request a replacement instead of a
        refund (subject to seller stock and product availability).
      </p>

      <h2>7. Return Shipping</h2>
      <p>
        For approved returns due to damaged, defective, or incorrect products, return shipping
        is <strong>free</strong>. For change-of-mind returns, a return shipping fee may be
        deducted from the refund based on the seller&apos;s policy.
      </p>

      <h2>8. Disputes</h2>
      <p>
        If a return is rejected and you disagree, please contact our support team within 48
        hours and we will mediate between you and the seller.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions? Reach out at{" "}
        <a href="mailto:shawsumit6286@gmail.com">shawsumit6286@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
