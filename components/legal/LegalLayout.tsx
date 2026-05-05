"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Shield,
  Truck,
  RotateCcw,
  XCircle,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Calendar,
} from "lucide-react";

const NAV = [
  { href: "/terms", label: "Terms of Use", icon: FileText },
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/shipping-policy", label: "Shipping Policy", icon: Truck },
  { href: "/returns", label: "Returns & Refunds", icon: RotateCcw },
  { href: "/cancellation", label: "Cancellation Policy", icon: XCircle },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/contact", label: "Contact Us", icon: MessageSquare },
];

export default function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const currentNav = NAV.find((n) => n.href === pathname);
  const CurrentIcon = currentNav?.icon || FileText;

  return (
    <div className="legal-page-root">
      {/* ══════════ Top Header ══════════ */}
      <header className="legal-header">
        <div className="legal-header-inner">
          <div className="legal-header-left">
            <button
              onClick={() =>
                history.length > 1 ? router.back() : router.push("/")
              }
              aria-label="Go back"
              className="legal-back-btn"
            >
              <ArrowLeft className="legal-back-icon" strokeWidth={2.2} />
            </button>
            <Link href="/" className="legal-logo-link">
              <Image
                src="/anga9-logo.png"
                alt="ANGA9"
                width={100}
                height={32}
                className="legal-logo-img"
                priority
              />
            </Link>
          </div>
          {/* Breadcrumb on desktop */}
          <div className="legal-breadcrumb">
            <Link href="/" className="legal-breadcrumb-home">
              Home
            </Link>
            <ChevronRight className="legal-breadcrumb-sep" />
            <span className="legal-breadcrumb-current">{title}</span>
          </div>
        </div>
      </header>

      {/* ══════════ Hero Banner ══════════ */}
      <section className="legal-hero">
        <div className="legal-hero-bg" />
        <div className="legal-hero-inner">
          <div className="legal-hero-icon-wrap">
            <CurrentIcon className="legal-hero-icon" strokeWidth={1.8} />
          </div>
          <h1 className="legal-hero-title">{title}</h1>
          <div className="legal-hero-meta">
            <Calendar className="legal-hero-cal-icon" strokeWidth={2} />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* ══════════ Body ══════════ */}
      <div className="legal-body">
        <div className="legal-body-grid">
          {/* ── Sidebar (desktop) ── */}
          <aside className="legal-sidebar">
            <div className="legal-sidebar-sticky">
              <div className="legal-sidebar-card">
                <p className="legal-sidebar-label">Quick Navigation</p>
                <nav className="legal-sidebar-nav">
                  {NAV.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`legal-sidebar-link ${
                          active ? "legal-sidebar-link--active" : ""
                        }`}
                      >
                        <Icon className="legal-sidebar-link-icon" strokeWidth={active ? 2.2 : 1.8} />
                        <span>{item.label}</span>
                        {active && <div className="legal-sidebar-active-dot" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Help card */}
              <div className="legal-sidebar-help">
                <p className="legal-sidebar-help-title">Need Help?</p>
                <p className="legal-sidebar-help-text">
                  Can&apos;t find what you&apos;re looking for?
                </p>
                <Link href="/contact" className="legal-sidebar-help-btn">
                  <MessageSquare
                    className="legal-sidebar-help-btn-icon"
                    strokeWidth={2}
                  />
                  Contact Support
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="legal-main">
            <div className="legal-content-card">
              <div className="legal-prose">{children}</div>
            </div>

            {/* ── Mobile-only nav at bottom ── */}
            <div className="legal-mobile-nav">
              <p className="legal-mobile-nav-label">More policies</p>
              <div className="legal-mobile-nav-grid">
                {NAV.filter((i) => i.href !== pathname).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="legal-mobile-nav-card"
                    >
                      <Icon
                        className="legal-mobile-nav-icon"
                        strokeWidth={1.8}
                      />
                      <span className="legal-mobile-nav-text">
                        {item.label}
                      </span>
                      <ChevronRight className="legal-mobile-nav-arrow" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ══════════ Footer ══════════ */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <div className="legal-footer-brand">
            <Image
              src="/anga9-logo.png"
              alt="ANGA9"
              width={80}
              height={26}
              className="legal-footer-logo"
            />
            <p className="legal-footer-tagline">
              India&apos;s B2B Wholesale Marketplace
            </p>
          </div>
          <div className="legal-footer-links">
            {NAV.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="legal-footer-link"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="legal-footer-copy">
            <p>© {new Date().getFullYear()} ANGA9. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ══════════ Styles ══════════ */}
      <style jsx global>{`
        /* ── Root ── */
        .legal-page-root {
          min-height: 100vh;
          background: #F6F8FC;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .legal-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px) saturate(1.6);
          -webkit-backdrop-filter: blur(16px) saturate(1.6);
          border-bottom: 1px solid rgba(26,111,212,0.08);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .legal-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        @media (min-width: 768px) {
          .legal-header-inner { padding: 0 32px; height: 64px; }
        }
        .legal-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .legal-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #E8EEF4;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .legal-back-btn:hover {
          background: #EAF2FF;
          border-color: #1A6FD4;
          transform: translateX(-2px);
        }
        .legal-back-icon { width: 17px; height: 17px; color: #1A1A2E; }
        .legal-logo-link { display: flex; align-items: center; }
        .legal-logo-img { height: 28px; width: auto; }
        @media (min-width: 768px) { .legal-logo-img { height: 32px; } }

        /* Breadcrumb */
        .legal-breadcrumb { display: none; }
        @media (min-width: 768px) {
          .legal-breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }
        .legal-breadcrumb-home {
          font-size: 13px;
          color: #6B7280;
          text-decoration: none;
          transition: color 0.15s;
        }
        .legal-breadcrumb-home:hover { color: #1A6FD4; }
        .legal-breadcrumb-sep { width: 14px; height: 14px; color: #D1D5DB; }
        .legal-breadcrumb-current {
          font-size: 13px;
          color: #1A1A2E;
          font-weight: 600;
        }

        /* ── Hero ── */
        .legal-hero {
          position: relative;
          overflow: hidden;
          padding: 40px 20px 36px;
        }
        @media (min-width: 768px) {
          .legal-hero { padding: 52px 32px 44px; }
        }
        .legal-hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0D47A1 0%, #1A6FD4 40%, #42A5F5 100%);
          z-index: 0;
        }
        .legal-hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%),
                      radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.06) 0%, transparent 50%);
        }
        .legal-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        .legal-hero-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          margin-bottom: 16px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        @media (min-width: 768px) { .legal-hero-icon-wrap { width: 64px; height: 64px; border-radius: 18px; } }
        .legal-hero-icon { width: 28px; height: 28px; color: #fff; }
        @media (min-width: 768px) { .legal-hero-icon { width: 32px; height: 32px; } }
        .legal-hero-title {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin: 0;
        }
        @media (min-width: 768px) { .legal-hero-title { font-size: 36px; } }
        .legal-hero-meta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          padding: 6px 16px;
          border-radius: 100px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          font-size: 12.5px;
          color: rgba(255,255,255,0.85);
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .legal-hero-cal-icon { width: 14px; height: 14px; }

        /* ── Body ── */
        .legal-body {
          flex: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 16px 48px;
        }
        @media (min-width: 768px) {
          .legal-body { padding: 32px 32px 64px; }
        }
        .legal-body-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .legal-body-grid {
            grid-template-columns: 250px 1fr;
            gap: 32px;
          }
        }

        /* ── Sidebar ── */
        .legal-sidebar { display: none; }
        @media (min-width: 768px) { .legal-sidebar { display: block; } }
        .legal-sidebar-sticky {
          position: sticky;
          top: 88px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .legal-sidebar-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #E8EEF4;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(26,111,212,0.03);
        }
        .legal-sidebar-label {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #9CA3AF;
          margin: 0 0 14px 0;
        }
        .legal-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .legal-sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          font-size: 13.5px;
          color: #4B5563;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }
        .legal-sidebar-link:hover {
          background: #F0F5FF;
          color: #1A6FD4;
          transform: translateX(2px);
        }
        .legal-sidebar-link--active {
          background: linear-gradient(135deg, #EAF2FF, #DBEAFE);
          color: #1A6FD4;
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(26,111,212,0.08);
        }
        .legal-sidebar-link--active:hover {
          transform: none;
        }
        .legal-sidebar-link-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }
        .legal-sidebar-active-dot {
          position: absolute;
          right: 12px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1A6FD4;
          box-shadow: 0 0 0 3px rgba(26,111,212,0.15);
        }

        /* Sidebar help card */
        .legal-sidebar-help {
          background: linear-gradient(135deg, #0D47A1, #1A6FD4);
          border-radius: 14px;
          padding: 20px;
          color: #fff;
          box-shadow: 0 4px 16px rgba(26,111,212,0.2);
        }
        .legal-sidebar-help-title {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }
        .legal-sidebar-help-text {
          font-size: 12.5px;
          color: rgba(255,255,255,0.75);
          margin: 0 0 14px 0;
          line-height: 1.5;
        }
        .legal-sidebar-help-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          background: rgba(255,255,255,0.18);
          color: #fff;
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .legal-sidebar-help-btn:hover {
          background: rgba(255,255,255,0.28);
          transform: translateY(-1px);
        }
        .legal-sidebar-help-btn-icon { width: 14px; height: 14px; }

        /* ── Main Content ── */
        .legal-main { min-width: 0; }
        .legal-content-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #E8EEF4;
          padding: 28px 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(26,111,212,0.03);
        }
        @media (min-width: 768px) {
          .legal-content-card { padding: 40px 44px; }
        }

        /* ── Mobile bottom nav ── */
        .legal-mobile-nav { display: block; margin-top: 32px; }
        @media (min-width: 768px) { .legal-mobile-nav { display: none; } }
        .legal-mobile-nav-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9CA3AF;
          margin: 0 0 12px 0;
        }
        .legal-mobile-nav-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .legal-mobile-nav-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #E8EEF4;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .legal-mobile-nav-card:hover,
        .legal-mobile-nav-card:active {
          background: #F0F5FF;
          border-color: rgba(26,111,212,0.15);
          transform: translateX(4px);
        }
        .legal-mobile-nav-icon {
          width: 18px;
          height: 18px;
          color: #1A6FD4;
          flex-shrink: 0;
        }
        .legal-mobile-nav-text {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: #1A1A2E;
        }
        .legal-mobile-nav-arrow {
          width: 16px;
          height: 16px;
          color: #D1D5DB;
        }

        /* ── Footer ── */
        .legal-footer {
          background: #fff;
          border-top: 1px solid #E8EEF4;
          margin-top: auto;
        }
        .legal-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 20px;
          text-align: center;
        }
        @media (min-width: 768px) {
          .legal-footer-inner { padding: 40px 32px; }
        }
        .legal-footer-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
        }
        .legal-footer-logo { height: 26px; width: auto; opacity: 0.7; }
        .legal-footer-tagline {
          font-size: 12px;
          color: #9CA3AF;
          margin: 0;
          font-weight: 500;
        }
        .legal-footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px 20px;
          margin-bottom: 20px;
        }
        .legal-footer-link {
          font-size: 12.5px;
          color: #6B7280;
          text-decoration: none;
          transition: color 0.15s;
          font-weight: 500;
        }
        .legal-footer-link:hover { color: #1A6FD4; }
        .legal-footer-copy p {
          font-size: 11.5px;
          color: #9CA3AF;
          margin: 0;
        }

        /* ══════════ Prose styles ══════════ */
        .legal-prose {
          font-size: 15px;
          line-height: 1.8;
          color: #374151;
        }
        .legal-prose h2 {
          font-size: 18px;
          font-weight: 700;
          color: #1A1A2E;
          margin-top: 36px;
          margin-bottom: 14px;
          letter-spacing: -0.01em;
          padding-bottom: 10px;
          border-bottom: 2px solid #EAF2FF;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .legal-prose h2::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 20px;
          border-radius: 4px;
          background: linear-gradient(180deg, #1A6FD4, #42A5F5);
          flex-shrink: 0;
        }
        .legal-prose h2:first-child {
          margin-top: 0;
        }
        .legal-prose h3 {
          font-size: 15.5px;
          font-weight: 600;
          color: #1F2937;
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .legal-prose p {
          margin-bottom: 16px;
        }
        .legal-prose ul,
        .legal-prose ol {
          margin: 0 0 18px 0;
          padding-left: 0;
          list-style: none;
        }
        .legal-prose ul li,
        .legal-prose ol li {
          position: relative;
          padding-left: 24px;
          margin-bottom: 8px;
        }
        .legal-prose ul li::before {
          content: '';
          position: absolute;
          left: 4px;
          top: 10px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1A6FD4;
          opacity: 0.5;
        }
        .legal-prose ol {
          counter-reset: legal-ol;
        }
        .legal-prose ol li {
          counter-increment: legal-ol;
        }
        .legal-prose ol li::before {
          content: counter(legal-ol) '.';
          position: absolute;
          left: 0;
          top: 0;
          font-size: 13px;
          font-weight: 700;
          color: #1A6FD4;
          opacity: 0.7;
        }
        .legal-prose a {
          color: #1A6FD4;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid rgba(26,111,212,0.25);
          transition: all 0.15s ease;
        }
        .legal-prose a:hover {
          color: #0D47A1;
          border-bottom-color: #0D47A1;
        }
        .legal-prose strong {
          font-weight: 600;
          color: #1A1A2E;
        }
        .legal-prose hr {
          border: none;
          border-top: 1px solid #EEF1F5;
          margin: 32px 0;
        }
        @media (max-width: 767px) {
          .legal-prose {
            font-size: 14.5px;
            line-height: 1.75;
          }
          .legal-prose h2 {
            font-size: 16.5px;
            margin-top: 28px;
          }
        }

        /* ── FAQ item overrides ── */
        .faq-item {
          padding: 18px 20px;
          margin: 0 -20px 0;
          border-bottom: 1px solid #EEF1F5;
          border-radius: 0;
          transition: background 0.15s ease;
        }
        @media (min-width: 768px) {
          .faq-item {
            padding: 20px 24px;
            margin: 0 -24px 0;
          }
        }
        .faq-item:hover {
          background: #FAFCFF;
        }
        .faq-item:last-child { border-bottom: none; }
        .faq-item h3 {
          margin-top: 0 !important;
          color: #1A1A2E;
          font-weight: 600;
        }
        .faq-item p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
