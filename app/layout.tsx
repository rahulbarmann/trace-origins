import type React from "react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { LenisProvider } from "@/components/providers/lenis-provider";
import "./globals.css";

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
});

export const metadata: Metadata = {
    title: "TraceChain - Blockchain Product Traceability",
    description:
        "Universal blockchain-based product traceability platform for vendors and consumers",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Instrument+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body
                className={`${manrope.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}
            >
                <LenisProvider>{children}</LenisProvider>
            </body>
        </html>
    );
}
