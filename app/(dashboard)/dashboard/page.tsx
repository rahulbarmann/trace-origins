"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, Layers, QrCode, ArrowRight } from "lucide-react";

interface Analytics {
    overview: {
        pipelines: number;
        products: number;
        totalScans: number;
    };
    recentScans: {
        id: string;
        productName: string;
        batchId: string;
        createdAt: string;
    }[];
}

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then((res) => res.json())
            .then((data) => setAnalytics(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-zinc-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
                        Dashboard
                    </h1>
                    <p className="text-sm md:text-base text-zinc-500">
                        Overview of your traceability platform
                    </p>
                </div>
                <Link
                    href="/dashboard/pipelines/new"
                    className="w-full sm:w-auto"
                >
                    <Button className="w-full sm:w-auto bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Pipeline
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                            Total Pipelines
                        </CardTitle>
                        <Layers className="w-4 h-4 text-zinc-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-bold text-zinc-100">
                                {analytics?.overview.pipelines || 0}
                            </div>
                            <Link href="/dashboard/pipelines">
                                <div className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                            Total Products
                        </CardTitle>
                        <Package className="w-4 h-4 text-zinc-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-bold text-zinc-100">
                                {analytics?.overview.products || 0}
                            </div>
                            <Link href="/dashboard/products">
                                <div className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                            QR Scans
                        </CardTitle>
                        <QrCode className="w-4 h-4 text-zinc-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-100">
                            {analytics?.overview.totalScans || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100">
                        Recent Scans
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {analytics?.recentScans &&
                    analytics.recentScans.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.recentScans.map((scan) => (
                                <div
                                    key={scan.id}
                                    className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
                                >
                                    <div>
                                        <div className="font-medium text-zinc-200">
                                            {scan.productName}
                                        </div>
                                        <div className="text-sm text-zinc-500">
                                            {scan.batchId}
                                        </div>
                                    </div>
                                    <div className="text-sm text-zinc-500">
                                        {new Date(
                                            scan.createdAt
                                        ).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-center py-8">
                            No scans yet. Create products and share QR codes to
                            get started.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
