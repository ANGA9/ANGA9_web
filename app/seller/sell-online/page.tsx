"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  TrendingUp,
  IndianRupee,
  Zap,
  LayoutDashboard,
  Truck,
  ShieldCheck,
  Megaphone,
  Package,
  ShoppingBag,
  Users,
  MapPin,
  Grid3X3,
  Headphones,
  Clock,
  Globe,
  Wallet,
  Star,
  ArrowRight,
  BadgeCheck,
  Layers,
  Menu,
  X,
  Plus,
} from "lucide-react";

export default function SellOnlinePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");

  const navLinks = [
    { name: "Sell Online", href: "/seller/sell-online" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Pricing & Commission", href: "#" },
    { name: "Shipping & Returns", href: "#" },
    { name: "Grow Business", href: "#" },
    { name: "Don't have GST?", href: "/seller/gst" },
  ];

  return (
    <div
      className="min-h-screen bg-white selection:bg-[#1A6FD4]/20 selection:text-[#1A1A2E]"
      style={{ fontFamily: "var(--font-gilroy)" }}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E8EEF4]">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-12">
          <Link
            href="/"
            className="shrink-0 transition-opacity hover:opacity-80"
          >
            <Image
              src="/anga9-logo.png"
              alt="ANGA9 Logo"
              width={110}
              height={36}
              priority
              quality={75}
              style={{ objectFit: "contain" }}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-[15px] font-medium transition-colors hover:text-[#1A6FD4] ${
                  item.name === "Sell Online" ? "text-[#1A6FD4]" : "text-[#4B5563]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <Link
              href="/seller/login"
              className="rounded-lg border border-[#1A6FD4] px-5 lg:px-6 py-2 lg:py-2.5 text-sm font-bold text-[#1A6FD4] transition-all hover:bg-[#1A6FD4]/5 inline-flex"
            >
              Login
            </Link>
            <Link
              href="/seller/register"
              className="hidden lg:inline-flex h-11 items-center justify-center rounded-[10px] bg-[#6C47FF] px-6 text-sm font-bold text-white shadow-[0_4px_12px_rgba(108,71,255,0.25)] transition-all hover:scale-[1.02] hover:bg-[#5A3AE0]"
            >
              Start Selling
            </Link>
            
            <button 
              className="p-2 lg:hidden text-[#1A1A2E] hover:bg-[#F3F4F6] rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white lg:hidden pt-[72px]">
            <div className="flex flex-col p-6 space-y-6">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-lg font-semibold text-[#1A1A2E] border-b border-[#F3F4F6] pb-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/seller/register"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-[#6C47FF] text-lg font-bold text-white shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Start Selling
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#F8FBFF] pt-12 pb-20 lg:pt-16 lg:pb-24">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[#1A6FD4]/5 -skew-x-12 translate-x-1/4" />
        
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <span className="text-[14px] font-bold text-[#1A6FD4] uppercase tracking-wider mb-4 block">
                Learn How to Sell Online
              </span>
              <h1 className="mb-6 text-[40px] font-bold leading-[1.1] text-[#1A1A2E] md:text-5xl lg:text-6xl">
                Become an ANGA9 seller to start selling your products online at{" "}
                <span className="text-[#1A6FD4]">0% commission</span>
              </h1>

              <div className="mb-8 flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E8EEF4] inline-flex">
                <span className="bg-[#FF4D4D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                <p className="text-[13px] text-[#4B5563]">
                  Don&apos;t have a GSTIN or have a Composition GSTIN? You can still sell on ANGA9.{" "}
                  <Link href="/seller/gst" className="text-[#1A6FD4] font-bold hover:underline">Click here</Link> to know more.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563] font-medium">+91</div>
                  <input
                    type="tel"
                    placeholder="Enter Your Mobile Number"
                    className="w-full h-14 pl-14 pr-4 rounded-xl border-2 border-[#E8EEF4] focus:border-[#1A6FD4] outline-none transition-all text-[16px]"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-[#1A6FD4] opacity-0 group-focus-within:opacity-10 pointer-events-none" />
                </div>
                <button className="h-14 px-10 bg-[#6C47FF] text-white font-bold rounded-xl shadow-lg shadow-[#6C47FF]/25 hover:bg-[#5A3AE0] transition-all hover:scale-[1.02]">
                  Start Selling
                </button>
              </div>
            </div>

            <div className="relative h-[400px] lg:h-[500px] w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1A6FD4]/10 to-transparent rounded-full blur-3xl" />
              <Image
                src="/seller-why-sell.png"
                fill
                className="object-contain"
                alt="Sell Online"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* WHY SELL ON ANGA9 */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <h2 className="text-center text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-16">
            Why Sell Your Products On ANGA9?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "0% Commission",
                desc: "Sell your products online at 0% commission and enjoy a hassle-free selling experience on ANGA9.",
                icon: IndianRupee,
                color: "text-[#22C55E] bg-[#22C55E]/10"
              },
              {
                title: "Crores of Customers",
                desc: "ANGA9 is a leading value e-commerce platform in India enabling sellers to reach 10+ Crore customers across the country.",
                icon: Users,
                color: "text-[#1A6FD4] bg-[#1A6FD4]/10"
              },
              {
                title: "Delivering Pan-India",
                desc: "Receive orders from all over India and sell products online to crores of customers across India.",
                icon: Globe,
                color: "text-[#F59E0B] bg-[#F59E0B]/10"
              },
              {
                title: "Affordable Shipping",
                desc: "Sell your products across India with affordable shipping solutions.",
                icon: Truck,
                color: "text-[#6C47FF] bg-[#6C47FF]/10"
              }
            ].map((item, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-[#E8EEF4] hover:shadow-xl hover:border-[#1A6FD4]/20 transition-all group">
                <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon size={28} />
                </div>
                <h3 className="text-[22px] font-bold text-[#1A1A2E] mb-4">{item.title}</h3>
                <p className="text-[#4B5563] text-[15px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO SELL TIMELINE */}
      <section id="how-it-works" className="py-24 bg-[#F8FBFF]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <h2 className="text-center text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-20 uppercase tracking-tight">
            How to Sell Your Products Online?
          </h2>

          <div className="relative max-w-5xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-[30px] lg:left-1/2 top-0 bottom-0 w-[2px] bg-[#E8EEF4] -translate-x-1/2" />

            <div className="space-y-32">
              {[
                {
                  step: 1,
                  title: "Register as an ANGA9 Seller",
                  desc: "Create an account on ANGA9 and list the products you want to sell online. All you need for ANGA9 seller registration is an active bank account and your GSTIN number (for GST sellers) or Enrolment ID / UIN (for non-GST sellers).",
                },
                {
                  step: 2,
                  title: "Upload Catalog and Receive Orders",
                  desc: "Once registered, set up your product page to start selling online on ANGA9. Upload your product catalog on the ANGA9 Supplier Panel and you'll be all set to sell and grow your business online. Your product catalog gets live post 72 hours from the time of upload.",
                },
                {
                  step: 3,
                  title: "Shipping & Order Delivery",
                  desc: "With ANGA9, you can enjoy easy and stress-free delivery of all your products. Once you receive an order for your product, you will get an email notification. You can also check the order update on the ANGA9 Supplier panel. ANGA9 offers affordable, reliable shipping across the country.",
                },
                {
                  step: 4,
                  title: "Receive Payment in Your Bank Account / Safe and Secure Payments",
                  desc: "Payment is securely deposited directly in your bank account, we follow a 7-day payment cycle from order delivery, including Cash on Delivery orders. You can view your deposited balance and future payments on the ANGA9 Supplier Panel.",
                }
              ].map((item, idx) => (
                <div key={idx} className={`relative flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}>
                  {/* Step Bubble */}
                  <div className="absolute left-[30px] lg:left-1/2 top-0 w-12 h-12 rounded-full bg-[#1A6FD4] text-white flex items-center justify-center font-bold text-xl shadow-lg ring-8 ring-[#F8FBFF] -translate-x-1/2 z-10">
                    {item.step}
                  </div>

                  <div className="flex-1 pl-16 lg:pl-0 pt-2 lg:pt-0">
                    <h3 className="text-[24px] font-bold text-[#1A1A2E] mb-4">{item.title}</h3>
                    <p className="text-[#4B5563] text-[16px] leading-relaxed bg-white/50 p-6 rounded-2xl border border-[#E8EEF4]/50">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex-1 w-full max-w-[400px]">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                      <Image
                        src="/seller-why-sell.png"
                        fill
                        className="object-cover"
                        alt={item.title}
                      />
                      <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-[#1A6FD4] flex items-center justify-center text-white pl-1 shadow-xl">
                          <ArrowRight />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY SUPPLIERS SELL ON ANGA9 */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-4">
              Why Suppliers Sell on ANGA9?
            </h2>
            <p className="text-[18px] text-[#4B5563]">Lakhs of Sellers sell products online on ANGA9</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                name: "Akansha and Bal Kishan",
                location: "Celebrity Club, Kolkata",
                img: "/seller-avatar-1.png",
                quote: "The biggest advantage of ANGA9 is the logistics support. We don't have to worry about delivery at all."
              },
              {
                name: "Priyanka",
                location: "Samridhi Design, Delhi",
                img: "/seller-avatar-2.png",
                quote: "ANGA9 has made my business journey very easy. The 0% commission is the best part for small artists."
              },
              {
                name: "Amit and Rajat Jain",
                location: "Smortees, Tiruppur",
                img: "/seller-avatar-3.png",
                quote: "Our business has grown beyond expectations. The sheer volume of orders is amazing."
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 group">
                  <Image src={item.img} fill className="object-cover group-hover:scale-105 transition-transform" alt={item.name} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="font-bold text-lg">{item.name}</p>
                    <p className="text-sm opacity-90">{item.location}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#1A6FD4] flex items-center justify-center text-white pl-1">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
                <p className="text-[#4B5563] text-center italic text-[15px]">&ldquo;{item.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GROW BUSINESS */}
      <section className="py-24 bg-[#F8FBFF]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <h2 className="text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-6">
                How to Grow Your Online Selling Business on ANGA9?
              </h2>
              <p className="text-[#4B5563] text-[17px] leading-relaxed mb-8">
                After you get your first order, it is time to start growing your online selling business! Some factors that help you building your online business are:
              </p>
              <div className="bg-white p-6 rounded-2xl border border-[#E8EEF4] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <h4 className="font-bold text-[#1A1A2E]">Growth Guarantee</h4>
                </div>
                <p className="text-sm text-[#4B5563]">Sellers using our growth tools see an average of 40% increase in orders within the first month.</p>
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Advertisements",
                  desc: "You can promote your product catalog to reach more customers and increase your sales using ANGA9 Ads. Currently, not available for sellers who don't have a Regular GSTIN.",
                  icon: Megaphone,
                  color: "text-[#EF4444] bg-[#EF4444]/10"
                },
                {
                  title: "Product Recommendations",
                  desc: "Use data-driven product recommendations to align with customer demand. These recommendations are made using customer demand data from across the internet.",
                  icon: Zap,
                  color: "text-[#6C47FF] bg-[#6C47FF]/10"
                },
                {
                  title: "Price Recommendation",
                  desc: "Sell online and set the ANGA9 recommended competitive price to increase your sales and visibility by getting an edge over sellers across online platforms.",
                  icon: TrendingUp,
                  color: "text-[#22C55E] bg-[#22C55E]/10"
                },
                {
                  title: "Quality Dashboard",
                  desc: "You can reduce returns with Quality Dashboard. It provides detailed insights into why customers are returning your products.",
                  icon: LayoutDashboard,
                  color: "text-[#1A6FD4] bg-[#1A6FD4]/10"
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-[#E8EEF4] shadow-sm hover:border-[#6C47FF]/30 transition-all">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-6`}>
                    <item.icon size={24} />
                  </div>
                  <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-3">{item.title}</h4>
                  <p className="text-[14px] text-[#4B5563] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="relative bg-[#6C47FF] rounded-[32px] overflow-hidden p-10 lg:p-20 text-center text-white">
            <div className="absolute inset-0 opacity-10">
              <Image src="/seller-cta-pattern.png" fill className="object-cover" alt="pattern" />
            </div>
            <h2 className="relative z-10 text-[32px] lg:text-[48px] font-bold mb-8">Ready to grow your business?</h2>
            <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/seller/register" className="h-[60px] px-12 bg-white text-[#6C47FF] font-bold rounded-2xl flex items-center justify-center text-lg hover:bg-[#F3F4F6] transition-all hover:scale-105">
                Start Selling
              </Link>
              <Link href="/seller/login" className="h-[60px] px-12 border-2 border-white text-white font-bold rounded-2xl flex items-center justify-center text-lg hover:bg-white/10 transition-all hover:scale-105">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#F8FBFF] pt-20 pb-10 border-t border-[#E8EEF4]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Logo & Intro */}
            <div className="lg:col-span-5 flex flex-col items-start">
              <Link href="/" className="mb-6 block">
                <Image
                  src="/anga9-logo.png"
                  alt="ANGA9 Logo"
                  width={130}
                  height={42}
                  unoptimized
                  style={{ objectFit: "contain" }}
                />
              </Link>
              <p className="mb-8 max-w-sm text-[17px] leading-relaxed text-[#4B5563]">
                Sell your products to crores of customers on ANGA9 at 0%
                commission
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="lg:col-span-3">
              <h4 className="mb-6 text-[18px] font-bold text-[#1A1A2E]">
                Sell on ANGA9
              </h4>
              <ul className="space-y-4">
                {[
                  "Sell Online",
                  "Pricing & Commission",
                  "How it works",
                  "Shipping & Returns",
                  "Grow Your Business",
                  "Learning Hub",
                  "ANGA9 Ads",
                  "Shop Online on ANGA9",
                ].map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-[15px] text-[#4B5563] transition-colors hover:text-[#1A6FD4]"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="lg:col-span-4">
              <h4 className="mb-6 text-[18px] font-bold text-[#1A1A2E]">
                Contact Us
              </h4>
              <Link
                href="mailto:sell@anga9.com"
                className="mb-6 block text-[16px] font-medium text-[#4B5563] hover:text-[#1A6FD4]"
              >
                sell@anga9.com
              </Link>
              <div className="flex items-center gap-4">
                {[
                  { icon: "Ig", color: "bg-[#E1306C]" },
                  { icon: "Fb", color: "bg-[#1877F2]" },
                  { icon: "Yt", color: "bg-[#FF0000]" },
                ].map((social) => (
                  <div
                    key={social.icon}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${social.color}/10 text-[14px] font-bold text-[#1A1A2E] cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    {social.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20 border-t border-[#E8EEF4] pt-10 text-center">
            <p className="text-[14px] text-[#6B7280]">
              &copy; 2024-25 ANGA9 Inc. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
