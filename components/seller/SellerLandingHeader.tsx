"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, User } from "lucide-react";

const navLinks = [
  { name: "Sell on ANGA9", href: "/seller/sell-on-anga9" },
  { name: "How to Sell", href: "/seller/how-to-sell" },
  { name: "Shipping & Delivery", href: "/seller/shipping" },
  { name: "Grow Your Business", href: "/seller/grow-business" },
];

export default function SellerLandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E8EEF4] shadow-sm">
        {/* Removed max-w to match full width of customer portal */}
        <div className="mx-auto flex h-[64px] sm:h-[72px] w-full items-center justify-between px-3 sm:px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80 flex items-center gap-1.5 sm:gap-2">
            <Image 
              src="/anga9-logo.png" 
              alt="ANGA9 Logo" 
              width={90} 
              height={28} 
              className="sm:w-[100px] sm:h-[32px]"
              priority 
              quality={75} 
              style={{ objectFit: "contain" }} 
            />
            <span className="inline-block border-l-2 border-[#E8EEF4] pl-2 sm:pl-3 sm:ml-1 text-[11px] sm:text-sm font-bold text-[#4B5563] tracking-wide whitespace-nowrap">
              SELLER HUB
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`relative text-[15px] font-semibold transition-all py-1.5 group ${
                    isActive 
                      ? "text-[#4338CA]" 
                      : "text-[#4B5563] hover:text-[#4338CA]"
                  }`}
                >
                  {item.name}
                  {/* Line growing transition */}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-[#4338CA] transition-all duration-300 ease-out ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Desktop: Back to Customer Portal */}
            <Link 
              href="/" 
              className="hidden lg:flex items-center gap-2 rounded-lg border border-[#E8EEF4] bg-white px-4 py-2 text-sm font-bold text-[#1A1A2E] shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300"
            >
              <User size={16} />
              Back to Customer Portal
            </Link>

            {/* Desktop: Login & Start Selling */}
            <Link 
              href="/seller/login" 
              className="hidden lg:inline-flex rounded-lg border border-[#1A1A2E] px-5 py-2 text-sm font-bold text-[#1A1A2E] transition-all hover:bg-gray-50"
            >
              Login
            </Link>
            <Link 
              href="/seller/login" 
              className="hidden lg:inline-flex h-[42px] items-center justify-center rounded-lg bg-[#4338CA] px-6 text-sm font-bold text-white shadow-md shadow-[#4338CA]/20 transition-all hover:-translate-y-[1px] hover:bg-[#3730A3]"
            >
              Start Selling
            </Link>

            {/* Mobile: Customer Portal & Login */}
            <div className="flex items-center gap-1.5 lg:hidden mr-1">
              <Link 
                href="/" 
                className="flex items-center gap-1 rounded-md border border-[#E8EEF4] bg-white px-2 py-1.5 text-[11px] font-bold text-[#1A1A2E] shadow-sm"
              >
                <User size={12} />
                Portal
              </Link>
              <Link 
                href="/seller/login" 
                className="rounded-md bg-[#4338CA] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm"
              >
                Login
              </Link>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="p-1.5 -mr-1 lg:hidden text-[#1A1A2E] hover:bg-[#F3F4F6] rounded-lg transition-colors" 
              onClick={() => setIsMenuOpen(true)} 
              aria-label="Open menu"
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#1A1A2E]/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Content */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[340px] bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between h-[64px] px-5 border-b border-[#E8EEF4] bg-[#F8FBFF]">
          <span className="font-bold text-[#1A1A2E] tracking-wide">Menu</span>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-2 -mr-2 text-[#4B5563] hover:text-[#DC2626] hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto py-4 px-5">
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`flex items-center justify-between p-4 rounded-xl font-semibold text-base transition-all ${
                    isActive 
                      ? "bg-[#4338CA]/10 text-[#4338CA]" 
                      : "text-[#1A1A2E] hover:bg-[#F3F4F6]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#4338CA]" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-[#E8EEF4] bg-white flex flex-col gap-3">
          <Link 
            href="/seller/login" 
            className="flex items-center justify-center w-full h-[52px] rounded-xl border-2 border-[#1A1A2E] font-bold text-[#1A1A2E] text-base hover:bg-gray-50 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Login to Dashboard
          </Link>
          <Link 
            href="/seller/login" 
            className="flex items-center justify-center gap-2 w-full h-[52px] rounded-xl bg-[#4338CA] font-bold text-white text-base shadow-lg shadow-[#4338CA]/25 hover:bg-[#3730A3] transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Start Selling <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </>
  );
}
