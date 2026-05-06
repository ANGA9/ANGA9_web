"use client";

import { createContext, useContext } from "react";

export type LangCode =
  | "en"
  | "hi"
  | "bn"
  | "ta"
  | "te"
  | "mr"
  | "kn"
  | "pa"
  | "gu"
  | "ml"
  | "ur";

export interface LangOption {
  code: LangCode;
  label: string; // English label
  native: string; // Native script label
  rtl?: boolean;
}

export const LANGUAGES: LangOption[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "ur", label: "Urdu", native: "اردو", rtl: true },
];

export const DEFAULT_LANG: LangCode = "en";
export const STORAGE_KEY = "anga9.lang";

export interface LangContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
}

export const LangContext = createContext<LangContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
});

export function useLang() {
  return useContext(LangContext);
}

export function getLangOption(code: LangCode): LangOption {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
