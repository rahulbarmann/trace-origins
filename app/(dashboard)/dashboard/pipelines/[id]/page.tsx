"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Package } from "lucide-react";

interface Stage {
    id: string;
    name: string;
    description: string | null;
    order: number;
}

interface Product {
    id: string;
    name: string;
    batchId: string;
    qrCode: string | null;
    createdAt: string;
    stageData: {
        id: string;
        status: string;
        stage: Stage;
    }[];
}

interface Pipeline {
    id: string;
    name: string;
    description: string | null;
    stages: Stage[];
    products: Product[];
}

export default function PipelineDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [pipeline, setPipeline] = useState<Pipeline | null>(null);
    const [loading, setLoading] = useState(true);
    const [newStageName, setNewStageName] = useState("");
    const [addingStage, setAddingStage] = useState(false);

    useEffect(() => {
        fetch(`/api/pipelines/${params.id}`)
            .then((res) => res.json())
            .then((data) => setPipeline(data.pipeline))
            .finally(() => setLoading(false));
    }, [params.id]);

    async function handleAddStage(e: React.FormEvent) {
        e.preventDefault();
        if (!newStageName.trim() || !pipeline) return;

        setAddingStage(true);
        try {
            const res = await fetch(`/api/pipelines/${pipeline.id}/stages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newStageName,
                    order: pipeline.stages.length,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setPipeline({
                    ...pipeline,
                    stages: [...pipeline.stages, data.stage],
                });
                setNewStageName("");
            }
        } finally {
            setAddingStage(false);
        }
    }

    async function handleDelete() {
        if (
            !pipeline ||
            !confirm("Are you sure you want to delete this pipeline?")
        )
            return;

        const res = await fetch(`/api/pipelines/${pipeline.id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            router.push("/dashboard/pipelines");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-zinc-500">Loading...</div>
            </div>
        );
    }

    if (!pipeline) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-500">Pipeline not found</p>
                <Link href="/dashboard/pipelines">
                    <Button variant="link" className="text-zinc-400">
                        Back to Pipelines
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">
                        {pipeline.name}
                    </h1>
                    <p className="text-zinc-500">
                        {pipeline.description || "No description"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href={`/dashboard/products/new?pipelineId=${pipeline.id}`}
                    >
                        <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        className="border-zinc-700 text-zinc-400 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">Stages</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Define the steps in your traceability pipeline
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pipeline.stages.length > 0 ? (
                            <div className="space-y-2">
                                {pipeline.stages.map((stage, index) => (
                                    <div
                                        key={stage.id}
                                        className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                                    >
                                        <span className="text-sm font-medium text-zinc-500 w-6">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-zinc-200">
                                            {stage.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-sm">
                                No stages defined yet
                            </p>
                        )}

                        <form
                            onSubmit={handleAddStage}
                            className="flex gap-2 pt-4 border-t border-zinc-800"
                        >
                            <Input
                                placeholder="New stage name"
                                value={newStageName}
                                onChange={(e) =>
                                    setNewStageName(e.target.value)
                                }
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                            />
                            <Button
                                type="submit"
                                disabled={addingStage || !newStageName.trim()}
                                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                            >
                                Add
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">
                            Products
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                            Products using this pipeline
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pipeline.products.length > 0 ? (
                            <div className="space-y-3">
                                {pipeline.products.map((product) => {
                                    const completedStages =
                                        product.stageData.filter(
                                            (s) => s.status === "COMPLETED"
                                        ).length;
                                    const totalStages =
                                        product.stageData.length;

                                    return (
                                        <Link
                                            key={product.id}
                                            href={`/dashboard/products/${product.id}`}
                                            className="block"
                                        >
                                            <div className="p-4 border border-zinc-700 rounded-lg hover:bg-zinc-800/50 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-zinc-200">
                                                        {product.name}
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-zinc-800 text-zinc-300"
                                                    >
                                                        {product.batchId}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 transition-all"
                                                            style={{
                                                                width: `${
                                                                    totalStages >
                                                                    0
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
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                                <p className="text-zinc-500 mb-4">
                                    No products yet
                                </p>
                                <Link
                                    href={`/dashboard/products/new?pipelineId=${pipeline.id}`}
                                >
                                    <Button
                                        variant="outline"
                                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                    >
                                        Add First Product
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
