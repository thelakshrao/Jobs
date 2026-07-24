"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import logo3 from "@/images/logo3.png";
import { FaLinkedinIn, FaXTwitter, FaInstagram } from "react-icons/fa6";

const BRAND_BLUE = "#004AAC";

const tags = [
  { label: "About Us", href: "#about" },
  { label: "Premium Services", href: "#premium" },
  { label: "Why JobsAbroad", href: "#why-us" },
  { label: "Contact Support", href: "#contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Cookie Settings", href: "/cookies" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleTagClick = (e, href) => {
    if (!href.startsWith("#")) return; // let normal page links (privacy, terms...) navigate as usual
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="bg-white text-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.3fr]">
        {/* ---------------- LEFT: white side ---------------- */}
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

        <div
          className="p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-center gap-5"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          <div>
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-widest text-white/70 mb-3">
              Quick Links
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {tags.map((tag) => (
                <Link
                  key={tag.label}
                  href={tag.href}
                  onClick={(e) => handleTagClick(e, tag.href)}
                  className="whitespace-nowrap text-xs sm:text-sm text-white/85 border border-white/25 rounded-full px-4 py-1.5 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>

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
    </footer>
  );
};

export default Footer;