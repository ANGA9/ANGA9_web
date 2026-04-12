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
      <main>{children}</main>
    </div>
  );
}
