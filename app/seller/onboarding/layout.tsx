import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Smartphone } from "lucide-react";
import { cdnUrl } from "@/lib/utils";
import WatercolorBg from "@/components/seller/WatercolorBg";

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
    <div className="min-h-screen bg-[#F8FBFF] relative" style={{ fontFamily: "var(--font-gilroy)" }}>
      <WatercolorBg />
      {/* Minimal header */}
      <header className="relative z-50 bg-white border-b border-[#E8EEF4]">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Link href="/seller" className="shrink-0">
            <div className="flex items-center gap-2 cursor-pointer">
              <Image src={cdnUrl("/anga9-logo.png")} alt="ANGA9" width={100} height={34} priority style={{ objectFit: "contain" }} />
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <span className="text-sm font-bold tracking-wider text-[#4B5563] uppercase">Seller Hub</span>
            </div>
          </Link>
          <a
            href="#"
            className="flex items-center gap-2 font-medium text-[#4B5563] hover:text-[#1A6FD4] transition-colors"
            style={{ fontSize: '16px' }}
          >
            <Smartphone style={{ width: 18, height: 18, color: "#1A6FD4" }} />
            Download our App
          </a>
        </div>
      </header>
      {children}
    </div>
  );
}
