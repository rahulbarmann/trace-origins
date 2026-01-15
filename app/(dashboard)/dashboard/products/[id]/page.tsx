"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Camera, RefreshCw } from "lucide-react";

interface Stage {
    id: string;
    name: string;
    description: string | null;
    order: number;
}

interface BlockchainData {
    transactionHash: string;
    blockNumber: number;
    gasUsed: string;
    contractAddress: string;
    explorerUrl: string;
}

interface StageMetadata {
    imageCid?: string;
    metadataCid?: string;
    blockchainData?: BlockchainData;
    [key: string]: unknown;
}

interface StageData {
    id: string;
    status: string;
    imageUrl: string | null;
    imageHash: string | null;
    latitude: number | null;
    longitude: number | null;
    timestamp: string;
    blockchainTxId: string | null;
    metadata: StageMetadata | null;
    stage: Stage;
}

interface Product {
    id: string;
    name: string;
    batchId: string;
    qrCode: string | null;
    createdAt: string;
    pipeline: {
        id: string;
        name: string;
        stages: Stage[];
    };
    stageData: StageData[];
    scans: { id: string; createdAt: string }[];
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStage, setUpdatingStage] = useState<string | null>(null);
    const [updateStatus, setUpdateStatus] = useState<string>("");
    const [regeneratingQR, setRegeneratingQR] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    async function fetchProduct() {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        setProduct(data.product);
        setLoading(false);
    }

    async function handleCompleteStage(stageId: string, imageDataUrl?: string) {
        if (!product) return;
        setUpdatingStage(stageId);
        setUpdateStatus("Getting location...");

        try {
            const position = await new Promise<GeolocationPosition>(
                (resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                    });
                }
            );

            setUpdateStatus("Uploading to IPFS...");

            const res = await fetch(
                `/api/products/${product.id}/stages/${stageId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: "COMPLETED",
                        imageData: imageDataUrl || null,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        metadata: {
                            completedAt: new Date().toISOString(),
                            accuracy: position.coords.accuracy,
                        },
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                setUpdateStatus("Stored on blockchain!");
                await fetchProduct();
                setTimeout(() => setUpdateStatus(""), 3000);
            } else {
                setUpdateStatus(`Error: ${data.error}`);
                setTimeout(() => setUpdateStatus(""), 5000);
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to complete stage";
            setUpdateStatus(`Error: ${message}`);
            setTimeout(() => setUpdateStatus(""), 5000);
        } finally {
            setUpdatingStage(null);
            setSelectedStageId(null);
        }
    }

    function handleCaptureClick(stageId: string) {
        setSelectedStageId(stageId);
        fileInputRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !selectedStageId) return;

        const reader = new FileReader();
        reader.onload = () => {
            handleCompleteStage(selectedStageId, reader.result as string);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    }

    async function handleDelete() {
        if (
            !product ||
            !confirm("Are you sure you want to delete this product?")
        )
            return;

        const res = await fetch(`/api/products/${product.id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            router.push("/dashboard/products");
        }
    }

    async function handleRegenerateQR() {
        if (!product) return;
        setRegeneratingQR(true);

        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: "PATCH",
            });

            if (res.ok) {
                await fetchProduct();
            }
        } catch (error) {
            console.error("Failed to regenerate QR:", error);
        } finally {
            setRegeneratingQR(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-zinc-500">Loading...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-500">Product not found</p>
                <Link href="/dashboard/products">
                    <Button variant="link" className="text-zinc-400">
                        Back to Products
                    </Button>
                </Link>
            </div>
        );
    }

    const completedStages = product.stageData.filter(
        (s) => s.status === "COMPLETED"
    ).length;
    const totalStages = product.stageData.length;

    return (
        <div className="space-y-8">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">
                        {product.name}
                    </h1>
                    <p className="text-zinc-500">{product.batchId}</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/track/${product.id}`} target="_blank">
                        <Button
                            variant="outline"
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Public Page
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        className="border-zinc-700 text-zinc-400 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {updateStatus && (
                <div
                    className={`p-4 rounded-lg ${
                        updateStatus.startsWith("Error")
                            ? "bg-red-900/20 text-red-400 border border-red-900/50"
                            : "bg-blue-900/20 text-blue-400 border border-blue-900/50"
                    }`}
                >
                    {updateStatus}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-zinc-100">
                                Progress
                            </CardTitle>
                            <CardDescription className="text-zinc-500">
                                {completedStages} of {totalStages} stages
                                completed
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-6">
                                <div
                                    className="h-full bg-green-500 transition-all"
                                    style={{
                                        width: `${
                                            totalStages > 0
                                                ? (completedStages /
                                                      totalStages) *
                                                  100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>

                            <div className="space-y-4">
                                {product.stageData
                                    .sort(
                                        (a, b) => a.stage.order - b.stage.order
                                    )
                                    .map((stageData, index) => (
                                        <div
                                            key={stageData.id}
                                            className={`p-4 rounded-lg border ${
                                                stageData.status === "COMPLETED"
                                                    ? "bg-green-900/20 border-green-900/50"
                                                    : "bg-zinc-800/50 border-zinc-700"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                                            stageData.status ===
                                                            "COMPLETED"
                                                                ? "bg-green-500 text-white"
                                                                : "bg-zinc-700 text-zinc-400"
                                                        }`}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium text-zinc-200">
                                                        {stageData.stage.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {stageData.blockchainTxId && (
                                                        <Badge className="bg-green-900/50 text-green-400 border-green-800">
                                                            On-Chain
                                                        </Badge>
                                                    )}
                                                    <Badge
                                                        className={
                                                            stageData.status ===
                                                            "COMPLETED"
                                                                ? "bg-green-900/50 text-green-400 border-green-800"
                                                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                                                        }
                                                    >
                                                        {stageData.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {stageData.status ===
                                            "COMPLETED" ? (
                                                <div className="ml-11 space-y-3 text-sm">
                                                    {(stageData.imageUrl ||
                                                        stageData.metadata
                                                            ?.imageCid) && (
                                                        <div className="relative">
                                                            <img
                                                                src={
                                                                    stageData
                                                                        .metadata
                                                                        ?.imageCid
                                                                        ? `https://cyan-capable-elephant-108.mypinata.cloud/ipfs/${stageData.metadata.imageCid}`
                                                                        : stageData.imageUrl ||
                                                                          ""
                                                                }
                                                                alt={
                                                                    stageData
                                                                        .stage
                                                                        .name
                                                                }
                                                                className="w-32 h-32 object-cover rounded-lg bg-zinc-800"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-4 text-zinc-400">
                                                        <div>
                                                            <span className="text-zinc-500">
                                                                Completed:
                                                            </span>
                                                            <br />
                                                            {new Date(
                                                                stageData.timestamp
                                                            ).toLocaleString()}
                                                        </div>
                                                        {stageData.latitude &&
                                                            stageData.longitude && (
                                                                <div>
                                                                    <span className="text-zinc-500">
                                                                        Location:
                                                                    </span>
                                                                    <br />
                                                                    {stageData.latitude.toFixed(
                                                                        6
                                                                    )}
                                                                    ,{" "}
                                                                    {stageData.longitude.toFixed(
                                                                        6
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>

                                                    {stageData.metadata
                                                        ?.imageCid && (
                                                        <div className="p-2 bg-purple-900/20 rounded border border-purple-900/50 text-purple-400">
                                                            <span className="text-purple-500">
                                                                IPFS Image:
                                                            </span>
                                                            <br />
                                                            <code className="text-xs break-all">
                                                                {
                                                                    stageData
                                                                        .metadata
                                                                        .imageCid
                                                                }
                                                            </code>
                                                        </div>
                                                    )}

                                                    {stageData.blockchainTxId && (
                                                        <div className="p-2 bg-green-900/20 rounded border border-green-900/50">
                                                            <span className="text-green-500">
                                                                Blockchain TX:
                                                            </span>
                                                            <br />
                                                            <a
                                                                href={
                                                                    stageData
                                                                        .metadata
                                                                        ?.blockchainData
                                                                        ?.explorerUrl ||
                                                                    `https://sepolia.basescan.org/tx/${stageData.blockchainTxId}`
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-green-400 hover:underline break-all"
                                                            >
                                                                {
                                                                    stageData.blockchainTxId
                                                                }
                                                            </a>
                                                            {stageData.metadata
                                                                ?.blockchainData
                                                                ?.blockNumber && (
                                                                <div className="text-xs text-green-500 mt-1">
                                                                    Block:{" "}
                                                                    {
                                                                        stageData
                                                                            .metadata
                                                                            .blockchainData
                                                                            .blockNumber
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="ml-11">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleCaptureClick(
                                                                stageData.stage
                                                                    .id
                                                            )
                                                        }
                                                        disabled={
                                                            updatingStage ===
                                                            stageData.stage.id
                                                        }
                                                        className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                                                    >
                                                        <Camera className="w-4 h-4 mr-2" />
                                                        {updatingStage ===
                                                        stageData.stage.id
                                                            ? "Processing..."
                                                            : "Capture & Complete"}
                                                    </Button>
                                                    <p className="text-xs text-zinc-500 mt-2">
                                                        Captures image,
                                                        location, and stores on
                                                        IPFS + blockchain
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-zinc-100">
                                QR Code
                            </CardTitle>
                            <CardDescription className="text-zinc-500">
                                Scan to view product timeline
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            {product.qrCode ? (
                                <img
                                    src={product.qrCode}
                                    alt="QR Code"
                                    className="w-48 h-48 rounded-lg"
                                />
                            ) : (
                                <div className="w-48 h-48 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
                                    No QR Code
                                </div>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRegenerateQR}
                                disabled={regeneratingQR}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 mr-2 ${
                                        regeneratingQR ? "animate-spin" : ""
                                    }`}
                                />
                                {regeneratingQR
                                    ? "Regenerating..."
                                    : "Regenerate QR"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-zinc-100">
                                Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Pipeline</span>
                                <span className="text-zinc-300">
                                    {product.pipeline.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Created</span>
                                <span className="text-zinc-300">
                                    {new Date(
                                        product.createdAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">
                                    Total Scans
                                </span>
                                <span className="text-zinc-300">
                                    {product.scans.length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">
                                    Blockchain Records
                                </span>
                                <span className="text-zinc-300">
                                    {
                                        product.stageData.filter(
                                            (s) => s.blockchainTxId
                                        ).length
                                    }
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-zinc-100">
                                Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-zinc-400">
                            <p>
                                Each completed stage is stored on Base Sepolia
                                blockchain with metadata on IPFS. This ensures
                                tamper-proof traceability.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
