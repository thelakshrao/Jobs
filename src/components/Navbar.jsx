"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/images/logo3.png";
import { motion } from "framer-motion";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Why Us", href: "#why-us" },
  { label: "Premium", href: "#premium" },
  { label: "Contact Us", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScroll = (e, href) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);

    if (elem) {
      const offset = 80;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-3 md:top-5 left-3 md:left-6 right-3 md:right-6 z-50 font-sans bg-white/95 backdrop-blur-md rounded-full transition-all duration-500 ${
        scrolled
          ? "shadow-[0_8px_30px_-8px_rgba(0,74,172,0.25)]"
          : "shadow-[0_4px_20px_-6px_rgba(0,74,172,0.12)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-14 md:h-16 flex items-center justify-between">
        <Link href="/" className="relative z-10 shrink-0 flex items-center">
          <div className="p-1.5 md:p-2 flex items-center justify-center">
            <Image
              src={logo}
              alt="Jobs Abroad"
              height={26}
              className="h-6 md:h-10 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.15 + i * 0.08,
              }}
            >
              <a
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className="relative group text-gray-600 hover:text-[#004AAC] text-sm font-medium tracking-wide transition-colors duration-200 cursor-pointer"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-[#004AAC] rounded-full transition-all duration-300 group-hover:w-full" />
              </a>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/employer"
            className="hidden sm:inline-flex items-center gap-1.5 text-[#004AAC] text-xs md:text-sm font-semibold px-3 md:px-4 py-2 md:py-2.5 rounded-full border border-[#004AAC]/25 hover:bg-[#eaf1fb] transition-all duration-300"
          >
            For Employers
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.45,
            }}
            className="shrink-0"
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 bg-[#004AAC] hover:bg-[#003785] text-white text-xs md:text-sm font-semibold px-4 md:px-5 py-2 md:py-2.5 rounded-full transition-all duration-300"
            >
              <span className="relative z-10">Login</span>
              <svg
                className="relative z-10 w-3 md:w-3.5 h-3 md:h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M5.5 2.5 10 7l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}