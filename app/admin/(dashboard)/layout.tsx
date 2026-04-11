import Sidebar from "@/components/Sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-anga-bg">
      <Sidebar />
      <div className="xl:pl-[240px] transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
