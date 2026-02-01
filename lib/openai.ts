import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiClient;
}

export interface PipelineStage {
    name: string;
    description: string;
    order: number;
    suggestedMetadata: string[];
    validationRules?: string[];
}

export interface GeneratedPipeline {
    name: string;
    description: string;
    stages: PipelineStage[];
    industry?: string;
    suggestions?: string[];
}

export interface CopilotMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

const SYSTEM_PROMPT = `You are an AI copilot specialized in helping vendors create product traceability pipelines. Your role is to:

1. Parse natural language descriptions of supply chains, manufacturing processes, or product journeys
2. Generate structured pipeline configurations with stages, metadata fields, and validation rules
3. Suggest improvements and best practices for traceability
4. Help refine pipelines through conversational iteration

When a user describes their process, extract:
- Sequential stages (e.g., Sourcing, Processing, Quality Check, Packaging, Distribution)
- Relevant metadata for each stage (e.g., supplier ID, batch weight, temperature, geo-location)
- Validation rules (e.g., required fields, geo-tagging requirements)
- Industry-specific considerations

Always respond in a helpful, conversational manner. When generating or modifying pipelines, include the pipeline JSON in your response wrapped in <pipeline> tags.

Example pipeline format:
<pipeline>
{
  "name": "Coffee Bean Supply Chain",
  "description": "Track coffee beans from farm to cup",
  "industry": "Food & Beverage",
  "stages": [
    {
      "name": "Sourcing",
      "description": "Coffee bean harvesting at origin farm",
      "order": 0,
      "suggestedMetadata": ["Farm ID", "Harvest Date", "Bean Variety", "Altitude"],
      "validationRules": ["Geo-location required", "Farm certification check"]
    }
  ],
  "suggestions": ["Consider adding a cupping/quality scoring stage"]
}
</pipeline>

Be proactive in suggesting improvements and asking clarifying questions to create comprehensive pipelines.`;

export async function generatePipelineFromDescription(
    messages: CopilotMessage[],
): Promise<{ response: string; pipeline: GeneratedPipeline | null }> {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m) => ({
                role: m.role as "user" | "assistant" | "system",
                content: m.content,
            })),
        ],
        temperature: 0.7,
        max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content || "";

    // Extract pipeline JSON if present
    const pipelineMatch = responseContent.match(
        /<pipeline>([\s\S]*?)<\/pipeline>/,
    );
    let pipeline: GeneratedPipeline | null = null;

    if (pipelineMatch) {
        try {
            pipeline = JSON.parse(pipelineMatch[1].trim());
        } catch {
            console.error("Failed to parse pipeline JSON");
        }
    }

    // Clean response by removing pipeline tags for display
    const cleanResponse = responseContent
        .replace(/<pipeline>[\s\S]*?<\/pipeline>/g, "")
        .trim();

    return { response: cleanResponse, pipeline };
}

export async function refinePipeline(
    currentPipeline: GeneratedPipeline,
    userRequest: string,
    conversationHistory: CopilotMessage[],
): Promise<{ response: string; pipeline: GeneratedPipeline | null }> {
    const refinementPrompt = `Current pipeline configuration:
<pipeline>
${JSON.stringify(currentPipeline, null, 2)}
</pipeline>

User request: ${userRequest}

Please update the pipeline based on the user's request and provide the modified pipeline.`;

    const messages: CopilotMessage[] = [
        ...conversationHistory,
        { role: "user", content: refinementPrompt },
    ];

    return generatePipelineFromDescription(messages);
}

export async function suggestImprovements(
    pipeline: GeneratedPipeline,
): Promise<string[]> {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `You are a supply chain traceability expert. Analyze the given pipeline and suggest 3-5 specific improvements. Return only a JSON array of suggestion strings.`,
            },
            {
                role: "user",
                content: `Analyze this pipeline and suggest improvements:\n${JSON.stringify(pipeline, null, 2)}`,
            },
        ],
        temperature: 0.7,
        max_tokens: 500,
    });

    try {
        const content = completion.choices[0]?.message?.content || "[]";
        return JSON.parse(content);
    } catch {
        return [];
    }
}

export { getOpenAIClient };
