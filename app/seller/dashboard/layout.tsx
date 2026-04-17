import SellerSidebar from "@/components/seller/SellerSidebar";

export default function SellerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-seller-bg">
      <SellerSidebar />
      <div className="xl:pl-[240px] transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
