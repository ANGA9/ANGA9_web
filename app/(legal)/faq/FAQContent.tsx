"use client";

import { Fragment, type ReactNode } from "react";
import LegalLayout from "@/components/legal/LegalLayout";
import FAQAccordion from "@/components/legal/FAQAccordion";
import { useLang } from "@/lib/i18n";
import { getFAQList, getFAQMeta } from "@/lib/legalTranslations/faqBody";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderInline(text: string): ReactNode {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > lastIndex) out.push(text.slice(lastIndex, m.index));
    out.push(
      <a key={`a-${m.index}`} href={m[2]}>
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
  const meta = getFAQMeta(lang);
  const faqs = getFAQList(lang);
  const dir = lang === "ur" ? "rtl" : "ltr";

  return (
    <LegalLayout title={meta.title} lastUpdated="May 5, 2026">
      <div dir={dir}>
        <p>{renderInline(meta.intro)}</p>
        <FAQAccordion faqs={faqs} />
      </div>
    </LegalLayout>
  );
}
