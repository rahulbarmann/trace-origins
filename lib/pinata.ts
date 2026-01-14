import { PinataSDK } from "pinata";

// Use dedicated Pinata gateway for better reliability and no rate limits
const PINATA_GATEWAY = process.env.PINATA_GATEWAY_URL || "gateway.pinata.cloud";

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: PINATA_GATEWAY,
});

// Use multiple gateways for reliability
const IPFS_GATEWAYS = [
    "https://gateway.pinata.cloud/ipfs/",
    "https://ipfs.io/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
];

export interface TraceabilityMetadata {
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

export async function uploadBase64ImageToPinata(
    base64Data: string,
    filename: string
): Promise<{ cid: string; url: string }> {
    // Extract mime type from data URL if present
    const mimeMatch = base64Data.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    // Remove the data URL prefix if present
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");

    // Convert base64 to a File object for upload
    const binaryData = Buffer.from(base64Content, "base64");
    const blob = new Blob([binaryData], { type: mimeType });
    const file = new File([blob], filename, { type: mimeType });

    const upload = await pinata.upload.public.file(file);

    return {
        cid: upload.cid,
        url: getIpfsUrl(upload.cid),
    };
}

export async function uploadMetadataToPinata(
    metadata: TraceabilityMetadata
): Promise<{ cid: string; url: string }> {
    const upload = await pinata.upload.public
        .json(metadata)
        .name(`metadata-${metadata.productId}-${metadata.stageId}.json`);

    return {
        cid: upload.cid,
        url: getIpfsUrl(upload.cid),
    };
}

export async function getFromPinata(cid: string): Promise<unknown> {
    // Try multiple gateways for reliability
    for (const gateway of IPFS_GATEWAYS) {
        try {
            const response = await fetch(`${gateway}${cid}`, {
                signal: AbortSignal.timeout(10000), // 10 second timeout
            });
            if (response.ok) {
                return response.json();
            }
        } catch {
            // Try next gateway
            continue;
        }
    }
    throw new Error(`Failed to fetch from IPFS: ${cid}`);
}

export function getIpfsUrl(cid: string): string {
    // Use dedicated Pinata gateway for better reliability
    return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
}

export { pinata };
