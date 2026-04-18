"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserPlus,
  PackagePlus,
  ShoppingCart,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  FileText,
  BarChart3,
  Truck,
  Shield,
} from "lucide-react";

export default function HowItWorksPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Sell Online", href: "/seller/sell-online" },
    { name: "How It Works", href: "/seller/how-it-works" },
    { name: "Shipping & Delivery", href: "/seller/shipping" },
    { name: "Grow Your Business", href: "/seller/grow-business" },
  ];

  const steps = [
    {
      step: 1,
      title: "Register Your Business",
      desc: "Sign up on ANGA9 with your business details, bank account information, and tax documents. Our streamlined registration takes less than 10 minutes. Once verified, you get instant access to the Seller Dashboard.",
      icon: UserPlus,
      color: "text-[#1A6FD4] bg-[#1A6FD4]/10",
      highlights: ["Quick 10-minute setup", "Business verification within 24 hours", "Dedicated onboarding support"],
    },
    {
      step: 2,
      title: "List Your Product Catalog",
      desc: "Upload your products with images, descriptions, pricing, and inventory details. Use our bulk upload tool for large catalogs. Set wholesale pricing tiers for B2B buyers and configure minimum order quantities.",
      icon: PackagePlus,
      color: "text-[#1A6FD4] bg-[#1A6FD4]/10",
      highlights: ["Bulk catalog upload via CSV", "Set wholesale pricing tiers", "Configure minimum order quantities"],
    },
    {
      step: 3,
      title: "Receive & Fulfill Orders",
      desc: "Once your catalog is live, orders start flowing in from retailers and bulk buyers across India. You receive instant notifications for every new order. Pack your products securely and hand them to our logistics partner for doorstep pickup.",
      icon: ShoppingCart,
      color: "text-[#22C55E] bg-[#22C55E]/10",
      highlights: ["Real-time order notifications", "Doorstep pickup by logistics partner", "Order management dashboard"],
    },
    {
      step: 4,
      title: "Get Paid Securely",
      desc: "Payments are deposited directly into your bank account on a reliable 7-day cycle from order delivery, including Cash on Delivery orders. Track your earnings, pending payouts, and transaction history from the Seller Dashboard.",
      icon: Wallet,
      color: "text-[#F59E0B] bg-[#F59E0B]/10",
      highlights: ["7-day payment cycle", "COD orders included", "Transparent payout tracking"],
    },
  ];

  const requirements = [
    { icon: FileText, title: "Business Registration", desc: "GST certificate or business PAN card for verification" },
    { icon: Wallet, title: "Bank Account", desc: "Active current or savings account for receiving payouts" },
    { icon: PackagePlus, title: "Product Catalog", desc: "Product images, descriptions, and pricing ready to upload" },
    { icon: Shield, title: "Quality Standards", desc: "Products must meet ANGA9 quality and packaging guidelines" },
  ];

  return (
    <div
      className="min-h-screen bg-white selection:bg-[#1A6FD4]/20 selection:text-[#1A1A2E]"
      style={{ fontFamily: "var(--font-gilroy)" }}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E8EEF4]">
        <div className="mx-auto flex h-[60px] sm:h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-12">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            <Image src="/anga9-logo.png" alt="ANGA9 Logo" width={110} height={36} priority quality={75} style={{ objectFit: "contain" }} />
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-[15px] font-medium transition-all hover:text-[#1A6FD4] pb-1 border-b-2 hover:border-[#1A6FD4] ${
                  item.name === "How It Works" ? "text-[#1A6FD4] border-[#1A6FD4]" : "text-[#4B5563] border-transparent"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <Link href="/seller/login" className="rounded-lg border border-[#1A6FD4] px-4 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm font-bold text-[#1A6FD4] transition-all hover:bg-[#1A6FD4]/5 inline-flex">
              Login
            </Link>
            <Link href="/seller/register" className="hidden lg:inline-flex h-11 items-center justify-center rounded-[10px] bg-[#6C47FF] px-6 text-sm font-bold text-white shadow-[0_4px_12px_rgba(108,71,255,0.25)] transition-all hover:scale-[1.02] hover:bg-[#5A3AE0]">
              Start Selling
            </Link>
            <button className="p-2 lg:hidden text-[#1A1A2E] hover:bg-[#F3F4F6] rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-40 bg-white border-b border-[#E8EEF4] shadow-lg lg:hidden">
            <nav className="flex flex-col px-4 py-3">
              {navLinks.map((item) => (
                <Link key={item.name} href={item.href} className="text-[15px] font-medium text-[#4B5563] hover:text-[#1A6FD4] hover:bg-[#F8FBFF] px-3 py-3 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {item.name}
                </Link>
              ))}
              <Link href="/seller/login" className="text-[15px] font-medium text-[#1A6FD4] hover:bg-[#1A6FD4]/5 px-3 py-3 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#F8FBFF] py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <span className="text-[12px] sm:text-[14px] font-bold text-[#1A6FD4] uppercase tracking-wider mb-3 block">
                Simple 4-Step Process
              </span>
              <h1 className="mb-4 sm:mb-6 text-[28px] sm:text-[36px] md:text-5xl lg:text-[56px] font-bold leading-[1.15] text-[#1A1A2E]">
                Start Selling on ANGA9 in{" "}
                <span className="text-[#1A6FD4]">Minutes</span>
              </h1>
              <p className="text-[15px] sm:text-[17px] text-[#4B5563] leading-relaxed mb-6 sm:mb-8 max-w-lg">
                From registration to your first order, our streamlined process gets your business online fast. Join thousands of suppliers already growing on India&apos;s B2B marketplace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/seller/register" className="h-12 sm:h-14 px-8 sm:px-10 bg-[#6C47FF] text-white font-bold rounded-xl shadow-lg shadow-[#6C47FF]/25 hover:bg-[#5A3AE0] transition-all hover:scale-[1.02] flex items-center justify-center">
                  Register Now
                </Link>
                <Link href="#steps" className="h-12 sm:h-14 px-8 sm:px-10 border-2 border-[#E8EEF4] text-[#1A1A2E] font-bold rounded-xl hover:border-[#1A6FD4] transition-all flex items-center justify-center gap-2">
                  View Steps <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="relative h-[250px] sm:h-[350px] lg:h-[450px] w-full">
              <Image src="/seller-why-sell.png" fill className="object-contain" alt="How it works" priority />
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section id="steps" className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Your Journey to Selling Online
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-4 rounded-full" />
          <p className="text-center text-[15px] sm:text-[17px] text-[#4B5563] mb-10 sm:mb-16 max-w-2xl mx-auto">
            Follow these four simple steps to get your products in front of buyers across India
          </p>

          <div className="space-y-8 sm:space-y-12 lg:space-y-20">
            {steps.map((item, idx) => (
              <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-6 sm:gap-8 lg:gap-16 items-center`}>
                {/* Content */}
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-4 mb-4 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon size={24} />
                    </div>
                    <div>
                      <span className="text-[12px] sm:text-[13px] font-bold text-[#1A6FD4] uppercase tracking-wider">Step {item.step}</span>
                      <h3 className="text-[20px] sm:text-[24px] lg:text-[28px] font-bold text-[#1A1A2E]">{item.title}</h3>
                    </div>
                  </div>
                  <p className="text-[14px] sm:text-[16px] text-[#4B5563] leading-relaxed mb-4 sm:mb-6">{item.desc}</p>
                  <ul className="space-y-2 sm:space-y-3">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-3 text-[13px] sm:text-[15px] text-[#1A1A2E]">
                        <CheckCircle2 size={18} className="text-[#22C55E] shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image */}
                <div className="flex-1 w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[480px]">
                  <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl border-2 sm:border-4 border-white bg-[#F8FBFF]">
                    <Image src="/seller-why-sell.png" fill className="object-cover" alt={item.title} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section className="py-12 sm:py-16 lg:py-24 bg-[#F8FBFF]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            What You Need to Get Started
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-4 rounded-full" />
          <p className="text-center text-[15px] sm:text-[17px] text-[#4B5563] mb-10 sm:mb-16 max-w-2xl mx-auto">
            Keep these documents and details ready for a smooth registration
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {requirements.map((item, idx) => (
              <div key={idx} className="bg-white p-5 sm:p-8 rounded-2xl border border-[#E8EEF4] hover:shadow-xl hover:border-[#1A6FD4]/20 transition-all text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#1A6FD4]/10 text-[#1A6FD4] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <item.icon size={28} />
                </div>
                <h3 className="text-[16px] sm:text-[18px] font-bold text-[#1A1A2E] mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-[13px] sm:text-[14px] text-[#4B5563] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ-STYLE QUICK ANSWERS */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Common Questions
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-10 sm:mb-16 rounded-full" />

          <div className="space-y-4 sm:space-y-6">
            {[
              { q: "How long does registration take?", a: "The registration process takes about 10 minutes. Your account is verified within 24 hours, and you can start listing products immediately after verification." },
              { q: "Is there a fee to become a seller?", a: "Registration is completely free. ANGA9 charges 0% commission on your sales, making it the most cost-effective marketplace for suppliers in India." },
              { q: "How soon can I start receiving orders?", a: "Once your product catalog is uploaded and approved (typically within 72 hours), your products go live and are visible to buyers across India." },
              { q: "What kind of products can I sell?", a: "ANGA9 supports a wide range of product categories including fashion, electronics, home goods, beauty, grocery, and more. All products must meet our quality guidelines." },
              { q: "How does payment work?", a: "Payments are processed on a 7-day cycle from delivery confirmation. Both prepaid and Cash on Delivery order amounts are deposited directly to your registered bank account." },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#F8FBFF] p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#E8EEF4]">
                <h3 className="text-[15px] sm:text-[17px] font-bold text-[#1A1A2E] mb-2 sm:mb-3">{item.q}</h3>
                <p className="text-[13px] sm:text-[15px] text-[#4B5563] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#F8FBFF] pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-10 border-t border-[#E8EEF4]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5 flex flex-col items-start">
              <Link href="/" className="mb-6 block">
                <Image src="/anga9-logo.png" alt="ANGA9 Logo" width={130} height={42} unoptimized style={{ objectFit: "contain" }} />
              </Link>
              <p className="mb-8 max-w-sm text-[15px] sm:text-[17px] leading-relaxed text-[#4B5563]">
                India&apos;s leading B2B marketplace connecting suppliers with buyers across the country at 0% commission.
              </p>
            </div>

            <div className="lg:col-span-3">
              <h4 className="mb-6 text-[18px] font-bold text-[#1A1A2E]">Sell on ANGA9</h4>
              <ul className="space-y-4">
                {[
                  { label: "Sell Online", href: "/seller/sell-online" },
                  { label: "How It Works", href: "/seller/how-it-works" },
                  { label: "Shipping & Delivery", href: "/seller/shipping" },
                  { label: "Grow Your Business", href: "/seller/grow-business" },
                  { label: "Seller Dashboard", href: "/seller/login" },
                  { label: "Shop on ANGA9", href: "/" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[15px] text-[#4B5563] transition-colors hover:text-[#1A6FD4]">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h4 className="mb-6 text-[18px] font-bold text-[#1A1A2E]">Contact Us</h4>
              <Link href="mailto:sell@anga9.com" className="mb-6 block text-[16px] font-medium text-[#4B5563] hover:text-[#1A6FD4]">sell@anga9.com</Link>
              <div className="flex items-center gap-4">
                {[
                  { icon: "Ig", color: "bg-[#E1306C]" },
                  { icon: "Fb", color: "bg-[#1877F2]" },
                  { icon: "Yt", color: "bg-[#FF0000]" },
                ].map((social) => (
                  <div key={social.icon} className={`flex h-9 w-9 items-center justify-center rounded-lg ${social.color}/10 text-[14px] font-bold text-[#1A1A2E] cursor-pointer hover:opacity-80 transition-opacity`}>
                    {social.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-16 lg:mt-20 border-t border-[#E8EEF4] pt-6 sm:pt-10 text-center">
            <p className="text-[14px] text-[#6B7280]">&copy; 2024-25 ANGA9 Inc. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
