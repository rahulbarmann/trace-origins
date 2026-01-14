import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { stageSchema } from "@/lib/validations";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    const { id: pipelineId } = await params;

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const pipeline = await prisma.pipeline.findFirst({
            where: { id: pipelineId, companyId: user.company.id },
        });

        if (!pipeline) {
            return NextResponse.json(
                { error: "Pipeline not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validation = stageSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const stage = await prisma.stage.create({
            data: {
                ...validation.data,
                pipelineId,
            },
        });

        return NextResponse.json({ stage }, { status: 201 });
    } catch (error) {
        console.error("Stage creation error:", error);
        return NextResponse.json(
            { error: "Failed to create stage" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    const { id: pipelineId } = await params;

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const pipeline = await prisma.pipeline.findFirst({
            where: { id: pipelineId, companyId: user.company.id },
        });

        if (!pipeline) {
            return NextResponse.json(
                { error: "Pipeline not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { stages } = body as { stages: { id: string; order: number }[] };

        await prisma.$transaction(
            stages.map((stage) =>
                prisma.stage.update({
                    where: { id: stage.id },
                    data: { order: stage.order },
                })
            )
        );

        const updatedStages = await prisma.stage.findMany({
            where: { pipelineId },
            orderBy: { order: "asc" },
        });

        return NextResponse.json({ stages: updatedStages });
    } catch (error) {
        console.error("Stage reorder error:", error);
        return NextResponse.json(
            { error: "Failed to reorder stages" },
            { status: 500 }
        );
    }
}
