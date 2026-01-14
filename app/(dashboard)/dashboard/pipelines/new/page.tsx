"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

export default function NewPipelinePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [stages, setStages] = useState<string[]>([""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function addStage() {
        setStages([...stages, ""]);
    }

    function removeStage(index: number) {
        setStages(stages.filter((_, i) => i !== index));
    }

    function updateStage(index: number, value: string) {
        const newStages = [...stages];
        newStages[index] = value;
        setStages(newStages);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const pipelineRes = await fetch("/api/pipelines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description }),
            });

            const pipelineData = await pipelineRes.json();

            if (!pipelineRes.ok) {
                setError(pipelineData.error || "Failed to create pipeline");
                return;
            }

            const pipelineId = pipelineData.pipeline.id;
            const validStages = stages.filter((s) => s.trim());

            for (let i = 0; i < validStages.length; i++) {
                await fetch(`/api/pipelines/${pipelineId}/stages`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: validStages[i],
                        order: i,
                    }),
                });
            }

            router.push(`/dashboard/pipelines/${pipelineId}`);
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100">
                        Create Pipeline
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        Define the stages of your product traceability pipeline
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
                                Pipeline Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., Coffee Bean Supply Chain"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="description"
                                className="text-zinc-300"
                            >
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what this pipeline tracks..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-300">Stages</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addStage}
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Stage
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {stages.map((stage, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-sm text-zinc-500 w-6">
                                            {index + 1}.
                                        </span>
                                        <Input
                                            placeholder={`Stage ${
                                                index + 1
                                            } (e.g., Sourcing, Processing)`}
                                            value={stage}
                                            onChange={(e) =>
                                                updateStage(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                                        />
                                        {stages.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    removeStage(index)
                                                }
                                                className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                            >
                                {loading ? "Creating..." : "Create Pipeline"}
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
