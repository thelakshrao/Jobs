"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo3 from "@/images/logo3.png";
import { FaLinkedinIn, FaXTwitter, FaInstagram } from "react-icons/fa6";
import { IoCallOutline, IoLocationOutline } from "react-icons/io5";
import { FiArrowUpRight } from "react-icons/fi";
import PolicyPanel from "@/components/Policypanel";
import policyContent from "@/components/Policycontent";

const BRAND_BLUE = "#004AAC";
const EMPLOYER_URL = "https://www.thejobsabroad.com/employer";

const ADDRESS = "30 Eglinton Ave W, Mississauga, ON L5R 3E7";
const PHONE_DISPLAY = "+1 437-967-3178";
const PHONE_HREF = "tel:+14379673178";

const pageLinks = [
  { label: "About Us", href: "#about" },
  { label: "Premium Services", href: "#premium" },
  { label: "Why JobsAbroad", href: "#why-us" },
  { label: "Contact Support", href: "#contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy", panelKey: "privacy" },
  { label: "Terms of Service", href: "/terms", panelKey: "terms" },
  { label: "Refund Policy", href: "/refund", panelKey: "refund" },
  { label: "Cookie Settings", href: "/cookies", panelKey: "cookies" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [activePanel, setActivePanel] = useState(null);

  const handleTagClick = (e, tag) => {
    if (tag.panelKey) {
      e.preventDefault();
      setActivePanel(tag.panelKey);
      return;
    }
    if (!tag.href.startsWith("#")) return;
    const target = document.querySelector(tag.href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderLinks = (links) => (
    <div className="flex flex-wrap gap-2.5">
      {links.map((tag) => (
        <Link
          key={tag.label}
          href={tag.href}
          onClick={(e) => handleTagClick(e, tag)}
          className="whitespace-nowrap text-xs sm:text-sm text-white/85 border border-white/25 rounded-full px-4 py-1.5 hover:bg-white/10 hover:text-white transition-colors"
        >
          {tag.label}
        </Link>
      ))}
    </div>
  );

  return (
    <footer className="bg-white text-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.3fr]">
        {/* Left: brand, contact, socials */}
        <div className="p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-center gap-4">
          <Link href="/">
            <Image
              src={logo3}
              alt="Jobs Abroad"
              height={32}
              className="h-10 sm:h-12 w-auto"
            />
          </Link>
          <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
            Connecting global talent with world-class opportunities. Your
            journey to a premium international career starts here.
          </p>

          <div className="space-y-2.5 text-sm text-slate-600">
            <div className="flex items-start gap-2.5">
              <IoLocationOutline
                size={18}
                className="mt-0.5 shrink-0"
                style={{ color: BRAND_BLUE }}
              />
              <span className="max-w-xs">{ADDRESS}</span>
            </div>
            <a
              href={PHONE_HREF}
              className="flex items-center gap-2.5 hover:text-slate-900 transition-colors"
            >
              <IoCallOutline
                size={18}
                className="shrink-0"
                style={{ color: BRAND_BLUE }}
              />
              <span>{PHONE_DISPLAY}</span>
            </a>
          </div>

          <div className="flex gap-3">
            {[FaLinkedinIn, FaXTwitter, FaInstagram].map((Icon, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-85 cursor-pointer"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                <Icon size={13} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: links */}
        <div
          className="p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-center gap-6"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          <div className="space-y-3">
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-widest text-white/70">
              Explore
            </h4>
            {renderLinks(pageLinks)}
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-widest text-white/70">
              Legal
            </h4>
            {renderLinks(legalLinks)}
          </div>

          <a
            href={EMPLOYER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group self-start inline-flex items-center gap-4 bg-white text-sm font-bold rounded-full pl-6 pr-2 py-2 hover:bg-white/90 transition-colors"
            style={{ color: BRAND_BLUE }}
          >
            Post a Job
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-white group-hover:rotate-45 transition-transform"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              <FiArrowUpRight size={14} />
            </span>
          </a>

          <p className="italic text-sm leading-relaxed text-white/85 max-w-md">
            "The only limit to our realization of tomorrow will be our doubts
            of today. Move beyond borders."{" "}
            <span className="not-italic text-xs font-bold uppercase tracking-widest text-white/55">
              — Global Career Vision
            </span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] font-medium text-slate-400 uppercase tracking-widest text-center">
        <p>© {currentYear} Jobs Abroad. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="cursor-pointer transition-colors hover:text-slate-700">
            Designed for Excellence
          </span>
          <span className="cursor-pointer transition-colors hover:text-slate-700">
            Global Reach
          </span>
        </div>
      </div>

      <PolicyPanel
        content={activePanel ? policyContent[activePanel] : null}
        onClose={() => setActivePanel(null)}
      />
    </footer>
  );
};

export default Footer;