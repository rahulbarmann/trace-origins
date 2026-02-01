import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { GeneratedPipeline } from "@/lib/openai";

export async function POST(request: NextRequest) {
    const user = await getCurrentUser();

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { pipeline } = body as { pipeline: GeneratedPipeline };

        if (!pipeline || !pipeline.name || !pipeline.stages) {
            return NextResponse.json(
                { error: "Valid pipeline data is required" },
                { status: 400 },
            );
        }

        // Create the pipeline with stages in a transaction
        const createdPipeline = await prisma.$transaction(async (tx) => {
            const newPipeline = await tx.pipeline.create({
                data: {
                    name: pipeline.name,
                    description: pipeline.description || null,
                    companyId: user.company!.id,
                },
            });

            // Create all stages
            await tx.stage.createMany({
                data: pipeline.stages.map((stage, index) => ({
                    name: stage.name,
                    description: stage.description || null,
                    order: stage.order ?? index,
                    pipelineId: newPipeline.id,
                })),
            });

            return tx.pipeline.findUnique({
                where: { id: newPipeline.id },
                include: { stages: { orderBy: { order: "asc" } } },
            });
        });

        return NextResponse.json(
            { pipeline: createdPipeline },
            { status: 201 },
        );
    } catch (error) {
        console.error("Pipeline creation error:", error);
        return NextResponse.json(
            { error: "Failed to create pipeline" },
            { status: 500 },
        );
    }
}
