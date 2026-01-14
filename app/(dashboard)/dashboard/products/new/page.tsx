"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers } from "lucide-react";

interface Pipeline {
    id: string;
    name: string;
    stages: { id: string; name: string }[];
}

export default function NewProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedPipelineId = searchParams.get("pipelineId");

    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [name, setName] = useState("");
    const [pipelineId, setPipelineId] = useState(preselectedPipelineId || "");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingPipelines, setLoadingPipelines] = useState(true);

    useEffect(() => {
        fetch("/api/pipelines")
            .then((res) => res.json())
            .then((data) => {
                setPipelines(data.pipelines || []);
                if (!pipelineId && data.pipelines?.length > 0) {
                    setPipelineId(data.pipelines[0].id);
                }
            })
            .finally(() => setLoadingPipelines(false));
    }, [pipelineId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, pipelineId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to create product");
                return;
            }

            router.push(`/dashboard/products/${data.product.id}`);
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    if (loadingPipelines) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-zinc-500">Loading...</div>
            </div>
        );
    }

    if (pipelines.length === 0) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="py-12 text-center">
                        <Layers className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                        <p className="text-zinc-500 mb-4">
                            You need to create a pipeline before adding products
                        </p>
                        <Button
                            onClick={() =>
                                router.push("/dashboard/pipelines/new")
                            }
                            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                        >
                            Create Pipeline
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100">Add Product</CardTitle>
                    <CardDescription className="text-zinc-500">
                        Create a new product to track through your pipeline
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-300">
                                Product Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., Organic Coffee Batch"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pipeline" className="text-zinc-300">
                                Pipeline
                            </Label>
                            <select
                                id="pipeline"
                                className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
                                value={pipelineId}
                                onChange={(e) => setPipelineId(e.target.value)}
                                required
                            >
                                {pipelines.map((pipeline) => (
                                    <option
                                        key={pipeline.id}
                                        value={pipeline.id}
                                    >
                                        {pipeline.name} (
                                        {pipeline.stages.length} stages)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                            >
                                {loading ? "Creating..." : "Create Product"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
