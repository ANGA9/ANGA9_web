import CustomerTopNav from "@/components/customer/CustomerTopNav";
import CategoryStrip from "@/components/customer/CategoryStrip";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export default function CustomerShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: t.bgPage }}>
      <CustomerTopNav />
      <CategoryStrip />
      {/* constrained main content — same max-width & padding as nav rows */}
      <main
        className="mx-auto"
        style={{ maxWidth: 1280, padding: "0 24px" }}
      >
        {children}
      </main>
    </div>
  );
}
