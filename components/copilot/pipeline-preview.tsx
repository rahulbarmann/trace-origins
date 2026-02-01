"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    GripVertical,
    Trash2,
    Plus,
    ChevronDown,
    ChevronUp,
    Check,
    Pencil,
    X,
    Lightbulb,
    ArrowRight,
} from "lucide-react";

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

interface PipelinePreviewProps {
    pipeline: GeneratedPipeline;
    onUpdate: (pipeline: GeneratedPipeline) => void;
    onSave: () => void;
    isSaving: boolean;
}

export function PipelinePreview({
    pipeline,
    onUpdate,
    onSave,
    isSaving,
}: PipelinePreviewProps) {
    const [editingName, setEditingName] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [expandedStages, setExpandedStages] = useState<Set<number>>(
        new Set([0]),
    );
    const [editingStage, setEditingStage] = useState<number | null>(null);

    function toggleStageExpand(index: number) {
        const newExpanded = new Set(expandedStages);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedStages(newExpanded);
    }

    function updatePipelineName(name: string) {
        onUpdate({ ...pipeline, name });
        setEditingName(false);
    }

    function updatePipelineDescription(description: string) {
        onUpdate({ ...pipeline, description });
        setEditingDescription(false);
    }

    function updateStage(index: number, updates: Partial<PipelineStage>) {
        const newStages = [...pipeline.stages];
        newStages[index] = { ...newStages[index], ...updates };
        onUpdate({ ...pipeline, stages: newStages });
    }

    function removeStage(index: number) {
        const newStages = pipeline.stages
            .filter((_, i) => i !== index)
            .map((stage, i) => ({ ...stage, order: i }));
        onUpdate({ ...pipeline, stages: newStages });
    }

    function addStage() {
        const newStage: PipelineStage = {
            name: `Stage ${pipeline.stages.length + 1}`,
            description: "",
            order: pipeline.stages.length,
            suggestedMetadata: [],
            validationRules: [],
        };
        onUpdate({ ...pipeline, stages: [...pipeline.stages, newStage] });
        setExpandedStages(new Set([...expandedStages, pipeline.stages.length]));
        setEditingStage(pipeline.stages.length);
    }

    function moveStage(index: number, direction: "up" | "down") {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= pipeline.stages.length) return;

        const newStages = [...pipeline.stages];
        [newStages[index], newStages[newIndex]] = [
            newStages[newIndex],
            newStages[index],
        ];
        newStages.forEach((stage, i) => (stage.order = i));
        onUpdate({ ...pipeline, stages: newStages });
    }

    function addMetadataField(stageIndex: number, field: string) {
        if (!field.trim()) return;
        const stage = pipeline.stages[stageIndex];
        if (!stage.suggestedMetadata.includes(field)) {
            updateStage(stageIndex, {
                suggestedMetadata: [...stage.suggestedMetadata, field],
            });
        }
    }

    function removeMetadataField(stageIndex: number, field: string) {
        const stage = pipeline.stages[stageIndex];
        updateStage(stageIndex, {
            suggestedMetadata: stage.suggestedMetadata.filter(
                (f) => f !== field,
            ),
        });
    }

    return (
        <>
            {/* Scrollable Content Area - this is the key: fixed height with overflow */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4 smooth-scroll"
                data-lenis-prevent
            >
                {/* Pipeline Header */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                            {editingName ? (
                                <Input
                                    autoFocus
                                    defaultValue={pipeline.name}
                                    onBlur={(e) =>
                                        updatePipelineName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            updatePipelineName(
                                                e.currentTarget.value,
                                            );
                                        }
                                        if (e.key === "Escape") {
                                            setEditingName(false);
                                        }
                                    }}
                                    className="text-lg font-semibold bg-zinc-800 border-zinc-700 text-zinc-100"
                                />
                            ) : (
                                <CardTitle
                                    className="text-zinc-100 cursor-pointer hover:text-zinc-300 flex items-center gap-2"
                                    onClick={() => setEditingName(true)}
                                >
                                    {pipeline.name}
                                    <Pencil className="w-3 h-3 opacity-50" />
                                </CardTitle>
                            )}
                            {pipeline.industry && (
                                <Badge
                                    variant="secondary"
                                    className="bg-violet-900/30 text-violet-300 border-violet-800"
                                >
                                    {pipeline.industry}
                                </Badge>
                            )}
                        </div>
                        {editingDescription ? (
                            <Textarea
                                autoFocus
                                defaultValue={pipeline.description}
                                onBlur={(e) =>
                                    updatePipelineDescription(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        setEditingDescription(false);
                                    }
                                }}
                                className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-300"
                                rows={2}
                            />
                        ) : (
                            <CardDescription
                                className="text-zinc-500 cursor-pointer hover:text-zinc-400 flex items-center gap-1"
                                onClick={() => setEditingDescription(true)}
                            >
                                {pipeline.description || "Add description..."}
                                <Pencil className="w-3 h-3 opacity-50" />
                            </CardDescription>
                        )}
                    </CardHeader>
                </Card>

                {/* Stages */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-zinc-300">
                            Pipeline Stages ({pipeline.stages.length})
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addStage}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Stage
                        </Button>
                    </div>

                    {/* Visual Pipeline Flow */}
                    <div className="flex items-center gap-1 py-2 overflow-x-auto">
                        {pipeline.stages.map((stage, index) => (
                            <div key={index} className="flex items-center">
                                <div
                                    className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs text-zinc-300 whitespace-nowrap cursor-pointer hover:bg-zinc-700"
                                    onClick={() => toggleStageExpand(index)}
                                >
                                    {stage.name}
                                </div>
                                {index < pipeline.stages.length - 1 && (
                                    <ArrowRight className="w-4 h-4 text-zinc-600 mx-1 shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Stage Cards */}
                    <div className="space-y-2">
                        {pipeline.stages.map((stage, index) => (
                            <Card
                                key={index}
                                className="bg-zinc-800/50 border-zinc-700"
                            >
                                <div
                                    className="flex items-center gap-2 p-3 cursor-pointer"
                                    onClick={() => toggleStageExpand(index)}
                                >
                                    <GripVertical className="w-4 h-4 text-zinc-600" />
                                    <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300">
                                        {index + 1}
                                    </span>
                                    {editingStage === index ? (
                                        <Input
                                            autoFocus
                                            defaultValue={stage.name}
                                            onClick={(e) => e.stopPropagation()}
                                            onBlur={(e) => {
                                                updateStage(index, {
                                                    name: e.target.value,
                                                });
                                                setEditingStage(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    updateStage(index, {
                                                        name: e.currentTarget
                                                            .value,
                                                    });
                                                    setEditingStage(null);
                                                }
                                                if (e.key === "Escape") {
                                                    setEditingStage(null);
                                                }
                                            }}
                                            className="flex-1 h-7 bg-zinc-700 border-zinc-600 text-zinc-100"
                                        />
                                    ) : (
                                        <span
                                            className="flex-1 font-medium text-zinc-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingStage(index);
                                            }}
                                        >
                                            {stage.name}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveStage(index, "up");
                                            }}
                                            disabled={index === 0}
                                            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-300"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveStage(index, "down");
                                            }}
                                            disabled={
                                                index ===
                                                pipeline.stages.length - 1
                                            }
                                            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-300"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeStage(index);
                                            }}
                                            className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        {expandedStages.has(index) ? (
                                            <ChevronUp className="w-4 h-4 text-zinc-500" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-zinc-500" />
                                        )}
                                    </div>
                                </div>

                                {expandedStages.has(index) && (
                                    <CardContent className="pt-0 pb-3 px-3 space-y-3">
                                        <div>
                                            <label className="text-xs text-zinc-500 mb-1 block">
                                                Description
                                            </label>
                                            <Textarea
                                                value={stage.description}
                                                onChange={(e) =>
                                                    updateStage(index, {
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Describe this stage..."
                                                className="bg-zinc-700/50 border-zinc-600 text-zinc-200 text-sm"
                                                rows={2}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-zinc-500 mb-1 block">
                                                Metadata Fields
                                            </label>
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {stage.suggestedMetadata.map(
                                                    (field) => (
                                                        <Badge
                                                            key={field}
                                                            variant="secondary"
                                                            className="bg-zinc-700 text-zinc-300 border-zinc-600 pr-1"
                                                        >
                                                            {field}
                                                            <button
                                                                onClick={() =>
                                                                    removeMetadataField(
                                                                        index,
                                                                        field,
                                                                    )
                                                                }
                                                                className="ml-1 hover:text-red-400"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                            <Input
                                                placeholder="Add metadata field..."
                                                className="bg-zinc-700/50 border-zinc-600 text-zinc-200 text-sm h-8"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        addMetadataField(
                                                            index,
                                                            e.currentTarget
                                                                .value,
                                                        );
                                                        e.currentTarget.value =
                                                            "";
                                                    }
                                                }}
                                            />
                                        </div>

                                        {stage.validationRules &&
                                            stage.validationRules.length >
                                                0 && (
                                                <div>
                                                    <label className="text-xs text-zinc-500 mb-1 block">
                                                        Validation Rules
                                                    </label>
                                                    <div className="space-y-1">
                                                        {stage.validationRules.map(
                                                            (rule, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="text-xs text-zinc-400 flex items-center gap-1"
                                                                >
                                                                    <Check className="w-3 h-3 text-green-500" />
                                                                    {rule}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* AI Suggestions */}
                {pipeline.suggestions && pipeline.suggestions.length > 0 && (
                    <Card className="bg-amber-900/10 border-amber-800/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                AI Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ul className="space-y-1">
                                {pipeline.suggestions.map((suggestion, i) => (
                                    <li
                                        key={i}
                                        className="text-sm text-amber-200/80"
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Save Button - Fixed at bottom */}
            <div className="border-t border-zinc-800 p-4 shrink-0">
                <Button
                    onClick={onSave}
                    disabled={isSaving || pipeline.stages.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                    {isSaving ? (
                        <>Saving Pipeline...</>
                    ) : (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Save Pipeline
                        </>
                    )}
                </Button>
            </div>
        </>
    );
}
