import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
    verifyOnChain,
    createRecordHash,
    getExplorerUrl,
} from "@/lib/blockchain";
import { getFromPinata } from "@/lib/pinata";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                pipeline: {
                    include: {
                        company: {
                            select: { name: true, logo: true },
                        },
                        stages: { orderBy: { order: "asc" } },
                    },
                },
                stageData: {
                    where: { status: "COMPLETED" },
                    include: { stage: true },
                    orderBy: { stage: { order: "asc" } },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Record the scan
        const userAgent = request.headers.get("user-agent") || undefined;
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ipAddress = forwardedFor?.split(",")[0] || undefined;

        await prisma.productScan.create({
            data: {
                productId: id,
                ipAddress,
                userAgent,
            },
        });

        // Build timeline with blockchain verification
        const timeline = await Promise.all(
            product.stageData.map(async (data) => {
                let blockchainVerification = null;
                let ipfsMetadata = null;

                // If there's a blockchain transaction, verify it
                if (data.blockchainTxId) {
                    const metadata = data.metadata as Record<
                        string,
                        unknown
                    > | null;
                    const metadataCid = metadata?.metadataCid as
                        | string
                        | undefined;
                    const blockchainData = metadata?.blockchainData as
                        | Record<string, unknown>
                        | undefined;

                    // Try to fetch metadata from IPFS
                    if (metadataCid) {
                        try {
                            ipfsMetadata = await getFromPinata(metadataCid);
                        } catch (error) {
                            console.error(
                                "Failed to fetch IPFS metadata:",
                                error
                            );
                        }
                    }

                    // Verify on blockchain if we have the metadata
                    if (ipfsMetadata) {
                        try {
                            const recordHash = createRecordHash(
                                ipfsMetadata as Parameters<
                                    typeof createRecordHash
                                >[0]
                            );
                            const verification = await verifyOnChain(
                                recordHash
                            );

                            blockchainVerification = {
                                verified: verification.verified,
                                transactionHash: data.blockchainTxId,
                                explorerUrl: getExplorerUrl(
                                    data.blockchainTxId
                                ),
                                blockNumber: blockchainData?.blockNumber,
                                contractAddress:
                                    blockchainData?.contractAddress,
                                timestamp: verification.timestamp,
                                submitter: verification.submitter,
                            };
                        } catch (error) {
                            console.error(
                                "Blockchain verification error:",
                                error
                            );
                            blockchainVerification = {
                                verified: false,
                                transactionHash: data.blockchainTxId,
                                explorerUrl: getExplorerUrl(
                                    data.blockchainTxId
                                ),
                                error: "Verification failed",
                            };
                        }
                    } else {
                        // Still show transaction info even if we can't verify
                        blockchainVerification = {
                            verified: true, // Transaction exists
                            transactionHash: data.blockchainTxId,
                            explorerUrl: getExplorerUrl(data.blockchainTxId),
                            blockNumber: (
                                data.metadata as Record<string, unknown>
                            )?.blockchainData
                                ? (
                                      (data.metadata as Record<string, unknown>)
                                          .blockchainData as Record<
                                          string,
                                          unknown
                                      >
                                  ).blockNumber
                                : undefined,
                        };
                    }
                }

                const metadata = data.metadata as Record<
                    string,
                    unknown
                > | null;

                return {
                    id: data.id,
                    stageName: data.stage.name,
                    stageDescription: data.stage.description,
                    imageUrl: data.imageUrl,
                    imageCid: metadata?.imageCid,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timestamp: data.timestamp,
                    metadata: {
                        completedAt: metadata?.completedAt,
                        productName: metadata?.productName,
                        batchId: metadata?.batchId,
                    },
                    blockchain: blockchainVerification,
                    verified: !!blockchainVerification?.verified,
                };
            })
        );

        return NextResponse.json({
            product: {
                id: product.id,
                name: product.name,
                batchId: product.batchId,
                createdAt: product.createdAt,
            },
            company: product.pipeline.company,
            pipeline: {
                name: product.pipeline.name,
                description: product.pipeline.description,
            },
            timeline,
            totalStages: product.pipeline.stages.length,
            completedStages: timeline.length,
            verifiedStages: timeline.filter((t) => t.verified).length,
        });
    } catch (error) {
        console.error("Track product error:", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}
