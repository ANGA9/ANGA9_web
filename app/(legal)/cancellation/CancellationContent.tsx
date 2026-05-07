"use client";

import { Fragment, type ReactNode } from "react";
import LegalLayout from "@/components/legal/LegalLayout";
import { useLang } from "@/lib/i18n";
import {
  getCancellationBody,
  getCancellationMeta,
  CANCELLATION_SECTION_KEYS,
  type CancellationBlock,
} from "@/lib/legalTranslations/cancellationBody";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const BOLD_RE = /\*\*([^*]+)\*\*/g;

function renderInline(text: string): ReactNode {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > lastIndex) {
      out.push(...renderBold(text.slice(lastIndex, m.index)));
    }
    out.push(
      <a key={`a-${m.index}`} href={m[2]}>
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

function renderBlock(block: CancellationBlock, idx: number): ReactNode {
  if (block.kind === "p") return <p key={idx}>{renderInline(block.text)}</p>;
  if (block.kind === "h3") return <h3 key={idx}>{block.text}</h3>;
  if (block.kind === "ol") {
    return (
      <ol key={idx}>
        {block.items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ol>
    );
  }
  return (
    <ul key={idx}>
      {block.items.map((item, i) => (
        <li key={i}>{renderInline(item)}</li>
      ))}
    </ul>
  );
}

export default function CancellationContent() {
  const { lang } = useLang();
  const meta = getCancellationMeta(lang);
  const dir = lang === "ur" ? "rtl" : "ltr";

  return (
    <LegalLayout title={meta.title} lastUpdated="May 5, 2026">
      <div dir={dir}>
        {getCancellationBody(lang, "intro").map(renderBlock)}

        {CANCELLATION_SECTION_KEYS.map((key) => (
          <Fragment key={key}>
            <h2>{meta.headings[key]}</h2>
            {getCancellationBody(lang, key).map(renderBlock)}
          </Fragment>
        ))}
      </div>
    </LegalLayout>
  );
}
