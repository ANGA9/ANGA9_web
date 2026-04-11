export const metadata = {
  title: "ANGA Admin Portal",
  description: "B2B wholesale marketplace admin dashboard",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
