import type { LangCode } from "@/lib/i18n";

export interface LegalChromeStrings {
  home: string;
  lastUpdated: string;
  quickNavigation: string;
  morePolicies: string;
  selectLanguage: string;
  tagline: string;
  copyright: string;
  mtDisclaimer: string;
  navLabels: Record<string, string>;
  pageTitles: Record<string, string>;
}

export type LegalChromeDict = Record<LangCode, LegalChromeStrings>;

export interface LegalSeeAlso {
  label: string;
  href: string;
}

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
  seeAlso?: LegalSeeAlso[];
}

export interface LegalPageStrings {
  intro: string;
  sections: LegalSection[];
  contact?: { label: string; href: string };
}

export type LegalPageDict = Record<LangCode, LegalPageStrings>;

export type LegalPageSlug = "terms";
