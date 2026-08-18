"use client";

import { Fragment, type ReactNode } from "react";
import LegalLayout from "@/components/legal/LegalLayout";
import ContactCards from "@/components/legal/ContactCards";
import { useLang } from "@/lib/i18n";
import { useLegalAudience } from "@/lib/legalAudience";
import { getContactT } from "@/lib/legalTranslations/contactBody";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderInline(text: string): ReactNode {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > lastIndex) out.push(text.slice(lastIndex, m.index));
    out.push(
      <a key={`a-${m.index}`} href={m[2]} className="text-[#1A6FD4] underline font-medium hover:text-[#1557AB]">
        {m[1]}
      </a>,
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return <>{out.map((node, i) => <Fragment key={i}>{node}</Fragment>)}</>;
}

export default function ContactContent() {
  const { lang } = useLang();
  const { audience } = useLegalAudience();
  const t = getContactT(lang);
  const dir = lang === "ur" ? "rtl" : "ltr";

  const isSeller = audience === "seller";
  const supportEmail = isSeller ? "sellersupport@anga9.com" : "support@anga9.com";
  const grievanceEmail = isSeller ? "grievance@anga9.com" : "grievance@anga9.com";

  return (
    <LegalLayout title={isSeller ? "Seller Support & Grievance Contact" : t.title} lastUpdated={isSeller ? "August 15, 2026" : "May 5, 2026"}>
      <div dir={dir}>
        <p>
          {isSeller
            ? "Need assistance with your Seller Portal account, wholesale catalog listings, courier dispatch pickups, or payouts? Contact our dedicated Seller Operations Desk below."
            : t.intro}
        </p>

        <ContactCards t={{ hero: t.hero, channels: t.channels }} />

        <h2>{t.grievance.heading}</h2>
        <p>{t.grievance.intro}</p>
        <p>
          <strong>{t.grievance.nameLabel}</strong> {t.grievance.nameValue}
          <br />
          <strong>{t.grievance.emailLabel}</strong>{" "}
          <a href={`mailto:${grievanceEmail}`} className="text-[#1A6FD4] underline font-medium">{grievanceEmail}</a>
          <br />
          <strong>Merchant Support Email:</strong>{" "}
          <a href={`mailto:${supportEmail}`} className="text-[#1A6FD4] underline font-medium">{supportEmail}</a>
          <br />
          <strong>{t.grievance.hoursLabel}</strong> {t.grievance.hoursValue}
        </p>

        <h2>{t.office.heading}</h2>
        <p>
          {t.office.line1}
          <br />
          {t.office.line2}
        </p>

        <hr />

        <p>{renderInline(t.faqLine)}</p>
      </div>
    </LegalLayout>
  );
}
