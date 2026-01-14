"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button";

export function CtaSection() {
    return (
        <section className="px-6 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto text-center"
            >
                <motion.h2
                    className="font-display text-4xl md:text-5xl font-bold text-zinc-100 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Ready to get started?
                </motion.h2>
                <motion.p
                    className="text-lg text-zinc-500 mb-10 text-balance"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Join hundreds of vendors already building trust with
                    blockchain-verified traceability. Start your free trial
                    today.
                </motion.p>
                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Link href="/register">
                        <LiquidCtaButton>Start Free Trial</LiquidCtaButton>
                    </Link>
                    <Link
                        href="/login"
                        className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                    >
                        <span>Sign in to dashboard</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
}
