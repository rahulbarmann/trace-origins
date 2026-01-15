"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Layers } from "lucide-react";

interface Pipeline {
    id: string;
    name: string;
    description: string | null;
    stages: { id: string; name: string; order: number }[];
    _count: { products: number };
    createdAt: string;
}

export default function PipelinesPage() {
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/pipelines")
            .then((res) => res.json())
            .then((data) => setPipelines(data.pipelines || []))
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
                        Pipelines
                    </h1>
                    <p className="text-sm md:text-base text-zinc-500">
                        Manage your product traceability pipelines
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

            {pipelines.length === 0 ? (
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="py-12 text-center">
                        <Layers className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                        <p className="text-zinc-500 mb-4">No pipelines yet</p>
                        <Link href="/dashboard/pipelines/new">
                            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                                Create Your First Pipeline
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {pipelines.map((pipeline) => (
                        <Link
                            key={pipeline.id}
                            href={`/dashboard/pipelines/${pipeline.id}`}
                        >
                            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <CardTitle className="text-zinc-100">
                                        {pipeline.name}
                                    </CardTitle>
                                    <CardDescription className="text-zinc-500">
                                        {pipeline.description ||
                                            "No description"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {pipeline.stages.map((stage) => (
                                            <Badge
                                                key={stage.id}
                                                variant="secondary"
                                                className="bg-zinc-800 text-zinc-300 border-zinc-700"
                                            >
                                                {stage.name}
                                            </Badge>
                                        ))}
                                        {pipeline.stages.length === 0 && (
                                            <span className="text-sm text-zinc-600">
                                                No stages defined
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-zinc-500">
                                        {pipeline._count.products} products
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
