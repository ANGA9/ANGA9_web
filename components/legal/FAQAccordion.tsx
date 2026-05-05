"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQAccordion({
  faqs,
}: {
  faqs: { q: string; a: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <div className="faq-accordion">
        {faqs.map((f, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`faq-accordion-item ${isOpen ? "faq-accordion-item--open" : ""}`}
            >
              <button
                className="faq-accordion-trigger"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <div className="faq-accordion-q-wrap">
                  <HelpCircle
                    className="faq-accordion-q-icon"
                    strokeWidth={2}
                  />
                  <span className="faq-accordion-q">{f.q}</span>
                </div>
                <ChevronDown
                  className={`faq-accordion-chevron ${isOpen ? "faq-accordion-chevron--open" : ""}`}
                  strokeWidth={2.2}
                />
              </button>
              <div
                className="faq-accordion-body"
                style={{
                  maxHeight: isOpen ? "300px" : "0px",
                  opacity: isOpen ? 1 : 0,
                  paddingTop: isOpen ? "0px" : "0px",
                  paddingBottom: isOpen ? "16px" : "0px",
                }}
              >
                <p className="faq-accordion-a">{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .faq-accordion {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }
        .faq-accordion-item {
          border: 1px solid #E8EEF4;
          border-radius: 12px;
          background: #FAFCFF;
          overflow: hidden;
          transition: all 0.25s ease;
        }
        .faq-accordion-item:hover {
          border-color: rgba(26,111,212,0.2);
        }
        .faq-accordion-item--open {
          background: #fff;
          border-color: rgba(26,111,212,0.2);
          box-shadow: 0 2px 8px rgba(26,111,212,0.06);
        }
        .faq-accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          background: none;
          border: none;
          cursor: pointer;
          gap: 12px;
          text-align: left;
        }
        .faq-accordion-q-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .faq-accordion-q-icon {
          width: 18px;
          height: 18px;
          color: #1A6FD4;
          flex-shrink: 0;
          opacity: 0.6;
        }
        .faq-accordion-item--open .faq-accordion-q-icon {
          opacity: 1;
        }
        .faq-accordion-q {
          font-size: 14.5px;
          font-weight: 600;
          color: #1A1A2E;
          line-height: 1.4;
        }
        .faq-accordion-chevron {
          width: 18px;
          height: 18px;
          color: #9CA3AF;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), color 0.2s;
        }
        .faq-accordion-chevron--open {
          transform: rotate(180deg);
          color: #1A6FD4;
        }
        .faq-accordion-body {
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1),
                      opacity 0.25s ease,
                      padding 0.35s ease;
          padding-left: 18px;
          padding-right: 18px;
        }
        .faq-accordion-a {
          font-size: 14px;
          line-height: 1.7;
          color: #4B5563;
          margin: 0;
          padding-left: 28px;
          border-left: 2px solid #EAF2FF;
        }
        @media (min-width: 768px) {
          .faq-accordion-trigger { padding: 18px 22px; }
          .faq-accordion-body { padding-left: 22px; padding-right: 22px; }
          .faq-accordion-q { font-size: 15px; }
          .faq-accordion-a { font-size: 14.5px; }
        }
      `}</style>
    </>
  );
}
