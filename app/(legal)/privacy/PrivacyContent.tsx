"use client";

import { Fragment, type ReactNode } from "react";
import LegalLayout from "@/components/legal/LegalLayout";
import { useLang } from "@/lib/i18n";
import { useLegalAudience } from "@/lib/legalAudience";
import {
  getPrivacyBody,
  getPrivacyMeta,
  PRIVACY_SECTION_KEYS,
  type PrivacyBlock,
} from "@/lib/legalTranslations/privacyBody";
import {
  getSellerPrivacyBody,
  getSellerPrivacyMeta,
  SELLER_PRIVACY_SECTION_KEYS,
} from "@/lib/legalTranslations/sellerPrivacyBody";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const BOLD_RE = /\*\*([^*]+)\*\*/g;

function renderInline(text: string): ReactNode {
  // First split on links, then within non-link segments split on **bold**.
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > lastIndex) {
      out.push(...renderBold(text.slice(lastIndex, m.index)));
    }
    out.push(
      <a key={`a-${m.index}`} href={m[2]} className="text-[#1A6FD4] underline font-medium hover:text-[#1557AB]">
        {m[1]}
      </a>,
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    out.push(...renderBold(text.slice(lastIndex)));
  }
  return <>{out.map((node, i) => <Fragment key={i}>{node}</Fragment>)}</>;
}

function renderBold(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  BOLD_RE.lastIndex = 0;
  while ((m = BOLD_RE.exec(text)) !== null) {
    if (m.index > lastIndex) out.push(text.slice(lastIndex, m.index));
    out.push(<strong key={`b-${m.index}`}>{m[1]}</strong>);
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return out;
}

function renderBlock(block: PrivacyBlock, idx: number): ReactNode {
  if (block.kind === "p") return <p key={idx}>{renderInline(block.text)}</p>;
  if (block.kind === "h3") return <h3 key={idx}>{block.text}</h3>;
  return (
    <ul key={idx}>
      {block.items.map((item, i) => (
        <li key={i}>{renderInline(item)}</li>
      ))}
    </ul>
  );
}

export default function PrivacyContent() {
  const { lang } = useLang();
  const { audience } = useLegalAudience();
  const dir = lang === "ur" ? "rtl" : "ltr";

  const customerMeta = getPrivacyMeta(lang);
  const sellerMeta = getSellerPrivacyMeta(lang);

  const isSeller = audience === "seller";
  const activeTitle = isSeller ? sellerMeta.title : customerMeta.title;

  return (
    <LegalLayout title={activeTitle} lastUpdated={isSeller ? "August 15, 2026" : "May 5, 2026"}>
      <div dir={dir}>
        {isSeller ? (
          <>
            {getSellerPrivacyBody(lang, "intro").map(renderBlock)}

            {SELLER_PRIVACY_SECTION_KEYS.map((key) => (
              <Fragment key={key}>
                <h2>{sellerMeta.headings[key]}</h2>
                {getSellerPrivacyBody(lang, key).map(renderBlock)}
              </Fragment>
            ))}
          </>
        ) : (
          <>
            {getPrivacyBody(lang, "intro").map(renderBlock)}

            {PRIVACY_SECTION_KEYS.map((key) => (
              <Fragment key={key}>
                <h2>{customerMeta.headings[key]}</h2>
                {getPrivacyBody(lang, key).map(renderBlock)}
              </Fragment>
            ))}
          </>
        )}
      </div>
    </LegalLayout>
  );
}
