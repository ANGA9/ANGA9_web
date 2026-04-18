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
  Menu,
  X,
  ShoppingBag,
  Layers,
  Globe,
  Star,
  Boxes,
  Handshake,
  BadgeCheck,
  LayoutDashboard,
} from "lucide-react";

export default function GrowBusinessPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Become a Seller", href: "/seller/sell-online" },
    { name: "How It Works", href: "/seller/how-it-works" },
    { name: "Shipping & Delivery", href: "/seller/shipping" },
    { name: "Grow Your Business", href: "/seller/grow-business" },
  ];

  const growthTools = [
    {
      icon: Megaphone,
      title: "ANGA9 Promotions",
      desc: "Boost your product visibility with targeted promotions. Feature your products in search results, category pages, and the homepage to reach more buyers.",
      color: "text-[#EF4444] bg-[#EF4444]/10",
      stats: "3x more visibility",
    },
    {
      icon: BarChart3,
      title: "Sales Analytics",
      desc: "Get detailed insights into your sales performance, customer behaviour, and product trends. Use data to make smarter inventory and pricing decisions.",
      color: "text-[#1A6FD4] bg-[#1A6FD4]/10",
      stats: "Real-time dashboards",
    },
    {
      icon: Target,
      title: "Smart Pricing Engine",
      desc: "Our AI-powered pricing tool recommends competitive prices based on market trends, competitor analysis, and demand patterns to maximize your sales volume.",
      color: "text-[#22C55E] bg-[#22C55E]/10",
      stats: "Up to 40% more orders",
    },
    {
      icon: Zap,
      title: "Product Recommendations",
      desc: "Discover what products are trending in your category. Our demand intelligence tool suggests high-potential products based on buyer search data across India.",
      color: "text-[#1A6FD4] bg-[#1A6FD4]/10",
      stats: "Data-driven insights",
    },
    {
      icon: LayoutDashboard,
      title: "Quality Dashboard",
      desc: "Monitor product quality metrics, track return rates, and get actionable feedback on how to improve customer satisfaction and reduce returns.",
      color: "text-[#F59E0B] bg-[#F59E0B]/10",
      stats: "Reduce returns by 30%",
    },
    {
      icon: BadgeCheck,
      title: "Seller Badges & Trust",
      desc: "Earn trust badges based on your performance metrics. Trusted sellers get priority placement in search results and higher buyer confidence.",
      color: "text-[#0EA5E9] bg-[#0EA5E9]/10",
      stats: "Priority in search",
    },
  ];

  const b2bFeatures = [
    {
      icon: Boxes,
      title: "Bulk Order Management",
      desc: "Handle large wholesale orders with ease. Set bulk pricing tiers, minimum order quantities, and manage inventory for high-volume B2B transactions.",
    },
    {
      icon: Handshake,
      title: "Retailer Network",
      desc: "Connect directly with verified retailers and resellers across India. Build long-term business relationships with recurring bulk buyers.",
    },
    {
      icon: Layers,
      title: "Catalog Syndication",
      desc: "Your products are automatically showcased to relevant B2B buyers. Our matching algorithm connects your catalog with the right retailers in your category.",
    },
    {
      icon: Globe,
      title: "Pan-India Reach",
      desc: "Expand your wholesale distribution beyond your local market. Reach retailers in tier-2 and tier-3 cities who are actively sourcing products online.",
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
                  item.name === "Grow Your Business" ? "text-[#1A6FD4] border-[#1A6FD4]" : "text-[#4B5563] border-transparent"
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
          <div className="fixed inset-0 z-40 bg-white lg:hidden pt-[60px] sm:pt-[72px]">
            <div className="flex flex-col p-6 space-y-6">
              {navLinks.map((item) => (
                <Link key={item.name} href={item.href} className="text-lg font-semibold text-[#1A1A2E] border-b border-[#F3F4F6] pb-4" onClick={() => setIsMenuOpen(false)}>
                  {item.name}
                </Link>
              ))}
              <Link href="/seller/register" className="inline-flex h-14 items-center justify-center rounded-xl bg-[#6C47FF] text-lg font-bold text-white shadow-lg" onClick={() => setIsMenuOpen(false)}>
                Start Selling
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#F8FBFF] py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <span className="text-[12px] sm:text-[14px] font-bold text-[#1A6FD4] uppercase tracking-wider mb-3 block">
                Scale Your Wholesale Business
              </span>
              <h1 className="mb-4 sm:mb-6 text-[28px] sm:text-[36px] md:text-5xl lg:text-[56px] font-bold leading-[1.15] text-[#1A1A2E]">
                Powerful Tools to{" "}
                <span className="text-[#1A6FD4]">Grow Your B2B Business</span>
              </h1>
              <p className="text-[15px] sm:text-[17px] text-[#4B5563] leading-relaxed mb-6 sm:mb-8 max-w-lg">
                From smart pricing to advanced analytics, ANGA9 gives you everything you need to scale your wholesale business, reach more retailers, and increase your revenue.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {successMetrics.map((stat) => (
                  <div key={stat.label} className="bg-white p-3 sm:p-4 rounded-xl border border-[#E8EEF4] text-center">
                    <div className="text-[20px] sm:text-[24px] font-bold text-[#1A6FD4]">{stat.value}</div>
                    <div className="text-[11px] sm:text-[12px] text-[#4B5563] font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[250px] sm:h-[350px] lg:h-[450px] w-full">
              <Image src="/seller-why-sell.png" fill className="object-contain" alt="Grow business" priority />
            </div>
          </div>
        </div>
      </section>

      {/* GROWTH TOOLS */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Tools to Accelerate Your Growth
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-4 rounded-full" />
          <p className="text-center text-[15px] sm:text-[17px] text-[#4B5563] mb-10 sm:mb-16 max-w-2xl mx-auto">
            Leverage data-driven tools built to help suppliers sell more and sell smarter
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {growthTools.map((item, idx) => (
              <div key={idx} className="p-5 sm:p-8 rounded-2xl border border-[#E8EEF4] hover:shadow-xl hover:border-[#1A6FD4]/20 transition-all group">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <span className="text-[11px] sm:text-[12px] font-bold text-[#1A6FD4] bg-[#1A6FD4]/10 px-2.5 py-1 rounded-full">{item.stats}</span>
                </div>
                <h3 className="text-[17px] sm:text-[20px] font-bold text-[#1A1A2E] mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-[13px] sm:text-[15px] text-[#4B5563] leading-relaxed">{item.desc}</p>
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
              <span className="text-[12px] sm:text-[14px] font-bold text-[#1A6FD4] uppercase tracking-wider mb-3 block">
                B2B Marketplace
              </span>
              <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
                Built for Wholesale & Bulk Commerce
              </h2>
              <div className="h-1 w-16 bg-[#1A6FD4] mb-4 sm:mb-6 rounded-full" />
              <p className="text-[15px] sm:text-[17px] text-[#4B5563] leading-relaxed mb-6 sm:mb-8">
                ANGA9 is designed from the ground up for B2B transactions. Whether you&apos;re a manufacturer, distributor, or wholesaler, our platform gives you the tools to connect with retailers and grow your wholesale business.
              </p>

              <div className="space-y-4 sm:space-y-6">
                {b2bFeatures.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1A6FD4]/10 text-[#1A6FD4] flex items-center justify-center shrink-0">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-[15px] sm:text-[17px] font-bold text-[#1A1A2E] mb-1">{item.title}</h4>
                      <p className="text-[13px] sm:text-[14px] text-[#4B5563] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[280px] sm:h-[400px] lg:h-[520px] w-full">
              <Image src="/seller-why-sell.png" fill className="object-contain" alt="B2B Features" />
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES / GROWTH TIPS */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Tips from Top Sellers
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-4 rounded-full" />
          <p className="text-center text-[15px] sm:text-[17px] text-[#4B5563] mb-10 sm:mb-16 max-w-2xl mx-auto">
            Proven strategies from sellers who scaled their business on ANGA9
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              {
                title: "Optimize Your Catalog",
                desc: "Use high-quality images, detailed descriptions, and relevant keywords. Sellers with complete catalogs see 60% more views than those with incomplete listings.",
                tip: "Add at least 4 images per product",
              },
              {
                title: "Competitive Pricing",
                desc: "Use the Smart Pricing Engine to set prices that attract buyers while maintaining healthy margins. Monitor competitor pricing and adjust seasonally.",
                tip: "Update prices weekly for best results",
              },
              {
                title: "Fast Order Fulfillment",
                desc: "Ship orders within 24 hours of receiving them. Fast dispatch improves your seller rating and leads to more visibility in search results.",
                tip: "Same-day dispatch = higher rankings",
              },
              {
                title: "Leverage Promotions",
                desc: "Run targeted promotions during peak buying seasons. Sellers using ANGA9 Promotions see an average of 3x increase in product views.",
                tip: "Plan campaigns around festivals",
              },
              {
                title: "Monitor Quality Metrics",
                desc: "Keep your return rate below 5% by maintaining product quality and accurate descriptions. High quality scores unlock premium seller badges.",
                tip: "Check quality dashboard daily",
              },
              {
                title: "Expand Your Range",
                desc: "Use Product Recommendations to identify high-demand items in your category. Sellers who expand their catalog see consistent month-over-month growth.",
                tip: "Add 10+ new products monthly",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-5 sm:p-8 rounded-2xl border border-[#E8EEF4] hover:shadow-xl transition-all">
                <h3 className="text-[17px] sm:text-[20px] font-bold text-[#1A1A2E] mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-[13px] sm:text-[15px] text-[#4B5563] leading-relaxed mb-4">{item.desc}</p>
                <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1.5 rounded-lg w-fit">
                  <CheckCircle2 size={14} />
                  {item.tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <div className="relative bg-[#1A6FD4] rounded-2xl sm:rounded-[32px] overflow-hidden p-6 sm:p-10 lg:p-20 text-center text-white">
            <h2 className="relative z-10 text-[22px] sm:text-[32px] lg:text-[48px] font-bold mb-3 sm:mb-4">Start growing your business today</h2>
            <p className="relative z-10 text-[14px] sm:text-[17px] text-white/80 mb-5 sm:mb-8 max-w-lg mx-auto">
              Join thousands of suppliers scaling their wholesale business on ANGA9
            </p>
            <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">
              <Link href="/seller/register" className="h-[48px] sm:h-[60px] px-8 sm:px-12 bg-white text-[#1A6FD4] font-bold rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-lg hover:bg-[#F3F4F6] transition-all hover:scale-105">
                Start Selling
              </Link>
              <Link href="/seller/sell-online" className="h-[48px] sm:h-[60px] px-8 sm:px-12 border-2 border-white text-white font-bold rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-lg hover:bg-white/10 transition-all hover:scale-105">
                Become a Seller
              </Link>
            </div>
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
                  { label: "Become a Seller", href: "/seller/sell-online" },
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
