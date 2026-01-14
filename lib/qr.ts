import QRCode from "qrcode";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function getProductUrl(productId: string): string {
    return `${BASE_URL}/track/${productId}`;
}

export async function generateQRCode(productId: string): Promise<string> {
    const url = getProductUrl(productId);
    return QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#ffffff",
        },
        errorCorrectionLevel: "H",
    });
}

export async function generateQRCodeBuffer(productId: string): Promise<Buffer> {
    const url = getProductUrl(productId);
    return QRCode.toBuffer(url, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: "H",
    });
}
