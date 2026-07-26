"use client";

import React, { useEffect } from "react";

const BRAND_BLUE = "#004AAC";

const PolicyPanel = ({ content, onClose }) => {
  const isOpen = !!content;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-999998 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={content?.title}
        className={`fixed top-0 right-0 h-full w-full sm:w-105 bg-white z-999999 shadow-2xl
          transform transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div
          className="px-6 py-5 flex items-start justify-between gap-4"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          <div>
            <h2 className="text-white text-lg font-bold">{content?.title}</h2>
            {content?.updated && (
              <p className="text-white/70 text-xs mt-1">{content.updated}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white text-2xl leading-none mt-0.5"
            type="button"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {content?.sections?.map((section, idx) => (
            <div key={idx} className="mb-5">
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                {section.heading}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full text-white font-semibold text-sm rounded-full py-3 transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND_BLUE }}
            type="button"
          >
            Okay
          </button>
        </div>
      </aside>
    </>
  );
};

export default PolicyPanel;
