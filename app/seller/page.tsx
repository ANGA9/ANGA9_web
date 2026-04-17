"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, TrendingUp, IndianRupee, Zap, LayoutDashboard, Truck, ShieldCheck, Megaphone, Package, ShoppingBag } from "lucide-react";

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

      {/* HERO SECTION - Edge-to-Edge sweeping background */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 bg-[#FDFPFE]">
        {/* Background Graphic (The sweeping curve like Meesho) */}
        <div className="absolute right-0 top-0 h-full w-[60%] lg:w-[65%] origin-top-right transform overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[#DBEAFE] rounded-bl-[100%] scale-125 translate-x-[15%] -translate-y-[10%]"></div>
          {/* A second curve for depth */}
          <div className="absolute inset-0 bg-[#BFDBFE] rounded-bl-[80%] scale-110 translate-x-[25%] opacity-50"></div>
          
          {/* This is where the Gemini generated seller photo goes (transparent png) */}
          {/* <Image src="/transparent-seller-hero.png" fill style={{objectFit: 'cover', objectPosition: 'left bottom'}} alt="Seller" /> */}
          <div className="absolute inset-0 flex items-end justify-center pb-8 border-4 border-dashed border-[#1A6FD4]/30 m-4 rounded-[4rem]">
             <div className="text-center p-6 bg-white/80 backdrop-blur rounded-2xl max-w-sm mb-12 shadow-xl">
               <Package className="w-12 h-12 text-[#1A6FD4] mx-auto mb-3" />
               <p className="text-[#1A1A2E] font-bold text-lg mb-1">Upload your cut-out image here!</p>
               <p className="text-[#6B7280] text-sm leading-relaxed">
                 Use the transparent PNG of the seller standing. It will completely overlap the blue curve exactly like the reference.
               </p>
             </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Hero Left Content */}
            <div className="max-w-xl py-10 lg:py-20 lg:pr-10 bg-white/40 backdrop-blur-3xl lg:backdrop-blur-none lg:bg-transparent rounded-3xl p-6 lg:p-0">
              <h1 className="mb-4 text-[42px] font-bold leading-[1.1] tracking-tight text-[#1A1A2E] md:text-5xl lg:text-6xl">
                Sell online to Crores of Customers at{" "}
                <span className="text-[#E11D48]">
                  0% Commission
                </span>
              </h1>
              
              <p className="mb-6 text-[17px] text-[#4B5563] leading-relaxed">
                Become an ANGA9 seller and grow your business across India
              </p>
              
              <div className="mb-8 flex items-center gap-3">
                 <span className="bg-[#E11D48] text-white text-[11px] font-bold px-2 py-0.5 rounded-[4px]">NEW</span>
                 <p className="text-[14px] text-[#4B5563]">
                   Don&apos;t have a GSTIN? You can still sell on ANGA9. <Link href="/seller/gst" className="text-[#E11D48] font-medium hover:underline">Know more</Link>
                 </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/seller/register"
                  className="inline-flex h-14 items-center justify-center rounded-[10px] bg-[#FFCC00] px-10 text-[16px] font-bold text-[#1A1A2E] shadow-lg shadow-[#FFCC00]/30 transition-all hover:bg-[#E6B800] hover:-translate-y-0.5"
                >
                  Start Selling
                </Link>
              </div>
            </div>
            
            {/* Native spacing for layout structure */}
            <div className="hidden lg:block h-[500px]"></div>
          </div>
        </div>
      </section>

      {/* STATS STRIP (Light Grey Tone) */}
      <section className="bg-[#F8FBFF] py-12">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8 text-center">
            <div className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-[#E8EEF4]">
              <p className="mb-2 text-3xl font-extrabold text-[#E11D48]">Lakhs of</p>
              <p className="text-[15px] font-medium text-[#1A1A2E] text-left leading-snug">Sellers trust ANGA9 to sell online</p>
            </div>
            <div className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-[#E8EEF4]">
              <p className="mb-2 text-3xl font-extrabold text-[#E11D48]">Crores of</p>
              <p className="text-[15px] font-medium text-[#1A1A2E] text-left leading-snug">Customers buying across India</p>
            </div>
            <div className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-[#E8EEF4]">
              <p className="mb-2 text-3xl font-extrabold text-[#E11D48]">Thousands of</p>
              <p className="text-[15px] font-medium text-[#1A1A2E] text-left leading-snug">Serviceable pincodes across India — we deliver everywhere.</p>
            </div>
            <div className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-[#E8EEF4]">
              <p className="mb-2 text-3xl font-extrabold text-[#E11D48]">Hundreds of</p>
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
               <p className="text-[#6B7280] text-[17px] leading-relaxed max-w-[400px]">
                 All the benefits that come with selling on ANGA9 are designed to help you sell more, and make it easier to grow your business.
               </p>
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
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E11D48]/10 text-[#E11D48]">
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
                   <p className="text-[#6B7280] text-[16px] leading-relaxed ml-[60px] max-md:ml-0 mb-2">
                     From small to large and unbranded to branded, ANGA9 fuels continuous growth for all suppliers globally.
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
                   <div className="w-[60px] h-[60px] rounded-full bg-[#E11D48] text-white flex items-center justify-center text-xl font-bold shadow-lg mb-6 ring-[8px] ring-[#F8FBFF]">
                      {item.step}
                   </div>
                   <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-2">{item.title}</h4>
                   <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* GROW BUSINESS WITH ANGA9 */}
      <section className="py-20 lg:py-28 bg-white">
         <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
               <div className="lg:col-span-5">
                  <h2 className="text-[32px] font-bold text-[#1A1A2E] lg:text-[40px] mb-6 leading-tight">Grow Your Business With ANGA9</h2>
                  <p className="text-[#6B7280] text-[17px] mb-8 max-w-[400px]">Access exclusive tools and insights tailored directly to boost your online enterprise effectively.</p>
               </div>
               
               <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
                  {/* Card 1 */}
                  <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(30,41,59,0.05)] border border-[#E8EEF4] transition-all hover:border-[#1A6FD4]/40">
                     <div className="w-12 h-12 rounded bg-[#1A6FD4]/10 text-[#1A6FD4] flex items-center justify-center mb-6">
                       <Zap className="h-6 w-6" />
                     </div>
                     <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-3">Efficient & Affordable Shipping</h4>
                     <p className="text-[#6B7280] text-[15px] leading-relaxed">Sell your products across India to over 28,000+ pincodes with reliable shipping mechanics.</p>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(30,41,59,0.05)] border border-[#E8EEF4] transition-all hover:border-[#1A6FD4]/40">
                     <div className="w-12 h-12 rounded bg-[#1A6FD4]/10 text-[#1A6FD4] flex items-center justify-center mb-6">
                       <Megaphone className="h-6 w-6" />
                     </div>
                     <h4 className="text-[18px] font-bold text-[#1A1A2E] mb-3">Ads to grow more</h4>
                     <p className="text-[#6B7280] text-[15px] leading-relaxed">Use selling tools like ANGA9 Ads to be more visible and sell more catalogs continuously.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER CTA (Not Black - Gradient Dark Purple) */}
      <section className="bg-gradient-to-br from-[#1A1A2E] to-[#0F3460] py-20 lg:py-28 text-center text-white">
         <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-[32px] lg:text-[40px] font-bold mb-6 tracking-tight">Ready to scale up your B2B wholesale orders?</h2>
            <p className="text-[#93C5FD] text-lg mb-10">Join thousands of sellers already generating crores in revenue on ANGA9.</p>
            <Link
              href="/seller/register"
              className="inline-flex h-[52px] items-center justify-center rounded-[10px] bg-[#FFCC00] px-10 text-[16px] font-bold text-[#1A1A2E] shadow-xl transition-all hover:scale-105 hover:bg-[#E6B800]"
            >
              Start Selling For Free
            </Link>
         </div>
      </section>
    </div>
  );
}
