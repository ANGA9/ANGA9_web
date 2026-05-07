import { CHROME } from "./chrome";
import type { LangCode } from "@/lib/i18n";
import type { LegalChromeStrings } from "./types";

export function getChrome(lang: LangCode): LegalChromeStrings {
  return CHROME[lang] ?? CHROME.en;
}

export { CHROME } from "./chrome";
export type { LegalChromeStrings, LegalSection, LegalPageStrings, LegalSeeAlso, LegalPageSlug } from "./types";
