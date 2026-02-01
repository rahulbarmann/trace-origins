import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generatePipelineFromDescription, CopilotMessage } from "@/lib/openai";

export async function POST(request: NextRequest) {
    const user = await getCurrentUser();

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { messages } = body as { messages: CopilotMessage[] };

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 },
            );
        }

        const { response, pipeline } =
            await generatePipelineFromDescription(messages);

        return NextResponse.json({
            response,
            pipeline,
        });
    } catch (error) {
        console.error("Copilot error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 },
        );
    }
}
