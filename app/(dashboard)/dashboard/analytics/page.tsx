"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Layers, Package, QrCode } from "lucide-react";

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
        location: string | null;
        createdAt: string;
    }[];
    productsByPipeline: {
        name: string;
        count: number;
    }[];
    scansByDay: {
        date: string;
        count: number;
    }[];
}

export default function AnalyticsPage() {
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

    const maxProductCount = Math.max(
        ...((analytics?.productsByPipeline || []).map((p) => p.count) || [1])
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
                <p className="text-zinc-500">Track your platform performance</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                            Total Pipelines
                        </CardTitle>
                        <Layers className="w-4 h-4 text-zinc-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-100">
                            {analytics?.overview.pipelines || 0}
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
                        <div className="text-3xl font-bold text-zinc-100">
                            {analytics?.overview.products || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                            Total QR Scans
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

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">
                            Products by Pipeline
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                            Distribution of products across pipelines
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analytics?.productsByPipeline &&
                        analytics.productsByPipeline.length > 0 ? (
                            <div className="space-y-4">
                                {analytics.productsByPipeline.map((item) => (
                                    <div key={item.name} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-300">
                                                {item.name}
                                            </span>
                                            <span className="text-zinc-500">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-zinc-400 transition-all"
                                                style={{
                                                    width: `${
                                                        (item.count /
                                                            maxProductCount) *
                                                        100
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-center py-8">
                                No data available
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">
                            Recent Scans
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                            Latest QR code scans
                        </CardDescription>
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
                                No scans yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
