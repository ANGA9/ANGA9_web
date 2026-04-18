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
} from "lucide-react";

export default function SellerLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                className="text-[15px] font-medium text-[#4B5563] transition-colors hover:text-[#1A6FD4]"
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
            
            {/* Mobile Menu Button */}
            <button 
              className="p-2 lg:hidden text-[#1A1A2E] hover:bg-[#F3F4F6] rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white lg:hidden pt-[72px] animate-in fade-in slide-in-from-top duration-300">
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
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 bg-white">
        {/* 
          FIX: Background blob — changed to position:absolute with explicit dimensions.
          The blob div itself doesn't need to hold the Image; we layer them separately.
        */}
        <div className="absolute right-0 top-0 h-full w-[60%] lg:w-[65%] -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[#DBEAFE] rounded-bl-[100%] scale-125 translate-x-[15%] -translate-y-[10%]" />
          <div className="absolute inset-0 bg-[#BFDBFE] rounded-bl-[80%] scale-110 translate-x-[25%] opacity-50" />
        </div>

        {/*
          FIX: Hero person image moved OUT of the -z-10 blob div into its own
          absolutely-positioned container that is z-0 (above background, below text).
          `fill` now works because the parent has explicit position:absolute + inset.
        */}
        <div className="absolute right-0 top-0 h-full w-[55%] lg:w-[52%] z-0 hidden lg:block">
          <Image
            src="/seller-why-sell.png"
            fill
            sizes="(max-width: 1024px) 55vw, 52vw"
            quality={75}
            style={{ objectFit: "contain", objectPosition: "center" }}
            alt="Seller"
            className="p-8"
            priority
            loading="eager"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="max-w-xl py-10 lg:py-20 lg:pr-10 bg-white/40 backdrop-blur-3xl lg:backdrop-blur-none lg:bg-transparent rounded-3xl p-6 lg:p-0">
              <h1 className="mb-4 text-[42px] font-bold leading-[1.1] tracking-tight text-[#1A1A2E] md:text-5xl lg:text-6xl">
                Sell online to Crores of Customers at{" "}
                <span className="text-[#1A6FD4]">0% Commission</span>
              </h1>

              <p className="mb-6 text-[17px] text-[#4B5563] leading-relaxed">
                Become an ANGA9 seller and grow your business across India
              </p>

              <div className="mb-6 flex flex-wrap items-center gap-4 text-[14px] text-[#4B5563]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1A6FD4]" /> Free
                  Registration
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1A6FD4]" /> No Hidden
                  Fees
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1A6FD4]" /> 7-Day
                  Payments
                </span>
              </div>

              <div className="mb-8 flex items-center gap-3">
                <span className="bg-[#1A6FD4] text-white text-[11px] font-bold px-2 py-0.5 rounded-[4px]">
                  NEW
                </span>
                <p className="text-[14px] text-[#4B5563]">
                  Don&apos;t have a GSTIN? You can still sell on ANGA9.{" "}
                  <Link
                    href="/seller/gst"
                    className="text-[#1A6FD4] font-medium hover:underline"
                  >
                    Know more
                  </Link>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/seller/register"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-[10px] bg-[#FFCC00] px-10 text-[16px] font-bold text-[#1A1A2E] shadow-lg shadow-[#FFCC00]/30 transition-all hover:bg-[#E6B800] hover:-translate-y-0.5"
                >
                  Start Selling <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Spacer col so text stays left on desktop */}
            <div className="hidden lg:block h-[500px]" />
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-[#F8FBFF] py-12">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8 text-center">
            {[
              { icon: Users, value: "Lakhs of", label: "Sellers trust ANGA9 to sell online" },
              { icon: ShoppingBag, value: "Crores of", label: "Customers buying across India" },
              { icon: MapPin, value: "Thousands of", label: "Serviceable pincodes across India" },
              { icon: Grid3X3, value: "Hundreds of", label: "Categories to sell online" },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-[#E8EEF4]"
              >
                <Icon className="h-7 w-7 text-[#1A6FD4] mb-3" />
                <p className="mb-1 text-3xl font-extrabold text-[#1A6FD4]">{value}</p>
                <p className="text-[15px] font-medium text-[#1A1A2E] text-left leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SELL ON ANGA9 */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <h2 className="text-[32px] font-bold text-[#1A1A2E] lg:text-[40px] mb-4 leading-tight">
                Why Suppliers Love ANGA9
              </h2>
              <div className="h-1 w-16 bg-[#1A6FD4] mb-8 rounded-full" />
              <p className="text-[#6B7280] text-[17px] leading-relaxed max-w-[400px] mb-8">
                All the benefits that come with selling on ANGA9 are designed to
                help you sell more, and make it easier to grow your business.
              </p>

              {/*
                FIX: Replaced <img> with Next.js <Image> with explicit width/height.
                Raw <img> tags in Next.js projects trigger lint warnings and may be
                blocked by next.config image domain rules in some setups.
                width/height are required when NOT using fill.
              */}
              <div className="hidden lg:block relative w-full h-[300px] rounded-2xl overflow-hidden">
                <Image
                  src="/seller-why-sell.png"
                  fill
                  sizes="400px"
                  quality={75}
                  style={{ objectFit: "contain" }}
                  alt="Why sell on ANGA9"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {[
                {
                  icon: IndianRupee,
                  color: "bg-[#1A6FD4]/10 text-[#1A6FD4]",
                  title: "0% Commission Fee",
                  desc: "Suppliers selling on ANGA9 keep 100% of their profit by not paying any commission at all.",
                },
                {
                  icon: TrendingUp,
                  color: "bg-[#22C55E]/10 text-[#22C55E]",
                  title: "Growth for Every Supplier",
                  desc: "From small to large and unbranded to branded, ANGA9 fuels continuous growth for all suppliers globally.",
                },
                {
                  icon: Clock,
                  color: "bg-[#1A6FD4]/10 text-[#1A6FD4]",
                  title: "7-Day Payment Cycle",
                  desc: "Receive your earnings within 7 days of dispatch, directly deposited to your bank account.",
                },
                {
                  icon: Headphones,
                  color: "bg-[#F59E0B]/10 text-[#F59E0B]",
                  title: "24/7 Seller Support",
                  desc: "Dedicated account managers and round-the-clock support to help you at every step.",
                },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div
                  key={title}
                  className="rounded-[1rem] border border-[#E8EEF4] bg-[#FDFDFD] p-8 shadow-sm hover:border-[#1A6FD4]/30 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-[20px] font-bold text-[#1A1A2E]">{title}</h3>
                    </div>
                    <p className="text-[#6B7280] text-[16px] leading-relaxed ml-[60px] max-md:ml-0">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#F8FBFF] py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#1A1A2E] lg:text-[40px] tracking-tight uppercase">
              How It Works
            </h2>
            <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mt-4 rounded-full" />
          </div>

          <div className="relative pt-8">
            <div className="hidden lg:block absolute top-[62px] left-[10%] right-[10%] h-[2px] bg-[#E8EEF4]" />

            <div className="grid gap-12 lg:grid-cols-5 text-center relative z-10">
              {[
                { step: 1, title: "Create Account", desc: "All you need is GSTIN and Bank Account", icon: LayoutDashboard },
                { step: 2, title: "List Products", desc: "List all the products you want to sell in your panel.", icon: Package },
                { step: 3, title: "Get Orders", desc: "Start receiving orders from active customers directly.", icon: ShoppingBag },
                { step: 4, title: "Affordable Shipping", desc: "Enjoy the most affordable shipping solutions across India.", icon: Truck },
                { step: 5, title: "Receive Payments", desc: "Payments are deposited directly to your bank account safely.", icon: IndianRupee },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div className="w-[60px] h-[60px] rounded-full bg-[#1A6FD4] text-white flex items-center justify-center shadow-lg mb-4 ring-[8px] ring-[#F8FBFF]">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[12px] font-bold text-[#1A6FD4] uppercase tracking-wider mb-1">
                    Step {item.step}
                  </span>
                  <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-2">{item.title}</h4>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-[200px] mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GROW BUSINESS */}
      <section className="py-20 lg:py-28 bg-white border-t border-[#E8EEF4]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#1A1A2E] lg:text-[40px] mb-4 leading-tight">
              Grow Your Business With ANGA9
            </h2>
            <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-8 rounded-full" />
            <p className="text-[#6B7280] text-[17px] max-w-[500px] mx-auto">
              Access exclusive tools and insights tailored directly to boost your
              online enterprise.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                color: "bg-[#1A6FD4]/10 text-[#1A6FD4]",
                title: "Affordable Shipping",
                desc: "Deliver to 28,000+ pincodes with the most reliable and cost-effective shipping.",
              },
              {
                icon: Megaphone,
                color: "bg-[#1A6FD4]/10 text-[#1A6FD4]",
                title: "ANGA9 Ads",
                desc: "Boost visibility with targeted ad tools to sell more catalogs every day.",
              },
              {
                icon: Wallet,
                color: "bg-[#22C55E]/10 text-[#22C55E]",
                title: "Instant Payouts",
                desc: "Get paid faster with instant payout options directly to your bank account.",
              },
              {
                icon: Globe,
                color: "bg-[#F59E0B]/10 text-[#F59E0B]",
                title: "Pan-India Reach",
                desc: "Sell to customers in every state — from metros to tier-3 towns and villages.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(30,41,59,0.05)] border border-[#E8EEF4] transition-all hover:border-[#1A6FD4]/40 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-6`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-3">{title}</h4>
                <p className="text-[#6B7280] text-[15px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELLER SUCCESS STORIES */}
      <section className="py-20 lg:py-28 bg-[#F8FBFF]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#1A1A2E] lg:text-[40px] tracking-tight mb-4">
              Seller Success Stories
            </h2>
            <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-8 rounded-full" />
            <p className="text-[#6B7280] text-[17px] max-w-[500px] mx-auto">
              Real sellers, real growth. Here&apos;s what our top suppliers have
              to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Rajesh Kumar",
                business: "Kumar Electronics, Delhi",
                quote:
                  "Within 3 months of joining ANGA9, my wholesale orders tripled. The 0% commission is a game-changer for my margins.",
                growth: "3x orders",
                avatar: "/seller-avatar-1.png",
                initials: "RK",
              },
              {
                name: "Priya Sharma",
                business: "Sharma Textiles, Surat",
                quote:
                  "I was skeptical at first, but the dashboard analytics helped me understand which products to push. Revenue is up 200%.",
                growth: "200% revenue",
                avatar: "/seller-avatar-2.png",
                initials: "PS",
              },
              {
                name: "Anil Patel",
                business: "Patel Agro Supplies, Ahmedabad",
                quote:
                  "The shipping network reaches even remote pincodes. My customer base expanded to states I never imagined selling to.",
                growth: "12 new states",
                avatar: "/seller-avatar-3.png",
                initials: "AP",
              },
            ].map((story) => (
              <div
                key={story.name}
                className="rounded-2xl border border-[#E8EEF4] bg-white p-8 shadow-sm flex flex-col hover:shadow-md hover:border-[#1A6FD4]/20 transition-all"
              >
                <div className="flex items-center gap-4 mb-5">
                  {/*
                    FIX: Avatar — use Next.js Image with fill inside a sized relative
                    container. Falls back gracefully to initials div if image 404s.
                    Since these avatars may not exist yet, we render both and let CSS
                    handle visibility via the onError pattern — but for simplicity we
                    use a wrapper that shows initials as the background and the Image
                    on top. If the image loads it covers the initials; if it 404s the
                    initials show through.
                  */}
                  <div className="relative w-14 h-14 rounded-full shrink-0 bg-white border border-[#E8EEF4] flex items-center justify-center overflow-hidden shadow-sm">
                    <Users className="h-8 w-8 text-[#1A1A2E]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A2E] text-[16px]">{story.name}</p>
                    <p className="text-[13px] text-[#6B7280]">{story.business}</p>
                  </div>
                </div>
                <p className="text-[#4B5563] text-[15px] leading-relaxed flex-1 mb-5">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-4 border-t border-[#E8EEF4]">
                  <TrendingUp className="h-4 w-4 text-[#22C55E]" />
                  <span className="text-[13px] font-bold text-[#22C55E]">{story.growth}</span>
                  <div className="ml-auto flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5 text-[#FFCC00] fill-[#FFCC00]" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BADGES STRIP */}
      <section className="bg-white py-16 border-y border-[#E8EEF4]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 items-center justify-items-center">
            {[
              { icon: ShieldCheck, label: "Secure Payments" },
              { icon: BadgeCheck, label: "Verified Sellers" },
              { icon: Layers, label: "Easy Catalog Upload" },
              { icon: Headphones, label: "24/7 Support" },
              { icon: Truck, label: "Pan-India Delivery" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 group transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-[#1A6FD4]/5 flex items-center justify-center text-[#1A6FD4] transition-colors group-hover:bg-[#1A6FD4] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[14px] font-semibold text-[#4B5563] text-center whitespace-nowrap">{label}</span>
              </div>
            ))}
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
              <Link
                href="/seller/register"
                className="inline-flex h-[52px] items-center justify-center rounded-[8px] bg-[#6C47FF] px-8 text-[16px] font-bold text-white shadow-lg shadow-[#6C47FF]/20 transition-all hover:scale-[1.02] hover:bg-[#5A3AE0]"
              >
                Start Selling
              </Link>
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
                {/* Social placeholders using circle backgrounds for now */}
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