"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Starter",
        description: "Perfect for small businesses getting started",
        price: "$0",
        period: "forever",
        features: [
            "Up to 3 pipelines",
            "100 products/month",
            "Basic analytics",
            "Community support",
            "QR code generation",
        ],
        cta: "Get Started",
        highlighted: false,
    },
    {
        name: "Pro",
        description: "For growing businesses that need more power",
        price: "$49",
        period: "/month",
        features: [
            "Unlimited pipelines",
            "Unlimited products",
            "Advanced analytics",
            "Priority support",
            "Custom branding",
            "API access",
            "Blockchain verification",
        ],
        cta: "Start Free Trial",
        highlighted: true,
    },
    {
        name: "Enterprise",
        description: "For large organizations with custom needs",
        price: "Custom",
        period: "",
        features: [
            "Everything in Pro",
            "Dedicated account manager",
            "Custom SLA",
            "On-premise deployment",
            "White-label solution",
            "Advanced security",
            "Training & onboarding",
        ],
        cta: "Contact Sales",
        highlighted: false,
    },
];

export function PricingSection() {
    return (
        <section id="pricing" className="px-6 py-24">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
                        Pricing
                    </p>
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-zinc-100 mb-4">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-zinc-500 max-w-xl mx-auto text-balance text-lg">
                        No hidden fees. No surprises. Choose the plan that works
                        for you.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -4 }}
                            className={`p-8 rounded-2xl border flex flex-col h-full transition-all duration-300 ${
                                plan.highlighted
                                    ? "bg-zinc-100 border-zinc-100 shadow-xl shadow-zinc-100/10"
                                    : "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50"
                            }`}
                        >
                            <div className="mb-6">
                                <h3
                                    className={`font-heading text-xl font-semibold mb-2 ${
                                        plan.highlighted
                                            ? "text-zinc-900"
                                            : "text-zinc-100"
                                    }`}
                                >
                                    {plan.name}
                                </h3>
                                <p
                                    className={`text-sm ${
                                        plan.highlighted
                                            ? "text-zinc-600"
                                            : "text-zinc-500"
                                    }`}
                                >
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <motion.span
                                    className={`font-display text-4xl font-bold ${
                                        plan.highlighted
                                            ? "text-zinc-900"
                                            : "text-zinc-100"
                                    }`}
                                    initial={{ scale: 0.5 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.1 + 0.2,
                                    }}
                                >
                                    {plan.price}
                                </motion.span>
                                <span
                                    className={`text-sm ${
                                        plan.highlighted
                                            ? "text-zinc-600"
                                            : "text-zinc-500"
                                    }`}
                                >
                                    {plan.period}
                                </span>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <motion.li
                                        key={feature}
                                        className="flex items-start gap-3"
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.3,
                                            delay: index * 0.1 + i * 0.05,
                                        }}
                                    >
                                        <Check
                                            className={`w-5 h-5 shrink-0 ${
                                                plan.highlighted
                                                    ? "text-zinc-900"
                                                    : "text-zinc-400"
                                            }`}
                                        />
                                        <span
                                            className={`text-sm ${
                                                plan.highlighted
                                                    ? "text-zinc-700"
                                                    : "text-zinc-400"
                                            }`}
                                        >
                                            {feature}
                                        </span>
                                    </motion.li>
                                ))}
                            </ul>

                            <Link
                                href="/register"
                                className={`block w-full py-3 px-6 text-center rounded-full font-medium text-sm transition-all duration-300 mt-auto ${
                                    plan.highlighted
                                        ? "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:scale-105"
                                        : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:scale-105"
                                }`}
                            >
                                {plan.cta}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
