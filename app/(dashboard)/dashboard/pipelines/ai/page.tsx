"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AICopilotChat } from "@/components/copilot/ai-copilot-chat";
import { PipelinePreview } from "@/components/copilot/pipeline-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, PanelRightClose, PanelRight } from "lucide-react";
import Link from "next/link";

interface PipelineStage {
    name: string;
    description: string;
    order: number;
    suggestedMetadata: string[];
    validationRules?: string[];
}

interface GeneratedPipeline {
    name: string;
    description: string;
    stages: PipelineStage[];
    industry?: string;
    suggestions?: string[];
}

export default function AICopilotPage() {
    const router = useRouter();
    const [pipeline, setPipeline] = useState<GeneratedPipeline | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [error, setError] = useState("");

    function handlePipelineGenerated(newPipeline: GeneratedPipeline) {
        setPipeline(newPipeline);
        setShowPreview(true);
    }

    function handlePipelineUpdate(updatedPipeline: GeneratedPipeline) {
        setPipeline(updatedPipeline);
    }

    async function handleSavePipeline() {
        if (!pipeline) return;

        setIsSaving(true);
        setError("");

        try {
            const res = await fetch("/api/copilot/create-pipeline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pipeline }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to save pipeline");
            }

            router.push(`/dashboard/pipelines/${data.pipeline.id}`);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to save pipeline",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/pipelines">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-400 hover:text-zinc-100"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-zinc-100">
                                AI Pipeline Copilot
                            </h1>
                            <p className="text-xs text-zinc-500">
                                Describe your process, let AI build your
                                pipeline
                            </p>
                        </div>
                    </div>
                </div>
                {pipeline && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 md:hidden"
                    >
                        {showPreview ? (
                            <PanelRightClose className="w-4 h-4" />
                        ) : (
                            <PanelRight className="w-4 h-4" />
                        )}
                    </Button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-md">
                    {error}
                </div>
            )}

            {/* Main Content - Two panels side by side */}
            <div className="flex gap-4">
                {/* Chat Panel */}
                <div
                    className={`flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl h-[600px] flex flex-col overflow-hidden ${
                        pipeline && showPreview ? "hidden md:flex" : "flex"
                    }`}
                >
                    <AICopilotChat
                        onPipelineGenerated={handlePipelineGenerated}
                        currentPipeline={pipeline}
                    />
                </div>

                {/* Preview Panel */}
                {pipeline && (
                    <div
                        className={`md:w-[450px] bg-zinc-900/50 border border-zinc-800 rounded-xl h-[600px] flex flex-col overflow-hidden ${
                            showPreview ? "flex-1 md:flex-none" : "hidden"
                        }`}
                    >
                        {/* Header - fixed */}
                        <div className="flex items-center justify-between p-3 border-b border-zinc-800 shrink-0">
                            <h2 className="text-sm font-medium text-zinc-300">
                                Pipeline Preview
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPreview(false)}
                                className="text-zinc-500 hover:text-zinc-300 md:hidden"
                            >
                                Back to Chat
                            </Button>
                        </div>
                        {/* Content - scrollable, takes remaining space */}
                        <PipelinePreview
                            pipeline={pipeline}
                            onUpdate={handlePipelineUpdate}
                            onSave={handleSavePipeline}
                            isSaving={isSaving}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
