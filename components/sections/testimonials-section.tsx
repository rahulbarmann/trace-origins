"use client";

import { motion } from "framer-motion";
import { TestimonialsColumn } from "@/components/ui/testimonials-column";

const testimonials = [
    {
        text: "Trace Origins completely transformed how we track our supply chain. Customers love scanning the QR codes to verify authenticity.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        name: "Sarah Chen",
        role: "COO at FreshFarms",
    },
    {
        text: "The blockchain verification gives our customers confidence. We've seen a 40% increase in brand trust since implementing Trace Origins.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        name: "Marcus Johnson",
        role: "VP Operations at Luxe Goods",
    },
    {
        text: "Finally, a traceability solution that actually works. Setup was quick and the IPFS storage ensures our data is permanent.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        name: "Emily Rodriguez",
        role: "Quality Manager at PharmaCo",
    },
    {
        text: "The geo-tagged images feature is a game changer. We can prove exactly where and when each stage was completed.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        name: "David Park",
        role: "Supply Chain Director",
    },
    {
        text: "Our compliance team loves the immutable audit trail. Every inspection is now verifiable on the blockchain.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        name: "Aisha Patel",
        role: "Compliance Officer",
    },
    {
        text: "Trace Origins helped us achieve organic certification faster. The transparent tracking impressed our auditors.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        name: "James Wilson",
        role: "CEO at OrganicHarvest",
    },
    {
        text: "Consumer engagement skyrocketed after we added QR codes. People love seeing the journey of their products.",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
        name: "Lisa Thompson",
        role: "Marketing Director",
    },
    {
        text: "The custom pipeline feature let us adapt Trace Origins to our unique manufacturing process perfectly.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        name: "Michael Brown",
        role: "Production Manager",
    },
    {
        text: "We reduced counterfeit claims by 90% after implementing blockchain verification. Worth every penny.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        name: "Rachel Kim",
        role: "Brand Protection Lead",
    },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const logos = [
    "FreshFarms",
    "LuxeGoods",
    "PharmaCo",
    "OrganicHarvest",
    "TechSupply",
    "GlobalTrade",
];

export function TestimonialsSection() {
    return (
        <section id="testimonials" className="px-6 py-24 bg-zinc-900/30">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.8,
                        delay: 0.1,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-xl mx-auto mb-12"
                >
                    <div className="border border-zinc-800 py-1.5 px-4 rounded-full text-sm text-zinc-400">
                        Testimonials
                    </div>

                    <h2 className="font-display text-4xl md:text-5xl font-bold text-zinc-100 mt-6 text-center tracking-tight">
                        What our users say
                    </h2>
                    <p className="text-center mt-4 text-zinc-500 text-lg text-balance">
                        See what vendors have to say about Trace Origins.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
                    <TestimonialsColumn
                        testimonials={firstColumn}
                        duration={15}
                    />
                    <TestimonialsColumn
                        testimonials={secondColumn}
                        className="hidden md:block"
                        duration={19}
                    />
                    <TestimonialsColumn
                        testimonials={thirdColumn}
                        className="hidden lg:block"
                        duration={17}
                    />
                </div>

                <div className="mt-16 pt-16 border-t border-zinc-800/50">
                    <p className="text-center text-sm text-zinc-500 mb-8">
                        Trusted by industry leaders
                    </p>
                    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
                        <motion.div
                            className="flex gap-12 md:gap-16"
                            animate={{
                                x: ["0%", "-50%"],
                            }}
                            transition={{
                                x: {
                                    duration: 20,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "linear",
                                },
                            }}
                        >
                            {[...logos, ...logos].map((logo, index) => (
                                <span
                                    key={`${logo}-${index}`}
                                    className="text-xl font-semibold text-zinc-700 whitespace-nowrap flex-shrink-0"
                                >
                                    {logo}
                                </span>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
