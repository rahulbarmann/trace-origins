import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateQRCode } from "@/lib/qr";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findFirst({
        where: {
            id,
            pipeline: { companyId: user.company.id },
        },
        include: {
            pipeline: {
                include: { stages: { orderBy: { order: "asc" } } },
            },
            stageData: {
                include: { stage: true },
                orderBy: { stage: { order: "asc" } },
            },
            scans: {
                orderBy: { createdAt: "desc" },
                take: 50,
            },
        },
    });

    if (!product) {
        return NextResponse.json(
            { error: "Product not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({ product });
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
        const product = await prisma.product.findFirst({
            where: {
                id,
                pipeline: { companyId: user.company.id },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        await prisma.product.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Product deletion error:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
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
        const product = await prisma.product.findFirst({
            where: {
                id,
                pipeline: { companyId: user.company.id },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const qrCode = await generateQRCode(id);

        const updated = await prisma.product.update({
            where: { id },
            data: { qrCode },
        });

        return NextResponse.json({ product: updated, qrCode });
    } catch (error) {
        console.error("QR regeneration error:", error);
        return NextResponse.json(
            { error: "Failed to regenerate QR code" },
            { status: 500 }
        );
    }
}
