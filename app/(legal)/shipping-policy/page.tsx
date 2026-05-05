import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "ANGA9 Shipping Policy — how orders are shipped, delivery timelines, charges, and tracking on India's leading B2B marketplace.",
  alternates: { canonical: "https://anga9.com/shipping-policy" },
  robots: { index: true, follow: true },
};

export default function ShippingPolicyPage() {
  return (
    <LegalLayout title="Shipping Policy" lastUpdated="May 5, 2026">
      <p>
        ANGA9 partners with leading logistics providers to deliver products across 19,000+ pin
        codes in India. This policy explains how shipping works on our Platform.
      </p>

      <h2>1. Shipping Coverage</h2>
      <p>
        We currently ship to addresses across India. International shipping is not yet
        supported. Some pin codes may have limited service or surcharges based on the carrier.
      </p>

      <h2>2. Delivery Timelines</h2>
      <ul>
        <li>
          <strong>Metro cities:</strong> typically 2–5 business days from dispatch.
        </li>
        <li>
          <strong>Tier-2 / Tier-3 cities:</strong> typically 4–8 business days.
        </li>
        <li>
          <strong>Remote / hilly areas:</strong> 7–12 business days.
        </li>
      </ul>
      <p>
        Timelines are estimates from the date of dispatch (not order placement) and exclude
        Sundays and public holidays. Sellers may take 1–3 business days to dispatch the order.
      </p>

      <h2>3. Shipping Charges</h2>
      <p>
        Shipping charges are calculated at checkout based on weight, dimensions, destination pin
        code, and the seller&apos;s shipping configuration. Some products may qualify for free
        shipping, indicated on the product page.
      </p>

      <h2>4. Order Tracking</h2>
      <p>
        Once your order is dispatched, you will receive a tracking link via SMS, email, and on
        your <a href="/orders">Orders</a> page. You can use this to follow your shipment.
      </p>

      <h2>5. Delivery Attempts & Failures</h2>
      <p>
        Most carriers attempt delivery 2–3 times. If all attempts fail, the package will be
        returned to the seller and a refund (less shipping charges, if applicable) will be
        processed. Please ensure someone is available at the delivery address and the contact
        number is reachable.
      </p>

      <h2>6. Damaged or Missing Items</h2>
      <p>
        If your package arrives damaged, tampered with, or is missing items, please:
      </p>
      <ol>
        <li>Refuse delivery if possible, or accept it with a note to the delivery agent.</li>
        <li>
          Take clear photos of the package (outer and inner) and the damaged/missing items.
        </li>
        <li>
          Report the issue within <strong>48 hours</strong> of delivery via your{" "}
          <a href="/orders">Orders</a> page or by emailing support.
        </li>
      </ol>
      <p>
        Reports made after 48 hours may not be eligible for replacement or refund.
      </p>

      <h2>7. Address Changes</h2>
      <p>
        Once an order is placed, the delivery address cannot be modified. Please review your
        address carefully before checkout.
      </p>

      <h2>8. Holidays & Force Majeure</h2>
      <p>
        Delivery timelines may be affected by public holidays, weather conditions, transport
        strikes, or other circumstances beyond our control. We will keep you informed of any
        significant delays.
      </p>

      <h2>9. Contact</h2>
      <p>
        Shipping questions? Email{" "}
        <a href="mailto:support@anga9.com">support@anga9.com</a>.
      </p>
    </LegalLayout>
  );
}
