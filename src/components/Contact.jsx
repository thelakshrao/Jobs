"use client";

import React, { useRef, useState, useEffect } from "react";
import { IoCallOutline, IoMailOutline } from "react-icons/io5";
import { FiArrowUpRight } from "react-icons/fi";
import { motion, useInView, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_3giimhf";
const EMAILJS_TEMPLATE_ID = "template_epgoa86";
const EMAILJS_PUBLIC_KEY = "UHzBWCtmnhUoZASXL";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Contact = () => {
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    from_name: "",
    from_email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => setStatus("idle"), 5000);
    return () => clearTimeout(timer);
  }, [status]);

  const leftRef = useRef(null);
  const leftInView = useInView(leftRef, { once: true, margin: "-80px" });

  const rightRef = useRef(null);
  const rightInView = useInView(rightRef, { once: true, margin: "-80px" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { from_name, from_email, phone, subject, message } = formData;
    if (!from_name || !from_email || !subject || !message) return;
    setStatus("sending");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { from_name, from_email, phone, subject, message },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      setFormData({ from_name: "", from_email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-white border-none rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-blue-400 transition-all text-xs sm:text-sm shadow-sm";

  const labelClass =
    "text-[9px] sm:text-[10px] font-bold text-black uppercase tracking-wider";

  return (
    <section id="contact" className="relative min-h-screen bg-white overflow-hidden font-sans">
      <hr />

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <svg
          className="absolute -top-10 -left-10 sm:-top-16 sm:-left-16 md:-top-20 md:-left-20 w-48 h-48 sm:w-72 sm:h-72 md:w-112.5 md:h-112.5 opacity-60"
          viewBox="0 0 320 320"
          fill="none"
          style={{ transform: "scaleX(-1) scaleY(-1)" }}
        >
          <path d="M320 0 C220 0, 320 100, 200 160 S 80 320, 320 320Z" fill="#EFF6FF" opacity="0.8" />
          <path d="M320 0 C260 0, 320 60, 240 120 S 140 320, 320 320Z" fill="#DBEAFE" opacity="0.6" />
          <path d="M320 0 C290 0, 320 30, 280 80 S 200 320, 320 320Z" fill="#BFDBFE" opacity="0.4" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 md:pt-32 pb-12 sm:pb-16 md:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
        <div ref={leftRef} className="space-y-5 sm:space-y-6 md:space-y-8">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate={leftInView ? "visible" : "hidden"} className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-400 flex items-center justify-center text-white">
              <span className="text-[8px] sm:text-[10px]">★</span>
            </div>
            <p className="text-blue-400 font-bold text-[9px] sm:text-xs uppercase tracking-widest">Premium Support</p>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate={leftInView ? "visible" : "hidden"} className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-black leading-[1.1]">
            Unlock Your <br />
            <span className="text-blue-400">Global Potential</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate={leftInView ? "visible" : "hidden"} className="text-slate-500 text-sm sm:text-base md:text-lg max-w-lg leading-relaxed">
            Ready to take the next step in your career? Our elite team is here to professionally guide you through international markets.
          </motion.p>

          <div className="flex flex-wrap gap-6 sm:gap-8 md:gap-12 pt-2 sm:pt-4">
            {[
              { icon: <IoCallOutline size={20} />, label: "Call Center", value: "+91 800-123-4567", delay: 3 },
              { icon: <IoMailOutline size={20} />, label: "Email", value: "support@jobsabroad.com", delay: 4 },
            ].map((item, i) => (
              <motion.div key={i} custom={item.delay} variants={fadeUp} initial="hidden" animate={leftInView ? "visible" : "hidden"} className="flex items-center gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-[#EBF5FF] flex items-center justify-center text-blue-400">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-black text-sm">{item.label}</p>
                  <p className="text-slate-500 font-medium text-xs sm:text-sm">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div ref={rightRef} custom={0} variants={fadeIn} initial="hidden" animate={rightInView ? "visible" : "hidden"} className="bg-blue-100 p-5 sm:p-8 md:p-10 lg:p-12 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] border border-blue-100">
          <motion.h2 custom={1} variants={fadeIn} initial="hidden" animate={rightInView ? "visible" : "hidden"} className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-1.5">
            Get in Touch
          </motion.h2>
          <motion.p custom={2} variants={fadeIn} initial="hidden" animate={rightInView ? "visible" : "hidden"} className="text-slate-400 text-xs sm:text-sm mb-5 sm:mb-6 md:mb-8">
            Fill out the form below and we will reach out shortly.
          </motion.p>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <motion.div custom={3} variants={fadeIn} initial="hidden" animate={rightInView ? "visible" : "hidden"} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <label className={labelClass}>Full Name *</label>
                <input type="text" name="from_name" placeholder="Full Name" value={formData.from_name} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Email Address *</label>
                <input type="email" name="from_email" placeholder="Email" value={formData.from_email} onChange={handleChange} required className={inputClass} />
              </div>
            </motion.div>

            <motion.div custom={4} variants={fadeIn} initial="hidden" animate={rightInView ? "visible" : "hidden"} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <label className={labelClass}>Phone Number</label>
                <input type="tel" name="phone" placeholder="+91 00000 00000" value={formData.phone} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Subject *</label>
                <input type="text" name="subject" placeholder="What is this regarding?" value={formData.subject} onChange={handleChange} required className={inputClass} />
              </div>
            </motion.div>

            <motion.div custom={5} variants={fadeIn} initial="hidden" animate={rightInView ? "visible" : "hidden"} className="space-y-1">
              <label className={labelClass}>Your Message *</label>
              <textarea rows="4" name="message" placeholder="How can we help?" value={formData.message} onChange={handleChange} required className={`${inputClass} resize-none`} />
            </motion.div>

            <AnimatePresence>
              {status === "success" && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-green-600 text-xs sm:text-sm font-medium"
                >
                  ✅ Message sent! We'll get back to you soon.
                </motion.p>
              )}
              {status === "error" && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-red-500 text-xs sm:text-sm font-medium"
                >
                  ❌ Something went wrong. Please try again.
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              custom={6} variants={fadeIn} initial="hidden" animate={rightInView ? "visible" : "hidden"}
              type="submit" disabled={status === "sending"}
              className="mt-2 w-full sm:w-auto bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full flex items-center justify-between gap-5 sm:gap-8 group hover:bg-blue-400 transition-all shadow-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="font-bold text-xs sm:text-sm">
                {status === "sending" ? "Sending…" : "Send Message"}
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-black group-hover:rotate-45 transition-transform">
                <FiArrowUpRight size={16} />
              </div>
            </motion.button>
          </form>
        </motion.div>
      </div>
      <hr />
    </section>
  );
};

export default Contact;