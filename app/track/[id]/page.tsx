"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Shield,
    MapPin,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Package,
    Building2,
    ChevronDown,
    ChevronUp,
    Link2,
    Image as ImageIcon,
} from "lucide-react";

interface BlockchainInfo {
    verified: boolean;
    transactionHash: string;
    explorerUrl: string;
    blockNumber?: number;
    contractAddress?: string;
    timestamp?: number;
    submitter?: string;
    error?: string;
}

interface TimelineItem {
    id: string;
    stageName: string;
    stageDescription: string | null;
    imageUrl: string | null;
    imageCid?: string;
    latitude: number | null;
    longitude: number | null;
    timestamp: string;
    metadata: {
        completedAt?: string;
        productName?: string;
        batchId?: string;
    } | null;
    blockchain: BlockchainInfo | null;
    verified: boolean;
}

interface TrackData {
    product: {
        id: string;
        name: string;
        batchId: string;
        createdAt: string;
    };
    company: {
        name: string;
        logo: string | null;
    };
    pipeline: {
        name: string;
        description: string | null;
    };
    timeline: TimelineItem[];
    totalStages: number;
    completedStages: number;
    verifiedStages: number;
}

export default function TrackPage() {
    const params = useParams();
    const [data, setData] = useState<TrackData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch(`/api/track/${params.id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Product not found");
                return res.json();
            })
            .then((data) => {
                setData(data);
                // Auto-expand first item
                if (data.timeline.length > 0) {
                    setExpandedItems(new Set([data.timeline[0].id]));
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [params.id]);

    const toggleExpand = (id: string) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-500">
                        Loading product information...
                    </p>
                </motion.div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-zinc-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-zinc-100">
                        Product Not Found
                    </h2>
                    <p className="text-zinc-500 mb-6">
                        The product you are looking for does not exist or has
                        been removed from our system.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-full transition-colors"
                    >
                        <Shield className="w-4 h-4" />
                        Go to Trace Origins
                    </Link>
                </motion.div>
            </div>
        );
    }

    const progressPercent =
        data.totalStages > 0
            ? (data.completedStages / data.totalStages) * 100
            : 0;

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header */}
            <header className="bg-zinc-900/80 border-b border-zinc-800 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {data.company.logo ? (
                                <img
                                    src={data.company.logo}
                                    alt={data.company.name}
                                    className="w-10 h-10 rounded-xl object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-zinc-400" />
                                </div>
                            )}
                            <div>
                                <div className="font-semibold text-zinc-100">
                                    {data.company.name}
                                </div>
                                <div className="text-xs text-zinc-500">
                                    Verified Supplier
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-800/50 rounded-full">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-medium text-green-400">
                                Blockchain Verified
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Product Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                            <Package className="w-7 h-7 text-zinc-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-zinc-100 mb-1">
                                {data.product.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-sm rounded-full">
                                    {data.product.batchId}
                                </span>
                                <span className="px-3 py-1 bg-zinc-800/50 text-zinc-500 text-sm rounded-full">
                                    {data.pipeline.name}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-zinc-400">
                                Journey Progress
                            </span>
                            <span className="text-zinc-300 font-medium">
                                {data.completedStages} of {data.totalStages}{" "}
                                stages
                            </span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-zinc-100">
                                {data.completedStages}
                            </div>
                            <div className="text-xs text-zinc-500">
                                Completed
                            </div>
                        </div>
                        <div className="bg-green-900/20 border border-green-900/30 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-green-400">
                                {data.verifiedStages}
                            </div>
                            <div className="text-xs text-green-500">
                                On-Chain
                            </div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-zinc-100">
                                {data.totalStages - data.completedStages}
                            </div>
                            <div className="text-xs text-zinc-500">Pending</div>
                        </div>
                    </div>
                </motion.div>

                {/* Timeline Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-zinc-100 mb-1">
                        Product Journey
                    </h2>
                    <p className="text-sm text-zinc-500">
                        Track every step from origin to you
                    </p>
                </div>

                {data.timeline.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center"
                    >
                        <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-zinc-300 mb-2">
                            Journey Not Started
                        </h3>
                        <p className="text-zinc-500">
                            No tracking data available yet. Check back soon!
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {data.timeline.map((item, index) => {
                            const isExpanded = expandedItems.has(item.id);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`bg-zinc-900/50 border rounded-2xl overflow-hidden transition-all ${
                                        item.verified
                                            ? "border-green-900/50"
                                            : "border-zinc-800"
                                    }`}
                                >
                                    {/* Stage Header */}
                                    <button
                                        onClick={() => toggleExpand(item.id)}
                                        className="w-full p-4 flex items-center gap-4 text-left hover:bg-zinc-800/30 transition-colors"
                                    >
                                        {/* Step Number */}
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                                                item.verified
                                                    ? "bg-green-500 text-white"
                                                    : "bg-zinc-800 text-zinc-400"
                                            }`}
                                        >
                                            {index + 1}
                                        </div>

                                        {/* Stage Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-zinc-100 truncate">
                                                    {item.stageName}
                                                </h3>
                                                {item.verified && (
                                                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                                <span>
                                                    {new Date(
                                                        item.timestamp
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </span>
                                                {item.blockchain && (
                                                    <span className="flex items-center gap-1 text-green-500">
                                                        <Link2 className="w-3 h-3" />
                                                        On-chain
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expand Icon */}
                                        <div className="text-zinc-500">
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: "auto",
                                                opacity: 1,
                                            }}
                                            className="px-4 pb-4 space-y-4"
                                        >
                                            {/* Image */}
                                            {(item.imageUrl ||
                                                item.imageCid) && (
                                                <div className="relative rounded-xl overflow-hidden bg-zinc-800">
                                                    <img
                                                        src={
                                                            item.imageCid
                                                                ? `https://cyan-capable-elephant-108.mypinata.cloud/ipfs/${item.imageCid}`
                                                                : item.imageUrl ||
                                                                  ""
                                                        }
                                                        alt={item.stageName}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    {item.imageCid && (
                                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-900/80 backdrop-blur-sm rounded-lg text-xs text-purple-300 flex items-center gap-1">
                                                            <Link2 className="w-3 h-3" />
                                                            IPFS Stored
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Location */}
                                            {item.latitude &&
                                                item.longitude && (
                                                    <div className="bg-zinc-800/50 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                                            <MapPin className="w-4 h-4" />
                                                            <span className="text-sm font-medium">
                                                                Geo-Tagged
                                                                Location
                                                            </span>
                                                        </div>
                                                        <div className="font-mono text-sm text-zinc-300 mb-2">
                                                            {item.latitude.toFixed(
                                                                6
                                                            )}
                                                            ,{" "}
                                                            {item.longitude.toFixed(
                                                                6
                                                            )}
                                                        </div>
                                                        <a
                                                            href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            View on Google Maps
                                                        </a>
                                                    </div>
                                                )}

                                            {/* Blockchain Verification */}
                                            {item.blockchain && (
                                                <div
                                                    className={`rounded-xl p-4 ${
                                                        item.blockchain.verified
                                                            ? "bg-green-900/20 border border-green-900/30"
                                                            : "bg-yellow-900/20 border border-yellow-900/30"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Shield
                                                            className={`w-4 h-4 ${
                                                                item.blockchain
                                                                    .verified
                                                                    ? "text-green-400"
                                                                    : "text-yellow-400"
                                                            }`}
                                                        />
                                                        <span
                                                            className={`text-sm font-medium ${
                                                                item.blockchain
                                                                    .verified
                                                                    ? "text-green-400"
                                                                    : "text-yellow-400"
                                                            }`}
                                                        >
                                                            {item.blockchain
                                                                .verified
                                                                ? "Blockchain Verified"
                                                                : "Verification Pending"}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                        <div>
                                                            <span className="text-zinc-500">
                                                                Transaction
                                                            </span>
                                                            <a
                                                                href={
                                                                    item
                                                                        .blockchain
                                                                        .explorerUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block font-mono text-xs text-blue-400 hover:text-blue-300 truncate"
                                                            >
                                                                {
                                                                    item
                                                                        .blockchain
                                                                        .transactionHash
                                                                }
                                                            </a>
                                                        </div>

                                                        {item.blockchain
                                                            .blockNumber && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-zinc-500">
                                                                    Block
                                                                </span>
                                                                <span className="text-zinc-300">
                                                                    #
                                                                    {
                                                                        item
                                                                            .blockchain
                                                                            .blockNumber
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="pt-2">
                                                            <a
                                                                href={
                                                                    item
                                                                        .blockchain
                                                                        .explorerUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                                View on Base
                                                                Sepolia Explorer
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Stage Description */}
                                            {item.stageDescription && (
                                                <p className="text-sm text-zinc-400">
                                                    {item.stageDescription}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
                >
                    <h3 className="font-semibold text-zinc-100 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        About This Verification
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                        Each stage of this product&apos;s journey is recorded
                        with geo-tagged images stored on IPFS (decentralized
                        storage) and verified on the Base blockchain. This
                        creates an immutable record that cannot be tampered
                        with.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-900/30 rounded-full">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <span className="text-xs text-green-400">
                                Blockchain Verified
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/20 border border-purple-900/30 rounded-full">
                            <div className="w-2 h-2 bg-purple-400 rounded-full" />
                            <span className="text-xs text-purple-400">
                                IPFS Stored
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/20 border border-blue-900/30 rounded-full">
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                            <span className="text-xs text-blue-400">
                                Geo-Tagged
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="mt-12 text-center pb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">
                            Powered by Trace Origins
                        </span>
                    </Link>
                    <p className="text-xs text-zinc-600 mt-1">
                        Blockchain-verified product traceability
                    </p>
                </footer>
            </main>
        </div>
    );
}
