import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { generateQRCode } from "@/lib/qr";
import { generateBatchId } from "@/lib/utils";

export async function GET(request: NextRequest) {
    const user = await getCurrentUser();

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pipelineId = searchParams.get("pipelineId");

    const products = await prisma.product.findMany({
        where: {
            pipeline: { companyId: user.company.id },
            ...(pipelineId && { pipelineId }),
        },
        include: {
            pipeline: true,
            stageData: {
                include: { stage: true },
                orderBy: { stage: { order: "asc" } },
            },
            _count: { select: { scans: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
    const user = await getCurrentUser();

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validation = productSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const pipeline = await prisma.pipeline.findFirst({
            where: {
                id: validation.data.pipelineId,
                companyId: user.company.id,
            },
            include: { stages: { orderBy: { order: "asc" } } },
        });

        if (!pipeline) {
            return NextResponse.json(
                { error: "Pipeline not found" },
                { status: 404 }
            );
        }

        const batchId = generateBatchId();

        const product = await prisma.product.create({
            data: {
                name: validation.data.name,
                batchId,
                pipelineId: pipeline.id,
                stageData: {
                    create: pipeline.stages.map((stage) => ({
                        stageId: stage.id,
                        status: "PENDING",
                    })),
                },
            },
            include: {
                pipeline: true,
                stageData: { include: { stage: true } },
            },
        });

        const qrCode = await generateQRCode(product.id);

        const updatedProduct = await prisma.product.update({
            where: { id: product.id },
            data: { qrCode },
            include: {
                pipeline: true,
                stageData: { include: { stage: true } },
            },
        });

        return NextResponse.json({ product: updatedProduct }, { status: 201 });
    } catch (error) {
        console.error("Product creation error:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}
