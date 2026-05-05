"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const NAV = [
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/returns", label: "Returns & Refunds" },
  { href: "/cancellation", label: "Cancellation Policy" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact Us" },
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

  return (
    <div className="min-h-screen bg-white">
      {/* ══════════ Top header ══════════ */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-[#EEF1F5]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-[56px] md:h-[64px] flex items-center gap-3 md:gap-4">
          <button
            onClick={() => (history.length > 1 ? router.back() : router.push("/"))}
            aria-label="Go back"
            className="-ml-1 p-2 rounded-full hover:bg-[#F4F6F9] transition-colors"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-[#1A1A2E]" strokeWidth={2.2} />
          </button>
          <Link
            href="/"
            className="text-[15px] md:text-[17px] font-bold tracking-tight text-[#1A1A2E]"
          >
            ANGA9
          </Link>
          <span className="hidden md:inline text-[13px] text-[#9CA3AF]">/</span>
          <span className="hidden md:inline text-[13px] text-[#4B5563] truncate">
            {title}
          </span>
        </div>
      </header>

      {/* ══════════ Body ══════════ */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 md:gap-14">
          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden md:block">
            <div className="sticky top-[88px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
                Policies
              </p>
              <nav className="flex flex-col">
                {NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-[13.5px] py-2 pl-3 -ml-3 border-l-2 transition-colors ${
                        active
                          ? "border-[#1A6FD4] text-[#1A6FD4] font-semibold"
                          : "border-transparent text-[#4B5563] hover:text-[#1A1A2E] hover:border-[#E5E7EB]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="min-w-0">
            <h1 className="text-[26px] md:text-[34px] font-bold tracking-tight text-[#1A1A2E] leading-tight">
              {title}
            </h1>
            <p className="mt-2 text-[12.5px] text-[#9CA3AF]">
              Last updated: {lastUpdated}
            </p>
            <div className="mt-7 md:mt-9 legal-prose">{children}</div>

            {/* ── Mobile-only nav at bottom ── */}
            <div className="md:hidden mt-14 pt-8 border-t border-[#EEF1F5]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
                More policies
              </p>
              <div className="flex flex-col">
                {NAV.filter((i) => i.href !== pathname).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[14px] py-3 text-[#1A1A2E] border-b border-[#F4F6F9]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ══════════ Footer ══════════ */}
      <footer className="border-t border-[#EEF1F5] mt-12">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-7 text-center">
          <p className="text-[12px] text-[#9CA3AF]">
            © {new Date().getFullYear()} ANGA9. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ══════════ Prose styles ══════════ */}
      <style jsx global>{`
        .legal-prose {
          font-size: 15px;
          line-height: 1.75;
          color: #2C3242;
        }
        .legal-prose h2 {
          font-size: 19px;
          font-weight: 700;
          color: #1A1A2E;
          margin-top: 36px;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .legal-prose h2:first-child {
          margin-top: 0;
        }
        .legal-prose h3 {
          font-size: 15.5px;
          font-weight: 600;
          color: #1A1A2E;
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .legal-prose p {
          margin-bottom: 14px;
        }
        .legal-prose ul,
        .legal-prose ol {
          margin: 0 0 16px 1.25rem;
        }
        .legal-prose ul {
          list-style: disc;
        }
        .legal-prose ol {
          list-style: decimal;
        }
        .legal-prose li {
          margin-bottom: 6px;
        }
        .legal-prose a {
          color: #1A6FD4;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .legal-prose strong {
          font-weight: 600;
          color: #1A1A2E;
        }
        .legal-prose hr {
          border: none;
          border-top: 1px solid #EEF1F5;
          margin: 28px 0;
        }
        @media (max-width: 767px) {
          .legal-prose {
            font-size: 14.5px;
            line-height: 1.7;
          }
          .legal-prose h2 {
            font-size: 17px;
            margin-top: 28px;
          }
        }
      `}</style>
    </div>
  );
}
