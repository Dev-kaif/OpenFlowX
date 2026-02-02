import crypto from "crypto";

export type Payload = {
    userId: string;
    action: "connect";
    exp: number;
};

export function signTelegram(payload: Payload): string {

    const SECRET = process.env.TELEGRAM_CONNECT_SECRET;

    if (!SECRET) {
        throw new Error("TELEGRAM_CONNECT_SECRET is not set");
    }

    const json = JSON.stringify(payload);
    const base64 = Buffer.from(json).toString("base64url");

    const signature = crypto
        .createHmac("sha256", SECRET)
        .update(base64)
        .digest("base64url");

    return `${base64}.${signature}`;
}


export function verify(token: string): Payload {
    const SECRET = process.env.TELEGRAM_CONNECT_SECRET;

    if (!SECRET) {
        throw new Error("TELEGRAM_CONNECT_SECRET is not set");
    }

    const [base64, signature] = token.split(".");

    if (!base64 || !signature) {
        throw new Error("Invalid token format");
    }

    const expectedSig = crypto
        .createHmac("sha256", SECRET!)
        .update(base64)
        .digest("base64url");

    if (signature !== expectedSig) {
        throw new Error("Invalid token signature");
    }

    const payload = JSON.parse(
        Buffer.from(base64, "base64url").toString()
    ) as Payload;

    if (Date.now() > payload.exp) {
        throw new Error("Token expired");
    }

    return payload;
}
