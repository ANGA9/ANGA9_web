"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LANGUAGES, getLangOption, type LangCode } from "@/lib/i18n";

interface LanguageSelectorProps {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  /** "header" = desktop header beside breadcrumb, "mobile" = beside hamburger */
  variant?: "header" | "mobile";
}

export default function LanguageSelector({
  lang,
  setLang,
  variant = "header",
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = getLangOption(lang);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="lang-sel-root" data-variant={variant}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="lang-sel-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.label}`}
      >
        <Globe className="lang-sel-globe" strokeWidth={2} />
        <span className="lang-sel-label">{current.native}</span>
        <ChevronDown className={`lang-sel-chevron ${open ? "lang-sel-chevron--open" : ""}`} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="lang-sel-dropdown" role="listbox" aria-label="Select language">
          <div className="lang-sel-dropdown-header">
            <span>Select Language</span>
          </div>
          <div className="lang-sel-dropdown-list">
            {LANGUAGES.map((opt) => {
              const selected = opt.code === lang;
              return (
                <button
                  key={opt.code}
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setLang(opt.code);
                    setOpen(false);
                  }}
                  className={`lang-sel-option ${selected ? "lang-sel-option--active" : ""}`}
                  dir={opt.rtl ? "rtl" : "ltr"}
                >
                  <span className="lang-sel-option-native">{opt.native}</span>
                  <span className="lang-sel-option-label">{opt.label}</span>
                  {selected && <Check className="lang-sel-check" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .lang-sel-root {
          position: relative;
          z-index: 50;
        }

        .lang-sel-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .lang-sel-trigger:hover {
          border-color: #D1D5DB;
          background: #F9FAFB;
        }

        .lang-sel-globe {
          width: 15px;
          height: 15px;
          color: #1A6FD4;
          flex-shrink: 0;
        }

        .lang-sel-label {
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lang-sel-chevron {
          width: 13px;
          height: 13px;
          color: #9CA3AF;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .lang-sel-chevron--open {
          transform: rotate(180deg);
        }

        .lang-sel-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 240px;
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          box-shadow: 0 12px 28px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.06);
          overflow: hidden;
          animation: langDropIn 180ms ease-out;
        }

        @keyframes langDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .lang-sel-dropdown-header {
          padding: 12px 16px 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9CA3AF;
          border-bottom: 1px solid #F3F4F6;
        }

        .lang-sel-dropdown-list {
          max-height: 320px;
          overflow-y: auto;
          padding: 6px;
        }
        .lang-sel-dropdown-list::-webkit-scrollbar {
          width: 4px;
        }
        .lang-sel-dropdown-list::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 4px;
        }

        .lang-sel-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
          font-size: 14px;
          color: #374151;
        }
        .lang-sel-option:hover {
          background: #F3F4F6;
        }
        .lang-sel-option--active {
          background: #F0F5FF;
          color: #1A6FD4;
        }
        .lang-sel-option--active:hover {
          background: #E8F0FE;
        }

        .lang-sel-option-native {
          font-weight: 600;
          min-width: 60px;
        }
        .lang-sel-option-label {
          flex: 1;
          font-size: 12.5px;
          color: #9CA3AF;
          font-weight: 500;
        }
        .lang-sel-option--active .lang-sel-option-label {
          color: #6B9BD2;
        }

        .lang-sel-check {
          width: 16px;
          height: 16px;
          color: #1A6FD4;
          flex-shrink: 0;
        }

        /* Mobile variant: slightly smaller */
        .lang-sel-root[data-variant="mobile"] .lang-sel-trigger {
          padding: 5px 8px;
          border-radius: 8px;
          font-size: 12px;
          gap: 4px;
        }
        .lang-sel-root[data-variant="mobile"] .lang-sel-globe {
          width: 14px;
          height: 14px;
        }
        .lang-sel-root[data-variant="mobile"] .lang-sel-chevron {
          width: 12px;
          height: 12px;
        }

        @media (min-width: 768px) {
          .lang-sel-root[data-variant="mobile"] { display: none; }
        }
        @media (max-width: 767px) {
          .lang-sel-root[data-variant="header"] { display: none; }
        }
      `}</style>
    </div>
  );
}
