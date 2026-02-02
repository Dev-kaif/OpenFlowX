import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { fileChannel } from "@/inngest/channels/file";
import mime from "mime-types";



type FileNodeData = {
    input?: string;
    variableName?: string;
    filename?: string;
};

export function tryParseJSON(value: unknown) {
    if (typeof value !== "string") return null;

    try {
        const cleaned = value
            .trim()
            .replace(/^```(?:json)?/i, "")
            .replace(/```$/, "")
            .trim();

        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}


function filenameFromUrl(url: string) {
    return decodeURIComponent(url.split("/").pop() || "file");
}


export const FileExecutor: NodeExecutor<FileNodeData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(fileChannel().status({ nodeId, status: "loading" }));

    if (!data.input || !data.variableName) {
        throw new NonRetriableError(
            "File Node: both `input` and `variableName` are required"
        );
    }

    try {
        const resolvedInput = Handlebars.compile(data.input, {
            noEscape: true,
        })(context)?.trim();

        if (!resolvedInput) {
            throw new Error("Resolved input is empty");
        }

        // Normalize file
        const file = await step.run(
            "normalize-file",
            async () => {

                // Json
                const json = tryParseJSON(resolvedInput);
                if (json) {
                    if (!json.url && !json.base64) {
                        throw new Error("JSON must contain `url` or `base64`");
                    }

                    return {
                        name: json.name ?? data.filename ?? "file",
                        mime: json.mime ?? "application/octet-stream",
                        size: json.size ?? 0,
                        source: json.url ? "url" : "base64",
                        url: json.url,
                        base64: json.base64,
                    };
                }

                // Base64  
                if (resolvedInput.startsWith("data:")) {
                    const match = resolvedInput.match(
                        /^data:(.+);base64,(.+)$/
                    );

                    if (!match) {
                        throw new Error("Invalid base64 data URL");
                    }

                    const [, mimeType, base64] = match;

                    return {
                        name: data.filename ?? "file",
                        mime: mimeType,
                        size: Buffer.byteLength(base64, "base64"),
                        source: "base64",
                        base64,
                    };
                }

                // URL
                if (resolvedInput.startsWith("http")) {
                    const name =
                        data.filename ?? filenameFromUrl(resolvedInput);

                    return {
                        name,
                        mime:
                            mime.lookup(resolvedInput) ||
                            "application/octet-stream",
                        size: 0,
                        source: "url",
                        url: resolvedInput,
                    };
                }

                throw new Error(
                    "Unsupported input. Expected JSON, URL, or base64 data URL."
                );
            }
        );

        await publish(fileChannel().status({ nodeId, status: "success" }));

        return {
            [data.variableName]: file,
        };
    } catch (error: any) {
        await publish(fileChannel().status({ nodeId, status: "error" }));

        throw new NonRetriableError(
            `File Node Failed: ${error.message}`
        );
    }
};
