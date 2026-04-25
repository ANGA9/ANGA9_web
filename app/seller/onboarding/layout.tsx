import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seller Onboarding — ANGA9",
  description: "Complete your seller profile to start selling on ANGA9.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FBFF]" style={{ fontFamily: "var(--font-gilroy)" }}>
      {/* Minimal header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E8EEF4]">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="shrink-0">
            <Image
              src="/anga9-logo.png"
              alt="ANGA9"
              width={100}
              height={34}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>
          <a
            href="mailto:sell@anga9.com"
            className="text-sm md:text-base font-medium text-[#1A6FD4] hover:underline"
          >
            Need help?
          </a>
        </div>
      </header>
      {children}
    </div>
  );
}
