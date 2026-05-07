"use client";

import { Fragment, type ReactNode } from "react";
import LegalLayout from "@/components/legal/LegalLayout";
import { useLang } from "@/lib/i18n";
import { getTermsT } from "@/lib/termsTranslations";
import { getTermsBody, type TermsSectionKey } from "@/lib/legalTranslations/termsBody";

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
      <a key={`${match.index}-${match[2]}`} href={match[2]}>
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
  const t = getTermsT(lang);
  const dir = lang === "ur" ? "rtl" : "ltr";

  return (
    <LegalLayout title={t.title} lastUpdated="May 5, 2026">
      <div dir={dir}>
        <p>{t.intro}</p>

        {SECTION_KEYS.map((key) => {
          const body = getTermsBody(lang, key);
          return (
            <Fragment key={key}>
              <h2>{t.heading(key)}</h2>
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
      </div>
    </LegalLayout>
  );
}
