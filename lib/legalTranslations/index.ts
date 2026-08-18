import { CHROME } from "./chrome";
import type { LangCode } from "@/lib/i18n";
import type { LegalChromeStrings } from "./types";

export function getChrome(lang: LangCode): LegalChromeStrings {
  return CHROME[lang] ?? CHROME.en;
}

export { CHROME } from "./chrome";
export * from "./types";
export * from "./sellerPrivacyBody";
export * from "./sellerTermsBody";
export * from "./sellerShippingBody";
export * from "./sellerReturnsBody";
export * from "./sellerCancellationBody";
export * from "./sellerFaqBody";
