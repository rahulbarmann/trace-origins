"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-40 p-2 sm:p-4">
            <nav className="max-w-5xl mx-auto flex items-center justify-between h-12 px-4 sm:px-6 rounded-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-md">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-display text-base sm:text-lg font-semibold text-zinc-100"
                >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">Trace Origins</span>
                    <span className="xs:hidden">Trace Origins</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-3 md:px-4 py-1.5 text-sm rounded-full transition-colors text-zinc-400 hover:text-zinc-100"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/login"
                        className="px-3 md:px-4 py-1.5 text-sm rounded-full transition-colors text-zinc-400 hover:text-zinc-100"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/register"
                        className="ml-1 md:ml-2 px-3 md:px-4 py-1.5 text-sm rounded-full bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200 transition-colors"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Navigation */}
                <div className="flex sm:hidden items-center gap-2">
                    <Link
                        href="/login"
                        className="px-3 py-1.5 text-xs rounded-full transition-colors text-zinc-400 hover:text-zinc-100"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/register"
                        className="px-3 py-1.5 text-xs rounded-full bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200 transition-colors"
                    >
                        Start
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-100"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="sm:hidden mt-2 mx-2 p-4 rounded-2xl bg-zinc-900/95 border border-zinc-800/50 backdrop-blur-md">
                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-2 text-sm rounded-lg transition-colors text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
