"use client";

import { Fragment, type ReactNode } from "react";
import LegalLayout from "@/components/legal/LegalLayout";
import { useLang } from "@/lib/i18n";
import { useLegalAudience } from "@/lib/legalAudience";
import { getTermsT } from "@/lib/termsTranslations";
import { getTermsBody, type TermsSectionKey } from "@/lib/legalTranslations/termsBody";
import {
  getSellerTermsBody,
  getSellerTermsMeta,
  SELLER_TERMS_SECTION_KEYS,
} from "@/lib/legalTranslations/sellerTermsBody";

const SECTION_KEYS: TermsSectionKey[] = [
  "s1", "s2", "s3", "s4", "s5", "s6", "s7",
  "s8", "s9", "s10", "s11", "s12", "s13", "s14",
];

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a key={`${match.index}-${match[2]}`} href={match[2]} className="text-[#1A6FD4] underline font-medium hover:text-[#1557AB]">
        {match[1]}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length === 1 ? parts[0] : <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

export default function TermsContent() {
  const { lang } = useLang();
  const { audience } = useLegalAudience();
  const dir = lang === "ur" ? "rtl" : "ltr";

  const customerT = getTermsT(lang);
  const sellerT = getSellerTermsMeta(lang);

  const isSeller = audience === "seller";
  const activeTitle = isSeller ? sellerT.title : customerT.title;

  return (
    <LegalLayout title={activeTitle} lastUpdated={isSeller ? "August 15, 2026" : "May 5, 2026"}>
      <div dir={dir}>
        {isSeller ? (
          <>
            <p>{sellerT.intro}</p>

            {SELLER_TERMS_SECTION_KEYS.map((key) => {
              const body = getSellerTermsBody(lang, key);
              return (
                <Fragment key={key}>
                  <h2>{sellerT.headings[key]}</h2>
                  {body.listIntro && <p>{body.listIntro}</p>}
                  {body.paragraphs.map((para, i) => (
                    <p key={i}>{renderInline(para)}</p>
                  ))}
                  {body.list && body.list.length > 0 && (
                    <ul>
                      {body.list.map((item, i) => (
                        <li key={i}>{renderInline(item)}</li>
                      ))}
                    </ul>
                  )}
                </Fragment>
              );
            })}
          </>
        ) : (
          <>
            <p>{customerT.intro}</p>

            {SECTION_KEYS.map((key) => {
              const body = getTermsBody(lang, key);
              return (
                <Fragment key={key}>
                  <h2>{customerT.heading(key)}</h2>
                  {body.listIntro && <p>{body.listIntro}</p>}
                  {body.paragraphs.map((para, i) => (
                    <p key={i}>{renderInline(para)}</p>
                  ))}
                  {body.list && body.list.length > 0 && (
                    <ul>
                      {body.list.map((item, i) => (
                        <li key={i}>{renderInline(item)}</li>
                      ))}
                    </ul>
                  )}
                </Fragment>
              );
            })}
          </>
        )}
      </div>
    </LegalLayout>
  );
}
