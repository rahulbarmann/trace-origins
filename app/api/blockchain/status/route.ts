import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
    getWalletAddress,
    getWalletBalance,
    getProvider,
} from "@/lib/blockchain";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const address = await getWalletAddress();
        const balance = await getWalletBalance();
        const provider = getProvider();
        const network = await provider.getNetwork();

        return NextResponse.json({
            wallet: {
                address,
                balance: `${balance} ETH`,
            },
            network: {
                name: network.name,
                chainId: Number(network.chainId),
            },
            contractAddress:
                process.env.STORAGE_CONTRACT_ADDRESS || "Not deployed",
            rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
        });
    } catch (error) {
        console.error("Blockchain status error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to get blockchain status",
            },
            { status: 500 }
        );
    }
}
