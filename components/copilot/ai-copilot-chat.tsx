"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send, Bot, User, Loader2, Sparkles, Lightbulb } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

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

interface AICopilotChatProps {
    onPipelineGenerated: (pipeline: GeneratedPipeline) => void;
    currentPipeline: GeneratedPipeline | null;
}

const EXAMPLE_PROMPTS = [
    "We source cotton from farms in India, spin it into yarn, dye it, weave into fabric, and package for retail.",
    "Our coffee goes from farm harvesting, to processing, roasting, quality testing, and finally packaging.",
    "We manufacture electronics: component sourcing, PCB assembly, quality inspection, firmware flashing, and shipping.",
    "Organic honey production: beekeeping, harvesting, filtering, bottling, and distribution.",
];

export function AICopilotChat({
    onPipelineGenerated,
    currentPipeline,
}: AICopilotChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const conversationHistory = [
                ...messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
                { role: "user" as const, content: userMessage.content },
            ];

            const res = await fetch("/api/copilot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: conversationHistory }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to get response");
            }

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            if (data.pipeline) {
                onPipelineGenerated(data.pipeline);
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content:
                    "Sorry, I encountered an error. Please try again or rephrase your request.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }

    function handleExampleClick(example: string) {
        setInput(example);
        textareaRef.current?.focus();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4 smooth-scroll"
                data-lenis-prevent
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-violet-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                            AI Pipeline Copilot
                        </h3>
                        <p className="text-zinc-400 text-sm mb-6 max-w-md">
                            Describe your supply chain or manufacturing process
                            in natural language, and I will help you create a
                            complete traceability pipeline.
                        </p>
                        <div className="w-full max-w-lg space-y-2">
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mb-2">
                                <Lightbulb className="w-3 h-3" />
                                Try one of these examples:
                            </p>
                            {EXAMPLE_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleExampleClick(prompt)}
                                    className="w-full text-left p-3 text-sm text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3",
                                    message.role === "user"
                                        ? "justify-end"
                                        : "justify-start",
                                )}
                            >
                                {message.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-violet-400" />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-2xl px-4 py-3",
                                        message.role === "user"
                                            ? "bg-violet-600 text-white"
                                            : "bg-zinc-800 text-zinc-100",
                                    )}
                                >
                                    <p className="text-sm whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                                {message.role === "user" && (
                                    <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-zinc-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-violet-400" />
                                </div>
                                <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-zinc-800 p-4">
                {currentPipeline && (
                    <div className="mb-3 p-2 bg-green-900/20 border border-green-800/50 rounded-lg">
                        <p className="text-xs text-green-400">
                            Pipeline generated: {currentPipeline.name} with{" "}
                            {currentPipeline.stages.length} stages. You can
                            refine it by chatting or edit manually.
                        </p>
                    </div>
                )}
                <form
                    onSubmit={handleSubmit}
                    className="flex gap-2 items-stretch"
                >
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your supply chain or ask me to modify the pipeline..."
                        className="flex-1 min-h-[44px] max-h-32 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none"
                        rows={1}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 h-[44px]"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
