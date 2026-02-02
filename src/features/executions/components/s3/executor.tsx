import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Channel } from "@/inngest/channels/s3";


function stripJsonFence(value: string) {
    return value
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
}

function tryParseJSON(value: string) {
    try {
        return JSON.parse(stripJsonFence(value));
    } catch {
        return null;
    }
}

function reviveBuffer(value: any): Buffer {
    if (
        value &&
        typeof value === "object" &&
        value.type === "Buffer" &&
        Array.isArray(value.data)
    ) {
        return Buffer.from(value.data);
    }

    throw new Error("Invalid buffer input");
}


type S3NodeData = {
    credentialId?: string;
    bucket?: string;
    key?: string;
    input?: string;          // {{file}} / {{ai.text}} / {{code.result}}
    acl?: "private" | "public-read";
    variableName?: string;
};


export const S3Executor: NodeExecutor<S3NodeData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {


    await publish(
        s3Channel().status({
            nodeId,
            status: "loading",
        }),
    );


    if (!data.variableName) {
        await publish(
            s3Channel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("S3 Node: variableName is required");
    }

    if (!data.input || !data.bucket || !data.key) {
        await publish(
            s3Channel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("S3 Node: input, bucket & key are required");
    }

    if (!data.credentialId) {
        await publish(
            s3Channel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("S3 Node: credential is required");
    }


    const secret = await step.run("get-s3-credentials", async () => {
        const cred = await prisma.credential.findUniqueOrThrow({
            where: {
                id: data.credentialId,
                userId,
            },
            select: {
                value: true,
            },
        });

        return decryptApiKey(cred.value);
    });

    const parsedSecret = tryParseJSON(secret);

    if (
        !parsedSecret?.accessKeyId ||
        !parsedSecret?.secretAccessKey ||
        !parsedSecret?.endpoint
    ) {
        await publish(
            s3Channel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("S3 Node: invalid credential format");
    }


    const resolvedInput = Handlebars.compile(data.input, { noEscape: true })(context);
    const resolvedKey = Handlebars.compile(data.key)(context);

    const { body, mime, size } = await step.run("resolve-file", async () => {

        // 1. JSON 
        const parsed = tryParseJSON(resolvedInput);

        if (parsed?.source === "url" && parsed.url) {
            const res = await fetch(parsed.url);
            const buffer = Buffer.from(await res.arrayBuffer());

            return {
                body: buffer,
                mime: parsed.mime ?? res.headers.get("content-type") ?? "application/octet-stream",
                size: buffer.length,
            };
        }

        if (parsed?.source === "base64" && parsed.base64) {
            return {
                body: Buffer.from(parsed.base64, "base64"),
                mime: parsed.mime ?? "application/octet-stream",
                size: Buffer.byteLength(parsed.base64, "base64"),
            };
        }

        // data:base64
        if (resolvedInput.startsWith("data:")) {
            const [, meta, base64] = resolvedInput.match(/^data:(.*);base64,(.*)$/)!;

            return {
                body: Buffer.from(base64, "base64"),
                mime: meta,
                size: Buffer.byteLength(base64, "base64"),
            };
        }

        // URL
        if (resolvedInput.startsWith("http")) {
            const res = await fetch(resolvedInput);
            const buffer = Buffer.from(await res.arrayBuffer());

            return {
                body: buffer,
                mime: res.headers.get("content-type") ?? "application/octet-stream",
                size: buffer.length,
            };
        }

        throw new Error("Unsupported S3 input format");
    });


    const client = new S3Client({
        region: parsedSecret.region ?? "auto",
        endpoint: parsedSecret.endpoint,
        credentials: {
            accessKeyId: parsedSecret.accessKeyId,
            secretAccessKey: parsedSecret.secretAccessKey,
        },
    });

    try {
        const bodyBuffer = reviveBuffer(body);

        await step.run("upload-to-s3", async () => {
            await client.send(
                new PutObjectCommand({
                    Bucket: data.bucket,
                    Key: resolvedKey,
                    Body: bodyBuffer,
                    ContentType: mime,
                    ACL: data.acl ?? "private",
                })
            );
        });

        await publish(
            s3Channel().status({
                nodeId,
                status: "success",
            }),
        );

        return {
            [data.variableName]: {
                provider: "s3",
                bucket: data.bucket,
                key: resolvedKey,
                mime,
                size,
                url: `${parsedSecret.publicBaseUrl}/${resolvedKey}`,
            },
        };

    } catch (error: any) {
        await publish(
            s3Channel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError(`S3 Upload Failed: ${error.message}`);
    }
};
