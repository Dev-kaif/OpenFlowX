import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { codeChannel } from "@/inngest/channels/code";
import Handlebars from "handlebars";

type CodeNodeData = {
    code?: string;
};

export const CodeExecutor: NodeExecutor<CodeNodeData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        codeChannel().status({
            nodeId,
            status: "loading"
        })
    );

    if (!data.code) {
        await publish(
            codeChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("Code Node: 'code' field is required");
    }

    try {

        const result = await step.run("run-custom-code", async () => {
            try {
                const compiledCode = Handlebars.compile(data.code, {
                    noEscape: true,
                })(context);

                const userFunction = new Function(
                    "context",
                    `"use strict";\n${compiledCode}`
                );

                return userFunction(context);
            } catch (err: any) {

                throw new Error(`Runtime Error: ${err.message}`);
            }
        });

        await publish(
            codeChannel().status({
                nodeId,
                status: "success"
            })
        );

        return {
            code: {
                result,
            },
        };
    } catch (error: any) {
        await publish(
            codeChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError(
            error.message || "Unknown Code Execution Error"
        );
    }
};
