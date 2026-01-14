import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
    createRecordHash,
    storeOnChain,
    hashData,
    getExplorerUrl,
} from "@/lib/blockchain";
import {
    uploadBase64ImageToPinata,
    uploadMetadataToPinata,
    type TraceabilityMetadata,
} from "@/lib/pinata";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; stageId: string }> }
) {
    const user = await getCurrentUser();
    const { id: productId, stageId } = await params;

    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                pipeline: { companyId: user.company.id },
            },
            include: {
                pipeline: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const stageData = await prisma.stageData.findFirst({
            where: { productId, stageId },
            include: { stage: true },
        });

        if (!stageData) {
            return NextResponse.json(
                { error: "Stage data not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { imageData, latitude, longitude, metadata, status } = body;

        let imageUrl: string | null = null;
        let imageHash: string | null = null;
        let imageCid: string | null = null;
        let metadataCid: string | null = null;
        let blockchainTxId: string | null = null;
        let blockchainData: {
            transactionHash: string;
            blockNumber: number;
            gasUsed: string;
            contractAddress: string;
            explorerUrl: string;
        } | null = null;

        // Step 1: Upload image to Pinata IPFS if provided
        if (
            imageData &&
            typeof imageData === "string" &&
            imageData.startsWith("data:image")
        ) {
            console.log("Uploading image to Pinata IPFS...");

            // Calculate image hash from base64 data
            const base64Content = imageData.replace(
                /^data:image\/\w+;base64,/,
                ""
            );
            imageHash = hashData(base64Content);

            const filename = `${productId}_${stageId}_${Date.now()}.jpg`;
            const imageUpload = await uploadBase64ImageToPinata(
                imageData,
                filename
            );

            imageUrl = imageUpload.url;
            imageCid = imageUpload.cid;

            console.log("Image uploaded to IPFS:", imageCid);
        }

        // Step 2: If completing the stage, store on blockchain
        if (
            status === "COMPLETED" &&
            latitude !== undefined &&
            longitude !== undefined
        ) {
            const timestamp = Date.now();

            // Create traceability metadata
            const traceabilityMetadata: TraceabilityMetadata = {
                productId,
                stageId,
                stageName: stageData.stage.name,
                imageHash: imageHash || "",
                imageCid: imageCid || undefined,
                latitude,
                longitude,
                timestamp,
                metadata: {
                    ...metadata,
                    productName: product.name,
                    batchId: product.batchId,
                    pipelineName: product.pipeline.name,
                    companyId: user.company.id,
                    completedBy: user.email,
                },
            };

            // Step 3: Upload metadata to Pinata IPFS
            console.log("Uploading metadata to Pinata IPFS...");
            const metadataUpload = await uploadMetadataToPinata(
                traceabilityMetadata
            );
            metadataCid = metadataUpload.cid;
            console.log("Metadata uploaded to IPFS:", metadataCid);

            // Step 4: Create record hash and store on blockchain
            const recordHash = createRecordHash(traceabilityMetadata);
            console.log("Record hash:", recordHash);

            console.log("Storing record on blockchain...");
            const blockchainResult = await storeOnChain(
                recordHash,
                metadataCid
            );

            blockchainTxId = blockchainResult.transactionHash;
            blockchainData = {
                ...blockchainResult,
                explorerUrl: getExplorerUrl(blockchainResult.transactionHash),
            };

            console.log("Blockchain transaction confirmed:", blockchainTxId);

            // Step 5: Store blockchain record in database
            await prisma.blockchainRecord.create({
                data: {
                    transactionId: blockchainResult.transactionHash,
                    dataHash: recordHash,
                    metadata: JSON.parse(
                        JSON.stringify({
                            ...traceabilityMetadata,
                            metadataCid,
                            contractAddress: blockchainResult.contractAddress,
                        })
                    ),
                    blockNumber: blockchainResult.blockNumber,
                    gasUsed: blockchainResult.gasUsed,
                },
            });
        }

        // Step 6: Update stage data in database
        const updated = await prisma.stageData.update({
            where: { id: stageData.id },
            data: {
                imageUrl,
                imageHash,
                latitude,
                longitude,
                metadata: {
                    ...metadata,
                    imageCid,
                    metadataCid,
                    blockchainData,
                },
                status,
                blockchainTxId,
                timestamp: new Date(),
            },
            include: { stage: true },
        });

        return NextResponse.json({
            stageData: updated,
            blockchain: blockchainData,
            ipfs: {
                imageCid,
                metadataCid,
                imageUrl,
            },
        });
    } catch (error) {
        console.error("Stage data update error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update stage data",
            },
            { status: 500 }
        );
    }
}
