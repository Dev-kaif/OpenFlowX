import SimpleCrypto from "simple-crypto-js";

const masterKey = process.env.CREDENTIAL_ENCRYPTION_KEY;

if (!masterKey) {
    throw new Error("Missing CREDENTIAL_ENCRYPTION_KEY env var");
}

// Create singleton instance
const simpleCrypto = new SimpleCrypto(masterKey);


export function encryptApiKey(apiKey: string): string {
    if (!apiKey) throw new Error("No apiKey provided to encrypt");

    const encrypted = simpleCrypto.encrypt(apiKey);

    if (typeof encrypted !== "string") {
        return JSON.stringify(encrypted);
    }

    return encrypted;
}


export function decryptApiKey(encryptedValue: string): string {
    if (!encryptedValue) throw new Error("No encrypted value provided to decrypt");

    const decrypted = simpleCrypto.decrypt(encryptedValue);

    if (typeof decrypted === "string") {
        return decrypted;
    }

    return JSON.stringify(decrypted);
}


export function maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) return "****";

    const start = apiKey.slice(0, 3);
    const end = apiKey.slice(-4);

    return `${start}****${end}`;
}
