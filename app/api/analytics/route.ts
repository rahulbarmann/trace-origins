import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RecentScan {
    id: string;
    location: string | null;
    createdAt: Date;
    product: {
        name: string;
        batchId: string;
    };
}

export async function GET() {
    const user = await getCurrentUser();

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = user.company.id;

    const [
        pipelineCount,
        productCount,
        totalScans,
        recentScans,
        productsByPipeline,
        scansByDay,
    ] = await Promise.all([
        prisma.pipeline.count({ where: { companyId } }),
        prisma.product.count({ where: { pipeline: { companyId } } }),
        prisma.productScan.count({
            where: { product: { pipeline: { companyId } } },
        }),
        prisma.productScan.findMany({
            where: { product: { pipeline: { companyId } } },
            include: { product: { select: { name: true, batchId: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
        }) as Promise<RecentScan[]>,
        prisma.pipeline.findMany({
            where: { companyId },
            select: {
                id: true,
                name: true,
                _count: { select: { products: true } },
            },
        }),
        prisma.$queryRaw`
      SELECT DATE(ps."createdAt") as date, COUNT(*)::int as count
      FROM "ProductScan" ps
      JOIN "Product" p ON ps."productId" = p.id
      JOIN "Pipeline" pl ON p."pipelineId" = pl.id
      WHERE pl."companyId" = ${companyId}
      AND ps."createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(ps."createdAt")
      ORDER BY date DESC
    ` as Promise<{ date: Date; count: number }[]>,
    ]);

    return NextResponse.json({
        overview: {
            pipelines: pipelineCount,
            products: productCount,
            totalScans,
        },
        recentScans: recentScans.map((scan: RecentScan) => ({
            id: scan.id,
            productName: scan.product.name,
            batchId: scan.product.batchId,
            location: scan.location,
            createdAt: scan.createdAt,
        })),
        productsByPipeline: productsByPipeline.map((p) => ({
            name: p.name,
            count: p._count.products,
        })),
        scansByDay,
    });
}
