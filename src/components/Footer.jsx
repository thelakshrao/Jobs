import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo2 from "@/images/logo2.png";
import { FaLinkedinIn, FaXTwitter, FaInstagram } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-400 text-white pt-12 pb-8 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">

          <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-4">
            <Link href="/">
              <Image
                src={logo2}
                alt="Jobs Abroad"
                height={36}
                className="h-15 sm:h-20 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed text-white/80 max-w-xs">
              Connecting global talent with world-class opportunities. Your journey to a premium international career starts here.
            </p>
            <div className="flex gap-3">
              {[FaLinkedinIn, FaXTwitter, FaInstagram].map((Icon, idx) => (
                <div
                  key={idx}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-blue-400 transition-all cursor-pointer"
                >
                  <Icon size={15} />
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-bold text-sm sm:text-base mb-4 sm:mb-6">Explore</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li><Link href="#about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#premium" className="hover:text-white transition-colors">Premium Services</Link></li>
              <li><Link href="#why-us" className="hover:text-white transition-colors">Why JobsAbroad</Link></li>
              <li><Link href="#contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-bold text-sm sm:text-base mb-4 sm:mb-6">Policies</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white/20 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/30">
            <span className="text-white text-3xl font-serif leading-none block mb-2">"</span>
            <p className="italic text-sm text-white leading-relaxed mb-3">
              The only limit to our realization of tomorrow will be our doubts of today. Move beyond borders.
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">— Global Career Vision</p>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-white/30 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-medium text-white/60 uppercase tracking-widest text-center">
          <p>© {currentYear} Jobs Abroad. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Designed for Excellence</span>
            <span className="hover:text-white cursor-pointer transition-colors">Global Reach</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;