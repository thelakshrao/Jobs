"use client";

import React, { useState, useEffect } from "react";
import {
    IoCallOutline,
    IoMailOutline,
    IoLocationOutline,
} from "react-icons/io5";
import { FiArrowUpRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_3giimhf";
const EMAILJS_TEMPLATE_ID = "template_epgoa86";
const EMAILJS_PUBLIC_KEY = "UHzBWCtmnhUoZASXL";

const ADDRESS = "30 Eglinton Ave W, Mississauga, ON L5R 3E7, Canada";
const MAPS_URL =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(ADDRESS);
const PHONE_DISPLAY = "+1 437-967-3178";
const PHONE_HREF = "tel:+14379673178";
const INFO_EMAIL = "info@thejobsabroad.com";
const SUPPORT_EMAIL = "support@thejobsabroad.com";

const CONTACT_ITEMS = [
    {
        icon: <IoCallOutline size={18} />,
        label: "Query",
        lines: [{ text: PHONE_DISPLAY, href: PHONE_HREF }],
    },
    {
        icon: <IoMailOutline size={18} />,
        label: "Email",
        lines: [
            { text: INFO_EMAIL, href: `mailto:${INFO_EMAIL}` },
            { text: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
        ],
    },
    {
        icon: <IoLocationOutline size={18} />,
        label: "Address",
        lines: [{ text: ADDRESS, href: MAPS_URL, external: true }],
    },
];

const initialForm = {
    from_name: "",
    from_email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
};

const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#004AAC] focus:border-[#004AAC] transition-all text-xs sm:text-sm shadow-sm";
const labelClass =
    "text-[9px] sm:text-[10px] font-bold text-[#0A0E17] uppercase tracking-wider";

export default function EmployerContact() {
    const [formData, setFormData] = useState(initialForm);
    const [status, setStatus] = useState("idle");

    useEffect(() => {
        if (status !== "success") return;
        const timer = setTimeout(() => setStatus("idle"), 5000);
        return () => clearTimeout(timer);
    }, [status]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { from_name, from_email, company, phone, subject, message } =
            formData;
        if (!from_name || !from_email || !subject || !message) return;
        setStatus("sending");
        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    from_name,
                    from_email,
                    phone: phone || "Not provided",
                    subject,
                    message,
                    sender_type: "Employer",
                    source: company
                        ? `Website — For Employers page · Company: ${company}`
                        : "Website — For Employers page",
                },
                EMAILJS_PUBLIC_KEY,
            );
            setStatus("success");
            setFormData(initialForm);
        } catch (err) {
            console.error("EmailJS error:", err);
            setStatus("error");
        }
    };

    return (
        <section id="contact" className="bg-white font-sans">
            <hr className="border-gray-200" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-center">

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-5"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#004AAC] flex items-center justify-center text-white">
                            <span className="text-[8px]">★</span>
                        </div>
                        <p className="text-[#004AAC] font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                            Employer Support
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#0A0E17] leading-[1.15]">
                        Need help with <span className="text-[#004AAC]">hiring?</span>
                    </h2>

                    <p className="text-gray-500 text-sm sm:text-base max-w-md leading-relaxed">
                        Questions about posting a job, plans or finding the right talent?
                        Our team will get back to you shortly.
                    </p>

                    <div className="space-y-4 pt-1">
                        {CONTACT_ITEMS.map((item) => (
                            <div key={item.label} className="flex items-start gap-3">
                                <div className="w-9 h-9 shrink-0 rounded-full bg-[#EAF1FC] flex items-center justify-center text-[#004AAC]">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-[#0A0E17] text-sm">
                                        {item.label}
                                    </p>
                                    {item.lines.map((line) => (
                                        <a
                                            key={line.text}
                                            href={line.href}
                                            {...(line.external
                                                ? { target: "_blank", rel: "noopener noreferrer" }
                                                : {})}
                                            className="block max-w-xs text-gray-500 font-medium text-xs sm:text-sm hover:text-[#004AAC] hover:underline transition-colors"
                                        >
                                            {line.text}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#F2F3F5] p-5 sm:p-7 rounded-3xl border border-gray-200"
                >
                    <h3 className="text-lg sm:text-xl font-semibold text-[#0A0E17]">
                        Get in Touch
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1 mb-4">
                        Fill out the form and we will reach out shortly.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className={labelClass}>Full Name *</label>
                                <input
                                    type="text"
                                    name="from_name"
                                    placeholder="Full Name"
                                    value={formData.from_name}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>Work Email *</label>
                                <input
                                    type="email"
                                    name="from_email"
                                    placeholder="Email"
                                    value={formData.from_email}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className={labelClass}>Company Name</label>
                                <input
                                    type="text"
                                    name="company"
                                    placeholder="Your company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+1 000 000 0000"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className={labelClass}>Subject *</label>
                            <input
                                type="text"
                                name="subject"
                                placeholder="What is this regarding?"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={labelClass}>Your Message *</label>
                            <textarea
                                rows="3"
                                name="message"
                                placeholder="How can we help?"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className={`${inputClass} resize-none`}
                            />
                        </div>

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

                        <button
                            type="submit"
                            disabled={status === "sending"}
                            className="w-full sm:w-auto bg-[#004AAC] text-white pl-6 pr-2 py-2 rounded-full flex items-center justify-between gap-6 group hover:bg-[#003785] transition-all shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="font-bold text-xs sm:text-sm">
                                {status === "sending" ? "Sending…" : "Send Message"}
                            </span>
                            <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#004AAC] group-hover:rotate-45 transition-transform">
                                <FiArrowUpRight size={15} />
                            </span>
                        </button>
                    </form>
                </motion.div>
            </div>

            <hr className="border-gray-200" />
        </section>
    );
}