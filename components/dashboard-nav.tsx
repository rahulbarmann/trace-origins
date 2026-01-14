"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, LogOut } from "lucide-react";

interface User {
    id: string;
    email: string;
    company: { name: string } | null;
}

const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/pipelines", label: "Pipelines" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/analytics", label: "Analytics" },
];

export function DashboardNav({ user }: { user: User }) {
    const pathname = usePathname();
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    return (
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                                <Shield className="w-4 h-4 text-zinc-400" />
                            </div>
                            <span className="font-semibold text-xl text-zinc-100">
                                TraceChain
                            </span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                        pathname === item.href
                                            ? "bg-zinc-800 text-zinc-100"
                                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-zinc-400">
                            {user.company?.name || user.email}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
