import { ethers } from "ethers";
import crypto from "crypto";

const PROVIDER_URL = process.env.BLOCKCHAIN_RPC_URL!;
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY!;
const CONTRACT_ADDRESS = process.env.STORAGE_CONTRACT_ADDRESS!;

const TRACEABILITY_ABI = [
    "event RecordStored(bytes32 indexed recordHash, string metadataCid, uint256 timestamp, address indexed submitter)",
    "function storeRecord(bytes32 recordHash, string memory metadataCid) public",
    "function getRecord(bytes32 recordHash) public view returns (string memory metadataCid, uint256 timestamp, address submitter)",
    "function recordExists(bytes32 recordHash) public view returns (bool)",
];

export function hashData(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
}

export function hashImage(imageBuffer: Buffer): string {
    return crypto.createHash("sha256").update(imageBuffer).digest("hex");
}

export interface TraceabilityRecord {
    productId: string;
    stageId: string;
    stageName: string;
    imageHash: string;
    imageCid?: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    metadata: Record<string, unknown>;
}

export function createRecordHash(record: TraceabilityRecord): string {
    const dataString = JSON.stringify({
        productId: record.productId,
        stageId: record.stageId,
        stageName: record.stageName,
        imageHash: record.imageHash,
        imageCid: record.imageCid || "",
        latitude: record.latitude,
        longitude: record.longitude,
        timestamp: record.timestamp,
    });
    return hashData(dataString);
}

export function getRecordHashBytes(recordHash: string): string {
    return "0x" + recordHash;
}

let providerInstance: ethers.JsonRpcProvider | null = null;
let walletInstance: ethers.Wallet | null = null;

export function getProvider(): ethers.JsonRpcProvider {
    if (!providerInstance) {
        if (!PROVIDER_URL) {
            throw new Error("BLOCKCHAIN_RPC_URL is not configured");
        }
        providerInstance = new ethers.JsonRpcProvider(PROVIDER_URL);
    }
    return providerInstance;
}

export function getWallet(): ethers.Wallet {
    if (!walletInstance) {
        if (!PRIVATE_KEY) {
            throw new Error("BLOCKCHAIN_PRIVATE_KEY is not configured");
        }
        const provider = getProvider();
        walletInstance = new ethers.Wallet(PRIVATE_KEY, provider);
    }
    return walletInstance;
}

export function getContract(): ethers.Contract {
    if (!CONTRACT_ADDRESS) {
        throw new Error(
            "STORAGE_CONTRACT_ADDRESS is not configured. Run npm run deploy:contract first."
        );
    }
    const wallet = getWallet();
    return new ethers.Contract(CONTRACT_ADDRESS, TRACEABILITY_ABI, wallet);
}

export function getReadOnlyContract(): ethers.Contract {
    if (!CONTRACT_ADDRESS) {
        throw new Error("STORAGE_CONTRACT_ADDRESS is not configured");
    }
    const provider = getProvider();
    return new ethers.Contract(CONTRACT_ADDRESS, TRACEABILITY_ABI, provider);
}

export async function storeOnChain(
    recordHash: string,
    metadataCid: string
): Promise<{
    transactionHash: string;
    blockNumber: number;
    gasUsed: string;
    contractAddress: string;
}> {
    const contract = getContract();
    const hashBytes = getRecordHashBytes(recordHash);

    console.log("Storing record on blockchain...");
    console.log("Contract:", CONTRACT_ADDRESS);
    console.log("Record hash:", hashBytes);
    console.log("Metadata CID:", metadataCid);

    const tx = await contract.storeRecord(hashBytes, metadataCid);
    console.log("Transaction submitted:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        contractAddress: CONTRACT_ADDRESS,
    };
}

export async function verifyOnChain(recordHash: string): Promise<{
    verified: boolean;
    metadataCid?: string;
    timestamp?: number;
    submitter?: string;
}> {
    try {
        const contract = getReadOnlyContract();
        const hashBytes = getRecordHashBytes(recordHash);

        const exists = await contract.recordExists(hashBytes);

        if (!exists) {
            return { verified: false };
        }

        const [metadataCid, timestamp, submitter] = await contract.getRecord(
            hashBytes
        );

        return {
            verified: true,
            metadataCid,
            timestamp: Number(timestamp),
            submitter,
        };
    } catch (error) {
        console.error("Blockchain verification error:", error);
        return { verified: false };
    }
}

export async function getWalletBalance(): Promise<string> {
    const wallet = getWallet();
    const balance = await wallet.provider!.getBalance(wallet.address);
    return ethers.formatEther(balance);
}

export async function getWalletAddress(): Promise<string> {
    const wallet = getWallet();
    return wallet.address;
}

export function getExplorerUrl(txHash: string): string {
    return `https://sepolia.basescan.org/tx/${txHash}`;
}

export function getContractExplorerUrl(): string {
    return `https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`;
}
