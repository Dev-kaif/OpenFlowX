import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { jsonParseChannel } from "@/inngest/channels/jsonParse";

type JsonParseNodeData = {
    input?: string;
    variableName?: string;
};

function stripJsonFences(input: string) {
    return input
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
}


export const JsonParseExecutor: NodeExecutor<JsonParseNodeData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        jsonParseChannel().status({
            nodeId,
            status: "loading",
        })
    );

    if (!data.input || !data.variableName) {
        await publish(
            jsonParseChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError(
            "JSON Parse Node: input and variableName are required"
        );
    }

    try {
        const parsed = await step.run("parse-json", async () => {
            const rendered = Handlebars.compile(data.input, {
                noEscape: true
            })(context);

            const cleaned = stripJsonFences(rendered)

            try {
                return JSON.parse(cleaned);
            } catch (err: any) {
                throw new Error(`Invalid JSON: ${err.message}`);
            }
        });

        await publish(
            jsonParseChannel().status({
                nodeId,
                status: "success",
            })
        );

        return {
            [data.variableName]: parsed,
        };

    } catch (error: any) {
        await publish(
            jsonParseChannel().status({
                nodeId,
                status: "error",
            })
        );

        throw new NonRetriableError(
            `JSON Parse Failed: ${error.message}`
        );
    }
};
