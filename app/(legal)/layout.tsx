"use client";

import { useState, useEffect } from "react";
import { type LangCode, DEFAULT_LANG, STORAGE_KEY, LangContext } from "@/lib/i18n";

export default function LegalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (saved) setLangState(saved);
  }, []);

  const setLang = (l: LangCode) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}
