import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <DashboardNav user={user} />
            <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-full overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
