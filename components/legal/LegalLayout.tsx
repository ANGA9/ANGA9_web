"use client";

import { useState } from "react";
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
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentNav = NAV.find((n) => n.href === pathname);
  const CurrentIcon = currentNav?.icon || FileText;

  return (
    <div className="legal-page-root">
      {/* ── Mobile Menu Overlay ── */}
      <div className={`legal-mobile-overlay ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="legal-mobile-overlay-header">
          <span className="legal-mobile-overlay-title">Quick Navigation</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="legal-mobile-overlay-close"
            aria-label="Close menu"
          >
            <X strokeWidth={2.5} size={24} />
          </button>
        </div>
        <div className="legal-mobile-overlay-content">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`legal-mobile-overlay-link ${
                  active ? "legal-mobile-overlay-link--active" : ""
                }`}
              >
                <Icon className="legal-mobile-overlay-icon" strokeWidth={active ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Header ── */}
      <header className="legal-header">
        <div className="legal-container">
          <div className="legal-header-inner">
            <div className="legal-header-left">
              <button
                onClick={() => router.push("/")}
                aria-label="Go to homepage"
                className="legal-back-btn"
              >
                <ArrowLeft className="legal-back-icon" strokeWidth={2.5} />
              </button>
              <Link href="/" className="legal-logo-link">
                <Image
                  src="/anga9-logo.png"
                  alt="ANGA9"
                  width={110}
                  height={34}
                  className="legal-logo-img"
                  priority
                />
              </Link>
            </div>
            <div className="legal-header-right">
              <button 
                className="legal-mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="legal-mobile-menu-icon" strokeWidth={2.5} size={24} />
              </button>
              {/* Breadcrumb on desktop */}
              <div className="legal-breadcrumb">
                <Link href="/" className="legal-breadcrumb-home">
                  Home
                </Link>
                <ChevronRight className="legal-breadcrumb-sep" strokeWidth={2.5} />
                <span className="legal-breadcrumb-current">{title}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════ Hero Wrapper ══════════ */}
      <div className="legal-hero-wrapper">
        {/* ── Hero Banner ── */}
        <section className="legal-hero">
          <div className="legal-container">
            <div className="legal-hero-inner">
              <div className="legal-hero-icon-wrap">
                <CurrentIcon className="legal-hero-icon" strokeWidth={2} />
              </div>
              <div className="legal-hero-text">
                <h1 className="legal-hero-title">{title}</h1>
                <div className="legal-hero-meta">
                  <Calendar className="legal-hero-cal-icon" strokeWidth={2.5} />
                  <span>Last updated: {lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══════════ Body ══════════ */}
      <div className="legal-body">
        <div className="legal-container">
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
                          <Icon className="legal-sidebar-link-icon" strokeWidth={active ? 2.5 : 2} />
                          <span>{item.label}</span>
                          {active && <div className="legal-sidebar-active-dot" />}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Help card */}
                {/* <div className="legal-sidebar-help">
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
                </div> */}
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
                          strokeWidth={2}
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
      </div>

      {/* ══════════ Footer ══════════ */}
      <footer className="legal-footer">
        <div className="legal-container">
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
        </div>
      </footer>

      {/* ══════════ Styles ══════════ */}
      <style jsx global>{`
        /* ── Root ── */
        .legal-page-root {
          min-height: 100vh;
          background: #F9FAFB;
          display: flex;
          flex-direction: column;
        }

        /* ── Strict Alignment Container ── */
        .legal-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .legal-container { padding: 0 32px; }
        }

        /* ── Hero Wrapper ── */
        .legal-hero-wrapper {
          position: relative;
          background: #fff;
          overflow: hidden;
        }
        .legal-hero-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 15% 50%, rgba(26,111,212,0.04) 0%, transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(26,111,212,0.06) 0%, transparent 50%);
          pointer-events: none;
        }

        /* ── Header ── */
        .legal-header {
          position: sticky;
          top: 0;
          z-index: 40;
          padding: 16px 0;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);
        }
        @media (min-width: 768px) {
          .legal-header { 
            position: relative;
            background: #fff;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border-bottom: none;
            padding: 24px 0; 
          }
        }
        .legal-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .legal-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .legal-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #E5E7EB;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .legal-back-btn:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
          transform: translateX(-2px);
        }
        .legal-back-icon { width: 20px; height: 20px; color: #111827; }
        .legal-logo-link { display: flex; align-items: center; }
        .legal-logo-img { height: 28px; width: auto; }
        @media (min-width: 768px) { .legal-logo-img { height: 34px; } }

        /* Breadcrumb & Mobile Menu */
        .legal-header-right {
          display: flex;
          align-items: center;
        }
        .legal-mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: transparent;
          border: none;
          color: #111827;
          cursor: pointer;
        }
        .legal-breadcrumb { display: none; }
        @media (min-width: 768px) {
          .legal-mobile-menu-btn { display: none; }
          .legal-breadcrumb {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #F3F4F6;
            padding: 6px 16px;
            border-radius: 100px;
          }
        }
        .legal-breadcrumb-home {
          font-size: 13.5px;
          color: #4B5563;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }
        .legal-breadcrumb-home:hover { color: #111827; }
        .legal-breadcrumb-sep { width: 14px; height: 14px; color: #9CA3AF; }
        .legal-breadcrumb-current {
          font-size: 13.5px;
          color: #111827;
          font-weight: 600;
        }

        /* ── Hero ── */
        .legal-hero {
          position: relative;
          z-index: 10;
          padding: 24px 0 40px;
        }
        @media (min-width: 768px) {
          .legal-hero { padding: 40px 0 64px; }
        }
        .legal-hero-inner {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 16px;
          max-width: 800px;
        }
        @media (min-width: 768px) {
          .legal-hero-inner {
            gap: 28px;
          }
        }
        .legal-hero-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #F0F5FF;
          border: 1px solid #DBEAFE;
          box-shadow: 0 4px 12px rgba(26,111,212,0.08);
          flex-shrink: 0;
        }
        @media (min-width: 768px) { .legal-hero-icon-wrap { width: 80px; height: 80px; border-radius: 24px; } }
        .legal-hero-icon { width: 24px; height: 24px; color: #1A6FD4; }
        @media (min-width: 768px) { .legal-hero-icon { width: 40px; height: 40px; } }
        .legal-hero-text {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        @media (min-width: 768px) { .legal-hero-text { gap: 12px; } }
        .legal-hero-title {
          font-size: 24px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0;
        }
        @media (min-width: 768px) { .legal-hero-title { font-size: 46px; letter-spacing: -0.03em; } }
        .legal-hero-meta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
        }
        .legal-hero-cal-icon { width: 16px; height: 16px; color: #9CA3AF; }

        /* ── Body ── */
        .legal-body {
          flex: 1;
          width: 100%;
          padding: 0 0 64px;
        }
        @media (min-width: 768px) {
          .legal-body { padding: 0 0 80px; }
        }
        .legal-body-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .legal-body-grid {
            grid-template-columns: 260px 1fr;
            gap: 40px;
          }
        }

        /* ── Sidebar ── */
        .legal-sidebar { display: none; }
        @media (min-width: 768px) { .legal-sidebar { display: block; } }
        .legal-sidebar-sticky {
          position: sticky;
          top: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .legal-sidebar-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
        }
        .legal-sidebar-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #9CA3AF;
          margin: 0 0 16px 0;
        }
        .legal-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .legal-sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14.5px;
          color: #4B5563;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          font-weight: 500;
        }
        .legal-sidebar-link:hover {
          background: #F3F4F6;
          color: #111827;
          transform: translateX(2px);
        }
        .legal-sidebar-link--active {
          background: #F0F5FF;
          color: #1A6FD4;
          font-weight: 600;
        }
        .legal-sidebar-link--active:hover {
          transform: none;
          background: #EAF2FF;
        }
        .legal-sidebar-link-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .legal-sidebar-active-dot {
          position: absolute;
          right: 14px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1A6FD4;
          box-shadow: 0 0 0 3px rgba(26,111,212,0.15);
        }

        /* Sidebar help card */
        .legal-sidebar-help {
          background: #1A6FD4;
          background-image: linear-gradient(135deg, #1A6FD4, #0D47A1);
          border-radius: 20px;
          padding: 24px;
          color: #fff;
          box-shadow: 0 10px 15px -3px rgba(26,111,212,0.3), 0 4px 6px -2px rgba(26,111,212,0.15);
        }
        .legal-sidebar-help-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }
        .legal-sidebar-help-text {
          font-size: 14px;
          color: rgba(255,255,255,0.85);
          margin: 0 0 16px 0;
          line-height: 1.5;
        }
        .legal-sidebar-help-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          background: #fff;
          color: #1A6FD4;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .legal-sidebar-help-btn:hover {
          background: #F8FAFC;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .legal-sidebar-help-btn-icon { width: 16px; height: 16px; }

        /* ── Main Content ── */
        .legal-main { min-width: 0; }
        .legal-content-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          padding: 32px 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
        }
        @media (min-width: 768px) {
          .legal-content-card { padding: 48px 56px; }
        }

        /* ── Mobile bottom nav ── */
        .legal-mobile-nav { display: block; margin-top: 40px; }
        @media (min-width: 768px) { .legal-mobile-nav { display: none; } }
        .legal-mobile-nav-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #9CA3AF;
          margin: 0 0 16px 0;
        }
        .legal-mobile-nav-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .legal-mobile-nav-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-radius: 16px;
          background: #fff;
          border: 1px solid #E5E7EB;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .legal-mobile-nav-card:hover,
        .legal-mobile-nav-card:active {
          background: #F9FAFB;
          border-color: #D1D5DB;
          transform: translateX(4px);
        }
        .legal-mobile-nav-icon {
          width: 20px;
          height: 20px;
          color: #1A6FD4;
          flex-shrink: 0;
        }
        .legal-mobile-nav-text {
          flex: 1;
          font-size: 15.5px;
          font-weight: 600;
          color: #111827;
        }
        .legal-mobile-nav-arrow {
          width: 18px;
          height: 18px;
          color: #9CA3AF;
        }

        /* ── Footer ── */
        .legal-footer {
          background: #fff;
          border-top: 1px solid #E5E7EB;
          margin-top: auto;
          padding: 40px 0;
        }
        @media (min-width: 768px) {
          .legal-footer { padding: 48px 0; }
        }
        .legal-footer-inner {
          text-align: center;
        }
        .legal-footer-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .legal-footer-logo { height: 28px; width: auto; opacity: 0.8; }
        .legal-footer-tagline {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
          font-weight: 500;
        }
        .legal-footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px 24px;
          margin-bottom: 24px;
        }
        .legal-footer-link {
          font-size: 14px;
          color: #4B5563;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }
        .legal-footer-link:hover { color: #111827; }
        .legal-footer-copy p {
          font-size: 13px;
          color: #9CA3AF;
          margin: 0;
        }

        /* ══════════ Prose styles ══════════ */
        .legal-prose {
          font-size: 17px;
          line-height: 1.7;
          color: #1F2937;
        }
        .legal-prose h2 {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin-top: 48px;
          margin-bottom: 20px;
          letter-spacing: -0.01em;
          padding-bottom: 12px;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .legal-prose h2::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 24px;
          border-radius: 4px;
          background: linear-gradient(180deg, #1A6FD4, #42A5F5);
          flex-shrink: 0;
        }
        .legal-prose h2:first-child {
          margin-top: 0;
        }
        .legal-prose h3 {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-top: 32px;
          margin-bottom: 12px;
        }
        .legal-prose p {
          margin-bottom: 20px;
        }
        .legal-prose ul,
        .legal-prose ol {
          margin: 0 0 24px 0;
          padding-left: 0;
          list-style: none;
        }
        .legal-prose ul li,
        .legal-prose ol li {
          position: relative;
          padding-left: 28px;
          margin-bottom: 12px;
        }
        .legal-prose ul li::before {
          content: '';
          position: absolute;
          left: 6px;
          top: 11px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1A6FD4;
          opacity: 0.8;
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
          font-size: 15px;
          font-weight: 700;
          color: #1A6FD4;
          opacity: 0.9;
          background: transparent;
          width: auto;
          height: auto;
        }
        .legal-prose a {
          color: #1A6FD4;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 1px solid rgba(26,111,212,0.3);
          transition: all 0.2s ease;
        }
        .legal-prose a:hover {
          color: #0D47A1;
          border-bottom-color: #0D47A1;
        }
        .legal-prose strong {
          font-weight: 700;
          color: #111827;
        }
        .legal-prose hr {
          border: none;
          border-top: 1px solid #E5E7EB;
          margin: 40px 0;
        }
        @media (max-width: 767px) {
          .legal-prose {
            font-size: 16px;
            line-height: 1.65;
          }
          .legal-prose h2 {
            font-size: 20px;
            margin-top: 36px;
            gap: 10px;
          }
          .legal-prose h2::before {
            height: 20px;
            width: 4px;
          }
        }

        /* ── Mobile Overlay Menu Styles ── */
        .legal-mobile-overlay {
          position: fixed;
          inset: 0;
          background: #fff;
          z-index: 100;
          display: flex;
          flex-direction: column;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }
        .legal-mobile-overlay.open {
          transform: translateY(0);
          pointer-events: auto;
        }
        @media (min-width: 768px) {
          .legal-mobile-overlay { display: none; }
        }
        .legal-mobile-overlay-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #E5E7EB;
        }
        .legal-mobile-overlay-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }
        .legal-mobile-overlay-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #F3F4F6;
          border: none;
          color: #4B5563;
          cursor: pointer;
        }
        .legal-mobile-overlay-content {
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
        }
        .legal-mobile-overlay-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          color: #4B5563;
          text-decoration: none;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
        }
        .legal-mobile-overlay-link--active {
          background: #F0F5FF;
          color: #1A6FD4;
          border-color: #DBEAFE;
          font-weight: 600;
        }
        .legal-mobile-overlay-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        /* ── FAQ item overrides ── */
        .faq-item {
          padding: 24px 20px;
          margin: 0 -20px 0;
          border-bottom: 1px solid #E5E7EB;
          border-radius: 0;
          transition: background 0.15s ease;
        }
        @media (min-width: 768px) {
          .faq-item {
            padding: 28px 24px;
            margin: 0 -24px 0;
          }
        }
        .faq-item:hover {
          background: #F9FAFB;
        }
        .faq-item:last-child { border-bottom: none; }
        .faq-item h3 {
          margin-top: 0 !important;
          color: #111827;
          font-weight: 700;
          font-size: 18px;
        }
        .faq-item p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
