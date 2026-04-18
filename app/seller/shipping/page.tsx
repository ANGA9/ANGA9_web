"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  Shield,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Boxes,
  RotateCcw,
  Warehouse,
  Globe,
} from "lucide-react";

export default function ShippingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Sell on ANGA9", href: "/seller/sell-on-anga9" },
    { name: "How to Sell", href: "/seller/how-to-sell" },
    { name: "Shipping & Delivery", href: "/seller/shipping" },
    { name: "Grow Your Business", href: "/seller/grow-business" },
  ];

  const shippingFeatures = [
    {
      icon: Truck,
      title: "Doorstep Pickup",
      desc: "Our logistics partners pick up packages directly from your warehouse or store. No need to visit any drop-off center.",
      color: "text-[#1A6FD4] bg-[#1A6FD4]/10",
    },
    {
      icon: Globe,
      title: "Pan-India Coverage",
      desc: "Deliver to 19,000+ pin codes across India. Reach buyers in metros, tier-2, tier-3 cities, and rural areas.",
      color: "text-[#1A6FD4] bg-[#1A6FD4]/10",
    },
    {
      icon: IndianRupee,
      title: "Affordable Rates",
      desc: "Competitive shipping rates negotiated with top logistics partners. Lower costs mean better margins for your business.",
      color: "text-[#22C55E] bg-[#22C55E]/10",
    },
    {
      icon: Shield,
      title: "Shipment Protection",
      desc: "All shipments are insured against damage and loss during transit. File claims directly from your Seller Dashboard.",
      color: "text-[#F59E0B] bg-[#F59E0B]/10",
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      desc: "Standard delivery in 3-7 business days across India. Express delivery options available for metro cities.",
      color: "text-[#EF4444] bg-[#EF4444]/10",
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      desc: "Track every shipment in real-time from dispatch to delivery. Both you and your buyers get live status updates.",
      color: "text-[#0EA5E9] bg-[#0EA5E9]/10",
    },
  ];

  const packagingTips = [
    {
      title: "Use Sturdy Boxes",
      desc: "Choose corrugated boxes that can withstand stacking and handling during transit. Double-wall boxes for fragile items.",
    },
    {
      title: "Secure Inner Packaging",
      desc: "Use bubble wrap, foam inserts, or crumpled paper to prevent movement inside the box. Fill all empty spaces.",
    },
    {
      title: "Seal Properly",
      desc: "Use strong packing tape on all edges and seams. Apply tape in an H-pattern for maximum security.",
    },
    {
      title: "Label Clearly",
      desc: "Print shipping labels clearly with complete address and pin code. Include a duplicate label inside the package.",
    },
  ];

  const deliveryZones = [
    { zone: "Metro Cities", cities: "Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad", timeline: "2-4 days", rate: "Starting at Rs. 35" },
    { zone: "Tier-2 Cities", cities: "Jaipur, Lucknow, Pune, Ahmedabad, Chandigarh & more", timeline: "3-5 days", rate: "Starting at Rs. 45" },
    { zone: "Tier-3 & Rural", cities: "All other serviceable pin codes across India", timeline: "5-7 days", rate: "Starting at Rs. 55" },
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
                  item.name === "Shipping & Delivery" ? "text-[#1A6FD4] border-[#1A6FD4]" : "text-[#4B5563] border-transparent"
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
                Logistics & Delivery
              </span>
              <h1 className="mb-4 sm:mb-6 text-[28px] sm:text-[36px] md:text-5xl lg:text-[56px] font-bold leading-[1.15] text-[#1A1A2E]">
                Hassle-Free Shipping Across{" "}
                <span className="text-[#1A6FD4]">All of India</span>
              </h1>
              <p className="text-[15px] sm:text-[17px] text-[#4B5563] leading-relaxed mb-6 sm:mb-8 max-w-lg">
                Focus on your products while we handle the logistics. ANGA9&apos;s integrated shipping network delivers your orders reliably to 19,000+ pin codes at the most affordable rates.
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                {[
                  { value: "19,000+", label: "Pin Codes" },
                  { value: "Rs. 35", label: "Starting Rate" },
                  { value: "2-7 Days", label: "Delivery Time" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-[22px] sm:text-[28px] font-bold text-[#1A6FD4]">{stat.value}</div>
                    <div className="text-[12px] sm:text-[13px] text-[#4B5563] font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[250px] sm:h-[350px] lg:h-[450px] w-full">
              <Image src="/seller-why-sell.png" fill className="object-contain" alt="Shipping" priority />
            </div>
          </div>
        </div>
      </section>

      {/* SHIPPING FEATURES */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Shipping Made Simple
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-4 rounded-full" />
          <p className="text-center text-[15px] sm:text-[17px] text-[#4B5563] mb-10 sm:mb-16 max-w-2xl mx-auto">
            Everything you need for smooth order fulfillment, built into the platform
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {shippingFeatures.map((item, idx) => (
              <div key={idx} className="p-5 sm:p-8 rounded-2xl border border-[#E8EEF4] hover:shadow-xl hover:border-[#1A6FD4]/20 transition-all group">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${item.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-[17px] sm:text-[20px] font-bold text-[#1A1A2E] mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-[13px] sm:text-[15px] text-[#4B5563] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERY ZONES */}
      <section className="py-12 sm:py-16 lg:py-24 bg-[#F8FBFF]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Delivery Zones & Timelines
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-4 rounded-full" />
          <p className="text-center text-[15px] sm:text-[17px] text-[#4B5563] mb-10 sm:mb-16 max-w-2xl mx-auto">
            Transparent delivery timelines and shipping rates based on destination
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {deliveryZones.map((zone, idx) => (
              <div key={idx} className="bg-white p-5 sm:p-8 rounded-2xl border border-[#E8EEF4] hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1A6FD4]/10 text-[#1A6FD4] flex items-center justify-center">
                    <MapPin size={22} />
                  </div>
                  <h3 className="text-[18px] sm:text-[22px] font-bold text-[#1A1A2E]">{zone.zone}</h3>
                </div>
                <p className="text-[13px] sm:text-[14px] text-[#4B5563] mb-4 sm:mb-6">{zone.cities}</p>
                <div className="space-y-3 border-t border-[#E8EEF4] pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] sm:text-[14px] text-[#4B5563]">Delivery Time</span>
                    <span className="text-[14px] sm:text-[15px] font-bold text-[#1A1A2E]">{zone.timeline}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] sm:text-[14px] text-[#4B5563]">Shipping Rate</span>
                    <span className="text-[14px] sm:text-[15px] font-bold text-[#22C55E]">{zone.rate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW SHIPPING WORKS */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative h-[250px] sm:h-[350px] lg:h-[450px] w-full order-2 lg:order-1">
              <Image src="/seller-why-sell.png" fill className="object-contain" alt="Shipping process" />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
                How Order Fulfillment Works
              </h2>
              <div className="h-1 w-16 bg-[#1A6FD4] mb-6 sm:mb-8 rounded-full" />
              <div className="space-y-4 sm:space-y-6">
                {[
                  { step: "1", title: "Order Received", desc: "You get an instant notification when a buyer places an order. View order details in your dashboard." },
                  { step: "2", title: "Pack & Label", desc: "Pack the product securely using our packaging guidelines. Print the shipping label from the dashboard." },
                  { step: "3", title: "Schedule Pickup", desc: "Schedule a pickup from your location. Our logistics partner arrives at your doorstep to collect the package." },
                  { step: "4", title: "Delivered & Paid", desc: "The order is delivered to the buyer. Payment is credited to your account within the 7-day cycle." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1A6FD4] text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-[15px] sm:text-[17px] font-bold text-[#1A1A2E] mb-1">{item.title}</h4>
                      <p className="text-[13px] sm:text-[14px] text-[#4B5563] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PACKAGING TIPS */}
      <section className="py-12 sm:py-16 lg:py-24 bg-[#F8FBFF]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Packaging Best Practices
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-4 rounded-full" />
          <p className="text-center text-[15px] sm:text-[17px] text-[#4B5563] mb-10 sm:mb-16 max-w-2xl mx-auto">
            Proper packaging reduces returns and keeps your customers happy
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {packagingTips.map((tip, idx) => (
              <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8EEF4]">
                <div className="w-10 h-10 rounded-xl bg-[#1A6FD4]/10 text-[#1A6FD4] flex items-center justify-center mb-4 font-bold text-lg">
                  {idx + 1}
                </div>
                <h3 className="text-[15px] sm:text-[17px] font-bold text-[#1A1A2E] mb-2">{tip.title}</h3>
                <p className="text-[13px] sm:text-[14px] text-[#4B5563] leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RETURNS */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-12">
          <h2 className="text-center text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#1A1A2E] mb-3 sm:mb-4">
            Returns & Reverse Logistics
          </h2>
          <div className="h-1 w-16 bg-[#1A6FD4] mx-auto mb-4 rounded-full" />
          <p className="text-center text-[15px] sm:text-[17px] text-[#4B5563] mb-10 sm:mb-16 max-w-2xl mx-auto">
            We handle the reverse logistics so you can focus on your business
          </p>

          <div className="space-y-4 sm:space-y-6">
            {[
              { icon: RotateCcw, title: "Easy Return Processing", desc: "When a buyer initiates a return, ANGA9 handles the reverse pickup and delivers the product back to you. You can track return shipments from your dashboard." },
              { icon: Shield, title: "Return Protection Policy", desc: "Our quality check process ensures that returned products are inspected. If a return is found to be fraudulent or the product was damaged by the buyer, you are fully protected." },
              { icon: Warehouse, title: "Restocking Support", desc: "Returned products in resalable condition are automatically restocked in your inventory. Damaged returns are flagged for your review with photographic evidence." },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 sm:gap-6 p-4 sm:p-6 bg-[#F8FBFF] rounded-xl sm:rounded-2xl border border-[#E8EEF4]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1A6FD4]/10 text-[#1A6FD4] flex items-center justify-center shrink-0">
                  <item.icon size={22} />
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-[17px] font-bold text-[#1A1A2E] mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-[13px] sm:text-[15px] text-[#4B5563] leading-relaxed">{item.desc}</p>
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
              <p className="mb-8 max-w-sm text-[15px] sm:text-[17px] leading-relaxed text-[#4B5563]">
                India&apos;s leading B2B marketplace connecting suppliers with buyers across the country at 0% commission.
              </p>
            </div>

            <div className="lg:col-span-3">
              <h4 className="mb-6 text-[18px] font-bold text-[#1A1A2E]">Sell on ANGA9</h4>
              <ul className="space-y-4">
                {[
                  { label: "Sell on ANGA9", href: "/seller/sell-on-anga9" },
                  { label: "How to Sell", href: "/seller/how-to-sell" },
                  { label: "Shipping & Delivery", href: "/seller/shipping" },
                  { label: "Grow Your Business", href: "/seller/grow-business" },
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
