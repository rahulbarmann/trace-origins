"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Shield } from "lucide-react";

const footerLinks = {
    product: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Documentation", href: "#" },
        { label: "API", href: "#" },
    ],
    company: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
    ],
    legal: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Security", href: "#" },
    ],
};

export function FooterSection() {
    return (
        <footer className="px-6 py-16 border-t border-zinc-900">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <motion.div
                        className="col-span-2 md:col-span-1"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-display text-xl font-semibold text-zinc-100"
                        >
                            <Shield className="w-5 h-5" />
                            Trace Origins
                        </Link>
                        <p className="mt-4 text-sm text-zinc-500 max-w-xs">
                            Blockchain-powered product traceability for modern
                            supply chains.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4">
                            Product
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, i) => (
                                <motion.li
                                    key={link.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.3,
                                        delay: 0.1 + i * 0.05,
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, i) => (
                                <motion.li
                                    key={link.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.3,
                                        delay: 0.2 + i * 0.05,
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4">
                            Legal
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link, i) => (
                                <motion.li
                                    key={link.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.3,
                                        delay: 0.3 + i * 0.05,
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                <motion.div
                    className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <p className="text-sm text-zinc-600">
                        {new Date().getFullYear()} Trace Origins. All rights
                        reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link
                                href="#"
                                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link
                                href="#"
                                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link
                                href="#"
                                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
