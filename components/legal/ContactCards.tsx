"use client";

import {
  Headphones,
  Store,
  Handshake,
  Newspaper,
  Mail,
  Clock,
  ExternalLink,
} from "lucide-react";

const CONTACTS = [
  {
    title: "Customer Support",
    desc: "Order, payment, shipping, or refund queries",
    icon: Headphones,
    color: "#1A6FD4",
    bgColor: "#EAF2FF",
    details: [
      {
        icon: Mail,
        label: "support@anga9.com",
        href: "mailto:support@anga9.com",
      },
      { icon: Clock, label: "Mon–Sat, 10:00 AM – 7:00 PM IST" },
    ],
    tip: 'Fastest: use "Contact Seller" or "Need Help" from your Orders page',
  },
  {
    title: "Seller Support",
    desc: "Onboarding, listings, payouts, or growth queries",
    icon: Store,
    color: "#059669",
    bgColor: "#ECFDF5",
    details: [
      {
        icon: ExternalLink,
        label: "seller.anga9.com",
        href: "https://seller.anga9.com/sell-on-anga9",
      },
      {
        icon: Mail,
        label: "support@anga9.com",
        href: "mailto:support@anga9.com",
      },
    ],
  },
  {
    title: "Business & Partnerships",
    desc: "Logistics, brand collaborations, bulk procurement",
    icon: Handshake,
    color: "#7C3AED",
    bgColor: "#F5F3FF",
    details: [
      {
        icon: Mail,
        label: "support@anga9.com",
        href: "mailto:support@anga9.com",
      },
    ],
  },
  {
    title: "Press & Media",
    desc: "Press inquiries, interviews, company info",
    icon: Newspaper,
    color: "#D97706",
    bgColor: "#FFFBEB",
    details: [
      {
        icon: Mail,
        label: "support@anga9.com",
        href: "mailto:support@anga9.com",
      },
    ],
  },
];

export default function ContactCards() {
  return (
    <>
      <div className="contact-cards-grid">
        {CONTACTS.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="contact-card">
              <div
                className="contact-card-icon-wrap"
                style={{ background: c.bgColor }}
              >
                <Icon
                  className="contact-card-icon"
                  style={{ color: c.color }}
                  strokeWidth={2}
                />
              </div>
              <div className="contact-card-body">
                <h3 className="contact-card-title">{c.title}</h3>
                <p className="contact-card-desc">{c.desc}</p>
                <div className="contact-card-details">
                  {c.details.map((d, i) => {
                    const DIcon = d.icon;
                    return (
                      <div key={i} className="contact-card-detail">
                        <DIcon
                          className="contact-card-detail-icon"
                          strokeWidth={2}
                        />
                        {d.href ? (
                          <a href={d.href} className="contact-card-detail-link">
                            {d.label}
                          </a>
                        ) : (
                          <span className="contact-card-detail-text">
                            {d.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {c.tip && <p className="contact-card-tip">💡 {c.tip}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .contact-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin: 24px 0 32px;
        }
        @media (min-width: 640px) {
          .contact-cards-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .contact-card {
          display: flex;
          gap: 14px;
          padding: 18px;
          border-radius: 14px;
          border: 1px solid #E8EEF4;
          background: #FAFCFF;
          transition: all 0.2s ease;
        }
        .contact-card:hover {
          border-color: rgba(26,111,212,0.15);
          box-shadow: 0 4px 16px rgba(26,111,212,0.06);
          transform: translateY(-2px);
        }
        .contact-card-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          flex-shrink: 0;
        }
        .contact-card-icon {
          width: 22px;
          height: 22px;
        }
        .contact-card-body {
          flex: 1;
          min-width: 0;
        }
        .contact-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #1A1A2E;
          margin: 0 0 3px 0 !important;
          border-bottom: none !important;
          padding-bottom: 0 !important;
        }
        .contact-card-title::before {
          display: none !important;
        }
        .contact-card-desc {
          font-size: 12.5px;
          color: #6B7280;
          margin: 0 0 10px 0 !important;
          line-height: 1.4;
        }
        .contact-card-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .contact-card-detail {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .contact-card-detail-icon {
          width: 13px;
          height: 13px;
          color: #9CA3AF;
          flex-shrink: 0;
        }
        .contact-card-detail-link {
          font-size: 12.5px;
          color: #1A6FD4 !important;
          text-decoration: none !important;
          border-bottom: none !important;
          font-weight: 500;
        }
        .contact-card-detail-link:hover {
          text-decoration: underline !important;
        }
        .contact-card-detail-text {
          font-size: 12.5px;
          color: #4B5563;
        }
        .contact-card-tip {
          font-size: 11.5px;
          color: #6B7280;
          background: #F0F5FF;
          padding: 6px 10px;
          border-radius: 8px;
          margin: 10px 0 0 0 !important;
          line-height: 1.4;
        }
      `}</style>
    </>
  );
}
