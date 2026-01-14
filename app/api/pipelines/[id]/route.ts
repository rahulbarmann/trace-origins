import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { pipelineSchema } from "@/lib/validations";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pipeline = await prisma.pipeline.findFirst({
        where: { id, companyId: user.company.id },
        include: {
            stages: { orderBy: { order: "asc" } },
            products: {
                include: {
                    stageData: { include: { stage: true } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!pipeline) {
        return NextResponse.json(
            { error: "Pipeline not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({ pipeline });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validation = pipelineSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const pipeline = await prisma.pipeline.updateMany({
            where: { id, companyId: user.company.id },
            data: validation.data,
        });

        if (pipeline.count === 0) {
            return NextResponse.json(
                { error: "Pipeline not found" },
                { status: 404 }
            );
        }

        const updated = await prisma.pipeline.findUnique({
            where: { id },
            include: { stages: { orderBy: { order: "asc" } } },
        });

        return NextResponse.json({ pipeline: updated });
    } catch (error) {
        console.error("Pipeline update error:", error);
        return NextResponse.json(
            { error: "Failed to update pipeline" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await prisma.pipeline.deleteMany({
            where: { id, companyId: user.company.id },
        });

        if (result.count === 0) {
            return NextResponse.json(
                { error: "Pipeline not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Pipeline deletion error:", error);
        return NextResponse.json(
            { error: "Failed to delete pipeline" },
            { status: 500 }
        );
    }
}
