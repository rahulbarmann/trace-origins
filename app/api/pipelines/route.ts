import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { pipelineSchema } from "@/lib/validations";

export async function GET() {
    const user = await getCurrentUser();

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pipelines = await prisma.pipeline.findMany({
        where: { companyId: user.company.id },
        include: {
            stages: { orderBy: { order: "asc" } },
            _count: { select: { products: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ pipelines });
}

export async function POST(request: NextRequest) {
    const user = await getCurrentUser();

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

        const pipeline = await prisma.pipeline.create({
            data: {
                ...validation.data,
                companyId: user.company.id,
            },
            include: { stages: true },
        });

        return NextResponse.json({ pipeline }, { status: 201 });
    } catch (error) {
        console.error("Pipeline creation error:", error);
        return NextResponse.json(
            { error: "Failed to create pipeline" },
            { status: 500 }
        );
    }
}
