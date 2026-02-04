import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { documentReaderChannel } from "@/inngest/channels/reader";
import { executeDocumentReader } from "./utils/document-parser";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonString);
});

type DocumentReaderProps = {
    variableName?: string;
    fileUrl?: string;
};

export const DocumentReaderExecutor: NodeExecutor<DocumentReaderProps> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    // 1. Publish Loading Status
    await publish(
        documentReaderChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    // 2. Validate Configuration
    if (!data.variableName) {
        await publish(
            documentReaderChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError(
            "Document Reader Node: No variable name configured",
        );
    }

    if (!data.fileUrl) {
        await publish(
            documentReaderChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError(
            "Document Reader Node: No file URL configured",
        );
    }

    const fileUrl = Handlebars.compile(data.fileUrl)(context);

    try {
        const result = await step.run("read-document", async () => {

            // Call the shared helper function 
            const output = await executeDocumentReader({
                file: fileUrl
            });

            return output;
        });

        await publish(
            documentReaderChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return {
            [data.variableName]: {
                text: result.text,
                metadata: {
                    char_count: result.char_count,
                    source: result.source,
                    type: result.type
                }
            },
        };

    } catch (error: any) {
        await publish(
            documentReaderChannel().status({
                nodeId,
                status: "error",
            }),
        );

        // Check for specific errors that should not be retried (e.g., File too big)
        if (error.message.includes("too large") || error.message.includes("Invalid input")) {
            throw new NonRetriableError(`Document Reader Error: ${error.message}`);
        }

        throw error;
    }
};