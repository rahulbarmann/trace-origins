"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Shield,
    LogOut,
    Menu,
    X,
    Home,
    GitBranch,
    Package,
    BarChart3,
} from "lucide-react";

interface User {
    id: string;
    email: string;
    company: { name: string } | null;
}

const navItems = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/pipelines", label: "Pipelines", icon: GitBranch },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function DashboardNav({ user }: { user: User }) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    return (
        <>
            <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-14 md:h-16">
                        <div className="flex items-center gap-4 md:gap-8">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2"
                            >
                                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-zinc-400" />
                                </div>
                                <span className="font-semibold text-lg md:text-xl text-zinc-100">
                                    Trace Origins
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
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="hidden sm:block text-sm text-zinc-400 truncate max-w-[150px]">
                                {user.company?.name || user.email}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="hidden md:flex text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="md:hidden text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 p-2"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-14 z-40 bg-zinc-950/95 backdrop-blur-sm">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors",
                                        pathname === item.href
                                            ? "bg-zinc-800 text-zinc-100"
                                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <div className="border-t border-zinc-800 my-2" />
                        <div className="px-4 py-2 text-sm text-zinc-500">
                            {user.company?.name || user.email}
                        </div>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                handleLogout();
                            }}
                            className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </nav>
                </div>
            )}
        </>
    );
}
