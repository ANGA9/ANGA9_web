import CustomerTopNav from "@/components/customer/CustomerTopNav";
import CategoryStrip from "@/components/customer/CategoryStrip";

export default function CustomerShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-anga-bg">
      <CustomerTopNav />
      <CategoryStrip />
      <main>{children}</main>
    </div>
  );
}
