"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";

interface Product {
    id: string;
    name: string;
    batchId: string;
    qrCode: string | null;
    createdAt: string;
    pipeline: { id: string; name: string };
    stageData: { status: string }[];
    _count: { scans: number };
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => setProducts(data.products || []))
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
                        Products
                    </h1>
                    <p className="text-sm md:text-base text-zinc-500">
                        Manage your tracked products
                    </p>
                </div>
                <Link
                    href="/dashboard/products/new"
                    className="w-full sm:w-auto"
                >
                    <Button className="w-full sm:w-auto bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {products.length === 0 ? (
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="py-12 text-center">
                        <Package className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                        <p className="text-zinc-500 mb-4">No products yet</p>
                        <Link href="/dashboard/products/new">
                            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                                Add Your First Product
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {products.map((product) => {
                        const completedStages = product.stageData.filter(
                            (s) => s.status === "COMPLETED"
                        ).length;
                        const totalStages = product.stageData.length;

                        return (
                            <Link
                                key={product.id}
                                href={`/dashboard/products/${product.id}`}
                            >
                                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer h-full">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-zinc-100">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-zinc-500">
                                                    {product.batchId}
                                                </p>
                                            </div>
                                            {product.qrCode && (
                                                <img
                                                    src={product.qrCode}
                                                    alt="QR Code"
                                                    className="w-16 h-16 rounded"
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Badge
                                                    variant="outline"
                                                    className="border-zinc-700 text-zinc-400"
                                                >
                                                    {product.pipeline.name}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 transition-all"
                                                        style={{
                                                            width: `${
                                                                totalStages > 0
                                                                    ? (completedStages /
                                                                          totalStages) *
                                                                      100
                                                                    : 0
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm text-zinc-500">
                                                    {completedStages}/
                                                    {totalStages}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-zinc-500">
                                                <span>
                                                    {product._count.scans} scans
                                                </span>
                                                <span>
                                                    {new Date(
                                                        product.createdAt
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
