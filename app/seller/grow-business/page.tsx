"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Megaphone,
  Target,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Layers,
  Globe,
  Star,
  Boxes,
  Handshake,
  BadgeCheck,
  LayoutDashboard,
} from "lucide-react";
import SellerLandingHeader from "@/components/seller/SellerLandingHeader";

export default function GrowBusinessPage() {

  const navLinks = [
    { name: "Sell on ANGA9", href: "/seller/sell-on-anga9" },
    { name: "How to Sell", href: "/seller/how-to-sell" },
    { name: "Shipping & Delivery", href: "/seller/shipping" },
    { name: "Grow Your Business", href: "/seller/grow-business" },
  ];

  const growthTools = [
    {
      icon: Megaphone,
      title: "ANGA9 Promotions",
      desc: "Boost visibility and reach more buyers with targeted homepage and search ads.",
      color: "text-[#EF4444] bg-[#EF4444]/10",
      stats: "3x more visibility",
    },
    {
      icon: BarChart3,
      title: "Sales Analytics",
      desc: "Gain real-time insights into performance, trends, and customer behavior to make smarter decisions.",
      color: "text-[#1A6FD4] bg-[#1A6FD4]/10",
      stats: "Real-time dashboards",
    },
    {
      icon: Target,
      title: "Smart Pricing",
      desc: "Our AI engine recommends competitive pricing based on live market trends to maximize volume.",
      color: "text-[#22C55E] bg-[#22C55E]/10",
      stats: "Up to 40% more orders",
    },
    {
      icon: Zap,
      title: "Recommendations",
      desc: "Discover trending products and high-potential categories based on nationwide buyer search data.",
      color: "text-[#1A6FD4] bg-[#1A6FD4]/10",
      stats: "Data-driven insights",
    },
    {
      icon: LayoutDashboard,
      title: "Quality Dashboard",
      desc: "Track quality metrics and return rates. Get actionable feedback to improve customer satisfaction.",
      color: "text-[#F59E0B] bg-[#F59E0B]/10",
      stats: "Reduce returns by 30%",
    },
    {
      icon: BadgeCheck,
      title: "Seller Badges",
      desc: "Earn trust badges for high performance to unlock priority search placement and buyer confidence.",
      color: "text-[#0EA5E9] bg-[#0EA5E9]/10",
      stats: "Priority in search",
    },
  ];

  const b2bFeatures = [
    {
      icon: Boxes,
      title: "Bulk Order Management",
      desc: "Easily set bulk pricing tiers and manage high-volume B2B inventory.",
    },
    {
      icon: Handshake,
      title: "Retailer Network",
      desc: "Connect directly with verified retailers and build recurring wholesale relationships.",
    },
    {
      icon: Layers,
      title: "Catalog Syndication",
      desc: "Our algorithm automatically matches your catalog with relevant active retailers.",
    },
    {
      icon: Globe,
      title: "Pan-India Reach",
      desc: "Expand distribution to buyers in tier-2 and tier-3 cities actively sourcing online.",
    },
  ];

  const successMetrics = [
    { value: "10,000+", label: "Active Sellers" },
    { value: "50 Lakh+", label: "Products Listed" },
    { value: "500+", label: "Categories" },
    { value: "19,000+", label: "Pin Codes Served" },
  ];

  return (
    <div
      className="min-h-screen bg-white selection:bg-[#1A6FD4]/20 selection:text-[#1A1A2E]"
      style={{ fontFamily: "var(--font-gilroy)" }}
    >
      {/* HEADER */}
      <SellerLandingHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#F8FBFF] py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <span className="text-xs md:text-sm sm:text-sm md:text-base font-bold text-[#1A6FD4] uppercase tracking-wider mb-3 block">
                Scale Your Wholesale Business
              </span>
              <h1 className="mb-4 sm:mb-6 text-3xl md:text-4xl sm:text-[36px] md:text-5xl lg:text-[56px] font-bold leading-[1.15] text-[#1A1A2E]">
                Powerful Tools to{" "}
                <span className="text-[#1A6FD4]">Grow Your B2B Business</span>
              </h1>
              <p className="text-base sm:text-base md:text-lg text-[#4B5563] leading-relaxed mb-6 sm:mb-8 max-w-lg">
                Scale your wholesale business effortlessly. From smart pricing to advanced analytics, access everything you need to increase your revenue.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {successMetrics.map((stat) => (
                  <div key={stat.label} className="bg-white p-3 sm:p-4 rounded-xl border border-[#E8EEF4] text-center">
                    <div className="text-xl md:text-2xl sm:text-2xl md:text-3xl font-bold text-[#1A6FD4]">{stat.value}</div>
                    <div className="text-xs md:text-sm sm:text-xs md:text-sm text-[#4B5563] font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[250px] sm:h-[350px] lg:h-[450px] w-full">
              <Image src="/seller-grow-hero.png" fill className="object-contain" alt="Grow business" priority />
            </div>
          </div>
        </div>
      </section>

      {/* GROWTH TOOLS */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-2xl md:text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Tools to Accelerate Your Growth
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-4 rounded-full" />
          <p className="text-center text-base sm:text-base md:text-lg text-[#4B5563] mb-10 sm:mb-16 max-w-2xl mx-auto">
            Leverage data-driven tools built to help suppliers sell more and sell smarter
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {growthTools.map((item, idx) => (
              <div key={idx} className="p-5 sm:p-8 rounded-2xl border border-[#E8EEF4] hover:shadow-xl hover:border-[#1A6FD4]/20 transition-all group">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <span className="text-xs md:text-sm sm:text-xs md:text-sm font-bold text-[#1A6FD4] bg-[#1A6FD4]/10 px-2.5 py-1 rounded-full">{item.stats}</span>
                </div>
                <h3 className="text-base md:text-lg sm:text-xl md:text-2xl font-bold text-[#1A1A2E] mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-sm md:text-base sm:text-base text-[#4B5563] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B FEATURES */}
      <section className="py-12 sm:py-16 lg:py-24 bg-[#F8FBFF]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <span className="text-xs md:text-sm sm:text-sm md:text-base font-bold text-[#1A6FD4] uppercase tracking-wider mb-3 block">
                B2B Marketplace
              </span>
              <h2 className="text-2xl md:text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
                Built for Wholesale & Bulk Commerce
              </h2>
              <div className="h-1 w-16 bg-[#1A6FD4] mb-4 sm:mb-6 rounded-full" />
              <p className="text-base sm:text-base md:text-lg text-[#4B5563] leading-relaxed mb-6 sm:mb-8">
                ANGA9 is designed from the ground up for B2B transactions. Whether you&apos;re a manufacturer, distributor, or wholesaler, our platform gives you the tools to connect with retailers and grow your wholesale business.
              </p>

              <div className="space-y-4 sm:space-y-6">
                {b2bFeatures.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1A6FD4]/10 text-[#1A6FD4] flex items-center justify-center shrink-0">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-base md:text-lg font-bold text-[#1A1A2E] mb-1">{item.title}</h4>
                      <p className="text-sm md:text-base sm:text-sm md:text-base text-[#4B5563] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[280px] sm:h-[400px] lg:h-[520px] w-full">
              <Image src="/seller-grow-b2b.png" fill className="object-contain" alt="B2B Features" />
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES / GROWTH TIPS */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-2xl md:text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Tips from Top Sellers
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-4 rounded-full" />
          <p className="text-center text-base sm:text-base md:text-lg text-[#4B5563] mb-10 sm:mb-16 max-w-2xl mx-auto">
            Proven strategies from sellers who scaled their business on ANGA9
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              {
                title: "Optimize Your Catalog",
                desc: "High-quality images and clear descriptions get 60% more views than incomplete listings.",
                tip: "Add at least 4 images per product",
              },
              {
                title: "Competitive Pricing",
                desc: "Use the Smart Pricing Engine to attract buyers while maintaining healthy profit margins.",
                tip: "Update prices weekly",
              },
              {
                title: "Fast Order Fulfillment",
                desc: "Dispatch within 24 hours. Fast shipping improves ratings and boosts search visibility.",
                tip: "Same-day dispatch = higher rankings",
              },
              {
                title: "Leverage Promotions",
                desc: "Run targeted ads during peak seasons. Promoted items see a 3x increase in views.",
                tip: "Plan campaigns around festivals",
              },
              {
                title: "Monitor Quality",
                desc: "Keep return rates below 5% by ensuring quality. High scores unlock premium seller badges.",
                tip: "Check quality dashboard daily",
              },
              {
                title: "Expand Your Range",
                desc: "Use Product Recommendations to add high-demand items and achieve steady monthly growth.",
                tip: "Add 10+ new products monthly",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-5 sm:p-8 rounded-2xl border border-[#E8EEF4] hover:shadow-xl transition-all">
                <h3 className="text-base md:text-lg sm:text-xl md:text-2xl font-bold text-[#1A1A2E] mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-sm md:text-base sm:text-base text-[#4B5563] leading-relaxed mb-4">{item.desc}</p>
                <div className="flex items-center gap-2 text-xs md:text-sm sm:text-sm md:text-base font-bold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1.5 rounded-lg w-fit">
                  <CheckCircle2 size={14} />
                  {item.tip}
                </div>
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
              <p className="mb-8 max-w-sm text-base sm:text-base md:text-lg leading-relaxed text-[#4B5563]">
                India&apos;s leading B2B marketplace connecting suppliers with buyers across the country at 0% commission.
              </p>
            </div>

            <div className="lg:col-span-3">
              <h4 className="mb-6 text-lg md:text-xl font-bold text-[#1A1A2E]">Sell on ANGA9</h4>
              <ul className="space-y-4">
                {[
                  { label: "Sell on ANGA9", href: "/seller/sell-on-anga9" },
                  { label: "How to Sell", href: "/seller/how-to-sell" },
                  { label: "Shipping & Delivery", href: "/seller/shipping" },
                  { label: "Grow Your Business", href: "/seller/grow-business" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-base text-[#4B5563] transition-colors hover:text-[#1A6FD4]">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h4 className="mb-6 text-lg md:text-xl font-bold text-[#1A1A2E]">Contact Us</h4>
              <Link href="mailto:sell@anga9.com" className="mb-6 block text-base md:text-lg font-medium text-[#4B5563] hover:text-[#1A6FD4]">sell@anga9.com</Link>
              <div className="flex items-center gap-4">
                {[
                  { icon: "Ig", color: "bg-[#E1306C]" },
                  { icon: "Fb", color: "bg-[#1877F2]" },
                  { icon: "Yt", color: "bg-[#FF0000]" },
                ].map((social) => (
                  <div key={social.icon} className={`flex h-9 w-9 items-center justify-center rounded-lg ${social.color}/10 text-sm md:text-base font-bold text-[#1A1A2E] cursor-pointer hover:opacity-80 transition-opacity`}>
                    {social.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-16 lg:mt-20 border-t border-[#E8EEF4] pt-6 sm:pt-10 text-center">
            <p className="text-sm md:text-base text-[#6B7280]">&copy; 2024-25 ANGA9 Inc. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
