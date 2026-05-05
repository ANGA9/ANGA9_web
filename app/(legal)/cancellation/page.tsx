import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description:
    "ANGA9 Cancellation Policy — how to cancel orders before dispatch, eligibility, and refund process for cancelled orders.",
  alternates: { canonical: "https://anga9.com/cancellation" },
  robots: { index: true, follow: true },
};

export default function CancellationPage() {
  return (
    <LegalLayout title="Cancellation Policy" lastUpdated="May 5, 2026">
      <p>
        This policy explains when and how you can cancel an order placed on ANGA9.
      </p>

      <h2>1. Cancellation by Buyer</h2>
      <p>
        You can cancel an order anytime <strong>before it is dispatched</strong> by the seller.
        Once the order moves to the &ldquo;Shipped&rdquo; stage, cancellation is no longer
        possible &mdash; you can request a return after delivery instead.
      </p>

      <h2>2. How to Cancel</h2>
      <ol>
        <li>
          Go to <a href="/orders">My Orders</a>.
        </li>
        <li>Select the order you want to cancel.</li>
        <li>Click &ldquo;Cancel Order&rdquo; and choose a reason.</li>
        <li>Confirm. You&apos;ll see a confirmation and refund initiation message.</li>
      </ol>

      <h2>3. Cancellation by Seller or ANGA9</h2>
      <p>An order may be cancelled by the seller or ANGA9 in the following situations:</p>
      <ul>
        <li>Product is out of stock.</li>
        <li>Pricing or listing error on the product page.</li>
        <li>Delivery to the buyer&apos;s pin code is not feasible.</li>
        <li>Suspected fraud, abuse, or violation of our Terms.</li>
        <li>Payment could not be authorized or verified.</li>
      </ul>
      <p>
        In all such cases, you will be notified and a full refund will be initiated to your
        original payment method.
      </p>

      <h2>4. Refund Timelines for Cancelled Orders</h2>
      <ul>
        <li>
          <strong>Prepaid orders:</strong> refunds are initiated within 24 hours of
          cancellation. Bank credit time depends on your payment method (typically 1–7 business
          days).
        </li>
        <li>
          <strong>Cash on delivery:</strong> no payment was made, so no refund is required.
        </li>
      </ul>

      <h2>5. Partial Cancellation</h2>
      <p>
        For multi-item orders, you can cancel individual items as long as they have not been
        dispatched. The refund for cancelled items will be initiated separately.
      </p>

      <h2>6. Contact</h2>
      <p>
        Need help with a cancellation? Email{" "}
        <a href="mailto:shawsumit6286@gmail.com">shawsumit6286@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
