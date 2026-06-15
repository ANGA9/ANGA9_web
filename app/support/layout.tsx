import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ANGA9 Support Portal",
  description: "Dedicated support team interface",
};

/**
 * Root layout for the entire /support tree (both /support/login and
 * /support/dashboard/*). It deliberately does NO auth work — gating lives in
 * app/support/dashboard/layout.tsx so the login page is reachable while
 * unauthenticated.
 *
 * (Putting the auth redirect here caused an infinite redirect loop: an
 * unauthenticated visitor to /support/login had no session, got
 * redirect("/support/login"), which re-ran this same layout forever. The old
 * isLoginPage guard relied on an "x-invoke-path" header that does not exist in
 * Next 16, so isLoginPage was always false.)
 */
export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-[#F0FDFA]`}>
      {children}
    </div>
  );
}
