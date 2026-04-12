import CustomerTopNav from "@/components/customer/CustomerTopNav";

export default function CustomerShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <CustomerTopNav />
      <main>{children}</main>
    </div>
  );
}
