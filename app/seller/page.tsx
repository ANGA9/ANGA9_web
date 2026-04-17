"use client";

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
} from "lucide-react";

export default function SellerLandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#1A6FD4]/20 selection:text-[#1A1A2E]" style={{ fontFamily: 'var(--font-gilroy)' }}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E8EEF4]">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-12">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            <Image
              src="/anga9-logo.png"
              alt="ANGA9 Logo"
              width={110}
              height={36}
              priority
              unoptimized
              style={{ objectFit: "contain" }}
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/seller/login"
              className="hidden rounded-lg px-6 py-2.5 text-sm font-semibold text-[#1A6FD4] transition-colors hover:bg-[#1A6FD4]/10 sm:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/seller/register"
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#FFCC00] px-6 text-sm font-semibold text-[#1A1A2E] shadow-[0_4px_12px_rgba(255,204,0,0.3)] transition-all hover:scale-[1.02] hover:bg-[#E6B800]"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 bg-white">
        {/* Background Graphic */}
        <div className="absolute right-0 top-0 h-full w-[60%] lg:w-[65%] origin-top-right transform overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[#DBEAFE] rounded-bl-[100%] scale-125 translate-x-[15%] -translate-y-[10%]"></div>
          <div className="absolute inset-0 bg-[#BFDBFE] rounded-bl-[80%] scale-110 translate-x-[25%] opacity-50"></div>

          {/* ============================================================
              ILLUSTRATION SLOT #1 — HERO SELLER IMAGE
              Place a transparent PNG here of a confident Indian seller/businessperson

              GEMINI PROMPT:
              "Create a full-body cutout illustration of a confident young Indian
              man in a kurta or casual business shirt, standing with arms crossed
              and smiling, with small floating icons around him — a package box,
              a rupee coin, a delivery truck, and a mobile phone showing a graph
              going up. Flat vector style, clean lines, warm friendly colors with
              blue (#1A6FD4) as accent. Transparent PNG background, 1200x1400px."

              Save as: /public/seller-hero-person.png
              Uncomment the Image below once ready:
          ============================================================ */}
          <Image src="/seller-hero-person.png" fill unoptimized style={{objectFit: 'contain', objectPosition: 'center bottom'}} alt="Seller" className="p-8" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="max-w-xl py-10 lg:py-20 lg:pr-10 bg-white/40 backdrop-blur-3xl lg:backdrop-blur-none lg:bg-transparent rounded-3xl p-6 lg:p-0">
              <h1 className="mb-4 text-[42px] font-bold leading-[1.1] tracking-tight text-[#1A1A2E] md:text-5xl lg:text-6xl">
                Sell online to Crores of Customers at{" "}
                <span className="text-[#1A6FD4]">
                  0% Commission
                </span>
              </h1>

              <p className="mb-6 text-[17px] text-[#4B5563] leading-relaxed">
                Become an ANGA9 seller and grow your business across India
              </p>

              {/* Trust indicators row */}
              <div className="mb-6 flex flex-wrap items-center gap-4 text-[14px] text-[#4B5563]">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#1A6FD4]" /> Free Registration</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#1A6FD4]" /> No Hidden Fees</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#1A6FD4]" /> 7-Day Payments</span>
              </div>

              <div className="mb-8 flex items-center gap-3">
                 <span className="bg-[#1A6FD4] text-white text-[11px] font-bold px-2 py-0.5 rounded-[4px]">NEW</span>
                 <p className="text-[14px] text-[#4B5563]">
                   Don&apos;t have a GSTIN? You can still sell on ANGA9. <Link href="/seller/gst" className="text-[#1A6FD4] font-medium hover:underline">Know more</Link>
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

            <div className="hidden lg:block h-[500px]"></div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-[#F8FBFF] py-12">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8 text-center">
            <div className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-[#E8EEF4]">
              <Users className="h-7 w-7 text-[#1A6FD4] mb-3" />
              <p className="mb-1 text-3xl font-extrabold text-[#1A6FD4]">Lakhs of</p>
              <p className="text-[15px] font-medium text-[#1A1A2E] text-left leading-snug">Sellers trust ANGA9 to sell online</p>
            </div>
            <div className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-[#E8EEF4]">
              <ShoppingBag className="h-7 w-7 text-[#1A6FD4] mb-3" />
              <p className="mb-1 text-3xl font-extrabold text-[#1A6FD4]">Crores of</p>
              <p className="text-[15px] font-medium text-[#1A1A2E] text-left leading-snug">Customers buying across India</p>
            </div>
            <div className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-[#E8EEF4]">
              <MapPin className="h-7 w-7 text-[#1A6FD4] mb-3" />
              <p className="mb-1 text-3xl font-extrabold text-[#1A6FD4]">Thousands of</p>
              <p className="text-[15px] font-medium text-[#1A1A2E] text-left leading-snug">Serviceable pincodes across India</p>
            </div>
            <div className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-[#E8EEF4]">
              <Grid3X3 className="h-7 w-7 text-[#1A6FD4] mb-3" />
              <p className="mb-1 text-3xl font-extrabold text-[#1A6FD4]">Hundreds of</p>
              <p className="text-[15px] font-medium text-[#1A1A2E] text-left leading-snug">Categories to sell online</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SELL ON ANGA9 */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-32">
               <h2 className="text-[32px] font-bold text-[#1A1A2E] lg:text-[40px] mb-6 leading-tight">
                 Why Suppliers Love ANGA9
               </h2>
               <p className="text-[#6B7280] text-[17px] leading-relaxed max-w-[400px] mb-8">
                 All the benefits that come with selling on ANGA9 are designed to help you sell more, and make it easier to grow your business.
               </p>

               {/* ============================================================
                   ILLUSTRATION SLOT #2 — WHY SELL SECTION GRAPHIC

                   GEMINI PROMPT:
                   "Create a flat vector illustration showing a small Indian shopkeeper
                   happily looking at a laptop screen displaying a sales dashboard
                   with an upward trending graph. Surround the scene with small
                   floating icons: rupee symbol, package box, 5-star rating, and
                   a shield with a checkmark. Soft blue (#1A6FD4) and white color
                   palette with light blue (#DBEAFE) background accents. Clean
                   modern style, no text. Transparent PNG, 800x600px."

                   Save as: /public/seller-why-sell.png
               ============================================================ */}
               <div className="hidden lg:block relative rounded-2xl overflow-hidden h-[300px]">
                  <Image src="/seller-why-sell.png" fill unoptimized style={{objectFit: 'contain'}} alt="Why sell on ANGA9" />
               </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {/* Card 1 */}
              <div className="rounded-[1rem] border border-[#E8EEF4] bg-[#FDFDFD] p-8 shadow-sm">
                 <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A6FD4]/10 text-[#1A6FD4]">
                       <IndianRupee className="h-6 w-6" />
                     </div>
                     <h3 className="text-[20px] font-bold text-[#1A1A2E]">0% Commission Fee</h3>
                   </div>
                   <p className="text-[#6B7280] text-[16px] leading-relaxed ml-[60px] max-md:ml-0">
                     Suppliers selling on ANGA9 keep 100% of their profit by not paying any commission at all.
                   </p>
                 </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-[1rem] border border-[#E8EEF4] bg-[#FDFDFD] p-8 shadow-sm">
                 <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A6FD4]/10 text-[#1A6FD4]">
                       <ShieldCheck className="h-6 w-6" />
                     </div>
                     <h3 className="text-[20px] font-bold text-[#1A1A2E]">0 Penalty Charges</h3>
                   </div>
                   <p className="text-[#6B7280] text-[16px] leading-relaxed ml-[60px] max-md:ml-0">
                     Sell online without the fear of order cancellation charges with 0 Penalty for late dispatch or cancellations.
                   </p>
                 </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-[1rem] border border-[#E8EEF4] bg-[#FDFDFD] p-8 shadow-sm">
                 <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/10 text-[#22C55E]">
                       <TrendingUp className="h-6 w-6" />
                     </div>
                     <h3 className="text-[20px] font-bold text-[#1A1A2E]">Growth for Every Supplier</h3>
                   </div>
                   <p className="text-[#6B7280] text-[16px] leading-relaxed ml-[60px] max-md:ml-0">
                     From small to large and unbranded to branded, ANGA9 fuels continuous growth for all suppliers globally.
                   </p>
                 </div>
              </div>

              {/* Card 4 — NEW */}
              <div className="rounded-[1rem] border border-[#E8EEF4] bg-[#FDFDFD] p-8 shadow-sm">
                 <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A6FD4]/10 text-[#1A6FD4]">
                       <Clock className="h-6 w-6" />
                     </div>
                     <h3 className="text-[20px] font-bold text-[#1A1A2E]">7-Day Payment Cycle</h3>
                   </div>
                   <p className="text-[#6B7280] text-[16px] leading-relaxed ml-[60px] max-md:ml-0">
                     Receive your earnings within 7 days of dispatch, directly deposited to your bank account.
                   </p>
                 </div>
              </div>

              {/* Card 5 — NEW */}
              <div className="rounded-[1rem] border border-[#E8EEF4] bg-[#FDFDFD] p-8 shadow-sm">
                 <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">
                       <Headphones className="h-6 w-6" />
                     </div>
                     <h3 className="text-[20px] font-bold text-[#1A1A2E]">24/7 Seller Support</h3>
                   </div>
                   <p className="text-[#6B7280] text-[16px] leading-relaxed ml-[60px] max-md:ml-0">
                     Dedicated account managers and round-the-clock support to help you at every step.
                   </p>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-[#F8FBFF] py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#1A1A2E] lg:text-[40px] tracking-tight uppercase">How It Works</h2>
            <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="relative pt-8">
             {/* Path line background */}
             <div className="hidden lg:block absolute top-[62px] left-[10%] right-[10%] h-[2px] bg-[#E8EEF4]"></div>

             <div className="grid gap-12 lg:grid-cols-5 text-center relative z-10">
               {[
                 { step: 1, title: 'Create Account', desc: 'All you need is GSTIN and Bank Account', icon: LayoutDashboard },
                 { step: 2, title: 'List Products', desc: 'List all the products you want to sell in your panel.', icon: Package },
                 { step: 3, title: 'Get Orders', desc: 'Start receiving orders from active customers directly.', icon: ShoppingBag },
                 { step: 4, title: 'Affordable Shipping', desc: 'Enjoy the most affordable shipping solutions across India.', icon: Truck },
                 { step: 5, title: 'Receive Payments', desc: 'Payments are deposited directly to your bank account safely.', icon: IndianRupee },
               ].map((item) => (
                 <div key={item.step} className="flex flex-col items-center">
                   <div className="w-[60px] h-[60px] rounded-full bg-[#1A6FD4] text-white flex items-center justify-center shadow-lg mb-4 ring-[8px] ring-[#F8FBFF]">
                      <item.icon className="h-6 w-6" />
                   </div>
                   <span className="text-[12px] font-bold text-[#1A6FD4] uppercase tracking-wider mb-1">Step {item.step}</span>
                   <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-2">{item.title}</h4>
                   <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* SELLER DASHBOARD PREVIEW — ILLUSTRATION SLOT #3 */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold text-[#1A1A2E] lg:text-[40px] tracking-tight mb-4">Powerful Seller Dashboard</h2>
            <p className="text-[#6B7280] text-[17px] max-w-[600px] mx-auto">Manage orders, track earnings, and grow your business — all from one intuitive dashboard.</p>
          </div>

          {/* ============================================================
              ILLUSTRATION SLOT #3 — DASHBOARD MOCKUP SCREENSHOT

              GEMINI PROMPT:
              "Create a clean, modern UI mockup illustration of an e-commerce seller
              dashboard displayed on a laptop screen, slightly angled in 3D perspective.
              The dashboard should show: a sidebar with nav icons, a top stats row
              with cards (Total Sales, Orders, Revenue with small graph sparklines),
              a line chart showing sales trend, and a recent orders table. Use a
              blue (#1A6FD4) and white color scheme with yellow (#FFCC00) accent
              for CTA buttons. Soft drop shadow under the laptop. Light grey
              (#F8FBFF) background. Flat clean vector style, no real text — use
              placeholder bars for text. PNG, 1400x800px."

              Save as: /public/seller-dashboard-preview.png
          ============================================================ */}
          <div className="relative max-w-4xl mx-auto h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
            <Image src="/seller-dashboard-preview.png" fill unoptimized style={{objectFit: 'contain'}} alt="ANGA9 Seller Dashboard Preview" />
          </div>
        </div>
      </section>

      {/* GROW BUSINESS WITH ANGA9 — expanded to 4 cards */}
      <section className="py-20 lg:py-28 bg-[#F8FBFF]">
         <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-[32px] font-bold text-[#1A1A2E] lg:text-[40px] mb-4 leading-tight">Grow Your Business With ANGA9</h2>
              <p className="text-[#6B7280] text-[17px] max-w-[500px] mx-auto">Access exclusive tools and insights tailored directly to boost your online enterprise.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {/* Card 1 */}
               <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(30,41,59,0.05)] border border-[#E8EEF4] transition-all hover:border-[#1A6FD4]/40 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-[#1A6FD4]/10 text-[#1A6FD4] flex items-center justify-center mb-6">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-3">Affordable Shipping</h4>
                  <p className="text-[#6B7280] text-[15px] leading-relaxed">Deliver to 28,000+ pincodes with the most reliable and cost-effective shipping.</p>
               </div>
               {/* Card 2 */}
               <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(30,41,59,0.05)] border border-[#E8EEF4] transition-all hover:border-[#1A6FD4]/40 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-[#1A6FD4]/10 text-[#1A6FD4] flex items-center justify-center mb-6">
                    <Megaphone className="h-6 w-6" />
                  </div>
                  <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-3">ANGA9 Ads</h4>
                  <p className="text-[#6B7280] text-[15px] leading-relaxed">Boost visibility with targeted ad tools to sell more catalogs every day.</p>
               </div>
               {/* Card 3 — NEW */}
               <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(30,41,59,0.05)] border border-[#E8EEF4] transition-all hover:border-[#1A6FD4]/40 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center mb-6">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-3">Instant Payouts</h4>
                  <p className="text-[#6B7280] text-[15px] leading-relaxed">Get paid faster with instant payout options directly to your bank account.</p>
               </div>
               {/* Card 4 — NEW */}
               <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(30,41,59,0.05)] border border-[#E8EEF4] transition-all hover:border-[#1A6FD4]/40 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mb-6">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-3">Pan-India Reach</h4>
                  <p className="text-[#6B7280] text-[15px] leading-relaxed">Sell to customers in every state — from metros to tier-3 towns and villages.</p>
               </div>
            </div>
         </div>
      </section>

      {/* SELLER SUCCESS STORIES — ILLUSTRATION SLOT #4 */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#1A1A2E] lg:text-[40px] tracking-tight mb-4">Seller Success Stories</h2>
            <p className="text-[#6B7280] text-[17px] max-w-[500px] mx-auto">Real sellers, real growth. Here&apos;s what our top suppliers have to say.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Rajesh Kumar",
                business: "Kumar Electronics, Delhi",
                quote: "Within 3 months of joining ANGA9, my wholesale orders tripled. The 0% commission is a game-changer for my margins.",
                growth: "3x orders",
                avatar: "/seller-avatar-1.png",
              },
              {
                name: "Priya Sharma",
                business: "Sharma Textiles, Surat",
                quote: "I was skeptical at first, but the dashboard analytics helped me understand which products to push. Revenue is up 200%.",
                growth: "200% revenue",
                avatar: "/seller-avatar-2.png",
              },
              {
                name: "Anil Patel",
                business: "Patel Agro Supplies, Ahmedabad",
                quote: "The shipping network reaches even remote pincodes. My customer base expanded to states I never imagined selling to.",
                growth: "12 new states",
                avatar: "/seller-avatar-3.png",
              },
            ].map((story) => (
              <div key={story.name} className="rounded-2xl border border-[#E8EEF4] bg-white p-8 shadow-sm flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#DBEAFE] shrink-0 relative">
                    <Image src={story.avatar} fill unoptimized style={{objectFit: 'cover'}} alt={story.name} />
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A2E] text-[16px]">{story.name}</p>
                    <p className="text-[13px] text-[#6B7280]">{story.business}</p>
                  </div>
                </div>
                <p className="text-[#4B5563] text-[15px] leading-relaxed flex-1 mb-5">&ldquo;{story.quote}&rdquo;</p>
                <div className="flex items-center gap-2 pt-4 border-t border-[#E8EEF4]">
                  <TrendingUp className="h-4 w-4 text-[#22C55E]" />
                  <span className="text-[13px] font-bold text-[#22C55E]">{story.growth}</span>
                  <div className="ml-auto flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 text-[#FFCC00] fill-[#FFCC00]" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BADGES STRIP */}
      <section className="bg-[#F8FBFF] py-12 border-y border-[#E8EEF4]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-[#4B5563]">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-[#1A6FD4]" />
              <span className="text-[15px] font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="h-6 w-6 text-[#1A6FD4]" />
              <span className="text-[15px] font-medium">Verified Sellers</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Layers className="h-6 w-6 text-[#1A6FD4]" />
              <span className="text-[15px] font-medium">Easy Catalog Upload</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Headphones className="h-6 w-6 text-[#1A6FD4]" />
              <span className="text-[15px] font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="h-6 w-6 text-[#1A6FD4]" />
              <span className="text-[15px] font-medium">Pan-India Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="bg-gradient-to-br from-[#1A1A2E] to-[#0F3460] py-20 lg:py-28 text-center text-white relative overflow-hidden" style={{backgroundImage: 'url(/seller-cta-pattern.png)', backgroundSize: '400px'}}>
         <div className="mx-auto max-w-3xl px-6 relative z-10">
            <h2 className="text-[32px] lg:text-[40px] font-bold mb-6 tracking-tight">Ready to scale up your B2B wholesale orders?</h2>
            <p className="text-[#93C5FD] text-lg mb-10">Join thousands of sellers already generating crores in revenue on ANGA9.</p>
            <Link
              href="/seller/register"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-[#FFCC00] px-10 text-[16px] font-bold text-[#1A1A2E] shadow-xl transition-all hover:scale-105 hover:bg-[#E6B800]"
            >
              Start Selling For Free <ArrowRight className="h-5 w-5" />
            </Link>
         </div>
      </section>
    </div>
  );
}
