"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo3 from "@/images/logo3.png";
import { FaLinkedinIn, FaXTwitter, FaInstagram } from "react-icons/fa6";
import {
  IoCallOutline,
  IoLocationOutline,
  IoMailOutline,
} from "react-icons/io5";
import { FiArrowUpRight } from "react-icons/fi";
import PolicyPanel from "@/components/Policypanel";
import policyContent from "@/components/Policycontent";

const BRAND_BLUE = "#004AAC";
const EMPLOYER_URL = "https://www.thejobsabroad.com/employer";

const ADDRESS = "30 Eglinton Ave W, Mississauga, ON L5R 3E7, Canada";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(ADDRESS);
const PHONE_DISPLAY = "+1 437-967-3178";
const PHONE_HREF = "tel:+14379673178";
const SUPPORT_EMAIL = "support@thejobsabroad.com";
const INFO_EMAIL = "info@thejobsabroad.com";

// Put your real profile URLs here (replace each "#").
const SOCIALS = [
  { label: "LinkedIn", Icon: FaLinkedinIn, href: "#" },
  { label: "X", Icon: FaXTwitter, href: "#" },
  { label: "Instagram", Icon: FaInstagram, href: "#" },
];

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

const headingClass =
  "font-bold text-xs uppercase tracking-widest text-white/60 mb-3";
const linkClass =
  "text-sm text-white/90 hover:text-white hover:underline transition-colors";

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

  const renderList = (links) => (
    <ul className="space-y-2.5">
      {links.map((tag) => (
        <li key={tag.label}>
          <Link
            href={tag.href}
            onClick={(e) => handleTagClick(e, tag)}
            className={linkClass}
          >
            {tag.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="text-white" style={{ backgroundColor: BRAND_BLUE }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 sm:pt-10">
        {/* Brand + address + socials | Explore | Legal | Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1.2fr] gap-8 lg:gap-10">
          {/* Left */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-block self-start bg-white rounded-xl px-3 py-1.5"
            >
              <Image
                src={logo3}
                alt="Jobs Abroad"
                height={32}
                className="h-8 sm:h-10 w-auto"
              />
            </Link>

            <p className="text-sm leading-relaxed text-white/80 max-w-xs">
              Connecting global talent with world-class opportunities.
            </p>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 max-w-xs text-sm text-white/90 hover:text-white hover:underline transition-colors"
            >
              <IoLocationOutline size={18} className="mt-0.5 shrink-0" />
              <span>{ADDRESS}</span>
            </a>

            <div className="flex gap-2.5">
              {SOCIALS.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-[#004AAC] hover:opacity-85 transition-opacity"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className={headingClass}>Explore</h4>
            {renderList(pageLinks)}
          </div>

          {/* Legal */}
          <div>
            <h4 className={headingClass}>Legal</h4>
            {renderList(legalLinks)}
          </div>

          {/* Contact */}
          <div>
            <h4 className={headingClass}>Contact</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={PHONE_HREF}
                  className={`flex items-center gap-2.5 ${linkClass}`}
                >
                  <IoCallOutline size={18} className="shrink-0" />
                  <span>{PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className={`flex items-center gap-2.5 ${linkClass}`}
                >
                  <IoMailOutline size={18} className="shrink-0" />
                  <span className="break-all">{SUPPORT_EMAIL}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${INFO_EMAIL}`}
                  className={`flex items-center gap-2.5 ${linkClass}`}
                >
                  <IoMailOutline size={18} className="shrink-0" />
                  <span className="break-all">{INFO_EMAIL}</span>
                </a>
              </li>
            </ul>

            <a
              href={EMPLOYER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 inline-flex items-center gap-3 bg-white text-xs sm:text-sm font-bold rounded-full pl-5 pr-1.5 py-1.5 hover:bg-white/90 transition-colors"
              style={{ color: BRAND_BLUE }}
            >
              Post a Job
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white group-hover:rotate-45 transition-transform"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                <FiArrowUpRight size={13} />
              </span>
            </a>
          </div>
        </div>

        {/* Quote */}
        <p className="mt-6 pt-4 border-t border-white/20 italic text-xs sm:text-sm leading-relaxed text-white/75">
          "The only limit to our realization of tomorrow will be our doubts of
          today. Move beyond borders."{" "}
          <span className="not-italic text-[11px] font-bold uppercase tracking-widest text-white/50">
            — Global Career Vision
          </span>
        </p>

        {/* Bottom bar */}
        <div className="mt-3 py-3 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-white/60 uppercase tracking-widest text-center">
          <p>© {currentYear} Jobs Abroad. All rights reserved.</p>
          <div className="flex gap-5">
            <span>Designed for Excellence</span>
            <span>Global Reach</span>
          </div>
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