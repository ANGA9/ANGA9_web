"use client";

import { Fragment, type ReactNode } from "react";
import LegalLayout from "@/components/legal/LegalLayout";
import FAQAccordion from "@/components/legal/FAQAccordion";
import { useLang } from "@/lib/i18n";
import { useLegalAudience } from "@/lib/legalAudience";
import { getFAQList, getFAQMeta } from "@/lib/legalTranslations/faqBody";
import { getSellerFAQList, getSellerFAQMeta } from "@/lib/legalTranslations/sellerFaqBody";

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

export default function FAQContent() {
  const { lang } = useLang();
  const { audience } = useLegalAudience();
  const dir = lang === "ur" ? "rtl" : "ltr";

  const customerMeta = getFAQMeta(lang);
  const sellerMeta = getSellerFAQMeta(lang);

  const isSeller = audience === "seller";
  const activeTitle = isSeller ? sellerMeta.title : customerMeta.title;
  const activeFaqs = isSeller ? getSellerFAQList(lang) : getFAQList(lang);
  const activeIntro = isSeller ? sellerMeta.intro : customerMeta.intro;

  return (
    <LegalLayout title={activeTitle} lastUpdated={isSeller ? "August 15, 2026" : "May 5, 2026"}>
      <div dir={dir}>
        <p>{renderInline(activeIntro)}</p>
        <FAQAccordion faqs={activeFaqs} />
      </div>
    </LegalLayout>
  );
}
