"use client";

import {
  Headphones,
  Store,
  Handshake,
  Newspaper,
  Mail,
  Clock,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export default function ContactCards() {
  return (
    <>
      {/* ── Primary: Customer Support (hero-style) ── */}
      <div className="cc-hero">
        <div className="cc-hero-icon-wrap">
          <Headphones className="cc-hero-icon" strokeWidth={2} />
        </div>
        <div className="cc-hero-body">
          <h3 className="cc-hero-title">Customer Support</h3>
          <p className="cc-hero-desc">
            Order tracking, payments, shipping, refunds — we&apos;ve got you.
          </p>
          <a href="mailto:support@anga9.com" className="cc-hero-cta">
            <Mail style={{ width: 16, height: 16 }} strokeWidth={2} />
            support@anga9.com
            <ArrowRight style={{ width: 14, height: 14, marginLeft: "auto" }} />
          </a>
          <div className="cc-hero-meta">
            <Clock style={{ width: 13, height: 13, color: "#9CA3AF", flexShrink: 0 }} strokeWidth={2} />
            <span>Mon – Sat, 10:00 AM – 7:00 PM IST</span>
          </div>
        </div>
      </div>

      {/* ── Secondary channels ── */}
      <div className="cc-channels">
        <ChannelRow
          icon={Store}
          color="#059669"
          bgColor="#ECFDF5"
          title="Seller Support"
          desc="Onboarding, listings, payouts, or growth queries"
          link={{ label: "seller.anga9.com", href: "https://seller.anga9.com/sell-on-anga9", external: true }}
          email="support@anga9.com"
        />
        <div className="cc-divider" />
        <ChannelRow
          icon={Handshake}
          color="#7C3AED"
          bgColor="#F5F3FF"
          title="Business & Partnerships"
          desc="Logistics, brand collaborations, bulk procurement"
          email="support@anga9.com"
        />
        <div className="cc-divider" />
        <ChannelRow
          icon={Newspaper}
          color="#D97706"
          bgColor="#FFFBEB"
          title="Press & Media"
          desc="Press inquiries, interviews, company info"
          email="support@anga9.com"
        />
      </div>

      <style>{`
        /* ─── Hero card ─── */
        .cc-hero {
          display: flex;
          gap: 18px;
          padding: 24px;
          border-radius: 16px;
          background: linear-gradient(135deg, #EBF3FF 0%, #F8FAFF 100%);
          border: 1px solid #D6E4F0;
          margin: 24px 0 20px;
        }
        .cc-hero-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #1A6FD4;
          flex-shrink: 0;
        }
        .cc-hero-icon {
          width: 26px;
          height: 26px;
          color: #FFF;
        }
        .cc-hero-body {
          flex: 1;
          min-width: 0;
        }
        .cc-hero-title {
          font-size: 17px;
          font-weight: 800;
          color: #1A1A2E;
          margin: 0 0 4px 0 !important;
          border-bottom: none !important;
          padding-bottom: 0 !important;
        }
        .cc-hero-title::before { display: none !important; }
        .cc-hero-desc {
          font-size: 13.5px;
          color: #4B5563;
          margin: 0 0 14px 0 !important;
          line-height: 1.5;
        }
        .cc-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          background: #1A6FD4;
          color: #FFF !important;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none !important;
          border-bottom: none !important;
          transition: all 0.2s ease;
          width: 100%;
          max-width: 320px;
        }
        .cc-hero-cta:hover {
          background: #1559B0;
          box-shadow: 0 4px 12px rgba(26,111,212,0.25);
        }
        .cc-hero-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          font-size: 12px;
          color: #6B7280;
        }

        /* ─── Channel list ─── */
        .cc-channels {
          border: 1px solid #E8EEF4;
          border-radius: 14px;
          background: #FAFCFF;
          margin: 0 0 28px;
          overflow: hidden;
        }
        .cc-divider {
          height: 1px;
          background: #E8EEF4;
          margin: 0 18px;
        }
        .cc-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px;
          transition: background 0.15s ease;
        }
        .cc-row:hover {
          background: #F0F5FF;
        }
        .cc-row-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .cc-row-icon {
          width: 20px;
          height: 20px;
        }
        .cc-row-body {
          flex: 1;
          min-width: 0;
        }
        .cc-row-title {
          font-size: 14px;
          font-weight: 700;
          color: #1A1A2E;
          margin: 0 0 2px 0 !important;
          border-bottom: none !important;
          padding-bottom: 0 !important;
        }
        .cc-row-title::before { display: none !important; }
        .cc-row-desc {
          font-size: 12px;
          color: #6B7280;
          margin: 0 0 8px 0 !important;
          line-height: 1.4;
        }
        .cc-row-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cc-row-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 500;
          color: #1A6FD4 !important;
          text-decoration: none !important;
          border-bottom: none !important;
        }
        .cc-row-link:hover {
          text-decoration: underline !important;
        }
        .cc-row-link-icon {
          width: 13px;
          height: 13px;
          color: #9CA3AF;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .cc-hero {
            flex-direction: column;
            gap: 14px;
            padding: 20px;
          }
          .cc-hero-icon-wrap {
            width: 44px;
            height: 44px;
          }
          .cc-hero-icon {
            width: 22px;
            height: 22px;
          }
          .cc-hero-cta {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}

/* ─── Sub-component: Channel Row ─── */
function ChannelRow({
  icon: Icon,
  color,
  bgColor,
  title,
  desc,
  link,
  email,
}: {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  title: string;
  desc: string;
  link?: { label: string; href: string; external?: boolean };
  email?: string;
}) {
  return (
    <div className="cc-row">
      <div className="cc-row-icon-wrap" style={{ background: bgColor }}>
        <Icon className="cc-row-icon" style={{ color }} strokeWidth={2} />
      </div>
      <div className="cc-row-body">
        <h3 className="cc-row-title">{title}</h3>
        <p className="cc-row-desc">{desc}</p>
        <div className="cc-row-links">
          {link && (
            <a href={link.href} className="cc-row-link" target={link.external ? "_blank" : undefined} rel={link.external ? "noopener noreferrer" : undefined}>
              <ExternalLink className="cc-row-link-icon" strokeWidth={2} />
              {link.label}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="cc-row-link">
              <Mail className="cc-row-link-icon" strokeWidth={2} />
              {email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
